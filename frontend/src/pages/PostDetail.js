import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { Avatar, Tag, Button, Spinner } from '../components/UI';
import { postsAPI } from '../utils/api';

export default function PostDetail({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    postsAPI.getOne(id)
      .then(res => {
        setPost(res.data.post);
        setLiked(user && res.data.post.likes?.includes(user.id));
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  async function handleLike() {
    if (!user) { showToast('Sign in to like posts', 'error'); return; }
    try {
      const res = await postsAPI.like(post._id);
      setLiked(res.data.liked);
      setPost(prev => ({ ...prev, likes: res.data.liked ? [...prev.likes, user.id] : prev.likes.filter(id => id !== user.id) }));
    } catch {}
  }

  if (loading) return <div style={{ maxWidth: 780, margin: '40px auto', padding: '0 24px' }}><Spinner /></div>;
  if (!post) return null;

  const isAuthor = user && post.author?._id === user.id;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px' }}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontSize: 14, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
        ← Back to feed
      </button>

      {/* Color accent */}
      <div style={{ height: 5, borderRadius: 3, background: post.coverColor || '#7C3AED', marginBottom: 28 }} />

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {post.tags?.map(t => <Tag key={t} label={t} />)}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0F172A', margin: '0 0 20px', lineHeight: 1.15, letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif" }}>
        {post.title}
      </h1>

      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #E2E8F0' }}>
        <Link to={`/profile/${post.author?.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar user={post.author} size={44} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{post.author?.username}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {post.updatedAt !== post.createdAt && ' · Updated'}
            </div>
          </div>
        </Link>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={handleLike} style={{ background: liked ? '#FEE2E2' : '#F1F5F9', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: liked ? '#DC2626' : '#64748B', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
            {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
          </button>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>👁 {post.views} views</span>
          {isAuthor && (
            <Button size="sm" variant="secondary" onClick={() => navigate('/', { state: { editPost: post } })}>Edit post</Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ fontSize: 17, color: '#1E293B', lineHeight: 1.9, whiteSpace: 'pre-line', letterSpacing: '0.01em' }}>
        {post.content}
      </div>

      {/* Author bio card */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, marginTop: 48, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Avatar user={post.author} size={56} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 4 }}>About {post.author?.username}</div>
          <div style={{ fontSize: 14, color: '#64748B' }}>{post.author?.bio || 'No bio yet.'}</div>
          <Link to={`/profile/${post.author?.username}`} style={{ fontSize: 13, color: '#7C3AED', fontWeight: 700, marginTop: 6, display: 'inline-block' }}>
            View all posts →
          </Link>
        </div>
      </div>

      {/* Comments */}
      <CommentSection postId={post._id} showToast={showToast} />
    </div>
  );
}
