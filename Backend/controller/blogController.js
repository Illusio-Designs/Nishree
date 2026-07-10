import slugify from 'slugify';
import { Op } from 'sequelize';
import { Blog } from '../model/blogModel.js';
import { writeAudit } from '../utils/audit.js';

const imageFromReq = (req) => (req.file ? `/uploads/blogs/${req.file.filename}` : req.body.image || null);

// ---- Public ----

// List published posts (optional ?type=recipe|article).
export const getPublicBlogs = async (req, res) => {
    try {
        const where = { status: 'published' };
        if (req.query.type) where.type = req.query.type;
        const blogs = await Blog.findAll({ where, order: [['published_at', 'DESC'], ['created_at', 'DESC']] });
        res.json(blogs);
    } catch (error) {
        console.error('Get public blogs error:', error);
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
};

// A single published post by slug (or id).
export const getPublicBlog = async (req, res) => {
    try {
        const { slug } = req.params;
        const blog = await Blog.findOne({
            where: { status: 'published', [Op.or]: [{ slug }, { id: Number(slug) || 0 }] }
        });
        if (!blog) return res.status(404).json({ message: 'Post not found' });
        res.json(blog);
    } catch (error) {
        console.error('Get public blog error:', error);
        res.status(500).json({ message: 'Failed to fetch post', error: error.message });
    }
};

// ---- Admin ----

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['created_at', 'DESC']] });
        res.json(blogs);
    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ message: 'Title is required' });

        const payload = { ...req.body };
        payload.slug = payload.slug || slugify(title, { lower: true, strict: true });
        payload.image = imageFromReq(req);
        if (payload.status === 'published' && !payload.published_at) payload.published_at = new Date();
        if (typeof payload.tags === 'string') {
            try { payload.tags = JSON.parse(payload.tags); } catch { payload.tags = payload.tags.split(',').map((t) => t.trim()); }
        }

        const blog = await Blog.create(payload);
        await writeAudit({ userId: req.user?.id, entity: 'Blog', entityId: blog.id, action: 'create', newValues: blog.toJSON() });
        res.status(201).json({ message: 'Post created', blog });
    } catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Post not found' });

        const oldValues = blog.toJSON();
        const payload = { ...req.body };
        if (req.file) payload.image = imageFromReq(req);
        if (payload.status === 'published' && !blog.published_at && !payload.published_at) payload.published_at = new Date();
        if (typeof payload.tags === 'string') {
            try { payload.tags = JSON.parse(payload.tags); } catch { payload.tags = payload.tags.split(',').map((t) => t.trim()); }
        }

        await blog.update(payload);
        await writeAudit({ userId: req.user?.id, entity: 'Blog', entityId: blog.id, action: 'update', oldValues, newValues: blog.toJSON() });
        res.json({ message: 'Post updated', blog });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ message: 'Failed to update post', error: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Post not found' });
        await blog.destroy();
        await writeAudit({ userId: req.user?.id, entity: 'Blog', entityId: req.params.id, action: 'delete' });
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
};
