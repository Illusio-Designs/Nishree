import express from 'express';
import {
	createPolicy,
	getPolicies,
	getPublicPolicyByName,
	getPolicyById,
	updatePolicy,
	deletePolicy
} from '../controller/policyController.js';

const router = express.Router();

router.post('/', createPolicy);
router.get('/', getPolicies);
router.get('/name/:name', getPublicPolicyByName);
router.get('/:id', getPolicyById);
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

export default router;


