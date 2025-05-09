import React, { useEffect, useState } from "react";
import { productService, categoryService, attributeService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/dashboard/Products.css";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentStep, setCurrentStep] = useState(1);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: "",
    values: ""
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    categoryId: "",
    variations: [
      {
        sku: "",
        price: 0,
        comparePrice: 0,
        stock: 0,
        weight: 0,
        weightUnit: "g",
        dimensions: { length: 0, width: 0, height: 0 },
        dimensionUnit: "cm",
        attributes: {}
      }
    ],
    seo: {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: ""
    },
    images: [],
    badges: []
  });

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to access this feature");
        navigate('/login');
        return;
      }

      const response = await categoryService.getAllCategories();
      console.log('Category API Response:', response);
      
      if (response && Array.isArray(response)) {
        setCategories(response);
      } else if (response && response.categories) {
        setCategories(response.categories);
      } else {
        setCategories([]);
        toast.error("No categories available");
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      if (error.response?.status === 401) {
        toast.error("Please login to access this feature");
        navigate('/login');
      } else {
        toast.error(error.message || "Failed to fetch categories");
      }
      setCategories([]);
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await attributeService.getAllAttributes();
      console.log('Attributes fetched:', response); // Debug log
      setAttributes(response || []);
    } catch (error) {
      toast.error("Failed to fetch attributes");
      console.error("Failed to fetch attributes:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        toast.error(error.message || "Failed to delete product");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      // Validate required fields
      if (!formData.name) {
        toast.error("Product name is required");
        return;
      }

      if (!formData.categoryId) {
        toast.error("Category is required");
        return;
      }

      if (!formData.variations || formData.variations.length === 0) {
        toast.error("At least one variation is required");
        return;
      }

      // Validate variations
      const validatedVariations = formData.variations.map((variation) => {
        if (!variation.price || isNaN(variation.price) || variation.price <= 0) {
          throw new Error("Price must be greater than 0 for all variations");
        }
        if (isNaN(variation.stock) || variation.stock < 0) {
          throw new Error("Stock cannot be negative");
        }

        return {
          sku: variation.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          price: Number(variation.price),
          comparePrice: variation.comparePrice ? Number(variation.comparePrice) : null,
          stock: Number(variation.stock),
          weight: variation.weight ? Number(variation.weight) : null,
          weightUnit: variation.weightUnit || "g",
          dimensions: variation.dimensions || null,
          dimensionUnit: variation.dimensionUnit || "cm",
          attributes: variation.attributes || {}
        };
      });

      // Create FormData instance
      const formDataToSend = new FormData();

      // Append basic product data
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("variations", JSON.stringify(validatedVariations));
      formDataToSend.append("seo", JSON.stringify(formData.seo));

      // Add images
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      try {
        if (modalMode === "add") {
          const response = await productService.createProduct(formDataToSend);
          toast.success("Product created successfully");
          setShowModal(false);
          fetchProducts();
        } else {
          const response = await productService.updateProduct(selectedProduct.id, formDataToSend);
          toast.success("Product updated successfully");
          setShowModal(false);
          fetchProducts();
        }
      } catch (error) {
        console.error("Error submitting product:", error);
        toast.error(error.message || "Failed to submit product");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error.message || `Failed to ${modalMode} product`);
    }
  };

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    setCurrentStep(1);
    if (product && mode === "edit") {
      setSelectedProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        status: product.status || "active",
        categoryId: product.categoryId || "",
        variations: product.ProductVariations?.map((v) => ({
          sku: v.sku || "",
          price: v.price || 0,
          comparePrice: v.comparePrice || 0,
          stock: v.stock || 0,
          weight: v.weight || 0,
          weightUnit: v.weightUnit || "g",
          dimensions: typeof v.dimensions === 'string' ? JSON.parse(v.dimensions) : (v.dimensions || { length: 0, width: 0, height: 0 }),
          dimensionUnit: v.dimensionUnit || "cm",
          attributes: typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || {})
        })) || [
          {
            sku: "",
            price: 0,
            comparePrice: 0,
            stock: 0,
            weight: 0,
            weightUnit: "g",
            dimensions: { length: 0, width: 0, height: 0 },
            dimensionUnit: "cm",
            attributes: {}
          }
        ],
        seo: product.ProductSEO || {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: ""
        },
        images: product.ProductImages?.map(img => ({
          url: img.image_url,
          alt: img.alt_text,
          isPrimary: img.is_primary
        })) || [],
        badges: product.ProductBadges?.map(b => ({
          name: b.name,
          type: b.badgeType,
          color: b.colorCode,
          icon: b.iconName
        })) || []
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        status: "active",
        categoryId: "",
        variations: [
          {
            sku: "",
            price: 0,
            comparePrice: 0,
            stock: 0,
            weight: 0,
            weightUnit: "g",
            dimensions: { length: 0, width: 0, height: 0 },
            dimensionUnit: "cm",
            attributes: {}
          }
        ],
        seo: {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: ""
        },
        images: [],
        badges: []
      });
    }
    setShowModal(true);
  };

  const handleAddVariation = () => {
    setFormData({
      ...formData,
      variations: [
        ...formData.variations,
        {
          sku: "",
          price: 0,
          comparePrice: 0,
          stock: 0,
          weight: 0,
          weightUnit: "g",
          dimensions: { length: 0, width: 0, height: 0 },
          dimensionUnit: "cm",
          attributes: {}
        }
      ]
    });
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    if (field.startsWith('attributes.')) {
      const attributeId = field.split('.')[1];
      updatedVariations[index] = {
        ...updatedVariations[index],
        attributes: {
          ...updatedVariations[index].attributes,
          [attributeId]: value
        }
      };
    } else {
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: value
      };
    }
    setFormData({ ...formData, variations: updatedVariations });
  };

  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    try {
      const attributeData = {
        name: newAttribute.name,
        type: 'select',
        isRequired: false,
        values: newAttribute.values.split(',').map(v => v.trim()).filter(v => v !== '')
      };

      const response = await attributeService.createAttribute(attributeData);
      toast.success("Attribute created successfully");
      setShowAttributeModal(false);
      setNewAttribute({
        name: "",
        values: ""
      });
      fetchAttributes(); // Refresh the attributes list
    } catch (error) {
      toast.error(error.message || "Failed to create attribute");
    }
  };

  const handleAttributeValueChange = (index, value) => {
    const newValues = [...newAttribute.values];
    newValues[index] = value;
    setNewAttribute({
      ...newAttribute,
      values: newValues
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchProducts();
    fetchCategories();
    fetchAttributes();
  }, [navigate]);

  const columns = [
    {
      key: "images",
      header: "Image",
      render: (row) => {
        const imageUrl = row.ProductImages && row.ProductImages[0]?.image_url;
        return (
          <div className="product-image-cell">
            {imageUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL}${imageUrl}`}
                alt={row.name}
                className="product-thumbnail"
              />
            ) : (
              <div className="no-image">No image</div>
            )}
          </div>
        );
      }
    },
    { key: "name", header: "Name" },
    {
      key: "price",
      header: "Price",
      render: (row) => {
        const variations = row.ProductVariations || [];
        if (variations.length === 0) return "N/A";
        const prices = variations.map((v) => v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice
          ? `$${minPrice.toFixed(2)}`
          : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
      }
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => {
        const variations = row.ProductVariations || [];
        if (variations.length === 0) return "N/A";
        const totalStock = variations.reduce((sum, v) => sum + (v.stock || 0), 0);
        return totalStock;
      }
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>{row.status}</span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlinePencil />}
            onClick={() => handleOpenModal("edit", row)}
            variant="edit"
            tooltip="Edit Product"
          />
          <ActionButton
            icon={<HiOutlineTrash />}
            onClick={() => handleDelete(row.id)}
            variant="delete"
            tooltip="Delete Product"
          />
        </div>
      )
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-section">
            <h3>Basic Information</h3>
            <InputField
              label="Name"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({
                  ...formData,
                  name: newName,
                  seo: {
                    ...formData.seo,
                    meta_title: newName,
                    meta_description: newName,
                    og_title: newName,
                    og_description: newName
                  }
                });
              }}
              required
            />
            <InputField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
            />
            <div className="input-field">
              <label>Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => {
                  console.log('Selected category:', e.target.value);
                  setFormData({ ...formData, categoryId: e.target.value });
                }}
                required
                className="select-input"
              >
                <option value="">Select a category</option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No categories available</option>
                )}
              </select>
            </div>
            <InputField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "draft", label: "Draft" }
              ]}
            />
          </div>
        );
      case 2:
        return (
          <div className="form-section">
            <h3>Variations</h3>
            {formData.variations.map((variation, index) => (
              <div key={index} className="variation-item">
                <div className="variation-header">
                  <h4>Variation {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => {
                        const newVariations = [...formData.variations];
                        newVariations.splice(index, 1);
                        setFormData({ ...formData, variations: newVariations });
                      }}
                    >
                      Remove Variation
                    </Button>
                  )}
                </div>
                <InputField
                  label="SKU"
                  value={variation.sku}
                  onChange={(e) => handleVariationChange(index, "sku", e.target.value)}
                />
                <InputField
                  label="Price"
                  type="number"
                  value={variation.price}
                  onChange={(e) => handleVariationChange(index, "price", parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  required
                />
                <InputField
                  label="Compare Price"
                  type="number"
                  value={variation.comparePrice}
                  onChange={(e) => handleVariationChange(index, "comparePrice", parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                />
                <InputField
                  label="Stock"
                  type="number"
                  value={variation.stock}
                  onChange={(e) => handleVariationChange(index, "stock", parseInt(e.target.value))}
                  min="0"
                  required
                />
                
                {/* Weight Section */}
                <div className="weight-section">
                  <InputField
                    label="Weight"
                    type="number"
                    value={variation.weight || 0}
                    onChange={(e) => handleVariationChange(index, "weight", parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                  <div className="input-field">
                    <label>Weight Unit</label>
                    <select
                      value={variation.weightUnit || 'g'}
                      onChange={(e) => handleVariationChange(index, "weightUnit", e.target.value)}
                      className="select-input"
                    >
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions Section */}
                <div className="dimensions-section">
                  <h5>Dimensions</h5>
                  <div className="dimensions-inputs">
                    <InputField
                      label="Length"
                      type="number"
                      value={variation.dimensions?.length || 0}
                      onChange={(e) => handleVariationChange(index, "dimensions", {
                        ...variation.dimensions,
                        length: parseFloat(e.target.value)
                      })}
                      min="0"
                      step="0.01"
                    />
                    <InputField
                      label="Width"
                      type="number"
                      value={variation.dimensions?.width || 0}
                      onChange={(e) => handleVariationChange(index, "dimensions", {
                        ...variation.dimensions,
                        width: parseFloat(e.target.value)
                      })}
                      min="0"
                      step="0.01"
                    />
                    <InputField
                      label="Height"
                      type="number"
                      value={variation.dimensions?.height || 0}
                      onChange={(e) => handleVariationChange(index, "dimensions", {
                        ...variation.dimensions,
                        height: parseFloat(e.target.value)
                      })}
                      min="0"
                      step="0.01"
                    />
                    <div className="input-field">
                      <label>Dimension Unit</label>
                      <select
                        value={variation.dimensionUnit || 'cm'}
                        onChange={(e) => handleVariationChange(index, "dimensionUnit", e.target.value)}
                        className="select-input"
                      >
                        <option value="cm">Centimeters (cm)</option>
                        <option value="m">Meters (m)</option>
                        <option value="in">Inches (in)</option>
                        <option value="ft">Feet (ft)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Attributes Section */}
                <div className="attributes-section">
                  <div className="attributes-header">
                    <h5>Attributes</h5>
                    <Button
                      type="button"
                      onClick={() => setShowAttributeModal(true)}
                      className="add-attribute-button"
                      variant="secondary"
                    >
                      Create New Attribute
                    </Button>
                  </div>

                  {/* Attribute Selection Dropdown */}
                  <div className="attribute-selection">
                    <select
                      className="select-input"
                      onChange={(e) => {
                        const selectedAttributeId = e.target.value;
                        if (selectedAttributeId) {
                          const selectedAttribute = attributes.find(attr => attr.id === parseInt(selectedAttributeId));
                          if (selectedAttribute) {
                            const updatedVariations = [...formData.variations];
                            const updatedAttributes = { ...updatedVariations[index].attributes };
                            if (!updatedAttributes[selectedAttributeId]) {
                              updatedAttributes[selectedAttributeId] = [];
                            }
                            updatedVariations[index] = {
                              ...updatedVariations[index],
                              attributes: updatedAttributes
                            };
                            setFormData({ ...formData, variations: updatedVariations });
                          }
                        }
                      }}
                      value=""
                    >
                      <option value="">Select an attribute</option>
                      {attributes
                        .filter(attr => !variation.attributes[attr.id])
                        .map(attribute => (
                          <option key={attribute.id} value={attribute.id}>
                            {attribute.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  {attributes && attributes.length > 0 ? (
                    <div className="attributes-list">
                      {attributes
                        .filter(attr => variation.attributes[attr.id])
                        .map((attribute) => (
                          <div key={attribute.id} className="attribute-item">
                            <div className="attribute-header">
                              <label>{attribute.name}</label>
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => {
                                  const updatedVariations = [...formData.variations];
                                  const updatedAttributes = { ...updatedVariations[index].attributes };
                                  delete updatedAttributes[attribute.id];
                                  updatedVariations[index] = {
                                    ...updatedVariations[index],
                                    attributes: updatedAttributes
                                  };
                                  setFormData({ ...formData, variations: updatedVariations });
                                }}
                                className="remove-attribute-button"
                              >
                                Remove
                              </Button>
                            </div>
                            {attribute.type === 'select' ? (
                              <div className="multi-select-container">
                                <Select
                                  isMulti
                                  closeMenuOnSelect={false}
                                  components={makeAnimated()}
                                  options={attribute.AttributeValues
                                    ?.filter(value => value.status === 'active')
                                    .map(value => ({
                                      value: value.id,
                                      label: value.value,
                                      isSelected: variation.attributes[attribute.id]?.includes(value.id)
                                    }))}
                                  value={attribute.AttributeValues
                                    ?.filter(value => value.status === 'active')
                                    .filter(value => variation.attributes[attribute.id]?.includes(value.id))
                                    .map(value => ({
                                      value: value.id,
                                      label: value.value
                                    }))}
                                  onChange={(selectedOptions) => {
                                    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                    handleVariationChange(index, `attributes.${attribute.id}`, selectedValues);
                                  }}
                                  className="react-select-container"
                                  classNamePrefix="react-select"
                                  placeholder={`Select ${attribute.name}`}
                                  isClearable
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      minHeight: '38px',
                                      borderColor: '#ddd',
                                      '&:hover': {
                                        borderColor: '#4a90e2'
                                      }
                                    }),
                                    option: (base, state) => ({
                                      ...base,
                                      backgroundColor: state.isSelected ? '#4a90e2' : state.isFocused ? '#f0f7ff' : 'white',
                                      color: state.isSelected ? 'white' : '#333',
                                      '&:hover': {
                                        backgroundColor: state.isSelected ? '#4a90e2' : '#f0f7ff'
                                      }
                                    }),
                                    multiValue: (base) => ({
                                      ...base,
                                      backgroundColor: '#e8f0fe',
                                      borderRadius: '4px'
                                    }),
                                    multiValueLabel: (base) => ({
                                      ...base,
                                      color: '#4a90e2',
                                      fontWeight: '500'
                                    }),
                                    multiValueRemove: (base) => ({
                                      ...base,
                                      color: '#4a90e2',
                                      '&:hover': {
                                        backgroundColor: '#d0e3ff',
                                        color: '#2c5282'
                                      }
                                    })
                                  }}
                                />
                              </div>
                            ) : (
                              <InputField
                                type={attribute.type === 'number' ? 'number' : 'text'}
                                value={variation.attributes[attribute.id] || ''}
                                onChange={(e) => handleVariationChange(index, `attributes.${attribute.id}`, e.target.value)}
                                required={attribute.isRequired}
                                placeholder={`Enter ${attribute.name}`}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="no-attributes">
                      <p>No attributes available.</p>
                      <Button
                        type="button"
                        onClick={() => setShowAttributeModal(true)}
                        className="create-attribute-button"
                      >
                        Create New Attribute
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Button type="button" onClick={handleAddVariation}>
              Add Variation
            </Button>
          </div>
        );
      case 3:
        return (
          <div className="form-section">
            <h3>SEO Information</h3>
            <InputField
              label="Meta Title"
              value={formData.seo.meta_title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, meta_title: e.target.value }
                })
              }
            />
            <InputField
              label="Meta Description"
              value={formData.seo.meta_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, meta_description: e.target.value }
                })
              }
              multiline
            />
            <InputField
              label="Meta Keywords"
              value={formData.seo.meta_keywords}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, meta_keywords: e.target.value }
                })
              }
              placeholder="Separate keywords with commas"
            />
          </div>
        );
      case 4:
        return (
          <div className="form-section">
            <h3>Product Images</h3>
            <div className="image-upload-section">
              <div className="image-upload-grid">
                {selectedProduct?.ProductImages?.map((image, index) => (
                  <div key={`existing-${index}`} className="image-preview-item">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${image.image_url}`}
                      alt={`Existing ${index + 1}`}
                    />
                    <div className="image-overlay">
                      <span className="image-label">Existing Image</span>
                    </div>
                  </div>
                ))}
                {formData.images && Array.from(formData.images).map((file, index) => (
                  <div key={`preview-${index}`} className="image-preview-item">
                    <img 
                      src={file instanceof File ? URL.createObjectURL(file) : `${import.meta.env.VITE_API_URL}${file.url}`} 
                      alt={`Preview ${index + 1}`} 
                    />
                    <div className="image-overlay">
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => {
                          const newFiles = Array.from(formData.images).filter((_, i) => i !== index);
                          const dataTransfer = new DataTransfer();
                          newFiles.forEach(file => dataTransfer.items.add(file));
                          setFormData({ ...formData, images: dataTransfer.files });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <label className="image-upload-button">
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        // Create a new FileList containing both existing and new files
                        const dataTransfer = new DataTransfer();
                        
                        // Add existing files if any
                        if (formData.images && formData.images.length > 0) {
                          Array.from(formData.images).forEach(file => {
                            if (file instanceof File) {
                              dataTransfer.items.add(file);
                            }
                          });
                        }
                        
                        // Add new files
                        Array.from(files).forEach(file => {
                          dataTransfer.items.add(file);
                        });
                        
                        setFormData(prev => ({ ...prev, images: dataTransfer.files }));
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-placeholder">
                    <FaPlus />
                    <span>Add Images</span>
                  </div>
                </label>
              </div>
              <small className="upload-hint">
                Supported formats: JPG, PNG, GIF. Max file size: 5MB
              </small>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAttributeModal = () => (
    <Modal
      isOpen={showAttributeModal}
      onClose={() => {
        setShowAttributeModal(false);
        setNewAttribute({
          name: "",
          values: ""
        });
      }}
      title="Create New Attribute"
    >
      <form onSubmit={handleCreateAttribute} className="attribute-form">
        <InputField
          label="Attribute Name"
          value={newAttribute.name}
          onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
          required
        />
        
        <div className="attribute-values">
          <label>Values (comma separated)</label>
          <InputField
            value={newAttribute.values}
            onChange={(e) => setNewAttribute({ ...newAttribute, values: e.target.value })}
            placeholder="Enter values separated by commas (e.g., Small, Medium, Large)"
            required
          />
        </div>

        <div className="modal-actions">
          <Button type="submit" className="modal-submit-button">
            Create Attribute
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowAttributeModal(false);
              setNewAttribute({
                name: "",
                values: ""
              });
            }}
            className="modal-cancel-button"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );

  return (
    <div className="products-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Products Manager</h2>
        <Button onClick={() => handleOpenModal("add")} className="add-button">
          <FaPlus /> Add Product
        </Button>
      </div>

      <TableWithControls
        columns={columns}
        data={products}
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
        onClose={() => {
          setShowModal(false);
          setCurrentStep(1);
        }}
        title={`${modalMode === "add" ? "Add New Product" : "Edit Product"} - Step ${currentStep} of 4`}
      >
        <form onSubmit={handleSubmit} className="product-form">
          {renderStepContent()}
          
          <div className="modal-actions">
            {currentStep > 1 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="modal-back-button"
                variant="secondary"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={
                (currentStep === 1 && !formData.name) ||
                (currentStep === 2 && (!formData.variations || formData.variations.length === 0))
              }
            >
              {currentStep === 4 ? (modalMode === "add" ? "Create Product" : "Update Product") : "Next"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowModal(false);
                setCurrentStep(1);
              }}
              className="modal-cancel-button"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
      {renderAttributeModal()}
    </div>
  );
};

export default Products;
