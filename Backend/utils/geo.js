// Geo helpers for B2B visit verification (geofencing).

const EARTH_RADIUS_M = 6371000; // mean Earth radius in metres

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Haversine distance in metres between two lat/lng points.
 * Returns null if any coordinate is missing/invalid.
 */
export const haversineDistanceM = (lat1, lng1, lat2, lng2) => {
    const a1 = parseFloat(lat1);
    const o1 = parseFloat(lng1);
    const a2 = parseFloat(lat2);
    const o2 = parseFloat(lng2);
    if ([a1, o1, a2, o2].some((v) => Number.isNaN(v))) return null;

    const dLat = toRad(a2 - a1);
    const dLng = toRad(o2 - o1);
    const s =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(a1)) * Math.cos(toRad(a2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    return EARTH_RADIUS_M * c;
};

// Geofence radius (metres). A visit recorded farther than this from the party is
// rejected. Configurable via GEOFENCE_RADIUS_M (default 250).
export const getGeofenceRadiusM = () =>
    parseInt(process.env.GEOFENCE_RADIUS_M, 10) || 250;

// When true, block a visit if the party has no coordinates (fail-closed).
// Defaults to fail-open so a missing geocode does not block field work.
export const requireCoords = () =>
    String(process.env.GEOFENCE_REQUIRE_COORDS).toLowerCase() === 'true';

/**
 * Evaluate a recorded GPS point against a party's coordinates.
 * Returns { distanceM, withinFence, matchPercent }.
 *  - withinFence: true if inside the geofence (or fail-open with no coords)
 *  - matchPercent: 100% on-site, falling to 0% at 2x the geofence radius
 */
export const evaluateGeofence = (partyLat, partyLng, gpsLat, gpsLng) => {
    const radius = getGeofenceRadiusM();
    const distanceM = haversineDistanceM(partyLat, partyLng, gpsLat, gpsLng);

    if (distanceM === null) {
        return {
            distanceM: null,
            withinFence: !requireCoords(),
            matchPercent: null
        };
    }

    const withinFence = distanceM <= radius;
    const matchPercent = Math.max(0, Math.min(100, Math.round((1 - distanceM / (2 * radius)) * 100)));
    return { distanceM: Math.round(distanceM * 100) / 100, withinFence, matchPercent };
};

export default { haversineDistanceM, evaluateGeofence, getGeofenceRadiusM, requireCoords };
