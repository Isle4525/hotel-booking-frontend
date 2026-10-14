import React, { useState } from 'react';
import '../styles/Auth.css';
import { isValidEmail } from '../utils/auth';
import { useAuth, useNavigation } from '../context';

export default function Register(props) {
  const auth = useAuth();
  const nav = useNavigation();

  const onNavigate = props.onNavigate || nav.navigate;
  const onRegisterSuccess = props.onRegisterSuccess || ((user) => {
    auth.setCurrentUser(user);
    nav.navigate('home');
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [serverError, setServerError] = useState('');

  // Handle field change and clear its error
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    setServerError('');
  };

  // Form validation function
  const validate = () => {
    const newErrors = {};

    // 1. Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // 2. Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g. user@example.com)';
    }

    // 3. Password validation (at least 8 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // 4. Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // 5. Terms acceptance validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions to register';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      return;
    }

    const result = auth.register({
      name: formData.fullName,
      email: formData.email,
      password: formData.password
    });

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccessData(result.user);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <span className="auth-badge">Demo Registration</span>
          <h2>Create Your Account</h2>
          <p>Join Booker to reserve luxury hotel rooms and unlock exclusive rates</p>
        </div>

        {/* Success Screen after Demo Registration */}
        {successData ? (
          <div className="reg-success-card">
            <div className="reg-success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p>
              Your demo account for <strong>{successData.name}</strong> (<code>{successData.email}</code>) has been successfully registered.
            </p>
            <div className="reg-success-actions">
              <button
                type="button"
                className="auth-submit-btn"
                onClick={() => {
                  if (onRegisterSuccess) {
                    onRegisterSuccess(successData);
                  } else {
                    onNavigate('login');
                  }
                }}
              >
                Log In Now →
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onNavigate('home')}
              >
                Back to Hotel Catalog
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <>
            {serverError && (
              <div className="auth-alert auth-alert-error" role="alert">
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-fullName">
                  <span>Full Name<span className="required-mark">*</span></span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="reg-fullName"
                    name="fullName"
                    type="text"
                    className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
                    placeholder="e.g. Aslan Kairatov"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
                {errors.fullName && (
                  <span className="field-error">⚠️ {errors.fullName}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  <span>Email Address<span className="required-mark">*</span></span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="e.g. aslan@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="field-error">⚠️ {errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  <span>Password (min. 8 characters)<span className="required-mark">*</span></span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter at least 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirmPassword">
                  <span>Confirm Password<span className="required-mark">*</span></span>
                </label>
                <div className="form-input-wrapper">
                  <input
                    id="reg-confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    title={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">⚠️ {errors.confirmPassword}</span>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="terms-checkbox-group">
                <label className="terms-label" htmlFor="reg-terms">
                  <input
                    id="reg-terms"
                    name="termsAccepted"
                    type="checkbox"
                    className="terms-checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                  <span>
                    I agree to the <span className="terms-link">Terms and Conditions</span> and Privacy Policy for this demo application.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <span className="field-error">⚠️ {errors.termsAccepted}</span>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="auth-submit-btn">
                Register Account
              </button>
            </form>

            {/* Footer with Link to Login */}
            <div className="auth-footer">
              <span>Already have an account?</span>
              <button
                type="button"
                className="auth-footer-link"
                onClick={() => onNavigate('login')}
              >
                Log In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
