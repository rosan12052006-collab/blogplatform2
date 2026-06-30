import { useState } from 'react';
import { Modal, Input, Button, ErrorMsg } from './UI';
import { postsAPI } from '../utils/api';

export default function PostEditor({ post, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    tags: post?.tags?.join(', ') || '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  function validate() {
    const e = {};
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.excerpt.trim()) e.excerpt = 'Excerpt is required';
    if (!form.content.trim() || form.content.length < 50) e.content = 'Content must be at least 50 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true); setApiError('');
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      let res;
      if (post) {
        res = await postsAPI.update(post._id, payload);
      } else {
        res = await postsAPI.create(payload);
      }
      onSaved(res.data.post, post ? 'Post updated!' : 'Post published! 🚀');
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={post ? 'Edit post' : 'Write a new post'} onClose={onClose} width={640}>
      {apiError && <ErrorMsg message={apiError} />}
      <Input label="Post Title" value={form.title} onChange={set('title')} placeholder="Enter a compelling title..." required error={errors.title} />
      <Input label="Excerpt" value={form.excerpt} onChange={set('excerpt')} placeholder="A brief summary shown in post cards..." required error={errors.excerpt} />
      <Input label="Content" value={form.content} onChange={set('content')} placeholder="Write your post content here..." multiline rows={9} required error={errors.content} />
      <Input label="Tags (comma-separated)" value={form.tags} onChange={set('tags')} placeholder="React, JavaScript, Tutorial" />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : post ? 'Save changes' : 'Publish post'}</Button>
      </div>
    </Modal>
  );
}
