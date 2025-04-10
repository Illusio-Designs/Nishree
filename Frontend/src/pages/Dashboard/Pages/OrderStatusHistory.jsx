import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import InputField from '../../../components/common/InputField';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { FaPlus } from 'react-icons/fa';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import '../../../Styles/dashboard/OrderStatusHistory.css';

const OrderStatusHistory = () => {
  const [statusHistories, setStatusHistories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    orderId: '',
    status: 'pending',
    note: '',
    createdBy: ''
  });

  const orderStatusHistoryService = {
    getAllStatusHistories: async () => {
      // TODO: Implement actual API call
      return [];
    },
    createStatusHistory: async (data) => {
      // TODO: Implement actual API call
      console.log('Creating status history:', data);
      return { success: true };
    },
    updateStatusHistory: async (id, data) => {
      // TODO: Implement actual API call
      console.log(`Updating status history ${id}:`, data);
      return { success: true };
    },
    deleteStatusHistory: async (id) => {
      // TODO: Implement actual API call
      console.log(`Deleting status history ${id}`);
      return { success: true };
    }
  };

  useEffect(() => {
    fetchStatusHistories();
  }, []);

  const fetchStatusHistories = async () => {
    try {
      const data = await orderStatusHistoryService.getAllStatusHistories();
      setStatusHistories(data);
    } catch (error) {
      console.error('Error fetching status histories:', error);
    }
  };

  const handleOpenModal = (mode, history = null) => {
    setModalMode(mode);
    if (history && mode === 'edit') {
      setSelectedHistory(history);
      setFormData({
        orderId: history.orderId,
        status: history.status,
        note: history.note,
        createdBy: history.createdBy
      });
    } else if (mode === 'add') {
      setSelectedHistory(null);
      setFormData({
        orderId: '',
        status: 'pending',
        note: '',
        createdBy: ''
      });
    } else {
      setSelectedHistory(history);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this status history?')) {
      try {
        await orderStatusHistoryService.deleteStatusHistory(id);
        fetchStatusHistories();
      } catch (error) {
        console.error('Error deleting status history:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await orderStatusHistoryService.createStatusHistory(formData);
      } else {
        await orderStatusHistoryService.updateStatusHistory(selectedHistory.id, formData);
      }
      setIsModalOpen(false);
      fetchStatusHistories();
    } catch (error) {
      console.error('Error saving status history:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { header: 'Order ID', accessor: 'orderId' },
    { header: 'Customer', accessor: 'customerName' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`status-badge ${row.status}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Note', accessor: 'note' },
    { header: 'Created By', accessor: 'createdBy' },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      cell: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye size={20} />}
            onClick={() => handleOpenModal('view', row)}
            variant="view"
            tooltip="View Details"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="order-status-history-container">
      <div className="header-section">
        <h2 className="dashboard-title">Order Status History</h2>
        <Button 
          className="add-button"
          onClick={() => handleOpenModal('add')}
        >
          <FaPlus /> Add Status Update
        </Button>
      </div>

      <TableWithControls
        data={statusHistories}
        columns={columns}
        searchPlaceholder="Search status histories..."
        searchFields={['orderId', 'customerName', 'status', 'note', 'createdBy']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'shipped', label: 'Shipped' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'add' ? 'Add Status Update' : modalMode === 'edit' ? 'Edit Status Update' : 'Status Details'}
      >
        {modalMode === 'view' ? (
          <div className="status-details">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{selectedHistory?.orderId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Customer:</span>
                <span className="info-value">{selectedHistory?.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-badge ${selectedHistory?.status}`}>
                  {selectedHistory?.status}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Created By:</span>
                <span className="info-value">{selectedHistory?.createdBy}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{selectedHistory && formatDate(selectedHistory.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Order Total:</span>
                <span className="info-value">${selectedHistory?.orderTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="note-section">
              <h3 className="section-title">Note</h3>
              <p className="note-content">{selectedHistory?.note}</p>
            </div>
            
            <div className="modal-footer">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="close-button"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="status-form">
            <InputField
              label="Order ID"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              placeholder="Enter order ID"
              required
            />
            
            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="form-control"
                required
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <InputField
              label="Note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Enter status note"
              multiline
              required
            />
            
            <InputField
              label="Created By"
              value={formData.createdBy}
              onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
              placeholder="Enter creator name"
              required
            />
            
            <div className="modal-actions">
              <Button
                type="submit"
                className="modal-submit-button"
              >
                {modalMode === 'add' ? 'Create' : 'Update'}
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
        )}
      </Modal>
    </div>
  );
};

export default OrderStatusHistory;