import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import Filter from '../../../components/common/Filter';
import { reviewService } from '../../../services';
import '../../../Styles/dashboard/Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    { header: 'Product', accessor: 'productName' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Rating', accessor: 'rating' },
    { header: 'Date', accessor: 'createdAt' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            onClick={() => handleViewDetails(row)}
            variant="view"
          >
            View
          </ActionButton>
          <ActionButton
            onClick={() => handleStatusUpdate(row)}
            variant="edit"
          >
            {row.status === 'pending' ? 'Approve' : 'Update'}
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
    fetchReviews();
  }, [filterStatus]);

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getAllReviews(filterStatus);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (review) => {
    const newStatus = review.status === 'pending' ? 'approved' : 'pending';
    try {
      await reviewService.updateReviewStatus(review.id, { status: newStatus });
      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewService.deleteReview(id);
        fetchReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="reviews-container">
      <div className="header-section">
        <h2 className="dashboard-title">Review Management</h2>
        <Filter
          options={[
            { value: 'all', label: 'All Reviews' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'reported', label: 'Reported' }
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <TableWithControls
        data={reviews}
        columns={columns}
        searchPlaceholder="Search reviews..."
        searchFields={['productName', 'customerName', 'status']}
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

            {selectedReview.comments?.length > 0 && (
              <div className="comments-section">
                <h3>Comments</h3>
                <div>
                  {selectedReview.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <p className="comment-author">{comment.userName}</p>
                      <p className="comment-content">{comment.content}</p>
                      <p className="comment-date">{formatDate(comment.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <ActionButton
                onClick={() => handleStatusUpdate(selectedReview)}
                variant="primary"
              >
                {selectedReview.status === 'pending' ? 'Approve' : 'Update Status'}
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