import React from 'react';

const Dashboard = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Total Leads</h2>
                    <p className="text-3xl font-bold text-blue-600">150</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Active Customers</h2>
                    <p className="text-3xl font-bold text-green-600">75</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Monthly Revenue</h2>
                    <p className="text-3xl font-bold text-purple-600">$25,000</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold">Pending Tasks</h2>
                    <p className="text-3xl font-bold text-red-600">12</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;