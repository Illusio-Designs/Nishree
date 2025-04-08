import React, { useEffect, useState } from "react";
import { productService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/dashboard/Products.css";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import "../../../Styles/dashboard/Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    status: "draft",
    categoryId: "",
    images: []
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error("Failed to fetch products:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          if (key === 'images') {
            Array.from(formData.images).forEach(image => {
              formDataToSend.append('images', image);
            });
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (modalMode === 'add') {
        await productService.createProduct(formDataToSend);
        toast.success('Product created successfully');
      } else {
        await productService.updateProduct(selectedProduct.id, formDataToSend);
        toast.success('Product updated successfully');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} product`);
    }
  };

  const handleOpenModal = async (mode, product = null) => {
    setModalMode(mode);
    if (product && mode === 'edit') {
      setSelectedProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock || "",
        status: product.status || "draft",
        categoryId: product.categoryId || "",
        images: product.images || []
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        status: "draft",
        categoryId: "",
        images: []
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns = [
    { key: "name", header: "Name" },
    { 
      key: "images", 
      header: "Image",
      render: (row) => (
        row.images && row.images[0] ? (
          <img 
            src={row.images[0].url}
            alt={row.name}
            className="product-thumbnail"
          />
        ) : (
          <span className="no-image">No image</span>
        )
      )
    },
    { key: "price", header: "Price" },
    { key: "stock", header: "Stock" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>
          {row.status}
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: <HiOutlineEye />,
      onClick: (row) => console.log('View product', row),
      variant: "view",
      tooltip: "View Product"
    },
    {
      icon: <HiOutlinePencil />,
      onClick: (row) => handleOpenModal('edit', row),
      variant: "edit",
      tooltip: "Edit Product"
    },
    {
      icon: <HiOutlineTrash />,
      onClick: (row) => handleDelete(row.id),
      variant: "delete",
      tooltip: "Delete Product"
    }
  ];

  return (
    <div className="products-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Products Manager</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
          <FaPlus /> Add Product
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={products}
        actions={actions}
        searchFields={["name", "description"]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "draft", label: "Draft" }
            ]
          }
        ]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
      >
        <form onSubmit={handleSubmit} className="product-form">
          <InputField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
          />
          <InputField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <InputField
            label="Stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <InputField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: "draft", label: "Draft" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
          />
          <InputField
            type="file"
            label="Product Images"
            onChange={(e) => setFormData({ ...formData, images: e.target.files })}
            accept="image/*"
            multiple
          />

          <div className="modal-actions">
            <Button
              type="submit"
              className="submit-button"
            >
              {modalMode === 'add' ? 'Create Product' : 'Update Product'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              className="cancel-button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;