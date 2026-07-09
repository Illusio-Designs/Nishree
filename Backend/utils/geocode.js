import axios from 'axios';

// Address -> coordinates geocoding for B2B parties/distributors.
//
// Defaults to the free OpenStreetMap Nominatim service (no API key). An Indian
// pincode pins a locality far better than "city, state" (which collapses to a
// state centroid), so the query chain tries the pincode early.

const GEOCODER_URL = process.env.GEOCODER_URL || 'https://nominatim.openstreetmap.org/search';
const GEOCODER_KEY = process.env.GEOCODER_KEY || '';
const GEOCODER_UA = process.env.GEOCODER_UA || 'NishreeB2B/1.0 (support@illusiodesigns.agency)';

/**
 * Build the ordered list of query strings to try, most-specific first, with a
 * pincode-first fallback chain for accuracy.
 */
const buildQueryChain = ({ address, city, state, pincode }) => {
    const parts = [];
    const push = (v) => {
        const s = [v].flat().filter(Boolean).join(', ').trim();
        if (s && !parts.includes(s)) parts.push(s);
    };
    push([address, city, state, pincode]);       // full address
    push([pincode, city, state]);                 // pincode + city/state
    push([pincode, 'India']);                     // pincode alone
    push([city, state]);                          // city/state
    push([state, 'India']);                       // state (coarse)
    return parts;
};

/**
 * Resolve an address object to { latitude, longitude } or null.
 * Never throws — geocoding failures are non-fatal to the caller.
 */
export const geocodeAddress = async (addressObj) => {
    const queries = buildQueryChain(addressObj || {});
    if (!queries.length) return null;

    for (const q of queries) {
        try {
            const params = { q, format: 'json', limit: 1, countrycodes: 'in' };
            if (GEOCODER_KEY) params.key = GEOCODER_KEY;

            const { data } = await axios.get(GEOCODER_URL, {
                params,
                headers: { 'User-Agent': GEOCODER_UA },
                timeout: 8000
            });

            if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            // Try the next (coarser) query in the chain.
            console.warn(`Geocode attempt failed for "${q}":`, error.message);
        }
    }
    return null;
};

export default { geocodeAddress };
