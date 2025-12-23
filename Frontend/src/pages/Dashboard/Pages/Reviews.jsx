import React, { useState, useEffect } from "react";
import { reviewService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import ActionButton from "../../../components/common/ActionButton";
import { 
  HiOutlineTrash, 
  HiOutlineCheck, 
  HiOutlineXMark 
} from "react-icons/hi2";
import "../../../styles/dashboard/Category.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);

  const columns = [
    { key: "productName", header: "Product" },
    { key: "customerName", header: "Customer" },
    {
      key: "rating",
      header: "Rating",
      render: (row) => (
        <div className="rating-stars">
          {"★".repeat(row.rating)}
          {"☆".repeat(5 - row.rating)}
        </div>
      ),
    },
    {
      key: "review",
      header: "Review Content",
      render: (row) => (
        <div style={{ 
          maxWidth: '300px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {row.review || row.content}
        </div>
      ),
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
          {row.status === "pending" && (
            <>
              <ActionButton
                icon={<HiOutlineCheck size={20} />}
                onClick={() => handleModerate(row.id, "approved")}
                variant="success"
                tooltip="Approve Review"
              />
              <ActionButton
                icon={<HiOutlineXMark size={20} />}
                onClick={() => handleModerate(row.id, "rejected")}
                variant="danger"
                tooltip="Reject Review"
              />
            </>
          )}
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Review"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewService.getAllReviews("all");
      if (response && Array.isArray(response)) {
        setReviews(response);
      } else {
        console.error('Invalid response format:', response);
        toast.error("Invalid response format from server");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(error.message || "Failed to fetch reviews");
      setReviews([]);
    }
  };

  const handleModerate = async (id, status) => {
    try {
      await reviewService.moderateReview(id, { status });
      toast.success(`Review ${status} successfully`);
      fetchReviews();
    } catch (error) {
      toast.error(error.message || "Failed to moderate review");
      console.error("Error moderating review:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewService.deleteReview(id);
        toast.success("Review deleted successfully");
        fetchReviews();
      } catch (error) {
        toast.error(error.message || "Failed to delete review");
        console.error("Error deleting review:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Review Management</h2>
      </div>

      <TableWithControls
        columns={columns}
        data={reviews}
        searchFields={["productName", "customerName", "status"]}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'all', label: 'All Reviews' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
            ]
          }
        ]}
      />
    </div>
  );
};

export default Reviews;
