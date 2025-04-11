import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { settingsService } from '../../../services';
import { toast } from 'react-toastify';
import '../../../Styles/dashboard/Settings.css';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    is_encrypted: false
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [filteredSettings, setFilteredSettings] = useState([]);

  // Define setting categories
  const categories = [
    { id: 'all', name: 'All Settings' },
    { id: 'general', name: 'General' },
    { id: 'payment', name: 'Payment' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'email', name: 'Email' },
    { id: 'social', name: 'Social Media' },
    { id: 'api', name: 'API Keys' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredSettings(settings);
    } else {
      setFilteredSettings(settings.filter(setting => {
        return setting.key.startsWith(activeCategory + '_');
      }));
    }
  }, [settings, activeCategory]);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const handleOpenModal = (mode, setting = null) => {
    setModalMode(mode);
    if (setting && mode === 'edit') {
      setSelectedSetting(setting);
      setFormData({
        key: setting.key,
        value: setting.value,
        description: setting.description || '',
        is_encrypted: setting.is_encrypted || false
      });
    } else {
      setSelectedSetting(null);
      setFormData({
        key: '',
        value: '',
        description: '',
        is_encrypted: false
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (key) => {
    if (window.confirm('Are you sure you want to delete this setting?')) {
      try {
        await settingsService.deleteSetting(key);
        toast.success('Setting deleted successfully');
        fetchSettings();
      } catch (error) {
        console.error('Error deleting setting:', error);
        toast.error('Failed to delete setting');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await settingsService.upsertSetting(formData);
      toast.success(`Setting ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      setIsModalOpen(false);
      fetchSettings();
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error(`Failed to ${modalMode} setting`);
    }
  };

  const getCategoryFromKey = (key) => {
    const prefix = key.split('_')[0];
    return categories.find(cat => cat.id === prefix) ? prefix : 'general';
  };

  return (
    <div className="settings-container">
      <div className="header-section">
        <h2 className="dashboard-title">System Settings</h2>
        <Button 
          className="add-button"
          onClick={() => handleOpenModal('add')}
        >
          <HiOutlinePlus /> Add Setting
        </Button>
      </div>

      <div className="settings-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="settings-grid">
        {filteredSettings.map(setting => (
          <div key={setting.key} className="setting-card">
            <div className="setting-header">
              <h3 className="setting-key">
                {setting.key}
                {setting.is_encrypted && (
                  <span className="encrypted-badge">Encrypted</span>
                )}
              </h3>
              <div className="setting-actions">
                <ActionButton
                  icon={<HiOutlinePencil size={18} />}
                  onClick={() => handleOpenModal('edit', setting)}
                  variant="edit"
                  tooltip="Edit Setting"
                />
                <ActionButton
                  icon={<HiOutlineTrash size={18} />}
                  onClick={() => handleDelete(setting.key)}
                  variant="delete"
                  tooltip="Delete Setting"
                />
              </div>
            </div>
            {setting.description && (
              <p className="setting-description">{setting.description}</p>
            )}
            <div className="setting-value">
              {setting.is_encrypted ? '••••••••••••••••' : setting.value}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Setting' : 'Edit Setting'}
      >
        <form onSubmit={handleSubmit} className="setting-form">
          <InputField
            label="Key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="Enter setting key (e.g. payment_api_key)"
            required
            disabled={modalMode === 'edit'}
          />
          
          <InputField
            label="Value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            placeholder="Enter setting value"
            required
          />
          
          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter setting description"
            multiline
          />
          
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="is_encrypted"
              checked={formData.is_encrypted}
              onChange={(e) => setFormData({ ...formData, is_encrypted: e.target.checked })}
            />
            <label htmlFor="is_encrypted">Encrypt this value (for sensitive data)</label>
          </div>
          
          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
            >
              {modalMode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="modal-cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;