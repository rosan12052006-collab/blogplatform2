import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button, Spinner, Input } from '../components/UI';
import { usersAPI, authAPI } from '../utils/api';

export default function Profile({ showToast }) {
  const { username } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');

  const isOwn = user?.username === username;

  useEffect(() => {
    usersAPI.getProfile(username)
      .then(res => { setProfile(res.data); setBio(res.data.user.bio || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [username]);

  async function saveBio() {
    try {
      const res = await authAPI.updateProfile({ bio });
      updateUser(res.data.user);
      setProfile(prev => ({ ...prev, user: { ...prev.user, bio } }));
      setEditingBio(false);
      showToast('Profile updated!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    }
  }

  if (loading) return <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 24px' }}><Spinner /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94A3B8' }}>User not found</div>;

  const { user: profileUser, posts, stats } = profile;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px' }}>
      {/* Profile header */}
      <div className="slide-up" style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #F8FAFC 100%)', borderRadius: 20, padding: 32, marginBottom: 32, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
          <Avatar user={profileUser} size={72} />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>@{profileUser.username}</h1>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              {profileUser.email} · Joined {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>

            {editingBio ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input value={bio} onChange={e => setBio(e.target.value)} maxLength={200}
                  style={{ flex: 1, padding: '7px 12px', border: '1.5px solid #E2E8F0', borderRadius: 7, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  placeholder="Write a short bio..." />
                <Button size="sm" onClick={saveBio}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingBio(false)}>Cancel</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>{profileUser.bio || 'No bio yet.'}</p>
                {isOwn && (
                  <button onClick={() => setEditingBio(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#7C3AED', fontWeight: 700, padding: 0, flexShrink: 0 }}>
                    ✏️ Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[{ icon: '📝', val: stats.postCount, label: 'Posts' }, { icon: '❤️', val: stats.totalLikes, label: 'Likes' }, { icon: '👁', val: stats.totalViews, label: 'Views' }].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 0', textAlign: 'center', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 22, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A' }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts list */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>
        Posts by {profileUser.username}
      </h2>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>No posts yet</div>
          {isOwn && <div style={{ fontSize: 13, marginTop: 6 }}>Start writing to share your ideas with the world!</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {posts.map(post => (
            <Link key={post._id} to={`/posts/${post._id}`} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7C3AED'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
              <div style={{ width: 4, height: 52, borderRadius: 2, background: post.coverColor || '#7C3AED', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', display: 'flex', gap: 12 }}>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span>❤️ {post.likes?.length || 0}</span>
                  <span>👁 {post.views || 0}</span>
                </div>
              </div>
              <span style={{ color: '#7C3AED', fontSize: 20 }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
