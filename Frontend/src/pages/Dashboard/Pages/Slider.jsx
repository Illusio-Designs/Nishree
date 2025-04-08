import React, { useEffect, useState } from "react";
import { sliderService } from "../../../services";
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
  const [selectedSlider, setSelectedSlider] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null,
    link: "",
    position: 0,
    status: "active",
    startDate: "",
    endDate: ""
  });

  const fetchSliders = async () => {
    try {
      const data = await sliderService.getAllSliders();
      setSliders(data);
    } catch (error) {
      toast.error('Failed to fetch sliders');
      console.error("Failed to fetch sliders:", error);
    }
  };

  const fetchSliderById = async (id) => {
    try {
      const slider = await sliderService.getSliderById(id);
      return slider;
    } catch (error) {
      toast.error('Failed to fetch slider details');
      console.error("Failed to fetch slider details:", error);
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await sliderService.deleteSlider(id);
      toast.success('Slider deleted successfully');
      fetchSliders();
    } catch (error) {
      toast.error(error.message || 'Failed to delete slider');
      console.error("Failed to delete slider:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          if (key === 'image' && typeof formData[key] === 'string') {
            return;
          }
          formDataToSend.append(key, formData[key]);
        }
      });

      if (modalMode === 'add') {
        await sliderService.createSlider(formDataToSend);
        toast.success('Slider created successfully');
      } else {
        await sliderService.updateSlider(selectedSlider.id, formDataToSend);
        toast.success('Slider updated successfully');
      }
      
      setShowModal(false);
      fetchSliders();
    } catch (error) {
      toast.error(error.message || `Failed to ${modalMode} slider`);
      console.error(`Failed to ${modalMode} slider:`, error);
    }
  };

  const handleOpenModal = async (mode, slider = null) => {
    setModalMode(mode);
    if (slider && mode === 'edit') {
      const sliderDetails = await fetchSliderById(slider.id);
      if (sliderDetails) {
        setSelectedSlider(sliderDetails);
        setFormData({
          title: sliderDetails.title || "",
          description: sliderDetails.description || "",
          image: sliderDetails.image || null,
          link: sliderDetails.link || "",
          position: sliderDetails.position || 0,
          status: sliderDetails.status || "active",
          startDate: sliderDetails.startDate || "",
          endDate: sliderDetails.endDate || ""
        });
      }
    } else {
      setSelectedSlider(null);
      setFormData({
        title: "",
        description: "",
        image: null,
        link: "",
        position: 0,
        status: "active",
        startDate: "",
        endDate: ""
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const columns = [
    { key: "title", header: "Title" },
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
            src={`${import.meta.env.VITE_API_URL}/uploads/slider/${row.image}`}
            alt={row.title}
            className="slider-thumbnail"
          />
        ) : (
          <span className="no-image">No image</span>
        )
      )
    },
    { key: "position", header: "Position" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil size={20} />}
            onClick={() => handleOpenModal('edit', row)}
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
      )
    }
  ];

  return (
    <div className="slider-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Slider Manager</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
          icon={<FaPlus />}
        >
          Add Slider
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={sliders}
        searchFields={["title", "description"]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Add New Slider' : 'Edit Slider'}
      >
        <form onSubmit={handleSubmit} className="slider-form">
          <InputField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter slider title"
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
            label="Link"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="Enter slider link"
          />
          <InputField
            label="Position"
            type="number"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
            placeholder="Enter position number"
          />
          <InputField
            label="Status"
            type="select"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" }
            ]}
          />
          <InputField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <InputField
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
          
          <div className="image-upload-section">
            {modalMode === 'edit' && formData.image && (
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
              onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
              accept="image/*"
            />
          </div>
          
          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={!formData.title}
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

export default Slider;