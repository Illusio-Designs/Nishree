// Compact geography fallback so country/state/city dropdowns work without a
// backend. The backend serves the full dataset; this covers common cases.
export const COUNTRIES = [{ id: 1, name: 'India', code: 'IN' }];

export const STATE_CITIES = {
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Mehsana', 'Morbi', 'Navsari', 'Bharuch', 'Vapi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Noida'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Karnal'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee'],
  'Himachal Pradesh': ['Shimla', 'Solan', 'Dharamshala'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu'],
  'Chandigarh': ['Chandigarh'],
  'Puducherry': ['Puducherry'],
};

export const STATES = Object.keys(STATE_CITIES).map((name, i) => ({ id: i + 1, name }));
export const citiesForState = (stateName) => (STATE_CITIES[stateName] || []).map((name, i) => ({ id: `${stateName}-${i}`, name }));
