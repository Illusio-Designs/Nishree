import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-auto">
            <div className="max-w-7xl mx-auto text-center">
                <p>© {new Date().getFullYear()} CRM System. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;