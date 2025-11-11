import React, { useState, useEffect } from "react";
import { reviewService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Filter from "../../../components/common/Filter";
import { 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlineEye, 
  HiOutlineCheck, 
  HiOutlineXMark 
} from "react-icons/hi2";
import "../../../Styles/dashboard/Reviews.css";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalMode, setModalMode] = useState("view");
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

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
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleEditReview(row)}
            variant="edit"
            tooltip="Edit Review"
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
    setLoading(true);
    try {
      const response = await reviewService.getAllReviews(filterStatus);
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
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setAdminNotes(review.admin_notes || "");
    setModalMode("edit");
    setIsModalOpen(true);
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

  const handleSaveEdit = async () => {
    try {
      await reviewService.moderateReview(selectedReview.id, {
        admin_notes: adminNotes,
        is_featured: selectedReview.is_featured
      });
      toast.success("Review updated successfully");
      setIsModalOpen(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.message || "Failed to update review");
      console.error("Error updating review:", error);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await reviewService.deleteReviewImage(imageId);
        toast.success("Image deleted successfully");
        fetchReviews();
      } catch (error) {
        toast.error(error.message || "Failed to delete image");
        console.error("Error deleting image:", error);
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
            { value: "rejected", label: "Rejected" },
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
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
          setAdminNotes("");
        }}
        title={modalMode === "view" ? "Review Details" : "Edit Review"}
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
                    <div key={index} className="image-container">
                      <img
                        src={image.url}
                        alt={`Review image ${index + 1}`}
                        className="review-image"
                      />
                      <button
                        className="delete-image-btn"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalMode === "edit" && (
              <div className="info-section">
                <h3>Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes..."
                  className="admin-notes"
                />
                <div className="checkbox-container">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedReview.is_featured}
                      onChange={(e) =>
                        setSelectedReview({
                          ...selectedReview,
                          is_featured: e.target.checked,
                        })
                      }
                    />
                    Feature this review
                  </label>
                </div>
              </div>
            )}

            <div className="modal-footer">
              {modalMode === "edit" ? (
                <>
                  <Button onClick={handleSaveEdit} variant="primary">
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsModalOpen(false)} variant="secondary">
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;
