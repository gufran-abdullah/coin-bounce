const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const {BASE_PATH} = require('../config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blog-details');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const blogController = {
    // Create Blog Method
    async create(req, res, next) {
        const createBlogSchema = Joi.object({
            title: Joi.string().required(),
            author: Joi.string().regex(mongodbIdPattern).required(),
            content: Joi.string().required(),
            photo: Joi.string().required()
        });

        const {error} = createBlogSchema.validate(req.body);
        if (error) {
            return next(error);
        }

        const {title, author, content, photo} = req.body;
        const buffer = Buffer.from(photo.replace(/^data:image\/(pbg|jpg|jpeg|);base64,/, ''), 'base64');
        const imagePath = `${Date.now()}-${author}.png`;
        try {
            fs.writeFileSync(`storage/${imagePath}`, buffer);
        } catch (error) {
            return next(error);
        }

        let savedBlog;
        try {
            const newBlog = new Blog({
                title,
                author,
                content,
                photoPath: `${BASE_PATH}/storage/${imagePath}`
            });
            savedBlog = await newBlog.save();
        } catch (error) {
            return next(error);
        }

        const blogDto = new BlogDTO(savedBlog);
        return res.status(201).json({blog: blogDto});
    },

    // Get All Blogs Method
    async getAll(req, res, next) {
        try {
            const blogs = await Blog.find({});
            const blogsDto = [];
            for (let i = 0; i < blogs.length; i++) {
                const dto = new BlogDTO(blogs[i]);
                blogsDto.push(dto);
            }

            return res.status(200).json({blogs: blogsDto});
        } catch (error) {
            return next(error);
        }
    },

    // Get Blog By Id Method
    async getById(req, res, next) {
        const getByIdSchema = Joi.object({
            id: Joi.string().regex(mongodbIdPattern).required()
        });
        const {error} = getByIdSchema.validate(req.params);
        if (error) {
            return next(error);
        }
        
        const {id} = req.params;
        let blog;
        try {
            blog = await Blog.findOne({_id: id}).populate('author');
        } catch (error) {
            return next(error);
        }
        const blogDto = new BlogDetailsDTO(blog);
        console.log(blogDto);
        return res.status(200).json({blog: blogDto});
    },

    // Update Blog Method
    async update(req, res, next) {

    },

    // Delete Blog Method
    async delete(req, res, next) {

    }
}

module.exports = blogController;