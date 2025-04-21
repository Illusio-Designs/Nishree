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
import "../../../Styles/dashboard/Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
    categoryId: "",
    // Basic product info
    price: "",
    stock: "",
    // SEO fields
    seo: {
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_title: "",
      og_description: "",
      og_image: ""
    },
    // Variations
    variations: [{
      price: "",
      stock: "",
      sku: "",
      attributes: [{
        attributeId: "",
        attributeName: "",
        valueId: "",
        value: ""
      }]
    }],
    // Badges
    badges: [{
      name: "",
      type: "",
      color: "",
      icon: ""
    }],
    // Discounts
    discounts: [{
      type: "percentage",
      value: "",
      startDate: "",
      endDate: "",
      minPurchase: "",
      maxDiscount: ""
    }],
    // Images
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

  const fetchAttributes = async () => {
    try {
      const response = await productService.getAttributes();
      setAvailableAttributes(response.attributes || []);
      
      // Create a map of attribute values
      const valuesMap = {};
      response.attributes.forEach(attr => {
        valuesMap[attr.id] = attr.values || [];
      });
      setAttributeValues(valuesMap);
    } catch (error) {
      toast.error('Failed to fetch attributes');
      console.error("Failed to fetch attributes:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add basic product info
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock);

      // Add SEO data
      formDataToSend.append('seo', JSON.stringify(formData.seo));

      // Add variations
      formDataToSend.append('variations', JSON.stringify(formData.variations));

      // Add badges
      formDataToSend.append('badges', JSON.stringify(formData.badges));

      // Add discounts
      formDataToSend.append('discounts', JSON.stringify(formData.discounts));

      // Add images
      if (formData.images) {
        Array.from(formData.images).forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      if (modalMode === 'add') {
        await productService.createProduct(formDataToSend);
        toast.success('Product created successfully');
      } else {
        await productService.updateProduct(selectedProduct.id, formDataToSend);
        toast.success('Product updated successfully');
      }
      
      setShowModal(false);
      fetchProducts();
    } catch (error) {
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
        seo: product.ProductSEO || {
          meta_title: "",
          meta_description: "",
          meta_keywords: "",
          og_title: "",
          og_description: "",
          og_image: ""
        },
        variations: product.ProductVariations || [{
          price: "",
          stock: "",
          sku: "",
          attributes: [{
            attributeId: "",
            attributeName: "",
            valueId: "",
            value: ""
          }]
        }],
        badges: product.ProductBadges || [{
          name: "",
          type: "",
          color: "",
          icon: ""
        }],
        discounts: product.ProductDiscounts || [{
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
          attributes: [{
            attributeId: "",
            attributeName: "",
            valueId: "",
            value: ""
          }]
        }],
        badges: [{
          name: "",
          type: "",
          color: "",
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
          attributes: [{
            attributeId: "",
            attributeName: "",
            valueId: "",
            value: ""
          }]
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
          color: "",
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

  const handleAddVariationAttribute = (variationIndex) => {
    const newFormData = { ...formData };
    newFormData.variations[variationIndex].attributes.push({
      attributeId: "",
      attributeName: "",
      valueId: "",
      value: ""
    });
    setFormData(newFormData);
  };

  const handleRemoveVariationAttribute = (variationIndex, attributeIndex) => {
    const newFormData = { ...formData };
    newFormData.variations[variationIndex].attributes.splice(attributeIndex, 1);
    setFormData(newFormData);
  };

  const handleVariationAttributeChange = (variationIndex, attributeIndex, field, value) => {
    const newFormData = { ...formData };
    const attribute = newFormData.variations[variationIndex].attributes[attributeIndex];
    
    if (field === 'attributeName') {
      // Find the selected attribute
      const selectedAttr = availableAttributes.find(attr => attr.name === value);
      if (selectedAttr) {
        attribute.attributeId = selectedAttr.id;
        attribute.attributeName = value;
        attribute.valueId = ""; // Reset value when attribute changes
        attribute.value = ""; // Reset value when attribute changes
      }
    } else if (field === 'value') {
      // Find the selected value
      const attrValues = attributeValues[attribute.attributeId] || [];
      const selectedValue = attrValues.find(val => val.value === value);
      if (selectedValue) {
        attribute.valueId = selectedValue.id;
        attribute.value = value;
      }
    }
    
    setFormData(newFormData);
  };

  useEffect(() => {
    fetchProducts();
    fetchAttributes();
  }, []);

  const columns = [
    { key: "name", header: "Name" },
    { 
      key: "images", 
      header: "Image",
      render: (row) => (
        row.ProductImages && row.ProductImages[0] ? (
          <img 
            src={row.ProductImages[0].image_url}
            alt={row.name}
            className="product-thumbnail"
          />
        ) : (
          <span className="no-image">No image</span>
        )
      )
    },
    { key: "price", header: "Price" },
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
            />
            <InputField
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
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

                {/* Attributes Section */}
                <div className="attributes-section">
                  <h5>Attributes</h5>
                  {variation.attributes.map((attribute, attributeIndex) => (
                    <div key={attributeIndex} className="attribute-item">
                      <InputField
                        label="Attribute"
                        type="select"
                        value={attribute.attributeName}
                        onChange={(e) => handleVariationAttributeChange(
                          variationIndex,
                          attributeIndex,
                          'attributeName',
                          e.target.value
                        )}
                        options={[
                          { value: "", label: "Select Attribute" },
                          ...availableAttributes.map(attr => ({
                            value: attr.name,
                            label: attr.name
                          }))
                        ]}
                      />
                      {attribute.attributeId && (
                        <InputField
                          label="Value"
                          type="select"
                          value={attribute.value}
                          onChange={(e) => handleVariationAttributeChange(
                            variationIndex,
                            attributeIndex,
                            'value',
                            e.target.value
                          )}
                          options={[
                            { value: "", label: "Select Value" },
                            ...(attributeValues[attribute.attributeId] || []).map(val => ({
                              value: val.value,
                              label: val.value
                            }))
                          ]}
                        />
                      )}
                      {attributeIndex > 0 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveVariationAttribute(variationIndex, attributeIndex)}
                        >
                          Remove Attribute
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => handleAddVariationAttribute(variationIndex)}
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
                  value={badge.type}
                  onChange={(e) => {
                    const newBadges = [...formData.badges];
                    newBadges[index].type = e.target.value;
                    setFormData({ ...formData, badges: newBadges });
                  }}
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
                />
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
                      <img src={image.image_url} alt={`Product ${index + 1}`} />
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
              disabled={!formData.name}
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