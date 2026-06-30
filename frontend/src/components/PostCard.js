import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Tag, Button } from './UI';

export default function PostCard({ post, onLike, onEdit, onDelete }) {
  const { user } = useAuth();
  const liked = user && post.likes?.includes(user.id);
  const isAuthor = user && post.author?._id === user.id;
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="fade-in" style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
      {/* Color bar */}
      <div style={{ height: 5, background: post.coverColor || '#7C3AED' }} />

      <div style={{ padding: '20px 22px 18px' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {post.tags?.slice(0, 3).map(t => <Tag key={t} label={t} />)}
        </div>

        {/* Title */}
        <Link to={`/posts/${post._id}`}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginBottom: 10, transition: 'color 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#7C3AED'} onMouseLeave={e => e.target.style.color = '#0F172A'}>
            {post.title}
          </h3>
        </Link>

        <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, marginBottom: 18 }}>{post.excerpt}</p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 14 }}>
          <Link to={`/profile/${post.author?.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar user={post.author} size={30} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{post.author?.username}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{date}</div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onLike(post._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked ? '#EF4444' : '#94A3B8', fontSize: 13, fontWeight: 700, padding: 4 }}>
              {liked ? '❤️' : '🤍'} {post.likes?.length || 0}
            </button>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>👁 {post.views || 0}</span>
            {isAuthor && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => onEdit(post)} style={{ background: '#EDE9FE', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#7C3AED', fontWeight: 700 }}>Edit</button>
                <button onClick={() => onDelete(post._id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#DC2626', fontWeight: 700 }}>Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
