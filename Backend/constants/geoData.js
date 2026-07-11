// Reference geography data for country/state/city dropdowns (India-focused).
// Loaded into the DB lazily on first request (see controller/geoController.js).

export const COUNTRIES = [
    { name: 'India', code: 'IN', phone_code: '+91' }
];

// name -> [cities]. States with no curated cities still appear in the state list.
export const STATE_CITIES = {
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Mehsana', 'Morbi', 'Navsari', 'Bharuch', 'Vapi'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati'],
    'Delhi': ['New Delhi', 'Delhi'],
    'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Kalaburagi'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Prayagraj'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
    'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Karnal', 'Hisar'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani'],
    'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala', 'Mandi'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu'],
    'Chandigarh': ['Chandigarh'],
    'Puducherry': ['Puducherry'],
    'Tripura': ['Agartala'],
    'Manipur': ['Imphal'],
    'Meghalaya': ['Shillong'],
    'Nagaland': ['Kohima', 'Dimapur'],
    'Arunachal Pradesh': ['Itanagar'],
    'Mizoram': ['Aizawl'],
    'Sikkim': ['Gangtok'],
    'Andaman and Nicobar Islands': ['Port Blair'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Silvassa'],
    'Ladakh': ['Leh', 'Kargil'],
    'Lakshadweep': ['Kavaratti']
};

export const STATES = Object.keys(STATE_CITIES);
