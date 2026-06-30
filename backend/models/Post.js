const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, 'Title is required'],
    trim: true, minlength: 5, maxlength: 150,
  },
  content: {
    type: String, required: [true, 'Content is required'], minlength: 50,
  },
  excerpt: {
    type: String, required: [true, 'Excerpt is required'], maxlength: 300,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true,
  },
  tags: [{ type: String, trim: true }],
  coverColor: { type: String, default: '#7C3AED' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
