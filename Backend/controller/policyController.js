import { Policy } from '../model/policyModel.js';

export const createPolicy = async (req, res) => {
	try {
		const { title, content } = req.body;
		const policy = await Policy.create({ title, content });
		res.status(201).json(policy);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getPolicies = async (req, res) => {
	try {
		const policies = await Policy.findAll();
		res.json(policies);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getPolicyById = async (req, res) => {
	try {
		const policy = await Policy.findByPk(req.params.id);
		if (!policy) return res.status(404).json({ error: 'Policy not found' });
		res.json(policy);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const updatePolicy = async (req, res) => {
	try {
		const { title, content } = req.body;
		const policy = await Policy.findByPk(req.params.id);
		if (!policy) return res.status(404).json({ error: 'Policy not found' });
		policy.title = title;
		policy.content = content;
		await policy.save();
		res.json(policy);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const deletePolicy = async (req, res) => {
	try {
		const policy = await Policy.findByPk(req.params.id);
		if (!policy) return res.status(404).json({ error: 'Policy not found' });
		await policy.destroy();
		res.json({ message: 'Policy deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const getPublicPolicyByName = async (req, res) => {
	try {
		const { name } = req.params;
		const searchTitle = name.replace(/-/g, ' ').trim().toLowerCase();

		let policy = await Policy.findOne({
			where: Policy.sequelize.where(
				Policy.sequelize.fn('LOWER', Policy.sequelize.col('title')),
				searchTitle
			)
		});

		if (!policy) {
			policy = await Policy.findOne({
				where: Policy.sequelize.where(
					Policy.sequelize.fn('LOWER', Policy.sequelize.col('title')),
					{ [Policy.sequelize.Op.like]: `%${searchTitle}%` }
				)
			});
		}

		if (!policy) {
			return res.status(404).json({ error: 'Policy not found' });
		}
		res.json(policy);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};


