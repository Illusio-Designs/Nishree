import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import InputField from './InputField';
import Button from './Button';
import { toast } from 'react-toastify';
import { HiOutlineCamera } from 'react-icons/hi2';
import '../../Styles/dashboard/Category.css';

const Settings = ({ type = 'profile' }) => {
    const { user, updateProfile, updatePassword } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Profile Settings State
    const [profileData, setProfileData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        photoURL: user?.photoURL || '',
        phoneNumber: user?.phoneNumber || ''
    });

    // Security Settings State
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Settings State
    const [settings, setSettings] = useState({
        notifications: true,
        emailUpdates: true,
        darkMode: false,
        language: 'english'
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Only send the fields that can be updated
            const updateData = {
                username: profileData.displayName,
                phoneNumber: profileData.phoneNumber
            };
            
            console.log('Updating profile with:', updateData);
            await updateProfile(updateData);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSecuritySubmit = async (e) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await updatePassword(securityData.currentPassword, securityData.newPassword);
            toast.success('Password updated successfully');
            setSecurityData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (setting, value) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value
        }));
    };

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setProfileData({ ...profileData, photoURL: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const renderProfileSettings = () => (
        <form onSubmit={handleProfileSubmit} className="category-form">
            <div className="profile-card">
                <div className="profile-header">
                    <h3>Profile Picture</h3>
                    <p className="profile-subtitle">Upload a photo to personalize your account</p>
                </div>
                
                <div className="profile-image-container">
                    <div className="profile-image-preview">
                        {imagePreview || profileData.photoURL ? (
                            <img 
                                src={imagePreview || profileData.photoURL} 
                                alt="Profile" 
                                className="profile-preview-img" 
                            />
                        ) : (
                            <div className="profile-placeholder">
                                <HiOutlineCamera size={48} />
                                <span>No Image</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="profile-upload-actions">
                        <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="profile-image" className="upload-image-btn">
                            <HiOutlineCamera size={20} />
                            Choose Image
                        </label>
                        <p className="upload-hint">JPG, PNG or GIF (Max 5MB)</p>
                    </div>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-header">
                    <h3>Personal Information</h3>
                    <p className="profile-subtitle">Update your personal details</p>
                </div>
                
                <InputField
                    label="Display Name"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                    required
                />
                <InputField
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    disabled
                />
                <InputField
                    label="Phone Number"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                />
            </div>
            
            <div className="modal-actions">
                <Button type="submit" className="modal-submit-button" disabled={loading}>
                    {loading ? 'Updating...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );

    const renderSecuritySettings = () => (
        <form onSubmit={handleSecuritySubmit} className="settings-form">
            <div className="form-group">
                <InputField
                    label="Current Password"
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <InputField
                    label="New Password"
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    required
                />
            </div>
            <div className="form-group">
                <InputField
                    label="Confirm New Password"
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    required
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
            </Button>
        </form>
    );

    return (
        <div className="category-manager">
            <div className="header-section">
                <h2 className="dashboard-title">My Profile</h2>
            </div>
            <div className="profile-content">
                {type === 'profile' ? renderProfileSettings() : renderSecuritySettings()}
            </div>
        </div>
    );
};

export default Settings;