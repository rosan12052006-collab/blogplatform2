const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, optionalAuth } = require('../middleware/auth');

const COVER_COLORS = ['#7C3AED','#059669','#DC2626','#D97706','#0284C7','#BE185D'];
const randomColor = () => COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];

// GET /api/posts — list all posts (with search & tag filter)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 10 } = req.query;
    const query = { published: true };
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      Post.find(query).populate('author', 'username bio').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Post.countDocuments(query),
    ]);
    res.json({ success: true, posts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('author', 'username bio createdAt');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts — create post
router.post('/', protect, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('content').isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const { title, content, excerpt, tags } = req.body;
    const post = await Post.create({ title, content, excerpt, tags: tags || [], author: req.user._id, coverColor: randomColor() });
    await post.populate('author', 'username bio');
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:id — update post
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const { title, content, excerpt, tags } = req.body;
    const updated = await Post.findByIdAndUpdate(req.params.id, { title, content, excerpt, tags }, { new: true, runValidators: true }).populate('author', 'username bio');
    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await Promise.all([post.deleteOne(), Comment.deleteMany({ post: post._id })]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:id/like — toggle like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/posts/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('author', 'username bio').sort({ createdAt: -1 });
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/posts/:id/comments
router.post('/:id/comments', protect, [
  body('content').trim().notEmpty().withMessage('Comment cannot be empty'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comment = await Comment.create({ content: req.body.content, author: req.user._id, post: req.params.id });
    await comment.populate('author', 'username bio');
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/posts/:postId/comments/:commentId
router.delete('/:postId/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/posts/:postId/comments/:commentId/like
router.put('/:postId/comments/:commentId/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const idx = comment.likes.indexOf(req.user._id);
    if (idx === -1) comment.likes.push(req.user._id);
    else comment.likes.splice(idx, 1);
    await comment.save();
    res.json({ success: true, likes: comment.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
