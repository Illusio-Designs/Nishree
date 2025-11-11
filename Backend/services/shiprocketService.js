import axios from 'axios';

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let token = null;
let tokenExpiry = null;

function formatPhoneNumber(phone) {
	if (!phone) return '9876543210';
	const digits = phone.toString().replace(/\D/g, '');
	if (digits.length === 12 && digits.startsWith('91')) return digits.substring(2);
	if (digits.length === 11 && digits.startsWith('0')) return digits.substring(1);
	if (digits.length === 10) return digits;
	if (digits.length < 10) return '9876543210';
	return digits.slice(-10);
}

async function authenticateShiprocket() {
	const res = await axios.post(`${BASE_URL}/auth/login`, {
		email: SHIPROCKET_EMAIL,
		password: SHIPROCKET_PASSWORD
	});
	token = res.data.token;
	tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
	return token;
}

async function ensureValidToken() {
	if (!token || Date.now() > tokenExpiry) {
		await authenticateShiprocket();
	}
	return token;
}

async function createShiprocketOrder(orderData) {
	await ensureValidToken();
	const required = [
		'order_id',
		'order_date',
		'pickup_location',
		'billing_customer_name',
		'billing_address',
		'billing_city',
		'billing_pincode',
		'billing_state',
		'billing_country',
		'billing_email',
		'billing_phone',
		'order_items',
		'payment_method',
		'sub_total'
	];
	const missing = required.filter(f => !orderData[f]);
	if (missing.length > 0) {
		throw new Error(`Missing required fields: ${missing.join(', ')}`);
	}
	if (!Array.isArray(orderData.order_items) || orderData.order_items.length === 0) {
		throw new Error('order_items must be a non-empty array');
	}
	orderData.order_items.forEach((item, index) => {
		if (!item.name || !item.units || !item.selling_price) {
			throw new Error(
				`Order item ${index} is missing required fields: name, units, or selling_price`
			);
		}
	});
	const formattedPayload = {
		order_id: String(orderData.order_id),
		order_date: orderData.order_date,
		pickup_location: orderData.pickup_location,
		channel_id: orderData.channel_id || '7361105',
		comment: orderData.comment || `Order from Nishree: ${orderData.order_id}`,
		billing_customer_name: String(orderData.billing_customer_name),
		billing_last_name: String(orderData.billing_last_name || ''),
		billing_address: String(orderData.billing_address),
		billing_address_2: String(orderData.billing_address_2 || ''),
		billing_city: String(orderData.billing_city),
		billing_pincode: parseInt(orderData.billing_pincode),
		billing_state: String(orderData.billing_state),
		billing_country: String(orderData.billing_country || 'India'),
		billing_email: String(orderData.billing_email),
		billing_phone: formatPhoneNumber(orderData.billing_phone),
		shipping_is_billing: Boolean(orderData.shipping_is_billing !== false),
		shipping_customer_name: String(
			orderData.shipping_customer_name || orderData.billing_customer_name
		),
		shipping_last_name: String(
			orderData.shipping_last_name || orderData.billing_last_name || ''
		),
		shipping_address: String(orderData.shipping_address || orderData.billing_address),
		shipping_address_2: String(
			orderData.shipping_address_2 || orderData.billing_address_2 || ''
		),
		shipping_city: String(orderData.shipping_city || orderData.billing_city),
		shipping_pincode: parseInt(orderData.shipping_pincode || orderData.billing_pincode),
		shipping_state: String(orderData.shipping_state || orderData.billing_state),
		shipping_country: String(orderData.shipping_country || orderData.billing_country || 'India'),
		shipping_email: String(orderData.shipping_email || orderData.billing_email),
		shipping_phone: formatPhoneNumber(orderData.shipping_phone || orderData.billing_phone),
		order_items: orderData.order_items.map(item => ({
			name: String(item.name),
			sku: String(item.sku || `PROD-${Date.now()}`),
			units: parseInt(item.units),
			selling_price: parseFloat(item.selling_price),
			discount: parseFloat(item.discount || 0),
			tax: parseFloat(item.tax || 0),
			hsn: parseInt(item.hsn || 9999)
		})),
		payment_method: String(orderData.payment_method),
		subreward_points: undefined,
		sub_total: parseFloat(orderData.sub_total),
		shipping_charges: parseFloat(orderData.shipping_charges || 0),
		giftwrap_charges: parseFloat(orderData.giftwrap_charges || 0),
		transaction_charges: parseFloat(orderData.transaction_charges || 0),
		total_discount: parseFloat(orderData.total_discount || 0),
		length: parseFloat(orderData.length || 10),
		breadth: parseFloat(orderData.breadth || 10),
		height: parseFloat(orderData.height || 5),
		weight: parseFloat(orderData.weight || 0.5)
	};
	const res = await axios.post(`${BASE_URL}/orders/create/adhoc`, formattedPayload, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
	return res.data;
}

async function getShiprocketTracking(shipmentId) {
	await ensureValidToken();
	const res = await axios.get(`${BASE_URL}/courier/track/shipment/${shipmentId}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return res.data;
}

async function getShiprocketLabel(shipmentId) {
	await ensureValidToken();
	const res = await axios.get(`${BASE_URL}/courier/generate/label/${shipmentId}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return res.data;
}

async function getPickupLocations() {
	await ensureValidToken();
	const res = await axios.get(`${BASE_URL}/settings/company/pickup`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	return res.data;
}

async function createPickupLocation(pickupData) {
	await ensureValidToken();
	const res = await axios.post(`${BASE_URL}/settings/company/pickup`, pickupData, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	});
	return res.data;
}

async function requestShiprocketPickup(shipmentIds, pickupLocation = 'Default') {
	await ensureValidToken();
	const res = await axios.post(
		`${BASE_URL}/courier/generate/pickup`,
		{
			shipment_id: shipmentIds,
			pickup_location: pickupLocation
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return res.data;
}

async function cancelShiprocketShipment(shipmentIds) {
	await ensureValidToken();
	const res = await axios.post(
		`${BASE_URL}/courier/cancel/shipment`,
		{ shipment_id: shipmentIds },
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return res.data;
}

async function getAllShiprocketOrders(params = {}) {
	await ensureValidToken();
	const res = await axios.get(`${BASE_URL}/orders`, {
		params,
		headers: { Authorization: `Bearer ${token}` }
	});
	return res.data;
}

async function cancelShiprocketOrder(orderId) {
	const tokenNow = await authenticateShiprocket();
	const response = await axios.post(
		`${BASE_URL}/orders/cancel`,
		{ ids: [orderId] },
		{
			headers: {
				Authorization: `Bearer ${tokenNow}`,
				'Content-Type': 'application/json'
			}
		}
	);
	return response.data;
}

export {
	authenticateShiprocket,
	createShiprocketOrder,
	getShiprocketTracking,
	getShiprocketLabel,
	requestShiprocketPickup,
	cancelShiprocketShipment,
	getAllShiprocketOrders,
	getPickupLocations,
	createPickupLocation,
	cancelShiprocketOrder
};


