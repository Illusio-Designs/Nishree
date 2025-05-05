import React, { useState, useEffect } from "react";
import TableWithControls from "../../../components/common/TableWithControls";
import Modal from "../../../components/common/Modal";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import { FaPlus } from "react-icons/fa";
import { couponService } from "../../../services";
import "../../../Styles/dashboard/Coupons.css";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
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
  const [error, setError] = useState("");

  const columns = [
    { header: "Code", accessor: "code" },
    {
      header: "Discount",
      accessor: "value",
      cell: (row) =>
        `${row.value}${row.type === "percentage" ? "%" : " Fixed"}`,
    },
    {
      header: "Valid From",
      accessor: "startDate",
      cell: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      header: "Valid To",
      accessor: "endDate",
      cell: (row) => new Date(row.endDate).toLocaleDateString(),
    },
    { header: "Min Purchase", accessor: "minPurchase" },
    {
      header: "Usage",
      cell: (row) => `${row.usedCount || 0}/${row.usageLimit || "∞"}`,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <ActionButton onClick={() => handleEdit(row)} variant="edit">
            Edit
          </ActionButton>
          <ActionButton onClick={() => handleDelete(row.id)} variant="delete">
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
      const response = await couponService.getAllCoupons();
      console.log("Coupons response:", response);
      if (response && response.coupons) {
        setCoupons(response.coupons);
      } else {
        console.error("Invalid response format:", response);
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setError(error.message || "Failed to fetch coupons");
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || "",
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: new Date(coupon.endDate).toISOString().split("T")[0],
      usageLimit: coupon.usageLimit || 1,
      status: coupon.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await couponService.deleteCoupon(id);
        fetchCoupons();
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form data
    if (!formData.code) {
      setError("Coupon code is required");
      return;
    }

    if (formData.value <= 0) {
      setError("Discount value must be greater than 0");
      return;
    }

    if (formData.type === "percentage" && formData.value > 100) {
      setError("Percentage discount cannot exceed 100%");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      setError("End date must be after start date");
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
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      setError(error.message || "Failed to save coupon");
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
        searchFields={["code", "type", "status"]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCoupon(null);
        }}
        title={selectedCoupon ? "Edit Coupon" : "Create Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <InputField
            label="Coupon Code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Discount Type</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
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
            <div>
              <label className="block mb-2">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <Button type="submit" className="modal-submit-button">
              {selectedCoupon ? "Update" : "Create"}
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
