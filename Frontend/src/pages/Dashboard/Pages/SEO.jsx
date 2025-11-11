import React, { useState, useEffect } from "react";
import TableWithControls from "../../../components/common/TableWithControls";
import Modal from "../../../components/common/Modal";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import InputField from "../../../components/common/InputField";
import { HiOutlinePencil } from "react-icons/hi2";
import { toast } from "react-toastify";
import { seoService } from "../../../services";
import "../../../Styles/dashboard/Category.css";

const SEO = () => {
  const [seoData, setSeoData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSEO, setSelectedSEO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    page_name: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    meta_image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  const columns = [
    { key: "page_name", header: "Page Name" },
    {
      key: "meta_title",
      header: "Meta Title",
      render: (row) => <div className="truncate-text">{row.meta_title}</div>,
    },
    {
      key: "meta_description",
      header: "Meta Description",
      render: (row) => (
        <div className="truncate-text">
          {row.meta_description?.substring(0, 50)}...
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleEditSEO(row)}
            variant="edit"
            tooltip="Edit SEO"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      setLoading(true);
      const data = await seoService.getAllSEOData();
      setSeoData(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch SEO data");
      console.error("Error fetching SEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSEO = (seo) => {
    console.log('Editing SEO:', seo);
    setSelectedSEO(seo);
    const newFormData = {
      page_name: seo.page_name || "",
      meta_title: seo.meta_title || "",
      meta_description: seo.meta_description || "",
      meta_keywords: seo.meta_keywords || "",
      meta_image: seo.meta_image || "",
    };
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    // Set image preview for existing image
    if (seo.meta_image) {
      setImagePreview(`${import.meta.env.VITE_API_URL}${seo.meta_image}`);
    } else {
      setImagePreview(null);
    }
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    console.log('Current form data:', formData);
    
    if (!name) {
      console.error('Input name is missing:', e.target);
      return;
    }

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handleTextareaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Just update the preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'meta_image') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append image if it's a File object
      const imageInput = document.getElementById('meta_image');
      if (imageInput.files.length > 0) {
        formDataToSend.append('image', imageInput.files[0]);
      }

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/seo/update`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update SEO data');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update SEO data');
      }

      toast.success("SEO data updated successfully");
      fetchSEOData();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating SEO:', error);
      if (error.message === 'No authentication token found') {
        toast.error('Please login again to continue');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        toast.error(error.message || "Failed to update SEO data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-manager">
      <div className="header-section">
        <h2 className="dashboard-title">SEO Management</h2>
      </div>

      <TableWithControls
        data={seoData}
        columns={columns}
        searchFields={["page_name", "meta_title"]}
        loading={loading}
      />

      {/* Edit SEO Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setImagePreview(null); // Clear preview when modal closes
        }}
        title="Edit SEO Data"
        style={{ maxWidth: "800px", width: "90%" }}
      >
        <form onSubmit={handleSubmitEdit} className="category-form">
          <div className="form-group">
            <label>Page Name</label>
            <input
              type="text"
              name="page_name"
              value={formData.page_name}
              onChange={handleInputChange}
              required
              disabled
              className="text-input"
            />
          </div>
          <div className="form-group">
            <label>Meta Title</label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleInputChange}
              required
              placeholder="Enter meta title"
              className="text-input"
            />
          </div>
          <div className="form-group">
            <label>Meta Description</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              className="textarea-input"
              rows="5"
              style={{ minHeight: "120px", width: "100%", padding: "12px" }}
              required
              placeholder="Enter meta description"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Meta Keywords</label>
            <textarea
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleInputChange}
              className="textarea-input"
              rows="3"
              style={{ minHeight: "80px", width: "100%", padding: "12px" }}
              placeholder="Enter keywords separated by commas"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Meta Image</label>
            <div className="image-upload-section">
              {imagePreview && (
                <div className="current-image">
                  <img
                    src={imagePreview}
                    alt="Current meta image"
                    className="preview-image"
                  />
                </div>
              )}
              <div className="image-upload-container">
                <input
                  type="file"
                  id="meta_image"
                  name="meta_image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  disabled={loading}
                />
                <label
                  htmlFor="meta_image"
                  className="upload-label"
                  style={{
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? (
                    <div className="upload-loading">
                      <div className="spinner"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <span>Click to upload image</span>
                      <small>PNG, JPG, GIF up to 5MB</small>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <Button type="submit" className="modal-submit-button" disabled={loading}>
              {loading ? "Saving..." : "Update"}
            </Button>
            <Button
              type="button"
              className="modal-cancel-button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <style jsx>{`
        .image-upload-section {
          margin-top: 1rem;
        }
        .current-image {
          margin-bottom: 1rem;
          position: relative;
        }
        .preview-image {
          max-width: 200px;
          max-height: 200px;
          object-fit: contain;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
        }
        .image-upload-container {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin-top: 8px;
          background-color: #f8f9fa;
          transition: all 0.3s ease;
        }
        .image-upload-container:hover {
          border-color: #007bff;
          background-color: #f0f7ff;
        }
        .upload-label {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .upload-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #666;
        }
        .upload-placeholder i {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .upload-placeholder span {
          display: block;
          font-size: 16px;
          font-weight: 500;
        }
        .upload-placeholder small {
          color: #999;
          font-size: 12px;
        }
        .file-input {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SEO;
