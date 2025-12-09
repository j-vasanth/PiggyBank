import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ParentLogin.css';

const ParentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      await login({ username: formData.username, password: formData.password }, 'parent');
      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page parent-theme">
      {/* Decorative background elements */}
      <div className="login-page__bg">
        <div className="login-page__bg-orb login-page__bg-orb--1" />
        <div className="login-page__bg-orb login-page__bg-orb--2" />
      </div>

      <div className="login-page__container">
        {/* Brand Header */}
        <header className="login-page__header animate-slide-up">
          <div className="login-page__logo">
            <span className="login-page__logo-icon">💵</span>
          </div>
          <h1 className="login-page__brand">Kash</h1>
          <p className="login-page__tagline">Welcome back</p>
        </header>

        {/* Login Card */}
        <div className="login-card animate-slide-up delay-1">
          <div className="login-card__header">
            <h2 className="login-card__title">Parent Sign In</h2>
            <p className="login-card__subtitle">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="alert alert-danger animate-scale-in">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className={`form-group ${focusedField === 'username' ? 'form-group--focused' : ''}`}>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className={`form-group ${focusedField === 'password' ? 'form-group--focused' : ''}`}>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full login-form__submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="login-card__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="login-card__link">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Child Login Link */}
        <div className="login-page__child-link animate-fade-in delay-2">
          <Link to="/child/login" className="child-login-link">
            <span className="child-login-link__icon">👶</span>
            <span>I'm a kid - Sign in with PIN</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentLogin;
