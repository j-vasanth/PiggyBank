import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './RegisterParent.css';

const RegisterParent: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    family_name: '',
    parent_name: '',
    parent_username: '',
    parent_password: '',
    confirm_password: '',
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

    if (!formData.family_name || !formData.parent_name || !formData.parent_username || !formData.parent_password) {
      setError('All fields are required');
      return;
    }

    if (formData.parent_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.parent_password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({
        family_name: formData.family_name,
        parent_name: formData.parent_name,
        parent_username: formData.parent_username,
        parent_password: formData.parent_password,
      });

      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page parent-theme">
      {/* Decorative background elements */}
      <div className="register-page__bg">
        <div className="register-page__bg-orb register-page__bg-orb--1" />
        <div className="register-page__bg-orb register-page__bg-orb--2" />
        <div className="register-page__bg-orb register-page__bg-orb--3" />
      </div>

      <div className="register-page__container">
        {/* Brand Header */}
        <header className="register-page__header animate-slide-up">
          <div className="register-page__logo">
            <span className="register-page__logo-icon">💵</span>
          </div>
          <h1 className="register-page__brand">Kash</h1>
          <p className="register-page__tagline">Family banking made simple</p>
        </header>

        {/* Registration Card */}
        <div className="register-card animate-slide-up delay-1">
          <div className="register-card__header">
            <h2 className="register-card__title">Create your account</h2>
            <p className="register-card__subtitle">Start managing your family's finances today</p>
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

          <form onSubmit={handleSubmit} className="register-form">
            {/* Family Name */}
            <div className={`form-group ${focusedField === 'family_name' ? 'form-group--focused' : ''}`}>
              <label htmlFor="family_name" className="form-label">
                Family Name
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="family_name"
                  name="family_name"
                  className="form-input"
                  placeholder="The Smith Family"
                  value={formData.family_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('family_name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  maxLength={100}
                />
              </div>
            </div>

            {/* Parent Name */}
            <div className={`form-group ${focusedField === 'parent_name' ? 'form-group--focused' : ''}`}>
              <label htmlFor="parent_name" className="form-label">
                Your Name
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
                  id="parent_name"
                  name="parent_name"
                  className="form-input"
                  placeholder="Enter your name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('parent_name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  maxLength={100}
                />
              </div>
            </div>

            {/* Username */}
            <div className={`form-group ${focusedField === 'parent_username' ? 'form-group--focused' : ''}`}>
              <label htmlFor="parent_username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                </span>
                <input
                  type="text"
                  id="parent_username"
                  name="parent_username"
                  className="form-input"
                  placeholder="Choose a username"
                  value={formData.parent_username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('parent_username')}
                  onBlur={() => setFocusedField(null)}
                  required
                  pattern="[a-zA-Z0-9_]{3,50}"
                />
              </div>
              <p className="form-help">3-50 characters. Letters, numbers, and underscores only.</p>
            </div>

            {/* Password */}
            <div className={`form-group ${focusedField === 'parent_password' ? 'form-group--focused' : ''}`}>
              <label htmlFor="parent_password" className="form-label">
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
                  id="parent_password"
                  name="parent_password"
                  className="form-input"
                  placeholder="Create a strong password"
                  value={formData.parent_password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('parent_password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={8}
                />
              </div>
              <div className="password-strength">
                <div className="password-strength__bar">
                  <div
                    className="password-strength__fill"
                    style={{
                      width: `${Math.min((formData.parent_password.length / 12) * 100, 100)}%`,
                      background: formData.parent_password.length >= 8
                        ? 'var(--kash-success-500)'
                        : 'var(--kash-gold-500)'
                    }}
                  />
                </div>
                <span className="password-strength__text">
                  {formData.parent_password.length === 0 && 'At least 8 characters'}
                  {formData.parent_password.length > 0 && formData.parent_password.length < 8 && 'Keep going...'}
                  {formData.parent_password.length >= 8 && formData.parent_password.length < 12 && 'Good!'}
                  {formData.parent_password.length >= 12 && 'Strong!'}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className={`form-group ${focusedField === 'confirm_password' ? 'form-group--focused' : ''}`}>
              <label htmlFor="confirm_password" className="form-label">
                Confirm Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  className="form-input"
                  placeholder="Re-enter your password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirm_password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
              {formData.confirm_password && formData.parent_password !== formData.confirm_password && (
                <p className="form-error">Passwords don't match</p>
              )}
              {formData.confirm_password && formData.parent_password === formData.confirm_password && (
                <p className="form-success">Passwords match!</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg btn-full register-form__submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  Get Started
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="register-card__footer">
            <p>
              Already have an account?{' '}
              <Link to="/parent/login" className="register-card__link">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="register-page__footer animate-fade-in delay-3">
          <p>By creating an account, you agree to our Terms of Service</p>
        </footer>
      </div>
    </div>
  );
};

export default RegisterParent;
