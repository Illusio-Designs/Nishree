import React, { useState, useEffect } from "react";
import TableWithControls from "../../../components/common/TableWithControls";
import Modal from "../../../components/common/Modal";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import DropdownSelect from "../../../components/common/DropdownSelect";
import { FaPlus } from "react-icons/fa";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import { couponService } from "../../../services";
import { toast } from "react-toastify";
import "../../../Styles/dashboard/Category.css";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minPurchase: 0,
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: 1,
    status: "active",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const columns = [
    { key: "code", header: "Code" },
    {
      key: "discount",
      header: "Discount",
      render: (row) =>
        `${parseFloat(row.value || 0).toFixed(2)}${
          row.type === "percentage" ? "%" : " Fixed"
        }`,
    },
    {
      key: "startDate",
      header: "Valid From",
      render: (row) => formatDate(row.startDate),
    },
    {
      key: "endDate",
      header: "Valid To",
      render: (row) => formatDate(row.endDate),
    },
    {
      key: "minPurchase",
      header: "Min Purchase",
      render: (row) => `₹${parseFloat(row.minPurchase || 0).toFixed(2)}`,
    },
    {
      key: "usage",
      header: "Usage",
      render: (row) => {
        const totalUsage = row.CouponUsages?.length || 0;
        const uniqueUsers = new Set(row.CouponUsages?.map(usage => usage.userId) || []).size;
        return `${uniqueUsers}/${row.usageLimit || "∞"} users`;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>{row.status}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal("edit", row)}
            variant="edit"
            tooltip="Edit Coupon"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Coupon"
          />
        </div>
      ),
    },
  ];

  const fetchCoupons = async () => {
    try {
      const response = await couponService.getAllCoupons();
      setCoupons(response.coupons || []);
    } catch (error) {
      toast.error("Failed to fetch coupons");
      console.error("Failed to fetch coupons:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await couponService.deleteCoupon(id);
        toast.success("Coupon deleted successfully");
        fetchCoupons();
      } catch (error) {
        toast.error(error.message || "Failed to delete coupon");
        console.error("Failed to delete coupon:", error);
      }
    }
  };

  const handleViewUsage = (coupon) => {
    setSelectedCoupon(coupon);
    setShowUsageModal(true);
  };

  const handleOpenModal = (mode, coupon = null) => {
    setModalMode(mode);
    if (coupon && mode === "edit") {
      setSelectedCoupon(coupon);
      setFormData({
        code: coupon.code || "",
        type: coupon.type || "percentage",
        value: coupon.value || "",
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount || "",
        startDate: coupon.startDate
          ? new Date(coupon.startDate).toISOString().split("T")[0]
          : "",
        endDate: coupon.endDate
          ? new Date(coupon.endDate).toISOString().split("T")[0]
          : "",
        usageLimit: coupon.usageLimit || 1,
        status: coupon.status || "active",
      });
    } else {
      setSelectedCoupon(null);
      setFormData({
        code: "",
        type: "percentage",
        value: "",
        minPurchase: 0,
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: 1,
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.code) {
        toast.error("Coupon code is required");
        return;
      }

      if (formData.value <= 0) {
        toast.error("Discount value must be greater than 0");
        return;
      }

      if (formData.type === "percentage" && formData.value > 100) {
        toast.error("Percentage discount cannot exceed 100%");
        return;
      }

      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        toast.error("End date must be after start date");
        return;
      }

      if (modalMode === "add") {
        await couponService.createCoupon(formData);
        toast.success("Coupon created successfully");
      } else {
        await couponService.updateCoupon(selectedCoupon.id, formData);
        toast.success("Coupon updated successfully");
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} coupon`);
      console.error(`Failed to ${modalMode} coupon:`, error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const renderUsageModal = () => (
    <Modal
      isOpen={showUsageModal}
      onClose={() => setShowUsageModal(false)}
      title={`Coupon Usage - ${selectedCoupon?.code}`}
    >
      <div className="usage-details">
        <div className="usage-stats">
          <div className="stat-item">
            <label>Total Usage:</label>
            <span>{selectedCoupon?.CouponUsages?.length || 0}</span>
          </div>
          <div className="stat-item">
            <label>Usage Limit:</label>
            <span>{selectedCoupon?.usageLimit || "∞"}</span>
          </div>
        </div>
        <div className="usage-list">
          <h4>Usage History</h4>
          {selectedCoupon?.CouponUsages?.length > 0 ? (
            <table className="usage-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Used At</th>
                </tr>
              </thead>
              <tbody>
                {selectedCoupon.CouponUsages.map((usage, index) => (
                  <tr key={index}>
                    <td>{usage.userId}</td>
                    <td>{formatDate(usage.usedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-usage">No usage history available</p>
          )}
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Coupon Management</h2>
        <Button onClick={() => handleOpenModal("add")} className="add-button">
          <FaPlus /> Add Coupon
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={coupons}
        searchFields={["code", "type", "status"]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "add" ? "Create Coupon" : "Edit Coupon"}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <InputField
            label="Coupon Code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <DropdownSelect
              label="Discount Type"
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed", label: "Fixed Amount" },
              ]}
              value={{
                value: formData.type,
                label:
                  formData.type === "percentage"
                    ? "Percentage"
                    : "Fixed Amount",
              }}
              onChange={(option) =>
                setFormData({ ...formData, type: option.value })
              }
              required
            />
            <InputField
              label="Discount Value"
              type="number"
              min="0"
              max={formData.type === "percentage" ? "100" : undefined}
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Minimum Purchase Amount"
              type="number"
              min="0"
              value={formData.minPurchase}
              onChange={(e) =>
                setFormData({ ...formData, minPurchase: e.target.value })
              }
            />
            <InputField
              label="Maximum Discount"
              type="number"
              min="0"
              value={formData.maxDiscount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscount: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Valid From"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
            <InputField
              label="Valid To"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Usage Limit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
            />
            <DropdownSelect
              label="Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              value={{
                value: formData.status,
                label: formData.status === "active" ? "Active" : "Inactive",
              }}
              onChange={(option) =>
                setFormData({ ...formData, status: option.value })
              }
              required
            />
          </div>
          <div className="modal-actions">
            <Button type="submit" className="modal-submit-button">
              {modalMode === "add" ? "Create" : "Update"}
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
      {renderUsageModal()}
    </div>
  );
};

export default Coupons;
