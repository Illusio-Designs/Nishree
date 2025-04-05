import React, { useState } from 'react';

const Settings = () => {
    const [settings, setSettings] = useState({
        notifications: true,
        emailUpdates: true,
        darkMode: false,
        language: 'english'
    });

    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Settings</h2>
            <div className="settings-card">
                <div className="settings-content">
                    <div className="settings-section">
                        <h2 className="section-title">Notifications</h2>
                        <div className="settings-group">
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3 className="setting-title">Push Notifications</h3>
                                    <p className="setting-description">Receive notifications about updates</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.notifications}
                                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            <div className="setting-item">
                                <div className="setting-info">
                                    <h3 className="setting-title">Email Updates</h3>
                                    <p className="setting-description">Receive email notifications</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailUpdates}
                                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h2 className="section-title">Appearance</h2>
                        <div className="setting-item">
                            <div className="setting-info">
                                <h3 className="setting-title">Dark Mode</h3>
                                <p className="setting-description">Toggle dark mode theme</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.darkMode}
                                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h2 className="section-title">Language</h2>
                        <select
                            className="language-select"
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                        >
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;