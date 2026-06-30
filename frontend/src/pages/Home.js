import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Tag, Spinner, Button } from '../components/UI';
import { postsAPI } from '../utils/api';

const ALL_TAGS = ['React', 'JavaScript', 'Node.js', 'CSS', 'Python', 'API', 'Frontend', 'Backend', 'Tutorial', 'Career'];

export default function Home({ onEditPost, showToast }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const search = searchParams.get('search') || '';

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search) params.search = search;
      if (selectedTag) params.tag = selectedTag;
      const res = await postsAPI.getAll(params);
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedTag, showToast]);

  useEffect(() => { setPage(1); }, [search, selectedTag]);
  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleLike(postId) {
    if (!user) { showToast('Sign in to like posts', 'error'); return; }
    try {
      const res = await postsAPI.like(postId);
      setPosts(prev => prev.map(p => p._id === postId
        ? { ...p, likes: res.data.liked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) }
        : p));
    } catch {}
  }

  async function handleDelete(postId) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await postsAPI.delete(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      showToast('Post deleted', 'info');
    } catch {
      showToast('Failed to delete post', 'error');
    }
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '36px 24px' }}>
      {/* Hero */}
      {!search && !selectedTag && page === 1 && (
        <div className="slide-up" style={{ textAlign: 'center', marginBottom: 48, padding: '20px 0' }}>
          <div style={{ display: 'inline-block', background: '#EDE9FE', color: '#7C3AED', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' }}>
            ✨ Community Blog Platform
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: "'Playfair Display', serif" }}>
            Ideas Worth <span style={{ color: '#7C3AED' }}>Sharing</span>
          </h1>
          <p style={{ fontSize: 18, color: '#64748B', maxWidth: 520, margin: '0 auto 28px' }}>
            Discover stories, insights, and perspectives from our community of developers and creators.
          </p>
          {!user && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button size="lg" onClick={() => window.__authModal?.('register')}>Start writing today →</Button>
              <Button size="lg" variant="ghost" onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })}>Browse posts</Button>
            </div>
          )}
        </div>
      )}

      {/* Search result header */}
      {search && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Results for "{search}"</h2>
        </div>
      )}

      {/* Tag filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28, alignItems: 'center' }} id="feed">
        <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>Topics:</span>
        <Tag label="All" active={!selectedTag} onClick={() => setSelectedTag(null)} />
        {ALL_TAGS.map(tag => <Tag key={tag} label={tag} active={selectedTag === tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} />)}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[{ label: 'Total Posts', val: posts.length + '+ posts', icon: '📝' }, { label: 'Active Writers', val: 'Community', icon: '✍️' }, { label: 'Topics', val: ALL_TAGS.length + ' topics', icon: '🏷' }, { label: 'Join Today', val: 'It\'s free', icon: '🚀' }].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#7C3AED' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Posts grid */}
      {loading ? <Spinner /> : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>No posts found</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Try a different search or tag</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onLike={handleLike} onEdit={onEditPost} onDelete={handleDelete} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              <Button variant="ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</Button>
              <span style={{ padding: '10px 16px', fontSize: 14, color: '#64748B', fontWeight: 600 }}>Page {page} of {totalPages}</span>
              <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
