const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

// GET /api/users/:username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const posts = await Post.find({ author: user._id, published: true }).sort({ createdAt: -1 }).select('title excerpt tags likes views createdAt coverColor');
    const totalLikes = posts.reduce((sum, p) => sum + p.likes.length, 0);
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    res.json({ success: true, user, posts, stats: { postCount: posts.length, totalLikes, totalViews } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
