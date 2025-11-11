import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { shippingAddressService } from '../../../services';
import { toast } from 'react-toastify';
import '../../../Styles/dashboard/ShippingAddresses.css';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa';

const ShippingAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone_number: '',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const data = await shippingAddressService.getUserShippingAddresses();
      setAddresses(data);
    } catch (error) {
      toast.error('Failed to fetch shipping addresses');
      console.error("Failed to fetch shipping addresses:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await shippingAddressService.deleteShippingAddress(id);
      toast.success('Shipping address deleted successfully');
      fetchAddresses();
    } catch (error) {
      toast.error(error.message || 'Failed to delete shipping address');
      console.error("Failed to delete shipping address:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.address || !formData.city || !formData.state || !formData.postal_code || !formData.country || !formData.phone_number) {
        toast.error('All fields are required');
        return;
      }

      if (modalMode === 'add') {
        await shippingAddressService.createShippingAddress(formData);
        toast.success('Shipping address created successfully');
      } else {
        await shippingAddressService.updateShippingAddress(selectedAddress.id, formData);
        toast.success('Shipping address updated successfully');
      }
      
      setShowModal(false);
      fetchAddresses();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} shipping address`);
      console.error(`Failed to ${modalMode} shipping address:`, error);
    }
  };

  const handleOpenModal = (mode, address = null) => {
    setModalMode(mode);
    if (address && (mode === 'edit' || mode === 'view')) {
      setSelectedAddress(address);
      setFormData({
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country: address.country || '',
        phone_number: address.phone_number || '',
        is_default: address.is_default || false
      });
    } else {
      setSelectedAddress(null);
      setFormData({
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone_number: '',
        is_default: false
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const columns = [
    { 
      header: "Address", 
      accessor: "address",
      cell: (row) => (
        <div>
          <div>{row.address}</div>
          <div>{row.city}, {row.state} {row.postal_code}</div>
          <div>{row.country}</div>
        </div>
      )
    },
    { 
      header: "Phone", 
      accessor: "phone_number"
    },
    { 
      header: "Default", 
      accessor: "is_default",
      cell: (row) => (
        <span className={`status-badge ${row.is_default ? 'active' : 'inactive'}`}>
          {row.is_default ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye size={20} />}
            onClick={() => handleOpenModal('view', row)}
            variant="view"
            tooltip="View Address"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit Address"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Address"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="shipping-addresses-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Shipping Address Management</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
          <FaPlus /> Add Shipping Address
        </Button>
      </div>

      <TableWithControls
        data={addresses}
        columns={columns}
        searchPlaceholder="Search addresses..."
        searchFields={['address', 'city', 'state', 'country', 'postal_code']}
        filters={[
          {
            key: 'is_default',
            label: 'Default Address',
            options: [
              { value: true, label: 'Yes' },
              { value: false, label: 'No' }
            ]
          }
        ]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'view' ? 'Address Details' : `${modalMode === 'add' ? 'Add' : 'Edit'} Shipping Address`}
      >
        <form onSubmit={handleSubmit} className="shipping-address-form">
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
            disabled={modalMode === 'view'}
          />
          <div className="form-row">
            <InputField
              label="City"
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
              disabled={modalMode === 'view'}
            />
            <InputField
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              required
              disabled={modalMode === 'view'}
            />
          </div>
          <div className="form-row">
            <InputField
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
              required
              disabled={modalMode === 'view'}
            />
            <InputField
              label="Country"
              name="country"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              required
              disabled={modalMode === 'view'}
            />
          </div>
          <InputField
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            required
            disabled={modalMode === 'view'}
          />
          <div className="checkbox-field">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              disabled={modalMode === 'view'}
            />
            <label htmlFor="is_default">Set as default address</label>
          </div>
          {modalMode !== 'view' && (
            <div className="modal-actions">
              <Button type="submit" className="modal-submit-button">
                {modalMode === 'add' ? 'Add' : 'Update'} Address
              </Button>
              <Button 
                type="button" 
                className="modal-cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          )}
          {modalMode === 'view' && (
            <div className="modal-actions">
              <Button 
                type="button" 
                className="modal-cancel-button"
                onClick={() => setShowModal(false)}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default ShippingAddresses;