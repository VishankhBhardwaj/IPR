import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  BadgeCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ChevronDown,
} from 'lucide-react';
import { login, register } from '../api/authApi';
import './Auth.css';

/* ------------------------------------------------------------------ */
/*  Roles — sourced from Prisma schema: enum Role { ADMIN FACULTY STUDENT }  */
/* ------------------------------------------------------------------ */
const ROLES = [
  { value: 'ADMIN',   label: 'Admin' },
  { value: 'FACULTY', label: 'Faculty' },
  // { value: 'STUDENT', label: 'Student' },  // uncomment when needed
];

/* ------------------------------------------------------------------ */
/*  Auth Page                                                           */
/* ------------------------------------------------------------------ */
const Auth = ({ onAuthSuccess }) => {
  const navigate = useNavigate();

  // 'login' | 'register'
  const [mode, setMode] = useState('login');

  /* ---- form state ---- */
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FACULTY',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------------- */
  const switchMode = (next) => {
    setMode(next);
    setForm({ name: '', email: '', password: '', role: 'STUDENT' });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ---------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Client-side validation with toast feedback */
    if (!form.email.trim() || !form.password.trim()) {
      toast.error('Email and password are required.');
      return;
    }
    if (mode === 'register' && !form.name.trim()) {
      toast.error('Full name is required.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const loadingToastId = toast.loading(
      mode === 'login' ? 'Signing you in…' : 'Creating your account…'
    );

    try {
      let data;

      if (mode === 'login') {
        // POST /auth/login  →  { email, password }
        data = await login({ email: form.email, password: form.password });
      } else {
        // POST /auth/register  →  { name, email, password, role }
        data = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,         // ADMIN | FACULTY | STUDENT
        });
      }

      /* Token is automatically handled via HttpOnly cookies from the backend, 
         but we also store it in localStorage per request */
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }

      toast.dismiss(loadingToastId);

      if (mode === 'register') {
        toast.success('Account created! Redirecting to login…', { duration: 2000 });
        setTimeout(() => switchMode('login'), 1800);
      } else {
        toast.success(`Welcome back!`, { duration: 2000 });
        if (onAuthSuccess) onAuthSuccess(data);
        navigate('/');
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">

        {/* ---- Brand header ---- */}
        <div className="auth-logo">
          <ShieldCheck size={30} className="auth-logo-icon" />
          <span className="auth-logo-text">IPR Portal</span>
        </div>
        <p className="auth-tagline">
          {mode === 'login'
            ? 'Sign in to manage your intellectual property records'
            : 'Create an account to get started'}
        </p>

        {/* ---- Tab switcher ---- */}
        <div className="auth-tabs" role="tablist">
          <button
            id="tab-login"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
            type="button"
          >
            <LogIn size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Login
          </button>
          <button
            id="tab-register"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
            type="button"
          >
            <UserPlus size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Register
          </button>
        </div>

        {/* ---- Form ---- */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Name — register only */}
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-name" className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><User size={16} /></span>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="auth-input"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-label">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Mail size={16} /></span>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="auth-password" className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={16} /></span>
              <input
                id="auth-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                style={{ paddingRight: '2.75rem' }}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role — register only | ADMIN | FACULTY | STUDENT (from Prisma schema) */}
          {mode === 'register' && (
            <div className="auth-field">
              <label htmlFor="auth-role" className="auth-label">Role</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><BadgeCheck size={16} /></span>
                <select
                  id="auth-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="auth-select"
                  disabled={loading}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '0.85rem', color: 'var(--text-tertiary)', pointerEvents: 'none' }}>
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <><div className="btn-spinner" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
            ) : (
              <>{mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}</>
            )}
          </button>
        </form>

        {/* ---- Footer ---- */}
        <p className="auth-footer">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 600,
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;
