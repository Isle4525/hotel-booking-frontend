import React, { useState } from 'react';
import '../styles/Auth.css';
import { isValidEmail } from '../utils/auth';
import { useAuth, useNavigation } from '../context';

export default function Login(props) {
  const auth = useAuth();
  const nav = useNavigation();

  const onNavigate = props.onNavigate || nav.navigate;
  const onLoginSuccess = props.onLoginSuccess || ((user) => {
    auth.setCurrentUser(user);
    nav.navigate('home');
  });

  const demoUser = auth.defaultDemoUser;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setAuthError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuickFill = () => {
    setFormData({
      email: demoUser.email,
      password: demoUser.password
    });
    setErrors({});
    setAuthError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    const result = auth.login(formData.email, formData.password);

    if (!result.success) {
      setAuthError(result.error);
      return;
    }

    setSuccessMessage(`Login successful! Welcome back, ${result.user.name}.`);

    setTimeout(() => {
      onLoginSuccess(result.user);
    }, 900);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <span className="auth-badge">Demo Authentication</span>
          <h2>Welcome Back</h2>
          <p>Log in to access your booked rooms and complete reservations</p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="demo-credentials-box">
          <div className="demo-credentials-header">
            <span>💡 Demo Account Credentials</span>
          </div>
          <div className="demo-credentials-body">
            Email: <code>{demoUser.email}</code><br />
            Password: <code>{demoUser.password}</code>
          </div>
          <button
            type="button"
            className="btn-quick-fill"
            onClick={handleQuickFill}
          >
            Fill Demo Credentials
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="auth-alert auth-alert-success" role="alert">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {authError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <span>Email Address<span className="required-mark">*</span></span>
            </label>
            <div className="form-input-wrapper">
              <input
                id="login-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. demo@booker.kz"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error">⚠️ {errors.email}</span>
            )}
          </div>

          {/* Password with Show/Hide Control */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <span>Password<span className="required-mark">*</span></span>
            </label>
            <div className="form-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">⚠️ {errors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn">
            Log In
          </button>
        </form>

        {/* Footer with Link to Register */}
        <div className="auth-footer">
          <span>Don't have an account?</span>
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => onNavigate('register')}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
