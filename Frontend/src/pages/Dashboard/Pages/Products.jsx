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
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
    categoryId: "",
    price: "",
    stock: "",
    sku: "",
    seo: {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: ""
    },
    variations: [{
      price: "",
      stock: "",
      sku: "",
      attributes: []
    }],
    badges: [{
      name: "",
      type: "",
      color: "#000000",
      icon: ""
    }],
    discounts: [{
      type: "percentage",
      value: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      maxDiscount: ""
    }],
    images: []
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error("Failed to fetch products:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First validate required fields
      if (!formData.name || !formData.price || !formData.stock) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Create base variation from main product data
      const baseVariation = {
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku: formData.sku || `SKU-${Date.now()}`
      };

      // Prepare form data
      const formDataToSend = new FormData();

      // Add basic product info
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('status', formData.status);
      formDataToSend.append('categoryId', formData.categoryId || '');
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);

      // Handle variations
      let variations = [];
      
      // Add additional variations if they exist and are valid
      const additionalVariations = formData.variations
        .filter(variation => {
          const price = parseFloat(variation.price);
          const stock = parseInt(variation.stock);
          return (
            variation.price && 
            variation.stock && 
            !isNaN(price) && 
            !isNaN(stock) && 
            price > 0 && 
            stock >= 0 &&
            variation.sku
          );
        })
        .map(variation => ({
          price: parseFloat(variation.price),
          stock: parseInt(variation.stock),
          sku: variation.sku
        }));

      // If we have valid additional variations, use them; otherwise use the base variation
      variations = additionalVariations.length > 0 ? additionalVariations : [baseVariation];

      // Add variations to form data
      formDataToSend.append('variations', JSON.stringify(variations));

      // Add SEO data if exists
      const seoData = {
        meta_title: formData.seo?.meta_title || '',
        meta_description: formData.seo?.meta_description || '',
        meta_keywords: formData.seo?.meta_keywords || '',
        og_title: formData.seo?.og_title || '',
        og_description: formData.seo?.og_description || '',
        og_image: formData.seo?.og_image || ''
      };
      formDataToSend.append('seo', JSON.stringify(seoData));

      // Add badges if they exist and are valid
      const validBadges = formData.badges
        .filter(badge => badge.name && badge.type)
        .map(badge => ({
          name: badge.name,
          type: badge.type,
          color: badge.color || '#000000',
          icon: badge.icon || ''
        }));
      formDataToSend.append('badges', JSON.stringify(validBadges));

      // Add discounts if they exist and are valid
      const validDiscounts = formData.discounts
        .filter(discount => {
          const value = parseFloat(discount.value);
          return (
            discount.type &&
            !isNaN(value) &&
            value > 0 &&
            discount.startDate &&
            discount.endDate
          );
        })
        .map(discount => ({
          type: discount.type,
          value: parseFloat(discount.value),
          startDate: discount.startDate,
          endDate: discount.endDate,
          minPurchase: parseFloat(discount.minPurchase) || null,
          maxDiscount: parseFloat(discount.maxDiscount) || null
        }));
      formDataToSend.append('discounts', JSON.stringify(validDiscounts));

      // Add images if they exist
      if (formData.images && formData.images.length > 0) {
        Array.from(formData.images).forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      // Submit the form
      if (modalMode === 'add') {
        const response = await productService.createProduct(formDataToSend);
        console.log('Create response:', response);
        toast.success('Product created successfully');
      } else {
        const response = await productService.updateProduct(selectedProduct.id, formDataToSend);
        console.log('Update response:', response);
        toast.success('Product updated successfully');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(error.message || `Failed to ${modalMode} product`);
    }
  };

  const handleOpenModal = (mode, product = null) => {
    setModalMode(mode);
    if (product && mode === 'edit') {
      setSelectedProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        status: product.status || "draft",
        categoryId: product.categoryId || "",
        price: product.price || "",
        stock: product.stock || "",
        sku: product.sku || "",
        seo: product.ProductSEO || {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: ""
        },
        variations: product.ProductVariations?.length ? product.ProductVariations : [{
          price: "",
          stock: "",
          sku: "",
          attributes: []
        }],
        badges: product.ProductBadges?.length ? product.ProductBadges : [{
          name: "",
          type: "",
          color: "#000000",
          icon: ""
        }],
        discounts: product.ProductDiscounts?.length ? product.ProductDiscounts : [{
          type: "percentage",
          value: "",
          startDate: "",
          endDate: "",
          minPurchase: "",
          maxDiscount: ""
        }],
        images: []
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        status: "draft",
        categoryId: "",
        price: "",
        stock: "",
        sku: "",
        seo: {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: ""
        },
        variations: [{
          price: "",
          stock: "",
          sku: "",
          attributes: []
        }],
        badges: [{
          name: "",
          type: "",
          color: "#000000",
          icon: ""
        }],
        discounts: [{
          type: "percentage",
          value: "",
          startDate: "",
          endDate: "",
          minPurchase: "",
          maxDiscount: ""
        }],
        images: []
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
          price: "",
          stock: "",
          sku: "",
          attributes: []
        }
      ]
    });
  };

  const handleAddBadge = () => {
    setFormData({
      ...formData,
      badges: [
        ...formData.badges,
        {
          name: "",
          type: "",
          color: "#000000",
          icon: ""
        }
      ]
    });
  };

  const handleAddDiscount = () => {
    setFormData({
      ...formData,
      discounts: [
        ...formData.discounts,
        {
          type: "percentage",
          value: "",
          startDate: "",
          endDate: "",
          minPurchase: "",
          maxDiscount: ""
        }
      ]
    });
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
      }
    },
    { key: "name", header: "Name" },
    { 
      key: "price", 
      header: "Price",
      render: (row) => `$${parseFloat(row.price).toFixed(2)}`
    },
    { key: "stock", header: "Stock" },
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
      key: "variations",
      header: "Variations",
      render: (row) => (
        <span>{row.ProductVariations?.length || 0}</span>
      )
    },
    {
      key: "badges",
      header: "Badges",
      render: (row) => (
        <div className="badge-list">
          {row.ProductBadges?.map(badge => (
            <span 
              key={badge.id} 
              className="badge"
              style={{ backgroundColor: badge.color }}
            >
              {badge.name}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="action-buttons">
          <ActionButton
            icon={<HiOutlineEye />}
            onClick={() => handleOpenModal('view', row)}
            variant="view"
            tooltip="View Product"
          />
          <ActionButton
            icon={<HiOutlinePencil />}
            onClick={() => handleOpenModal('edit', row)}
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

  return (
    <div className="products-manager">
      <div className="header-section">
        <h2 className="dashboard-title">Products Manager</h2>
        <Button 
          onClick={() => handleOpenModal('add')}
          className="add-button"
        >
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
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
      >
        <form onSubmit={handleSubmit} className="product-form">
          {/* Basic Information */}
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
            <InputField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              min="0"
              step="0.01"
            />
            <InputField
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              min="0"
            />
            <InputField
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Enter product SKU"
            />
            <InputField
              label="Status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
            />
          </div>

          {/* SEO Section */}
          <div className="form-section">
            <h3>SEO Information</h3>
            <InputField
              label="Meta Title"
              value={formData.seo.meta_title}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, meta_title: e.target.value }
              })}
            />
            <InputField
              label="Meta Description"
              value={formData.seo.meta_description}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, meta_description: e.target.value }
              })}
              multiline
            />
            <InputField
              label="Meta Keywords"
              value={formData.seo.meta_keywords}
              onChange={(e) => setFormData({
                ...formData,
                seo: { ...formData.seo, meta_keywords: e.target.value }
              })}
              placeholder="Separate keywords with commas"
            />
          </div>

          {/* Variations Section */}
          <div className="form-section">
            <h3>Variations</h3>
            {formData.variations.map((variation, variationIndex) => (
              <div key={variationIndex} className="variation-item">
                <div className="variation-header">
                  <h4>Variation {variationIndex + 1}</h4>
                  {variationIndex > 0 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => {
                        const newVariations = [...formData.variations];
                        newVariations.splice(variationIndex, 1);
                        setFormData({ ...formData, variations: newVariations });
                      }}
                    >
                      Remove Variation
                    </Button>
                  )}
                </div>
                <InputField
                  label="Price"
                  type="number"
                  value={variation.price}
                  onChange={(e) => {
                    const newVariations = [...formData.variations];
                    newVariations[variationIndex].price = e.target.value;
                    setFormData({ ...formData, variations: newVariations });
                  }}
                  min="0"
                  step="0.01"
                />
                <InputField
                  label="Stock"
                  type="number"
                  value={variation.stock}
                  onChange={(e) => {
                    const newVariations = [...formData.variations];
                    newVariations[variationIndex].stock = e.target.value;
                    setFormData({ ...formData, variations: newVariations });
                  }}
                  min="0"
                />
                <InputField
                  label="SKU"
                  value={variation.sku}
                  onChange={(e) => {
                    const newVariations = [...formData.variations];
                    newVariations[variationIndex].sku = e.target.value;
                    setFormData({ ...formData, variations: newVariations });
                  }}
                />
              </div>
            ))}
            <Button type="button" onClick={handleAddVariation}>
              Add Variation
            </Button>
          </div>

          {/* Badges Section */}
          <div className="form-section">
            <h3>Badges</h3>
            {formData.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <InputField
                  label="Name"
                  value={badge.name}
                  onChange={(e) => {
                    const newBadges = [...formData.badges];
                    newBadges[index].name = e.target.value;
                    setFormData({ ...formData, badges: newBadges });
                  }}
                />
                <InputField
                  label="Type"
                  type="select"
                  value={badge.type}
                  onChange={(e) => {
                    const newBadges = [...formData.badges];
                    newBadges[index].type = e.target.value;
                    setFormData({ ...formData, badges: newBadges });
                  }}
                  options={[
                    { value: "new", label: "New" },
                    { value: "sale", label: "Sale" },
                    { value: "featured", label: "Featured" },
                    { value: "custom", label: "Custom" }
                  ]}
                />
                <InputField
                  label="Color"
                  type="color"
                  value={badge.color}
                  onChange={(e) => {
                    const newBadges = [...formData.badges];
                    newBadges[index].color = e.target.value;
                    setFormData({ ...formData, badges: newBadges });
                  }}
                />
                <InputField
                  label="Icon"
                  value={badge.icon}
                  onChange={(e) => {
                    const newBadges = [...formData.badges];
                    newBadges[index].icon = e.target.value;
                    setFormData({ ...formData, badges: newBadges });
                  }}
                  placeholder="Icon class name or URL"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      const newBadges = [...formData.badges];
                      newBadges.splice(index, 1);
                      setFormData({ ...formData, badges: newBadges });
                    }}
                  >
                    Remove Badge
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={handleAddBadge}>
              Add Badge
            </Button>
          </div>

          {/* Discounts Section */}
          <div className="form-section">
            <h3>Discounts</h3>
            {formData.discounts.map((discount, index) => (
              <div key={index} className="discount-item">
                <InputField
                  label="Type"
                  type="select"
                  value={discount.type}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].type = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                  options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "fixed", label: "Fixed Amount" }
                  ]}
                />
                <InputField
                  label="Value"
                  type="number"
                  value={discount.value}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].value = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                  min="0"
                  step={discount.type === "percentage" ? "1" : "0.01"}
                  max={discount.type === "percentage" ? "100" : undefined}
                />
                <InputField
                  label="Start Date"
                  type="datetime-local"
                  value={discount.startDate}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].startDate = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                />
                <InputField
                  label="End Date"
                  type="datetime-local"
                  value={discount.endDate}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].endDate = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                />
                <InputField
                  label="Minimum Purchase"
                  type="number"
                  value={discount.minPurchase}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].minPurchase = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                  min="0"
                  step="0.01"
                />
                <InputField
                  label="Maximum Discount"
                  type="number"
                  value={discount.maxDiscount}
                  onChange={(e) => {
                    const newDiscounts = [...formData.discounts];
                    newDiscounts[index].maxDiscount = e.target.value;
                    setFormData({ ...formData, discounts: newDiscounts });
                  }}
                  min="0"
                  step="0.01"
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      const newDiscounts = [...formData.discounts];
                      newDiscounts.splice(index, 1);
                      setFormData({ ...formData, discounts: newDiscounts });
                    }}
                  >
                    Remove Discount
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={handleAddDiscount}>
              Add Discount
            </Button>
          </div>

          {/* Images Section */}
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

          <div className="modal-actions">
            <Button
              type="submit"
              className="modal-submit-button"
              disabled={!formData.name || !formData.price || !formData.stock}
            >
              {modalMode === 'add' ? 'Create Product' : 'Update Product'}
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