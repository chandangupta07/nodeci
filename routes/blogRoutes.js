const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require("../middlewares/cleanCache");
const Blog = mongoose.model('Blog');

module.exports = app => {
    app.get('/api/blogs/:id', requireLogin, async (req, res) => {
        const blog = await Blog.findOne({
            _user: req.user.id,
            _id: req.params.id
        });

        res.send(blog);
    });

    app.get('/api/blogs', requireLogin, async (req, res) => {
        const blogs = await Blog.find({ _user: req.user.id }).cache({ key: req.user.id });

        res.send(blogs);
    });

    // app.get('/api/blogs', requireLogin, async (req, res) => {
    //     const redis = require("redis");
    //     const util = require("util");
    //     const redisUrl = 'redis://127.0.0.1:6379';
    //     const client = redis.createClient(redisUrl);
    //     client.get = util.promisify(client.get);
    //     //checking if we cached data for that user
    //     const cachedBlogs = await client.get(req.user.id);
    //     if (cachedBlogs) {
    //         console.log("serving from cache");
    //         return res.send(JSON.parse(cachedBlogs));
    //     }
    //     // if yes then send response from cache


    //     // if no then fetch data from mongo then send response and save data in cache 
    //     console.log("serving from db");
    //     const blogs = await Blog.find({ _user: req.user.id });

    //     res.send(blogs);
    //     client.set(req.user.id, JSON.stringify(blogs));
    // });

    app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
        const { title, content } = req.body;

        const blog = new Blog({
            title,
            content,
            _user: req.user.id
        });

        try {
            await blog.save();
            res.send(blog);
        } catch (err) {
            res.send(400, err);
        }
    });
};
