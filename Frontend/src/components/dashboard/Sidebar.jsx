import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/leads', label: 'Leads', icon: '🎯' },
        { path: '/reports', label: 'Reports', icon: '📈' },
    ];

    return (
        <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
            <div className="text-2xl font-bold mb-8">CRM System</div>
            <nav>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 p-3 rounded ${
                                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                            }`
                        }
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;