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
    discount: '',
    validFrom: '',
    validUntil: '',
    maxUses: '',
    isActive: true
  });

  const columns = [
    { header: 'Code', accessor: 'code' },
    { header: 'Discount', accessor: 'discount' },
    { header: 'Valid From', accessor: 'validFrom' },
    { header: 'Valid Until', accessor: 'validUntil' },
    { header: 'Max Uses', accessor: 'maxUses' },
    { header: 'Status', accessor: 'isActive' },
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
      discount: coupon.discount,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      maxUses: coupon.maxUses,
      isActive: coupon.isActive
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
        discount: '',
        validFrom: '',
        validUntil: '',
        maxUses: '',
        isActive: true
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
          <InputField
            label="Coupon Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
          />
          <InputField
            label="Discount"
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            required
          />
          <InputField
            label="Valid From"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
            required
          />
          <InputField
            label="Valid Until"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            required
          />
          <InputField
            label="Max Uses"
            type="number"
            value={formData.maxUses}
            onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
            required
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Active</label>
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