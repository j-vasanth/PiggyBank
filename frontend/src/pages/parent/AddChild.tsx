import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenService } from '../../services/children-service';
import Layout from '../../components/Layout';
import { IMAGE_AVATARS, EMOJI_AVATARS } from '../../constants/avatars';
import { Avatar } from '../../components/Avatar';
import './AddChild.css';

const AddChild: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    avatar: '',
    age: '',
    pin: ['', '', '', ''],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [avatarTab, setAvatarTab] = useState<'images' | 'emojis'>('images');

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleAvatarSelect = (avatarId: string) => {
    setFormData({ ...formData, avatar: avatarId });
  };

  const handlePinChange = (index: number, value: string) => {
    const numValue = value.replace(/[^0-9]/g, '');

    if (numValue.length <= 1) {
      const newPin = [...formData.pin];
      newPin[index] = numValue;
      setFormData({ ...formData, pin: newPin });

      if (numValue && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your child\'s name');
      return;
    }

    if (!formData.username.trim()) {
      setError('Please enter a username');
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernamePattern.test(formData.username)) {
      setError('Username must be 3-50 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (!formData.avatar) {
      setError('Please select an avatar');
      return;
    }

    const pin = formData.pin.join('');
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setLoading(true);

    try {
      await childrenService.createChild({
        name: formData.name,
        username: formData.username,
        password: pin,
        avatar: formData.avatar,
        age: formData.age ? parseInt(formData.age) : undefined,
      });

      navigate('/parent/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create child account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Add Child" showBack>
      <div className="add-child">
        <div className="add-child__container">
          {/* Header */}
          <header className="add-child__header animate-slide-up">
            <Avatar avatar={formData.avatar || null} size="xl" className="add-child__header-icon" />
            <h2 className="add-child__header-title">Create a new account</h2>
            <p className="add-child__header-subtitle">
              Set up a piggy bank for your child
            </p>
          </header>

          {/* Error Alert */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="add-child__form animate-slide-up delay-1">
            {/* Avatar Selection */}
            <div className="form-section">
              <h3 className="form-section__title">Choose an Avatar</h3>
              <p className="form-section__subtitle">Pick a fun character your child will love!</p>

              {/* Avatar Tabs */}
              <div className="avatar-tabs">
                <button
                  type="button"
                  className={`avatar-tab ${avatarTab === 'images' ? 'avatar-tab--active' : ''}`}
                  onClick={() => setAvatarTab('images')}
                >
                  Characters
                </button>
                <button
                  type="button"
                  className={`avatar-tab ${avatarTab === 'emojis' ? 'avatar-tab--active' : ''}`}
                  onClick={() => setAvatarTab('emojis')}
                >
                  Emojis
                </button>
              </div>

              {/* Image Avatars */}
              {avatarTab === 'images' && (
                <div className="avatar-grid avatar-grid--images">
                  {IMAGE_AVATARS.map(([id, entry]) => (
                    <button
                      key={id}
                      type="button"
                      className={`avatar-option avatar-option--large ${formData.avatar === id ? 'avatar-option--selected' : ''}`}
                      onClick={() => handleAvatarSelect(id)}
                    >
                      <img src={entry.src} alt={entry.name} className="avatar-option__image" />
                      {formData.avatar === id && (
                        <span className="avatar-option__check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Avatars */}
              {avatarTab === 'emojis' && (
                <div className="avatar-grid avatar-grid--emojis">
                  {EMOJI_AVATARS.map(([id]) => (
                    <button
                      key={id}
                      type="button"
                      className={`avatar-option ${formData.avatar === id ? 'avatar-option--selected' : ''}`}
                      onClick={() => handleAvatarSelect(id)}
                    >
                      <span className="avatar-option__emoji">{id}</span>
                      {formData.avatar === id && (
                        <span className="avatar-option__check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Child Details */}
            <div className="form-section">
              <h3 className="form-section__title">Child Details</h3>

              {/* Name */}
              <div className={`form-group ${focusedField === 'name' ? 'form-group--focused' : ''}`}>
                <label htmlFor="name" className="form-label">Child's Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="Enter child's name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    maxLength={100}
                  />
                </div>
                <p className="form-help">This is how your child will appear in the app</p>
              </div>

              {/* Username */}
              <div className={`form-group ${focusedField === 'username' ? 'form-group--focused' : ''}`}>
                <label htmlFor="username" className="form-label">Username</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-input"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                    pattern="[a-zA-Z0-9_]{3,50}"
                    maxLength={50}
                  />
                </div>
                <p className="form-help">Your child will use this to log in (3-50 characters)</p>
              </div>

              {/* Age */}
              <div className={`form-group ${focusedField === 'age' ? 'form-group--focused' : ''}`}>
                <label htmlFor="age" className="form-label">Age <span className="form-label__optional">(Optional)</span></label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </span>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    className="form-input"
                    placeholder="Enter child's age"
                    value={formData.age}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('age')}
                    onBlur={() => setFocusedField(null)}
                    min={1}
                    max={18}
                  />
                </div>
              </div>
            </div>

            {/* PIN Setup */}
            <div className="form-section">
              <h3 className="form-section__title">Create Login PIN</h3>
              <p className="form-section__subtitle">A simple 4-digit code for your child to remember</p>

              <div className="pin-input-container">
                <div className="pin-input-group">
                  {formData.pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={pinRefs[index]}
                      type="text"
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
                <p className="pin-help">
                  {formData.pin.filter(d => d).length === 0 && 'Enter 4 digits'}
                  {formData.pin.filter(d => d).length > 0 && formData.pin.filter(d => d).length < 4 && `${4 - formData.pin.filter(d => d).length} more digit${4 - formData.pin.filter(d => d).length > 1 ? 's' : ''}`}
                  {formData.pin.filter(d => d).length === 4 && '✓ PIN complete'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="add-child__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/parent/dashboard')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    Add Child
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddChild;
