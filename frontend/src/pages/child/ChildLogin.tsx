import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ChildLogin.css';

const ChildLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboard = user.user_type === 'child' ? '/child/dashboard' : '/parent/dashboard';
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePinChange = (index: number, value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');

    if (numValue.length <= 1) {
      const newPin = [...pin];
      newPin[index] = numValue;
      setPin(newPin);
      setError('');

      if (numValue && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    const pinCode = pin.join('');
    if (pinCode.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setLoading(true);

    try {
      await login({ username, password: pinCode }, 'child');
      navigate('/child/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid username or PIN');
      // Clear PIN on error
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-login-page child-theme">
      {/* Fun background */}
      <div className="child-login-page__bg">
        <div className="child-login-page__bg-shape child-login-page__bg-shape--1" />
        <div className="child-login-page__bg-shape child-login-page__bg-shape--2" />
        <div className="child-login-page__bg-shape child-login-page__bg-shape--3" />
      </div>

      <div className="child-login-page__container">
        {/* Header */}
        <header className="child-login-page__header animate-slide-up">
          <div className="child-login-page__logo">
            <span className="child-login-page__logo-icon">🐷</span>
          </div>
          <h1 className="child-login-page__brand">Kash Kids</h1>
          <p className="child-login-page__tagline">Your piggy bank awaits!</p>
        </header>

        {/* Login Card */}
        <div className="child-login-card animate-slide-up delay-1">
          <div className="child-login-card__header">
            <h2 className="child-login-card__title">Welcome Back!</h2>
            <p className="child-login-card__subtitle">Enter your username and PIN to see your savings</p>
          </div>

          {error && (
            <div className="alert alert-danger animate-scale-in">
              <span className="alert__icon">😕</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="child-login-form">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                id="username"
                className="form-input form-input--large"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                autoComplete="username"
                required
              />
            </div>

            {/* PIN Input */}
            <div className="form-group">
              <label className="form-label">4-Digit PIN</label>
              <div className="pin-input-group">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    pattern="[0-9]"
                    className={`pin-digit ${digit ? 'pin-digit--filled' : ''}`}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-child-primary btn-lg btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Logging In...
                </>
              ) : (
                <>
                  <span>Let's Go!</span>
                  <span className="btn-emoji">🚀</span>
                </>
              )}
            </button>
          </form>

          {/* Parent Login Link */}
          <div className="child-login-card__footer">
            <p>
              Are you a parent?{' '}
              <Link to="/parent/login" className="child-login-card__link">
                Parent Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildLogin;
