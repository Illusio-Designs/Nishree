import React, { useEffect, useState } from "react";
import { sliderService, categoryService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/dashboard/Slider.css";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";

const Slider = () => {
  const [sliders, setSliders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    image: null,
    categoryId: "",
    status: "active"
  });

  const fetchSliders = async () => {
    try {
      const response = await sliderService.getAllSliders();
      setSliders(response.sliders);
    } catch (error) {
      toast.error('Failed to fetch sliders');
      console.error('Failed to fetch sliders:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      const activeCategories = data.filter(category => category.status === 'active');
      setCategories(activeCategories);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await sliderService.deleteSlider(id);
      toast.success("Slider deleted successfully");
      fetchSliders();
    } catch (error) {
      toast.error(error.message || "Failed to delete slider");
      console.error("Failed to delete slider:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.title) {
        toast.error("Title is required");
        return;
      }
      
      if (modalMode === 'add' && !formData.image) {
        toast.error("Image is required");
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('buttonText', formData.buttonText || '');
      formDataToSend.append('status', formData.status);
      
      // Handle categoryId
      if (formData.categoryId) {
        formDataToSend.append('categoryId', formData.categoryId);
      }
      
      // Handle image
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }
      
      if (modalMode === 'add') {
        await sliderService.createSlider(formDataToSend);
        toast.success('Slider created successfully');
      } else {
        await sliderService.updateSlider(selectedSlider.id, formDataToSend);
        toast.success('Slider updated successfully');
      }
      
      setShowModal(false);
      fetchSliders();
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        buttonText: "",
        image: null,
        categoryId: "",
        status: "active"
      });
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${modalMode} slider`);
      console.error(`Failed to ${modalMode} slider:`, error);
    }
  };

  const handleOpenModal = (mode, slider = null) => {
    setModalMode(mode);
    if (slider && mode === "edit") {
      setSelectedSlider(slider);
      setFormData({
        title: slider.title || "",
        description: slider.description || "",
        buttonText: slider.buttonText || "",
        image: slider.image || null,
        categoryId: slider.categoryId || "",
        status: slider.status || "active"
      });
    } else {
      setSelectedSlider(null);
      setFormData({
        title: "",
        description: "",
        buttonText: "",
        image: null,
        categoryId: "",
        status: "active"
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchSliders();
    fetchCategories();
  }, []);

  const columns = [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    { key: "buttonText", header: "Button Text" },
    {
      key: "categoryName",
      header: "Category",
      render: (row) => row.categoryName || "N/A"
    },
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
      render: (row) =>
        row.image ? (
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/slider/${row.image}`}
            alt={row.title}
            style={{ width: "100px", height: "auto", objectFit: "cover" }}
          />
        ) : (
          <span className="no-image">No image</span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal("edit", row)}
            variant="edit"
            tooltip="Edit Slider"
          />
          <ActionButton
            icon={<HiOutlineTrash size={20} />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Slider"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="slider-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Slider Manager</h2>
        <Button onClick={() => handleOpenModal("add")} className="add-button">
          <FaPlus /> Add Slider
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={sliders}
        searchFields={["title", "description", "buttonText"]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "add" ? "Add New Slider" : "Edit Slider"}
      >
        <form onSubmit={handleSubmit} className="slider-form">
          <InputField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter slider title"
            required
          />
          <InputField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter description"
            multiline
          />
          <InputField
            label="Button Text"
            value={formData.buttonText}
            onChange={(e) =>
              setFormData({ ...formData, buttonText: e.target.value })
            }
            placeholder="Enter button text"
          />
          <InputField
            label="Category"
            type="select"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            options={[
              { value: "", label: "Select a category" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))
            ]}
          />
          <InputField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
          />
          <div className="image-upload-section">
            {modalMode === "edit" && formData.image && (
              <div className="current-image">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/slider/${formData.image}`}
                  alt="Current slider"
                  className="preview-image"
                />
              </div>
            )}
            <InputField
              type="file"
              label="Slider Image"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files[0] })
              }
              accept="image/*"
              required={modalMode === "add"}
            />
          </div>

          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={!formData.title}
            >
              {modalMode === "add" ? "Create" : "Update"}
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

export default Slider;