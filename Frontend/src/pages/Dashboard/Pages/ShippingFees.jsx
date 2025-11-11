import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { shippingFeeService } from '../../../services';
import { toast } from 'react-toastify';
import '../../../Styles/dashboard/ShippingFees.css';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import { FaPlus } from 'react-icons/fa';

const ShippingFees = () => {
  const [shippingFees, setShippingFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    order_type: '',
    fee: 0,
    weight_based_fee: 0,
    location_based_fee: 0
  });

  const fetchShippingFees = async () => {
    try {
      const data = await shippingFeeService.getAllShippingFees();
      setShippingFees(data);
    } catch (error) {
      toast.error('Failed to fetch shipping fees');
      console.error("Failed to fetch shipping fees:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await shippingFeeService.deleteShippingFee(id);
      toast.success('Shipping fee deleted successfully');
      fetchShippingFees();
    } catch (error) {
      toast.error(error.message || 'Failed to delete shipping fee');
      console.error("Failed to delete shipping fee:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.order_type || formData.fee === undefined) {
        toast.error('Order type and fee are required');
        return;
      }

      // Ensure numeric values
      const feeData = {
        order_type: formData.order_type,
        fee: parseFloat(formData.fee),
        weight_based_fee: parseFloat(formData.weight_based_fee || 0),
        location_based_fee: parseFloat(formData.location_based_fee || 0)
      };

      await shippingFeeService.createOrUpdateShippingFee(feeData);
      toast.success(`Shipping fee ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
      
      setShowModal(false);
      fetchShippingFees();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} shipping fee`);
      console.error(`Failed to ${modalMode} shipping fee:`, error);
    }
  };

  const handleOpenModal = (mode, fee = null) => {
    setModalMode(mode);
    if (fee && mode === 'edit') {
      setSelectedFee(fee);
      setFormData({
        order_type: fee.order_type || '',
        fee: fee.fee || 0,
        weight_based_fee: fee.weight_based_fee || 0,
        location_based_fee: fee.location_based_fee || 0
      });
    } else {
      setSelectedFee(null);
      setFormData({
        order_type: '',
        fee: 0,
        weight_based_fee: 0,
        location_based_fee: 0
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    { 
      header: "Order Type", 
      accessor: "order_type",
      cell: (row) => row.order_type.toUpperCase()
    },
    { 
      header: "Base Fee", 
      accessor: "fee",
      cell: (row) => formatCurrency(row.fee)
    },
    { 
      header: "Weight-Based Fee", 
      accessor: "weight_based_fee",
      cell: (row) => formatCurrency(row.weight_based_fee)
    },
    { 
      header: "Location-Based Fee", 
      accessor: "location_based_fee",
      cell: (row) => formatCurrency(row.location_based_fee)
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit Fee"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Fee"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="shipping-fees-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Shipping Fee Management</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
          <FaPlus /> Add Shipping Fee
        </Button>
      </div>

      <TableWithControls
        data={shippingFees}
        columns={columns}
        searchPlaceholder="Search shipping fees..."
        searchFields={['order_type']}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${modalMode === 'add' ? 'Add' : 'Edit'} Shipping Fee`}
      >
        <form onSubmit={handleSubmit} className="shipping-fee-form">
          <InputField
            label="Order Type"
            name="order_type"
            value={formData.order_type}
            onChange={(e) => setFormData({...formData, order_type: e.target.value})}
            required
          />
          <InputField
            label="Base Fee"
            name="fee"
            type="number"
            step="0.01"
            value={formData.fee}
            onChange={(e) => setFormData({...formData, fee: e.target.value})}
            required
          />
          <InputField
            label="Weight-Based Fee"
            name="weight_based_fee"
            type="number"
            step="0.01"
            value={formData.weight_based_fee}
            onChange={(e) => setFormData({...formData, weight_based_fee: e.target.value})}
          />
          <InputField
            label="Location-Based Fee"
            name="location_based_fee"
            type="number"
            step="0.01"
            value={formData.location_based_fee}
            onChange={(e) => setFormData({...formData, location_based_fee: e.target.value})}
          />
          <div className="modal-actions">
            <Button type="submit" className="modal-submit-button">
              {modalMode === 'add' ? 'Add' : 'Update'} Shipping Fee
            </Button>
            <Button 
              type="button" 
              className="modal-cancel-button"
              onClick={() => setShowModal(false)}
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