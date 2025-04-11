import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import Filter from '../../../components/common/Filter';
import '../../../Styles/dashboard/Reviews.css';

const ReviewLikes = () => {
  const [likes, setLikes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLike, setSelectedLike] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const columns = [
    { header: 'Review', accessor: 'reviewTitle' },
    { header: 'Product', accessor: 'productName' },
    { header: 'User', accessor: 'userName' },
    { header: 'Date', accessor: 'createdAt' },
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
    fetchLikes();
  }, [filterStatus]);

  const fetchLikes = async () => {
    try {
      // This would be replaced with an actual API call
      // const data = await reviewLikeService.getAllLikes(filterStatus);
      // Placeholder data for now
      const data = [
        {
          id: 1,
          reviewId: 101,
          reviewTitle: 'Great Product',
          productId: 301,
          productName: 'Premium Coffee',
          userId: 201,
          userName: 'John Doe',
          createdAt: '2023-06-15T10:30:00Z'
        },
        {
          id: 2,
          reviewId: 102,
          reviewTitle: 'Average Experience',
          productId: 302,
          productName: 'Organic Tea',
          userId: 202,
          userName: 'Jane Smith',
          createdAt: '2023-06-16T14:20:00Z'
        },
        {
          id: 3,
          reviewId: 103,
          reviewTitle: 'Not Recommended',
          productId: 303,
          productName: 'Herbal Supplement',
          userId: 203,
          userName: 'Mike Johnson',
          createdAt: '2023-06-17T09:15:00Z'
        },
      ];
      setLikes(data);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const handleViewDetails = (like) => {
    setSelectedLike(like);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this like?')) {
      try {
        // This would be replaced with an actual API call
        // await reviewLikeService.deleteLike(id);
        // For now, just update the local state
        setLikes(likes.filter(l => l.id !== id));
        if (isModalOpen && selectedLike && selectedLike.id === id) {
          setIsModalOpen(false);
          setSelectedLike(null);
        }
      } catch (error) {
        console.error('Error deleting like:', error);
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
        <h2 className="dashboard-title">Review Likes</h2>
        <Filter
          options={[
            { value: 'all', label: 'All Likes' },
            { value: 'recent', label: 'Recent' },
            { value: 'oldest', label: 'Oldest' }
          ]}
          value={filterStatus}
          onChange={setFilterStatus}
        />
      </div>

      <TableWithControls
        data={likes}
        columns={columns}
        searchPlaceholder="Search likes..."
        searchFields={['reviewTitle', 'productName', 'userName']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLike(null);
        }}
        title="Like Details"
      >
        {selectedLike && (
          <div className="modal-content">
            <div className="grid-container">
              <div className="info-section">
                <h3>Review Information</h3>
                <p>Review: {selectedLike.reviewTitle}</p>
                <p>Product: {selectedLike.productName}</p>
                <p>Date Liked: {formatDate(selectedLike.createdAt)}</p>
              </div>
              <div className="info-section">
                <h3>User Information</h3>
                <p>Name: {selectedLike.userName}</p>
              </div>
            </div>

            <div className="modal-footer">
              <ActionButton
                onClick={() => handleDelete(selectedLike.id)}
                variant="delete"
              >
                Delete Like
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

export default ReviewLikes;