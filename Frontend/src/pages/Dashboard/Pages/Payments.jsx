import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { paymentService } from '../../../services';
import { toast } from 'react-toastify';
import '../../../Styles/dashboard/Payments.css';
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalMode, setModalMode] = useState('view');
  const [statusOptions] = useState([
    'pending',
    'successful',
    'failed',
    'refunded'
  ]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await paymentService.getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (payment) => {
    setSelectedPayment(payment);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentService.deletePayment(id);
        toast.success('Payment record deleted successfully');
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
        toast.error('Failed to delete payment record');
      }
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      const newStatus = e.target.status.value;
      await paymentService.updatePaymentStatus(selectedPayment.id, { status: newStatus });
      toast.success('Payment status updated successfully');
      setIsModalOpen(false);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    { header: 'Order ID', accessor: 'orderId' },
    { header: 'Customer', accessor: 'customerName' },
    { 
      header: 'Amount', 
      accessor: 'amountPaid',
      cell: (row) => formatCurrency(row.amountPaid)
    },
    { 
      header: 'Payment Type', 
      accessor: 'paymentType',
      cell: (row) => row.paymentType.toUpperCase()
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => (
        <span className={`status-badge ${row.status}`}>
          {row.status}
        </span>
      )
    },
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
            onClick={() => handleViewDetails(row)}
            variant="view"
            tooltip="View Details"
          />
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleUpdateStatus(row)}
            variant="edit"
            tooltip="Update Status"
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
    <div className="payments-container">
      <div className="header-section">
        <h2 className="dashboard-title">Payment Management</h2>
        <Button 
          className="add-button"
          onClick={fetchPayments}
        >
          Refresh Payments
        </Button>
      </div>

      <TableWithControls
        data={payments}
        columns={columns}
        searchPlaceholder="Search payments..."
        searchFields={['orderId', 'customerName', 'transactionId', 'status']}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: statusOptions.map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1)
            }))
          },
          {
            key: 'paymentType',
            label: 'Payment Type',
            options: [
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'cod', label: 'Cash on Delivery' }
            ]
          }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        title={modalMode === 'view' ? 'Payment Details' : 'Update Payment Status'}
      >
        {selectedPayment && modalMode === 'view' ? (
          <div className="modal-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{selectedPayment.orderId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Customer:</span>
                <span className="info-value">{selectedPayment.customerName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Amount:</span>
                <span className="info-value">{formatCurrency(selectedPayment.amountPaid)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  <span className={`status-badge ${selectedPayment.status}`}>
                    {selectedPayment.status}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Payment Type:</span>
                <span className="info-value">{selectedPayment.paymentType.toUpperCase()}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date:</span>
                <span className="info-value">{formatDate(selectedPayment.createdAt)}</span>
              </div>
            </div>
            
            <div className="payment-details">
              <h3>Transaction Details</h3>
              <p>
                <strong>Transaction ID:</strong> 
                <span className="transaction-id">{selectedPayment.transactionId || 'N/A'}</span>
              </p>
              <p>
                <strong>Payment Gateway:</strong> {selectedPayment.paymentGateway || 'N/A'}
              </p>
              {selectedPayment.paymentDetails && (
                <div>
                  <h3>Additional Details</h3>
                  <pre>{JSON.stringify(selectedPayment.paymentDetails, null, 2)}</pre>
                </div>
              )}
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
          <form onSubmit={handleStatusChange} className="status-form">
            <div className="form-group">
              <label>Payment Status</label>
              <select 
                name="status"
                defaultValue={selectedPayment?.status}
                className="form-control"
                required
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <Button
                type="submit"
                className="modal-submit-button"
              >
                Update Status
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

export default Payments;