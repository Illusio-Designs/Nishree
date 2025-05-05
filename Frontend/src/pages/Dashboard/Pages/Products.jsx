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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
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
        attributes: {},
      },
    ],
    seo: {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: "",
    },
    images: [],
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error("Failed to fetch products:", error);
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
    try {
      // Validate required fields
      if (!formData.name) {
        toast.error("Product name is required");
        return;
      }

      if (!formData.variations || formData.variations.length === 0) {
        toast.error("At least one variation is required");
        return;
      }

      // Validate and transform variations
      const validatedVariations = formData.variations.map((variation) => {
        // Ensure required fields are present and valid
        if (
          !variation.price ||
          isNaN(variation.price) ||
          variation.price <= 0
        ) {
          throw new Error("Price must be greater than 0 for all variations");
        }
        if (isNaN(variation.stock) || variation.stock < 0) {
          throw new Error("Stock cannot be negative");
        }

        // Transform the variation data
        return {
          sku:
            variation.sku ||
            `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          price: Number(variation.price),
          comparePrice: variation.comparePrice
            ? Number(variation.comparePrice)
            : null,
          stock: Number(variation.stock),
          weight: variation.weight ? Number(variation.weight) : null,
          weightUnit: variation.weightUnit || "g",
          dimensions: variation.dimensions || null,
          dimensionUnit: variation.dimensionUnit || "cm",
          attributes: variation.attributes || {},
        };
      });

      // Create the product data object
      const productData = {
        name: formData.name,
        description: formData.description || "",
        status: formData.status,
        categoryId: formData.categoryId || "",
        variations: validatedVariations,
        seo: formData.seo,
      };

      // Create FormData instance
      const formDataToSend = new FormData();

      // Append all fields except images
      Object.entries(productData).forEach(([key, value]) => {
        if (typeof value === "object") {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add images
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach((image) => {
          formDataToSend.append("images", image);
        });
      }

      if (modalMode === "add") {
        await productService.createProduct(formDataToSend);
        toast.success("Product created successfully");
      } else {
        await productService.updateProduct(selectedProduct.id, formDataToSend);
        toast.success("Product updated successfully");
      }

      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error.message || `Failed to ${modalMode} product`);
    }
  };

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    if (product && mode === "edit") {
      setSelectedProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        status: product.status || "draft",
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
          attributes: v.attributes || {},
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
            attributes: {},
          },
        ],
        seo: product.ProductSEO || {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: "",
        },
        images: [],
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        status: "draft",
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
            attributes: {},
          },
        ],
        seo: {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: "",
        },
        images: [],
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
          attributes: {},
        },
      ],
    });
  };

  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...formData.variations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value,
    };
    setFormData({ ...formData, variations: updatedVariations });
  };

  useEffect(() => {
    fetchProducts();
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
      },
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
      },
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => {
        const variations = row.ProductVariations || [];
        if (variations.length === 0) return "N/A";
        const totalStock = variations.reduce(
          (sum, v) => sum + (v.stock || 0),
          0
        );
        return totalStock;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span className={`status-badge ${row.status}`}>{row.status}</span>
      ),
    },
    {
      key: "variations",
      header: "Variations",
      render: (row) => <span>{row.ProductVariations?.length || 0}</span>,
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
      ),
    },
  ];

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
              { value: "draft", label: "Draft" },
            ],
          },
        ]}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === "add" ? "Add New Product" : "Edit Product"}
      >
        <form onSubmit={handleSubmit} className="product-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <InputField
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <InputField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
            />
            <InputField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          {/* Variations Section */}
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
                  onChange={(e) =>
                    handleVariationChange(index, "sku", e.target.value)
                  }
                />
                <InputField
                  label="Price"
                  type="number"
                  value={variation.price}
                  onChange={(e) =>
                    handleVariationChange(
                      index,
                      "price",
                      parseFloat(e.target.value)
                    )
                  }
                  min="0"
                  step="0.01"
                  required
                />
                <InputField
                  label="Compare Price"
                  type="number"
                  value={variation.comparePrice}
                  onChange={(e) =>
                    handleVariationChange(
                      index,
                      "comparePrice",
                      parseFloat(e.target.value)
                    )
                  }
                  min="0"
                  step="0.01"
                />
                <InputField
                  label="Stock"
                  type="number"
                  value={variation.stock}
                  onChange={(e) =>
                    handleVariationChange(
                      index,
                      "stock",
                      parseInt(e.target.value)
                    )
                  }
                  min="0"
                  required
                />
                <div className="weight-dimensions">
                  <InputField
                    label="Weight"
                    type="number"
                    value={variation.weight}
                    onChange={(e) =>
                      handleVariationChange(
                        index,
                        "weight",
                        parseFloat(e.target.value)
                      )
                    }
                    min="0"
                  />
                  <InputField
                    label="Weight Unit"
                    type="select"
                    value={variation.weightUnit}
                    onChange={(e) =>
                      handleVariationChange(index, "weightUnit", e.target.value)
                    }
                    options={[
                      { value: "g", label: "Grams" },
                      { value: "kg", label: "Kilograms" },
                      { value: "lb", label: "Pounds" },
                      { value: "oz", label: "Ounces" },
                    ]}
                  />
                </div>
                <div className="dimensions">
                  <h5>Dimensions</h5>
                  <div className="dimension-fields">
                    <InputField
                      label="Length"
                      type="number"
                      value={variation.dimensions.length}
                      onChange={(e) =>
                        handleVariationChange(index, "dimensions", {
                          ...variation.dimensions,
                          length: parseFloat(e.target.value),
                        })
                      }
                      min="0"
                    />
                    <InputField
                      label="Width"
                      type="number"
                      value={variation.dimensions.width}
                      onChange={(e) =>
                        handleVariationChange(index, "dimensions", {
                          ...variation.dimensions,
                          width: parseFloat(e.target.value),
                        })
                      }
                      min="0"
                    />
                    <InputField
                      label="Height"
                      type="number"
                      value={variation.dimensions.height}
                      onChange={(e) =>
                        handleVariationChange(index, "dimensions", {
                          ...variation.dimensions,
                          height: parseFloat(e.target.value),
                        })
                      }
                      min="0"
                    />
                    <InputField
                      label="Unit"
                      type="select"
                      value={variation.dimensionUnit}
                      onChange={(e) =>
                        handleVariationChange(
                          index,
                          "dimensionUnit",
                          e.target.value
                        )
                      }
                      options={[
                        { value: "cm", label: "Centimeters" },
                        { value: "m", label: "Meters" },
                        { value: "in", label: "Inches" },
                        { value: "ft", label: "Feet" },
                      ]}
                    />
                  </div>
                </div>
                <div className="attributes">
                  <h5>Attributes</h5>
                  {Object.entries(variation.attributes || {}).map(
                    ([key, value]) => (
                      <div key={key} className="attribute-field">
                        <InputField
                          label={key}
                          value={value}
                          onChange={(e) =>
                            handleVariationChange(index, "attributes", {
                              ...variation.attributes,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      const newAttr = prompt("Enter attribute name:");
                      if (newAttr) {
                        handleVariationChange(index, "attributes", {
                          ...variation.attributes,
                          [newAttr]: "",
                        });
                      }
                    }}
                  >
                    Add Attribute
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={handleAddVariation}>
              Add Variation
            </Button>
          </div>

          {/* SEO Section */}
          <div className="form-section">
            <h3>SEO Information</h3>
            <InputField
              label="Meta Title"
              value={formData.seo.meta_title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, meta_title: e.target.value },
                })
              }
            />
            <InputField
              label="Meta Description"
              value={formData.seo.meta_description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, meta_description: e.target.value },
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
                  seo: { ...formData.seo, meta_keywords: e.target.value },
                })
              }
              placeholder="Separate keywords with commas"
            />
          </div>

          {/* Images Section */}
          <div className="form-section">
            <h3>Product Images</h3>
            <InputField
              type="file"
              label="Product Images"
              onChange={(e) =>
                setFormData({ ...formData, images: e.target.files })
              }
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
                        src={`${import.meta.env.VITE_API_URL}${
                          image.image_url
                        }`}
                        alt={`Product ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={
                !formData.name ||
                !formData.variations ||
                formData.variations.length === 0
              }
            >
              {modalMode === "add" ? "Create Product" : "Update Product"}
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

export default Products;
