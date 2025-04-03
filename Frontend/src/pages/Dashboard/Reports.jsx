import React from 'react';

const Reports = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        Chart Placeholder
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Lead Conversion</h2>
                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                        Chart Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;