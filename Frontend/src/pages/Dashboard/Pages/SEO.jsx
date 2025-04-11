import React, { useState, useEffect } from 'react';
import TableWithControls from '../../../components/common/TableWithControls';
import Modal from '../../../components/common/Modal';
import ActionButton from '../../../components/common/ActionButton';
import Button from '../../../components/common/Button';
import InputField from '../../../components/common/InputField';
import '../../../Styles/dashboard/Dashboard.css';

const SEO = () => {
  const [seoData, setSeoData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSEO, setSelectedSEO] = useState(null);
  const [formData, setFormData] = useState({
    page_name: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image: ''
  });

  const columns = [
    { header: 'Page Name', accessor: 'page_name' },
    { header: 'Slug', accessor: 'slug' },
    { 
      header: 'Meta Title', 
      accessor: 'meta_title',
      cell: (row) => (
        <div className="truncate-text">{row.meta_title}</div>
      ) 
    },
    { 
      header: 'Meta Description', 
      accessor: 'meta_description',
      cell: (row) => (
        <div className="truncate-text">{row.meta_description.substring(0, 50)}...</div>
      ) 
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="action-buttons">
          <ActionButton
            onClick={() => handleEditSEO(row)}
            variant="edit"
          >
            Edit
          </ActionButton>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchSEOData();
  }, []);

  const fetchSEOData = async () => {
    try {
      // This would be replaced with an actual API call
      // const data = await seoService.getAllSEOData();
      // Placeholder data for now
      const data = [
        {
          id: 1,
          page_name: 'home',
          slug: '/',
          meta_title: 'Home - Nishree',
          meta_description: 'Welcome to Nishree, your one-stop shop for all your needs.',
          keywords: 'nishree, shop, products, online store',
          og_title: 'Nishree - Premium Products',
          og_description: 'Discover premium products at Nishree',
          og_image: '/images/og-home.jpg'
        },
        {
          id: 2,
          page_name: 'about-us',
          slug: '/about-us',
          meta_title: 'About Us - Nishree',
          meta_description: 'Learn more about Nishree and our mission.',
          keywords: 'about nishree, our story, mission, vision',
          og_title: 'About Nishree',
          og_description: 'Our journey and mission at Nishree',
          og_image: '/images/og-about.jpg'
        },
        {
          id: 3,
          page_name: 'products',
          slug: '/products',
          meta_title: 'Products - Nishree',
          meta_description: 'Explore our wide range of high-quality products.',
          keywords: 'nishree products, quality items, shop products',
          og_title: 'Nishree Products',
          og_description: 'Browse our collection of premium products',
          og_image: '/images/og-products.jpg'
        },
        {
          id: 4,
          page_name: 'contact',
          slug: '/contact',
          meta_title: 'Contact Us - Nishree',
          meta_description: 'Get in touch with our team for any queries or support.',
          keywords: 'contact nishree, support, help, reach us',
          og_title: 'Contact Nishree',
          og_description: 'Reach out to our support team',
          og_image: '/images/og-contact.jpg'
        },
        {
          id: 5,
          page_name: 'faq',
          slug: '/faq',
          meta_title: 'Frequently Asked Questions - Nishree',
          meta_description: 'Find answers to commonly asked questions about our products and services.',
          keywords: 'nishree faq, questions, answers, help',
          og_title: 'Nishree FAQs',
          og_description: 'Answers to your questions about Nishree',
          og_image: '/images/og-faq.jpg'
        },
      ];
      setSeoData(data);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    }
  };

  const handleEditSEO = (seo) => {
    setSelectedSEO(seo);
    setFormData({
      page_name: seo.page_name,
      slug: seo.slug,
      meta_title: seo.meta_title,
      meta_description: seo.meta_description,
      keywords: seo.keywords || '',
      og_title: seo.og_title || '',
      og_description: seo.og_description || '',
      og_image: seo.og_image || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSEO = () => {
    setFormData({
      page_name: '',
      slug: '',
      meta_title: '',
      meta_description: '',
      keywords: '',
      og_title: '',
      og_description: '',
      og_image: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // This would be replaced with an actual API call
      // await seoService.updateSEOData(selectedSEO.id, formData);
      // For now, just update the local state
      setSeoData(seoData.map(item => 
        item.id === selectedSEO.id ? {...item, ...formData} : item
      ));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating SEO data:', error);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      // This would be replaced with an actual API call
      // const newSEO = await seoService.createSEOData(formData);
      // For now, just update the local state with a mock ID
      const newSEO = {
        ...formData,
        id: Math.max(...seoData.map(item => item.id)) + 1
      };
      setSeoData([...seoData, newSEO]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating SEO data:', error);
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
        searchPlaceholder="Search SEO entries..."
        searchFields={['page_name', 'slug', 'meta_title']}
      />

      {/* Edit SEO Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit SEO Data"
      >
        <form onSubmit={handleSubmitEdit} className="seo-form">
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
              rows="3"
              required
            ></textarea>
          </div>
          <InputField
            label="Keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
          />
          <InputField
            label="OG Title"
            name="og_title"
            value={formData.og_title}
            onChange={handleInputChange}
          />
          <div className="form-group">
            <label>OG Description</label>
            <textarea
              name="og_description"
              value={formData.og_description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
            ></textarea>
          </div>
          <InputField
            label="OG Image URL"
            name="og_image"
            value={formData.og_image}
            onChange={handleInputChange}
          />
          <div className="modal-footer">
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Create SEO Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New SEO Entry"
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
              rows="3"
              required
            ></textarea>
          </div>
          <InputField
            label="Keywords"
            name="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
          />
          <InputField
            label="OG Title"
            name="og_title"
            value={formData.og_title}
            onChange={handleInputChange}
          />
          <div className="form-group">
            <label>OG Description</label>
            <textarea
              name="og_description"
              value={formData.og_description}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
            ></textarea>
          </div>
          <InputField
            label="OG Image URL"
            name="og_image"
            value={formData.og_image}
            onChange={handleInputChange}
          />
          <div className="modal-footer">
            <Button type="submit" variant="primary">Create SEO Entry</Button>
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SEO;