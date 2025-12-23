import React, { useEffect, useState } from "react";
import { categoryService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../styles/dashboard/Category.css";
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
    slug: ""
  });

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await categoryService.getAllCategories();
      console.log('Raw API response:', response);
      
      // The API response is already the array of categories
      if (Array.isArray(response)) {
        console.log('Setting categories array:', response);
        setCategories(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log('Setting categories from response.data:', response.data);
        setCategories(response.data);
      } else {
        console.error('Unexpected data format:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]);
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

  const handleOpenModal = async (mode, category = null) => {
    setModalMode(mode);
    if (category && mode === 'edit') {
      console.log('Edit mode with category:', category);
      console.log('Meta Keywords from API:', category.metaKeywords);
      setSelectedCategory(category);
      const formDataToSet = {
        name: category.name || "",
        description: category.description || "",
        parentId: category.parentId || null,
        status: category.status || 'active',
        metaTitle: category.metaTitle || category.name || "",
        metaDescription: category.metaDescription || category.description || "",
        metaKeywords: category.metaKeywords || category.name || "",
        image: category.image || null,
        slug: category.slug || ""
      };
      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
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
        image: null,
        slug: ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
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

  const handleInputChange = (field, value) => {
    setFormData(prevData => {
      const newData = { ...prevData, [field]: value };
      
      // Auto-fill meta title and description based on name and description
      if (field === 'name') {
        newData.metaTitle = value;
        // Don't auto-fill meta keywords when name changes to preserve existing keywords
      }
      if (field === 'description') {
        newData.metaDescription = value;
      }
      
      return newData;
    });
  };

  useEffect(() => {
    console.log('Component mounted, fetching categories...');
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('Categories state updated:', categories);
  }, [categories]);

  const columns = [
    { 
      key: "name", 
      header: "Category Name",
      render: (row) => (
        <div>
          {row.name}
          {row.parentId && (
            <small className="parent-category">
              Parent: {row.parentName || row.parentId}
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
      key: "slug",
      header: "Slug"
    },
    {
      key: "image",
      header: "Image",
      render: (row) => {
        const imageUrl = row.image;
        // Check if image already contains the full path
        const imageSrc = imageUrl?.startsWith('/uploads/') 
          ? `${import.meta.env.VITE_API_URL}${imageUrl}`
          : `${import.meta.env.VITE_API_URL}/uploads/category/${imageUrl}`;
        
        return (
          <div>
            {imageUrl ? (
              <>
                <img
                  src={imageSrc}
                  alt={row.name}
                  className="category-thumbnail"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'inline-block';
                    }
                  }}
                />
                <span className="no-image" style={{ display: 'none' }}>No image</span>
              </>
            ) : (
              <span className="no-image">No image</span>
            )}
          </div>
        );
      }
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
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter category name"
            required
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter description"
            multiline
          />
          <InputField
            label="Meta Title"
            value={formData.metaTitle}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            placeholder="Enter meta title"
          />
          <InputField
            label="Meta Description"
            value={formData.metaDescription}
            onChange={(e) => handleInputChange('metaDescription', e.target.value)}
            placeholder="Enter meta description"
            multiline
          />
          <InputField
            label="Meta Keywords"
            value={formData.metaKeywords}
            onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
            placeholder="Enter meta keywords (comma separated)"
          />
          
          <div className="image-upload-section">
            {modalMode === 'edit' && formData.image && typeof formData.image === 'string' && (
              <div className="current-image">
                <img 
                  src={formData.image?.startsWith('/uploads/') 
                    ? `${import.meta.env.VITE_API_URL}${formData.image}`
                    : `${import.meta.env.VITE_API_URL}/uploads/category/${formData.image}`}
                  alt="Current category"
                  className="preview-image"
                  onError={(e) => {
                    console.error('Preview image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                  }}
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