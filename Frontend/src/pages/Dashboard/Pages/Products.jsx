import React, { useEffect, useState } from "react";
import { productService, categoryService } from "../../../services";
import { toast } from "react-toastify";
import TableWithControls from "../../../components/common/TableWithControls";
import InputField from "../../../components/common/InputField";
import ActionButton from "../../../components/common/ActionButton";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import "../../../Styles/dashboard/Products.css";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentStep, setCurrentStep] = useState(1);
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
      const response = await categoryService.getAllCategories();
      console.log('Category API Response:', response); // Debug log
      setCategories(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Failed to fetch categories:", error);
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

      // Add badges if any
      if (formData.badges && formData.badges.length > 0) {
        formDataToSend.append("badges", JSON.stringify(formData.badges));
      }

      if (modalMode === "add") {
        await productService.createProduct(formDataToSend);
        toast.success("Product created successfully");
      } else {
        await productService.updateProduct(selectedProduct.id, formDataToSend);
        toast.success("Product updated successfully");
      }

      setShowModal(false);
      setCurrentStep(1);
      fetchProducts();
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
          dimensions: v.dimensions || { length: 0, width: 0, height: 0 },
          dimensionUnit: v.dimensionUnit || "cm",
          attributes: v.attributes || {}
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
        images: [],
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
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    setFormData({ ...formData, variations: updatedVariations });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

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
      key: "variations",
      header: "Variations",
      render: (row) => <span>{row.ProductVariations?.length || 0}</span>
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye />}
            onClick={() => handleOpenModal("view", row)}
            variant="view"
            tooltip="View Product"
          />
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
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
            <InputField
              type="file"
              label="Product Images"
              onChange={(e) => setFormData({ ...formData, images: e.target.files })}
              accept="image/*"
              multiple
            />
            {selectedProduct && selectedProduct.ProductImages && (
              <div className="existing-images">
                <h4>Existing Images</h4>
                <div className="image-grid">
                  {selectedProduct.ProductImages.map((image, index) => (
                    <div key={index} className="image-item">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${image.image_url}`}
                        alt={`Product ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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
    </div>
  );
};

export default Products;
