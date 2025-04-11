import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import ActionButton from '../../../components/common/ActionButton';
import Button from "../../../components/common/Button";
import { FaPlus } from "react-icons/fa";
import { couponService } from '../../../services';
import '../../../Styles/dashboard/Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: 0,
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    maxUsage: 1,
    status: 'active'
  });
  const [error, setError] = useState('');

  const columns = [
    { header: 'Code', accessor: 'code' },
    { 
      header: 'Discount',
      accessor: 'discountValue',
      cell: (row) => `${row.discountValue}${row.discountType === 'percentage' ? '%' : ' Fixed'}`
    },
    { 
      header: 'Valid From', 
      accessor: 'validFrom',
      cell: (row) => new Date(row.validFrom).toLocaleDateString()
    },
    { 
      header: 'Valid To', 
      accessor: 'validTo',
      cell: (row) => new Date(row.validTo).toLocaleDateString()
    },
    { header: 'Min Order', accessor: 'minOrderAmount' },
    { header: 'Usage', cell: (row) => `${row.usedCount}/${row.maxUsage}` },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex gap-2">
          <ActionButton
            onClick={() => handleEdit(row)}
            variant="edit"
          >
            Edit
          </ActionButton>
          <ActionButton
            onClick={() => handleDelete(row.id)}
            variant="delete"
          >
            Delete
          </ActionButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await couponService.getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validTo: new Date(coupon.validTo).toISOString().split('T')[0],
      maxUsage: coupon.maxUsage,
      status: coupon.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await couponService.deleteCoupon(id);
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form data
    if (!formData.code) {
      setError('Coupon code is required');
      return;
    }

    if (formData.discountValue <= 0) {
      setError('Discount value must be greater than 0');
      return;
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      return;
    }

    const startDate = new Date(formData.validFrom);
    const endDate = new Date(formData.validTo);

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      if (selectedCoupon) {
        await couponService.updateCoupon(selectedCoupon.id, formData);
      } else {
        await couponService.createCoupon(formData);
      }

      setIsModalOpen(false);
      setSelectedCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: 0,
        maxDiscount: '',
        validFrom: '',
        validTo: '',
        maxUsage: 1,
        status: 'active'
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  return (
    <div className="coupons-container">
      <div className="header-section">
      <h2 className="dashboard-title">Coupon Management</h2>
        <Button 
          className="add-button"
          onClick={() => {
            setSelectedCoupon(null);
            setFormData({
              code: '',
              discount: '',
              validFrom: '',
              validUntil: '',
              maxUses: '',
              isActive: true
            });
            setIsModalOpen(true);
          }}
        >
         <FaPlus /> Create Coupon
        </Button>
      </div>

      <TableWithControls
        data={coupons}
        columns={columns}
        searchPlaceholder="Search coupons..."
        searchFields={['code', 'discountType', 'status']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoupon(null);
        }}
        title={selectedCoupon ? 'Edit Coupon' : 'Create Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <InputField
            label="Coupon Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Discount Type</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <InputField
              label="Discount Value"
              type="number"
              min="0"
              max={formData.discountType === 'percentage' ? '100' : undefined}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Minimum Order Amount"
              type="number"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
            />
            <InputField
              label="Maximum Discount"
              type="number"
              min="0"
              value={formData.maxDiscount}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Valid From"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              required
            />
            <InputField
              label="Valid To"
              type="date"
              value={formData.validTo}
              onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Maximum Usage"
              type="number"
              min="1"
              value={formData.maxUsage}
              onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
              required
            />
            <div>
              <label className="block mb-2">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
          <Button 
              type="submit" 
              className="modal-submit-button"
            >
              {selectedCoupon ? 'Update' : 'Create'}
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

export default Coupons;