import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import InputField from './InputField';
import Button from './Button';
import { toast } from 'react-toastify';
import { HiOutlineCamera, HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone } from 'react-icons/hi2';
import '../../Styles/dashboard/Category.css';
import '../../Styles/common/Settings.css';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        photoURL: ''
    });

    useEffect(() => {
        if (user) {
            // Handle different image URL formats
            let currentImage = user.photoURL;
            
            if (!currentImage && user.profileImage) {
                // If profileImage already has /uploads/ prefix, use it directly
                if (user.profileImage.startsWith('/uploads/')) {
                    currentImage = `${import.meta.env.VITE_API_URL}${user.profileImage}`;
                } else {
                    // Otherwise construct the full path
                    currentImage = `${import.meta.env.VITE_API_URL}/uploads/users/${user.profileImage}`;
                }
            }
            
            setFormData({
                username: user.username || user.displayName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || user.phone || '',
                photoURL: currentImage || ''
            });
            setImagePreview(currentImage);
        }
    }, [user]);

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
            
            // Store the file for upload
            setImageFile(file);
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to update your profile');
            return;
        }
        
        setLoading(true);
        
        try {
            // Check if there's anything to update
            const hasTextChanges = (formData.username && formData.username !== user.username && formData.username !== user.displayName) ||
                                   (formData.phoneNumber && formData.phoneNumber !== user.phoneNumber && formData.phoneNumber !== user.phone);
            
            if (!hasTextChanges && !imageFile) {
                toast.info('No changes to update');
                setLoading(false);
                return;
            }

            console.log('Current user:', user);
            console.log('Token present:', !!token);
            console.log('Has image file:', !!imageFile);
            
            // Create FormData for file upload
            const formDataToSend = new FormData();
            
            if (formData.username && formData.username !== user.username && formData.username !== user.displayName) {
                formDataToSend.append('username', formData.username);
            }
            
            if (formData.phoneNumber && formData.phoneNumber !== user.phoneNumber && formData.phoneNumber !== user.phone) {
                formDataToSend.append('phone', formData.phoneNumber); // Backend expects 'phone', not 'phoneNumber'
            }
            
            // Add image file if selected
            if (imageFile) {
                formDataToSend.append('profilePic', imageFile);
            }
            
            console.log('Updating profile with FormData');
            
            // Call the API through context (this will update the header automatically)
            await updateProfile(formDataToSend);
            
            toast.success('Profile updated successfully!');
            
            // Clear image file after successful upload
            setImageFile(null);
            
            // Update local form with fresh user data
            const updatedUser = await userService.getCurrentUser();
            if (updatedUser) {
                // Handle different image URL formats
                let currentImage = updatedUser.photoURL;
                
                if (!currentImage && updatedUser.profileImage) {
                    // If profileImage already has /uploads/ prefix, use it directly
                    if (updatedUser.profileImage.startsWith('/uploads/')) {
                        currentImage = `${import.meta.env.VITE_API_URL}${updatedUser.profileImage}`;
                    } else {
                        // Otherwise construct the full path
                        currentImage = `${import.meta.env.VITE_API_URL}/uploads/users/${updatedUser.profileImage}`;
                    }
                }
                
                setFormData({
                    username: updatedUser.username || updatedUser.displayName || formData.username,
                    email: updatedUser.email || formData.email,
                    phoneNumber: updatedUser.phoneNumber || updatedUser.phone || formData.phoneNumber,
                    photoURL: currentImage || formData.photoURL
                });
                setImagePreview(currentImage);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            const errorMessage = error?.message || error?.error || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="category-manager">
            <div className="header-section">
                <h2 className="dashboard-title">My Profile</h2>
            </div>
            
            <div className="profile-content">
                <form onSubmit={handleSubmit} className="category-form">
                    {/* Profile Picture Card */}
                    <div className="profile-card">
                        <div className="profile-header">
                            <h3>Profile Picture</h3>
                            <p className="profile-subtitle">Upload a photo to personalize your account</p>
                        </div>
                        
                        <div className="profile-image-container">
                            <div className="profile-image-preview">
                                {imagePreview || formData.photoURL ? (
                                    <img 
                                        src={imagePreview || formData.photoURL} 
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

                    {/* Personal Information Card */}
                    <div className="profile-card">
                        <div className="profile-header">
                            <h3>Personal Information</h3>
                            <p className="profile-subtitle">Update your personal details</p>
                        </div>
                        
                        <div className="profile-field">
                            <div className="field-icon">
                                <HiOutlineUser size={20} />
                            </div>
                            <InputField
                                label="Display Name"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter your display name"
                                required
                            />
                        </div>

                        <div className="profile-field">
                            <div className="field-icon disabled">
                                <HiOutlineEnvelope size={20} />
                            </div>
                            <InputField
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                disabled
                            />
                        </div>

                        <div className="profile-field">
                            <div className="field-icon">
                                <HiOutlinePhone size={20} />
                            </div>
                            <InputField
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                placeholder="+91 0000000000"
                            />
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="modal-actions">
                        <Button type="submit" className="modal-submit-button" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
