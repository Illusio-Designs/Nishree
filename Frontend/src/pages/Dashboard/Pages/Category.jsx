import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/dashboard/Category.css";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null,
    status: 'active',
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    image: null,
    createdAt: "",
    updatedAt: ""
  });

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchCategoryById = async (id) => {
    try {
      const category = await categoryService.getCategoryById(id);
      return category;
    } catch (error) {
      toast.error('Failed to fetch category details');
      console.error("Failed to fetch category details:", error);
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
      console.error("Failed to delete category:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          if (key === 'image' && typeof formData[key] === 'string') {
            // Skip if image is a string (existing image URL)
            return;
          }
          formDataToSend.append(key, formData[key]);
        }
      });

      if (modalMode === 'add') {
        await categoryService.createCategory(formDataToSend);
        toast.success('Category created successfully');
      } else {
        await categoryService.updateCategory(selectedCategory.id, formDataToSend);
        toast.success('Category updated successfully');
      }
      
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} category`);
      console.error(`Failed to ${modalMode} category:`, error);
    }
  };

  const handleOpenModal = async (mode, category = null) => {
    setModalMode(mode);
    if (category && mode === 'edit') {
      const categoryDetails = await fetchCategoryById(category.id);
      if (categoryDetails) {
        setSelectedCategory(categoryDetails);
        setFormData({
          name: categoryDetails.name || "",
          description: categoryDetails.description || "",
          parentId: categoryDetails.parentId || null,
          status: categoryDetails.status || 'active',
          metaTitle: categoryDetails.metaTitle || "",
          metaDescription: categoryDetails.metaDescription || "",
          metaKeywords: categoryDetails.metaKeywords || "",
          image: categoryDetails.image || null,
          createdAt: categoryDetails.createdAt || "",
          updatedAt: categoryDetails.updatedAt || ""
        });
      }
    } else {
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        parentId: null,
        status: 'active',
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        image: null
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = [
    { 
      key: "name", 
      header: "Category Name",
      render: (row) => (
        <div>
          {row.name}
          {row.parentId && (
            <small className="parent-category">
              Parent ID: {row.parentId}
            </small>
          )}
        </div>
      )
    },
    { key: "description", header: "Description" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>
          {row.status}
        </span>
      )
    },
    {
      key: "image",
      header: "Image",
      render: (row) => (
        row.image ? (
          <img 
            src={`${import.meta.env.VITE_API_URL}/uploads/category/${row.image}`}
            alt={row.name}
            className="category-thumbnail"
          />
        ) : (
          <span className="no-image">No image</span>
        )
      )
    },
    
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit Category"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Category"
          />
        </div>
      )
    }
  ];

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Category Manager</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
         <FaPlus /> Add Category
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={categories}
        searchFields={["name", "description"]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
      >
        <form onSubmit={handleSubmit} className="category-form">
          <InputField
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
            required
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
            multiline
          />
          <InputField
            label="Meta Title"
            value={formData.metaTitle}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            placeholder="Enter meta title"
          />
          <InputField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="Enter meta description"
            multiline
          />
          <InputField
            label="Meta Keywords"
            value={formData.metaKeywords}
            onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
            placeholder="Enter meta keywords"
          />
          
          <div className="image-upload-section">
            {modalMode === 'edit' && formData.image && (
              <div className="current-image">
                <img 
                  src={`${import.meta.env.VITE_API_URL}/uploads/category/${formData.image}`}
                  alt="Current category"
                  className="preview-image"
                />
              </div>
            )}
            <InputField
              type="file"
              label="Category Image"
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              accept="image/*"
            />
          </div>
          
          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={!formData.name}
            >
              {modalMode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              className="modal-cancel-button"
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

export default Category;