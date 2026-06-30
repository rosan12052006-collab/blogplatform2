import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button } from './UI';
import { postsAPI } from '../utils/api';

export default function CommentSection({ postId, showToast }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    postsAPI.getComments(postId)
      .then(res => setComments(res.data.comments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await postsAPI.addComment(postId, { content: text.trim() });
      setComments(prev => [res.data.comment, ...prev]);
      setText('');
      showToast('Comment posted!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      await postsAPI.deleteComment(postId, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      showToast('Comment deleted', 'info');
    } catch {
      showToast('Failed to delete', 'error');
    }
  }

  async function handleLike(commentId) {
    if (!user) { showToast('Sign in to like', 'error'); return; }
    try {
      const res = await postsAPI.likeComment(postId, commentId);
      setComments(prev => prev.map(c => c._id === commentId
        ? { ...c, likes: res.data.liked ? [...(c.likes || []), user.id] : (c.likes || []).filter(id => id !== user.id) }
        : c));
    } catch {}
  }

  return (
    <div style={{ marginTop: 48 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 24 }}>
        💬 {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {user ? (
        <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, marginBottom: 28, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Avatar user={user} size={36} />
            <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', alignSelf: 'center' }}>{user.username}</span>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <Button onClick={handleSubmit} disabled={!text.trim() || submitting}>
              {submitting ? 'Posting...' : 'Post comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ background: '#EDE9FE', borderRadius: 10, padding: '14px 18px', marginBottom: 28, color: '#7C3AED', fontSize: 14, fontWeight: 600 }}>
          ✨ Sign in to join the conversation
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8' }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💭</div>
          <div style={{ fontSize: 14 }}>No comments yet. Be the first!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {comments.map(comment => {
            const liked = user && comment.likes?.includes(user.id);
            const isAuthor = user && comment.author?._id === user.id;
            return (
              <div key={comment._id} className="fade-in" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar user={comment.author} size={34} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{comment.author?.username}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  {isAuthor && (
                    <button onClick={() => handleDelete(comment._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 13, padding: 4, borderRadius: 4 }}>🗑</button>
                  )}
                </div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 12 }}>{comment.content}</p>
                <button onClick={() => handleLike(comment._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: liked ? '#EF4444' : '#94A3B8', fontWeight: 700, padding: 0 }}>
                  {liked ? '❤️' : '🤍'} {comment.likes?.length || 0} {(comment.likes?.length || 0) === 1 ? 'like' : 'likes'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
