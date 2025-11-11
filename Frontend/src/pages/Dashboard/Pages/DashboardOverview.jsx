import React from 'react';

const DashboardOverview = () => {
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Dashboard Overview</h1>
            <div className="stats-grid">
                <div className="stat-card total-leads">
                    <h2 className="stat-title">Total Leads</h2>
                    <p className="stat-value">150</p>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: '75%' }}></div>
                    </div>
                </div>
                <div className="stat-card active-customers">
                    <h2 className="stat-title">Active Customers</h2>
                    <p className="stat-value">75</p>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: '50%' }}></div>
                    </div>
                </div>
                <div className="stat-card monthly-revenue">
                    <h2 className="stat-title">Monthly Revenue</h2>
                    <p className="stat-value">$25,000</p>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: '66%' }}></div>
                    </div>
                </div>
                <div className="stat-card pending-tasks">
                    <h2 className="stat-title">Pending Tasks</h2>
                    <p className="stat-value">12</p>
                    <div className="stat-progress">
                        <div className="progress-bar" style={{ width: '25%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;