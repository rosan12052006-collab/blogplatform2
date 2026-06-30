import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal, Input, Button, ErrorMsg } from './UI';

export default function AuthModal({ mode, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const set = (k) => (v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  function validate() {
    const e = {};
    if (!isLogin && !form.username.trim()) e.username = 'Username is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    if (!isLogin && form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true); setApiError('');
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ username: form.username, email: form.email, password: form.password });
      }
      onSuccess(isLogin ? 'Welcome back! 👋' : 'Account created! 🎉');
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title={isLogin ? 'Welcome back' : 'Create your account'} onClose={onClose}>
      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: 24, borderBottom: '2px solid #E2E8F0' }}>
        {['Sign in', 'Sign up'].map((label, i) => (
          <button key={label} onClick={() => { setIsLogin(i === 0); setApiError(''); setErrors({}); }}
            style={{ flex: 1, padding: '10px 0', background: 'none', border: 'none', fontWeight: 700, fontSize: 14, color: (isLogin ? i === 0 : i === 1) ? '#7C3AED' : '#94A3B8', borderBottom: `2px solid ${(isLogin ? i === 0 : i === 1) ? '#7C3AED' : 'transparent'}`, marginBottom: -2, transition: 'all 0.15s', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {apiError && <ErrorMsg message={apiError} />}

      {!isLogin && <Input label="Username" value={form.username} onChange={set('username')} placeholder="yourname" required error={errors.username} />}
      <Input label="Email" value={form.email} onChange={set('email')} type="email" placeholder="you@example.com" required error={errors.email} />
      <Input label="Password" value={form.password} onChange={set('password')} type="password" placeholder={isLogin ? 'Your password' : 'Min. 6 characters'} required error={errors.password} />

      <Button fullWidth onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
        {loading ? '...' : isLogin ? 'Sign in' : 'Create account'}
      </Button>

      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748B' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button onClick={() => { setIsLogin(!isLogin); setApiError(''); setErrors({}); }}
          style={{ background: 'none', border: 'none', color: '#7C3AED', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}>
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </Modal>
  );
}
