import { useState, useEffect } from 'react';

export function Avatar({ user, size = 36 }) {
  const colors = ['#7C3AED','#059669','#DC2626','#D97706','#0284C7','#BE185D'];
  const color = colors[(user?.username?.charCodeAt(0) || 0) % colors.length];
  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, letterSpacing: '0.02em' }}>
      {initials}
    </div>
  );
}

export function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', disabled, fullWidth, style = {} }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, transition: 'all 0.15s', opacity: disabled ? 0.55 : 1, fontFamily: 'inherit', width: fullWidth ? '100%' : undefined };
  const sizes = { sm: { padding: '6px 14px', fontSize: 13 }, md: { padding: '10px 20px', fontSize: 14 }, lg: { padding: '14px 28px', fontSize: 16 } };
  const variants = {
    primary: { background: '#7C3AED', color: '#fff' },
    secondary: { background: '#F1F5F9', color: '#0F172A' },
    danger: { background: '#FEE2E2', color: '#DC2626' },
    ghost: { background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0' },
    amber: { background: '#F59E0B', color: '#fff' },
    outline: { background: 'transparent', color: '#7C3AED', border: '2px solid #7C3AED' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, error, multiline, rows = 4, name }) {
  const base = { width: '100%', padding: '11px 14px', border: `1.5px solid ${error ? '#DC2626' : '#E2E8F0'}`, borderRadius: 8, fontSize: 14, color: '#0F172A', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 600, color: '#64748B' }}>{label}{required && <span style={{ color: '#DC2626' }}> *</span>}</label>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize: 'vertical', lineHeight: 1.6 }} />
        : <input name={name} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
      {error && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
}

export function Tag({ label, onClick, active }) {
  return (
    <span onClick={onClick} style={{ display: 'inline-block', padding: '3px 11px', borderRadius: 20, background: active ? '#7C3AED' : '#EDE9FE', color: active ? '#fff' : '#7C3AED', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s' }}>
      {label}
    </span>
  );
}

export function Modal({ title, children, onClose, width = 540 }) {
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', animation: 'slideUp 0.25s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94A3B8', lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  return <div className={`toast ${type}`}><span>{icons[type]}</span>{message}</div>;
}

export function Spinner() {
  return <div className="spinner" />;
}

export function ErrorMsg({ message }) {
  return (
    <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 8, padding: '12px 16px', color: '#DC2626', fontSize: 14, marginBottom: 16 }}>
      ⚠ {message}
    </div>
  );
}
