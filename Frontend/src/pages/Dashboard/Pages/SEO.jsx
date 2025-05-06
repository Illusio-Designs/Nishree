import React, { useState, useEffect } from "react";
import TableWithControls from "../../../components/common/TableWithControls";
import Modal from "../../../components/common/Modal";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import InputField from "../../../components/common/InputField";
import { HiOutlinePencil } from "react-icons/hi2";
import { toast } from "react-toastify";
import { seoService } from "../../../services";
import "../../../Styles/dashboard/Dashboard.css";

const SEO = () => {
  const [seoData, setSeoData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSEO, setSelectedSEO] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    page_name: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    meta_image: "",
  });

  const columns = [
    { key: "page_name", header: "Page Name" },
    { key: "slug", header: "Slug" },
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
    setSelectedSEO(seo);
    setFormData({
      page_name: seo.page_name,
      slug: seo.slug,
      meta_title: seo.meta_title || "",
      meta_description: seo.meta_description || "",
      meta_keywords: seo.meta_keywords || "",
      canonical_url: seo.canonical_url || "",
      meta_image: seo.meta_image || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSEO = () => {
    setFormData({
      page_name: "",
      slug: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      canonical_url: "",
      meta_image: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await seoService.updateSEOData(selectedSEO.page_name, formData);
      toast.success("SEO data updated successfully");
      fetchSEOData();
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update SEO data");
      console.error("Error updating SEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await seoService.createSEOData(formData);
      toast.success("SEO data created successfully");
      fetchSEOData();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to create SEO data");
      console.error("Error creating SEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seo-container">
      <div className="header-section">
        <h2 className="dashboard-title">SEO Management</h2>
        <Button onClick={handleCreateSEO} variant="primary">
          Add New SEO Entry
        </Button>
      </div>

      <TableWithControls
        data={seoData}
        columns={columns}
        searchFields={["page_name", "slug", "meta_title"]}
        loading={loading}
      />

      {/* Edit SEO Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit SEO Data"
        style={{ maxWidth: "800px", width: "90%" }}
      >
        <form onSubmit={handleSubmitEdit} className="seo-form">
          <InputField
            label="Page Name"
            name="page_name"
            value={formData.page_name}
            onChange={handleInputChange}
            required
            disabled
          />
          <InputField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Meta Title"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleInputChange}
            required
          />
          <div className="form-group">
            <label>Meta Description</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="5"
              style={{ minHeight: "120px", width: "100%", padding: "12px" }}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Meta Keywords</label>
            <textarea
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              style={{ minHeight: "80px", width: "100%", padding: "12px" }}
              placeholder="Enter keywords separated by commas"
            ></textarea>
          </div>
          <InputField
            label="Canonical URL"
            name="canonical_url"
            value={formData.canonical_url}
            onChange={handleInputChange}
            placeholder="https://example.com/page"
          />
          <InputField
            label="Meta Image URL"
            name="meta_image"
            value={formData.meta_image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          <div className="modal-footer">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create SEO Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New SEO Entry"
        style={{ maxWidth: "800px", width: "90%" }}
      >
        <form onSubmit={handleSubmitCreate} className="seo-form">
          <InputField
            label="Page Name"
            name="page_name"
            value={formData.page_name}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
          />
          <InputField
            label="Meta Title"
            name="meta_title"
            value={formData.meta_title}
            onChange={handleInputChange}
            required
          />
          <div className="form-group">
            <label>Meta Description</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="5"
              style={{ minHeight: "120px", width: "100%", padding: "12px" }}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Meta Keywords</label>
            <textarea
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              style={{ minHeight: "80px", width: "100%", padding: "12px" }}
              placeholder="Enter keywords separated by commas"
            ></textarea>
          </div>
          <InputField
            label="Canonical URL"
            name="canonical_url"
            value={formData.canonical_url}
            onChange={handleInputChange}
            placeholder="https://example.com/page"
          />
          <InputField
            label="Meta Image URL"
            name="meta_image"
            value={formData.meta_image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          <div className="modal-footer">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Creating..." : "Create SEO Entry"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SEO;
