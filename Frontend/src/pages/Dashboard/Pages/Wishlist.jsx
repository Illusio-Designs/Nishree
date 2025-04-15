import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import { wishlistService } from '../../../services';
import '../../../Styles/dashboard/Wishlist.css';


const Wishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  const columns = [
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Items Count', accessor: 'itemsCount' },
    { header: 'Last Updated', accessor: 'updatedAt' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            onClick={() => handleViewDetails(row)}
            variant="view"
          >
            View Items
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
    fetchWishlists();
  }, []);

  const fetchWishlists = async () => {
    try {
      const data = await wishlistService.getAllWishlists();
      setWishlists(data);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    }
  };

  const handleViewDetails = (wishlist) => {
    setSelectedWishlist(wishlist);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wishlist?')) {
      try {
        await wishlistService.deleteWishlist(id);
        fetchWishlists();
      } catch (error) {
        console.error('Error deleting wishlist:', error);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="wishlist-container">
      <div className="header-section">
        <h2 className="dashboard-title">Wishlist Management</h2>
  <Button 
          className="add-button"
          onClick={fetchWishlists}
        >
          Refresh Wishlists
        </Button>
      </div>

      <TableWithControls
        data={wishlists}
        columns={columns}
        searchPlaceholder="Search wishlists..."
        searchFields={['productName', 'userName', 'createdAt']}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWishlist(null);
        }}
        title="Wishlist Details"
      >
        {selectedWishlist && (
   <div className="modal-content">
            <div className="customer-info">
              <h3 className="section-title">Customer Information</h3>
              <p>Name: {selectedWishlist.customerName}</p>
              <p>Email: {selectedWishlist.customerEmail}</p>
              <p>Last Updated: {formatDate(selectedWishlist.updatedAt)}</p>
            </div>

            <div>
              <h3 className="section-title">Wishlist Items</h3>
              <table className="wishlist-table">
                <thead>
                  <tr>
                    <th className="text-left">Product</th>
                    <th className="text-right">Price</th>
                    <th className="text-center">Stock Status</th>
                    <th className="text-center">Added Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWishlist.items?.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td>
                        <div className="product-cell">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="product-image"
                            />
                          )}
                          <div className="product-info">
                            <p className="product-name">{item.productName}</p>
                            <p className="product-sku">{item.productSku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-center">
                        <span
                          className={`stock-status ${item.inStock ? 'in-stock' : 'out-of-stock'}`}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="text-center">{formatDate(item.addedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
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

export default Wishlist;