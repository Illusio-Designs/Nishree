import React, { useState, useEffect } from "react";
import { reviewService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Filter from "../../../components/common/Filter";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import "../../../Styles/dashboard/Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalMode, setModalMode] = useState("view");

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
      key: "createdAt",
      header: "Date",
      render: (row) => formatDate(row.createdAt),
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
            icon={<HiOutlineEye size={20} />}
            onClick={() => handleViewDetails(row)}
            variant="view"
            tooltip="View Details"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleStatusUpdate(row)}
            variant="edit"
            tooltip={row.status === "pending" ? "Approve" : "Update Status"}
          />
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
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAllReviews(filterStatus);
      setReviews(data);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error("Error fetching reviews:", error);
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (review) => {
    const newStatus = review.status === "pending" ? "approved" : "pending";
    try {
      await reviewService.updateReviewStatus(review.id, { status: newStatus });
      toast.success(`Review ${newStatus} successfully`);
      fetchReviews();
    } catch (error) {
      toast.error(error.message || "Failed to update review status");
      console.error("Error updating review status:", error);
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
    <div className="reviews-container">
      <div className="header-section">
        <h2 className="dashboard-title">Review Management</h2>
        <Filter
          options={[
            { value: "all", label: "All Reviews" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <TableWithControls
        data={reviews}
        columns={columns}
        searchPlaceholder="Search reviews..."
        searchFields={["productName", "customerName", "status"]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
        }}
        title="Review Details"
      >
        {selectedReview && (
          <div className="modal-content">
            <div className="grid-container">
              <div className="info-section">
                <h3>Product Information</h3>
                <p>Name: {selectedReview.productName}</p>
                <p>Rating: {selectedReview.rating} / 5</p>
                <p>Date: {formatDate(selectedReview.createdAt)}</p>
                <p>Status: {selectedReview.status}</p>
              </div>
              <div className="info-section">
                <h3>Customer Information</h3>
                <p>Name: {selectedReview.customerName}</p>
                <p>Email: {selectedReview.customerEmail}</p>
              </div>
            </div>

            <div className="info-section">
              <h3>Review Content</h3>
              <p className="review-content">{selectedReview.content}</p>
            </div>

            {selectedReview.images?.length > 0 && (
              <div className="info-section">
                <h3>Review Images</h3>
                <div className="review-images">
                  {selectedReview.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Review image ${index + 1}`}
                      className="review-image"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <ActionButton
                onClick={() => handleStatusUpdate(selectedReview)}
                variant="primary"
              >
                {selectedReview.status === "pending"
                  ? "Approve"
                  : "Update Status"}
              </ActionButton>
              <ActionButton
                onClick={() => setIsModalOpen(false)}
                variant="secondary"
              >
                Close
              </ActionButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
