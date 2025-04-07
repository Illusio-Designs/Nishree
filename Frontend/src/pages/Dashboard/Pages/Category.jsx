import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/Category.css";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaTags: "",
    image: null
  });

  const handleOpenModal = (mode, category = null) => {
    setModalMode(mode);
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        parentId: category.parentId || null,
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
        metaKeywords: category.metaKeywords || "",
        metaTags: category.metaTags || "",
        image: null
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        parentId: null,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        metaTags: "",
        image: null
      });
    }
    setShowModal(true);
  };
  
  const columns = [
    { 
      key: "name", 
      header: "Category Name",
      render: (row) => (
        <div>
          {row.name}
          {row.parentName && (
            <small className="parent-category">
              Parent: {row.parentName}
            </small>
          )}
        </div>
      )
    },
    { key: "description", header: "Description" },
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
            icon={<FaEdit />}
            onClick={() => handleOpenModal('edit', row)}
            variant="edit"
            tooltip="Edit Category"
          />
          <ActionButton
            icon={<FaTrash />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Category"
          />
        </div>
      )
    }
  ];
  
  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
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
      
      fetchCategories();
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} category`);
      console.error(`Failed to ${modalMode} category:`, error);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Category Manager</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
          icon={<FaPlus />}
        >
          Add Category
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
        <div className="category-form">
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
          <InputField
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Enter slug"
          />
          <InputField
            label="Meta Tags"
            value={formData.metaTags}
            onChange={(e) => setFormData({ ...formData, metaTags: e.target.value })}
            placeholder="Enter meta tags"
          />
          <InputField
            type="file"
            label="Category Image"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
            accept="image/*"
          />
          
          <div className="modal-actions">
            <Button
              onClick={handleSubmit}
              className="modal-submit-button"
              disabled={!formData.name}
            >
              {modalMode === 'add' ? 'Create' : 'Update'}
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              className="modal-cancel-button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Category;