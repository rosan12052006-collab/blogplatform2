import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, Button } from './UI';

export default function Navbar({ onWriteClick, onAuthClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header style={{ background: '#0F172A', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: '#7C3AED', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✍️</div>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', fontFamily: "'Playfair Display', serif" }}>Inkwell</span>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
            placeholder="Search posts... (Enter)"
            style={{ width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.09)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>

        {/* Nav links */}
        <nav className="hide-mobile" style={{ display: 'flex', gap: 4 }}>
          <Link to="/" style={{ color: '#94A3B8', fontSize: 14, fontWeight: 500, padding: '6px 12px', borderRadius: 6, transition: 'all 0.15s' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Feed</Link>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
          {user ? (
            <>
              <Button size="sm" variant="amber" onClick={onWriteClick}>✏️ Write</Button>
              <Link to={`/profile/${user.username}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <Avatar user={user} size={28} />
                  <span className="hide-mobile" style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user.username}</span>
                </div>
              </Link>
              <Button size="sm" variant="ghost" style={{ color: '#94A3B8', borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => { logout(); navigate('/'); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => onAuthClick('login')}>Sign in</Button>
              <Button size="sm" variant="amber" onClick={() => onAuthClick('register')}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
