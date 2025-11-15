import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa';
import TableWithControls from '../../../components/common/TableWithControls';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import { shippingFeeService } from '../../../services';
import '../../../Styles/dashboard/Category.css';

const ShippingFees = () => {
  const [shippingFees, setShippingFees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    order_type: '',
    fee: ''
  });

  const columns = [
    { 
      key: 'order_type',
      header: 'Order Type',
      render: (row) => row.order_type.toUpperCase()
    },
    { 
      key: 'fee',
      header: 'Fee Amount',
      render: (row) => `₹${parseFloat(row.fee).toFixed(2)}`
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete"
          />
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const fetchShippingFees = async () => {
    try {
      const fees = await shippingFeeService.getAllShippingFees();
      setShippingFees(fees || []);
    } catch (error) {
      console.error('Error fetching shipping fees:', error);
      toast.error('Failed to load shipping fees');
    }
  };

  const handleOpenModal = (mode, fee = null) => {
    setModalMode(mode);
    if (fee && mode === 'edit') {
      setEditingFee(fee);
      setFormData({
        order_type: fee.order_type,
        fee: fee.fee
      });
    } else {
      setEditingFee(null);
      setFormData({ order_type: '', fee: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping fee?')) {
      try {
        await shippingFeeService.deleteShippingFee(id);
        toast.success('Shipping fee deleted successfully');
        fetchShippingFees();
      } catch (error) {
        toast.error('Failed to delete shipping fee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'edit') {
        await shippingFeeService.createOrUpdateShippingFee({
          ...formData,
          id: editingFee.id
        });
        toast.success('Shipping fee updated successfully');
      } else {
        await shippingFeeService.createOrUpdateShippingFee(formData);
        toast.success('Shipping fee added successfully');
      }
      
      setIsModalOpen(false);
      fetchShippingFees();
    } catch (error) {
      toast.error(error.message || 'Failed to save shipping fee');
    }
  };

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Shipping Fees</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
          <FaPlus /> Add Shipping Fee
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={shippingFees}
        searchFields={['order_type']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Shipping Fee' : 'Edit Shipping Fee'}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <InputField
            label="Order Type"
            value={formData.order_type}
            onChange={(e) => setFormData({ ...formData, order_type: e.target.value.toLowerCase() })}
            placeholder="e.g., cod, prepaid"
            required
          />

          <InputField
            label="Fee Amount (₹)"
            type="number"
            step="0.01"
            min="0"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            placeholder="0.00"
            required
          />

          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={!formData.order_type || !formData.fee}
            >
              {modalMode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="modal-cancel-button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShippingFees;
