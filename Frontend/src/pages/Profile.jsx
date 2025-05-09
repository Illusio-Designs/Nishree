import React, { useState } from 'react';
import { FaUser, FaEdit, FaBox, FaMapMarkerAlt } from 'react-icons/fa';
import Header from "../components/Header";
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('view');

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 8901',
  };

  const orders = [
    { id: 'ORD123', item: 'Organic Honey', date: '2025-04-10', amount: '$25.00' },
    { id: 'ORD124', item: 'Turmeric Powder', date: '2025-04-12', amount: '$18.00' },
  ];

  const addresses = [
    '123, Green Street, New York, USA',
    '456, Blue Avenue, Los Angeles, USA',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-col items-center justify-start flex-grow p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">My Profile</h1>

        <div className="flex space-x-2 mb-6 flex-wrap justify-center">
          <TabButton label="View Profile" icon={<FaUser />} active={activeTab === 'view'} onClick={() => setActiveTab('view')} />
          <TabButton label="Edit Profile" icon={<FaEdit />} active={activeTab === 'edit'} onClick={() => setActiveTab('edit')} />
          <TabButton label="My Orders" icon={<FaBox />} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          <TabButton label="My Address" icon={<FaMapMarkerAlt />} active={activeTab === 'address'} onClick={() => setActiveTab('address')} />
        </div>

        <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6">
          {activeTab === 'view' && (
            <div className="space-y-4">
              <InfoItem label="Name" value={user.name} />
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Phone" value={user.phone} />
            </div>
          )}

          {activeTab === 'edit' && (
            <form className="space-y-4">
              <TextField label="Name" defaultValue={user.name} />
              <TextField label="Email" defaultValue={user.email} type="email" />
              <TextField label="Phone" defaultValue={user.phone} type="tel" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl w-full transition-all">Save Changes</button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-4 rounded-xl shadow-sm">
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Item:</strong> {order.item}</p>
                  <p><strong>Date:</strong> {order.date}</p>
                  <p><strong>Amount:</strong> {order.amount}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'address' && (
            <ul className="space-y-2">
              {addresses.map((addr, index) => (
                <li key={index} className="bg-gray-100 p-4 rounded-xl shadow-sm">{addr}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

const TabButton = ({ label, icon, active, onClick }) => (
  <button
    className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm transition-all font-medium ${
      active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-100'
    }`}
    onClick={onClick}
  >
    {icon} {label}
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-gray-800 font-medium">{value}</p>
  </div>
);

const TextField = ({ label, defaultValue, type = 'text' }) => (
  <div>
    <label className="block text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default ProfilePage;
