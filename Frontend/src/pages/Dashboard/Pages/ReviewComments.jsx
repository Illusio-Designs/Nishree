import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import Filter from '../../../components/common/Filter';
import '../../../Styles/dashboard/Reviews.css';

const ReviewComments = () => {
  const [comments, setComments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    { header: 'Review', accessor: 'reviewTitle' },
    { header: 'User', accessor: 'userName' },
    { header: 'Comment', accessor: 'comment', cell: (row) => (
      <div className="comment-preview">{row.comment.substring(0, 50)}...</div>
    )},
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
    fetchComments();
  }, [filterStatus]);

  const fetchComments = async () => {
    try {
      // This would be replaced with an actual API call
      // const data = await reviewCommentService.getAllComments(filterStatus);
      // Placeholder data for now
      const data = [
        {
          id: 1,
          reviewId: 101,
          reviewTitle: 'Great Product',
          userId: 201,
          userName: 'John Doe',
          comment: 'I agree with this review. The product is amazing!',
          createdAt: '2023-06-15T10:30:00Z',
          status: 'approved'
        },
        {
          id: 2,
          reviewId: 102,
          reviewTitle: 'Average Experience',
          userId: 202,
          userName: 'Jane Smith',
          comment: 'I had a different experience. The product was just okay.',
          createdAt: '2023-06-16T14:20:00Z',
          status: 'pending'
        },
        {
          id: 3,
          reviewId: 103,
          reviewTitle: 'Not Recommended',
          userId: 203,
          userName: 'Mike Johnson',
          comment: 'I disagree with this review. The product worked fine for me.',
          createdAt: '2023-06-17T09:15:00Z',
          status: 'approved'
        },
      ];
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleViewDetails = (comment) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (comment) => {
    const newStatus = comment.status === 'pending' ? 'approved' : 'pending';
    try {
      // This would be replaced with an actual API call
      // await reviewCommentService.updateCommentStatus(comment.id, { status: newStatus });
      // For now, just update the local state
      setComments(comments.map(c => 
        c.id === comment.id ? {...c, status: newStatus} : c
      ));
      if (selectedComment && selectedComment.id === comment.id) {
        setSelectedComment({...selectedComment, status: newStatus});
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        // This would be replaced with an actual API call
        // await reviewCommentService.deleteComment(id);
        // For now, just update the local state
        setComments(comments.filter(c => c.id !== id));
        if (isModalOpen && selectedComment && selectedComment.id === id) {
          setIsModalOpen(false);
          setSelectedComment(null);
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
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
        <h2 className="dashboard-title">Review Comments</h2>
        <Filter
          options={[
            { value: 'all', label: 'All Comments' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'reported', label: 'Reported' }
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <TableWithControls
        data={comments}
        columns={columns}
        searchPlaceholder="Search comments..."
        searchFields={['reviewTitle', 'userName', 'comment', 'status']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComment(null);
        }}
        title="Comment Details"
      >
        {selectedComment && (
          <div className="modal-content">
            <div className="grid-container">
              <div className="info-section">
                <h3>Review Information</h3>
                <p>Review: {selectedComment.reviewTitle}</p>
                <p>Date: {formatDate(selectedComment.createdAt)}</p>
                <p>Status: {selectedComment.status}</p>
              </div>
              <div className="info-section">
                <h3>User Information</h3>
                <p>Name: {selectedComment.userName}</p>
              </div>
            </div>

            <div className="info-section">
              <h3>Comment Content</h3>
              <p className="review-content">{selectedComment.comment}</p>
            </div>

            <div className="modal-footer">
              <ActionButton
                onClick={() => handleStatusUpdate(selectedComment)}
                variant="primary"
              >
                {selectedComment.status === 'pending' ? 'Approve' : 'Update Status'}
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

export default ReviewComments;