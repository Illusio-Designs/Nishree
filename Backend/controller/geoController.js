import { Op } from 'sequelize';
import { Country } from '../model/countryModel.js';
import { State } from '../model/stateModel.js';
import { City } from '../model/cityModel.js';
import { COUNTRIES, STATE_CITIES, STATES } from '../constants/geoData.js';

// Seed the geography tables once (lazily) from the bundled dataset, so the
// country/state/city dropdowns always have data without a separate seed step.
let seeding = null;
const ensureSeeded = async () => {
    if (seeding) return seeding;
    seeding = (async () => {
        const count = await Country.count();
        if (count > 0) return;
        const country = await Country.create(COUNTRIES[0]);
        for (const stateName of STATES) {
            const state = await State.create({ name: stateName, country_id: country.id });
            const cities = STATE_CITIES[stateName] || [];
            if (cities.length) {
                await City.bulkCreate(cities.map((c) => ({ name: c, state_id: state.id, state_name: stateName })));
            }
        }
        console.log('Geography reference data seeded.');
    })();
    return seeding;
};

export const getCountries = async (req, res) => {
    try {
        await ensureSeeded();
        const countries = await Country.findAll({ order: [['name', 'ASC']] });
        res.json(countries);
    } catch (error) {
        console.error('Get countries error:', error);
        res.status(500).json({ message: 'Failed to fetch countries', error: error.message });
    }
};

export const getStates = async (req, res) => {
    try {
        await ensureSeeded();
        const where = {};
        if (req.query.country_id) where.country_id = req.query.country_id;
        const states = await State.findAll({ where, order: [['name', 'ASC']] });
        res.json(states);
    } catch (error) {
        console.error('Get states error:', error);
        res.status(500).json({ message: 'Failed to fetch states', error: error.message });
    }
};

export const getCities = async (req, res) => {
    try {
        await ensureSeeded();
        const where = {};
        if (req.query.state_id) where.state_id = req.query.state_id;
        else if (req.query.state) where.state_name = req.query.state;
        const cities = await City.findAll({ where, order: [['name', 'ASC']] });
        res.json(cities);
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ message: 'Failed to fetch cities', error: error.message });
    }
};
