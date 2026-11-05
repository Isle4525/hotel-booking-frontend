import React, { useState } from 'react';
import '../styles/OrderCheckout.css';
import { useAuth, useCart, useNavigation } from '../context';

export default function OrderCheckout(props) {
  const auth = useAuth();
  const cart = useCart();
  const nav = useNavigation();

  const cartItems = props.cartItems || cart.cartItems || [];
  const clearCart = props.clearCart || cart.clearCart;
  const currentUser = props.currentUser !== undefined ? props.currentUser : auth.currentUser;
  const onNavigate = props.onNavigate || nav.navigate;

  // Active items selected in cart for calculation
  const activeItems = cartItems.filter((it) => it.selected !== false);
  const selectedItems = activeItems;
  const currentTotal = selectedItems.reduce(
    (sum, it) => sum + (it.hotel?.price || 0) * (it.roomsCount || 1) * (it.nights || 1),
    0
  );

  // Controlled component state for all 11 form fields
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'card', // 'card' | 'cash'
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [cartError, setCartError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Handle controlled input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    // Formatting helpers for bank card fields
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      nextValue = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) {
        nextValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      } else {
        nextValue = digits;
      }
    } else if (name === 'cvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));

    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // When switching payment method to cash, clear card field errors
    if (name === 'paymentMethod' && nextValue === 'cash') {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.cardHolder;
        delete next.cardNumber;
        delete next.expiryDate;
        delete next.cvv;
        return next;
      });
    }
  };

  // Demo auto-fill helper for testing and grading
  const handleQuickFill = () => {
    setFormData({
      fullName: currentUser?.name || 'Aibek Nurlanuly',
      email: currentUser?.email || 'aibek@example.kz',
      phone: '+7 (701) 555-43-21',
      address: '45 Dostyk Avenue, Apt 12',
      city: 'Almaty',
      paymentMethod: 'card',
      cardHolder: 'AIBEK NURLANULY',
      cardNumber: '4400 1234 5678 9012',
      expiryDate: '12/28',
      cvv: '888',
      comment: 'Please arrange quiet rooms and early check-in if possible.'
    });
    setErrors({});
    setCartError('');
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // 1. fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // 2. email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. user@example.com)';
    }

    // 3. phone
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length < 10) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits)';
    }

    // 4. address
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    // 5. city
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // 6. Bank card fields (validated only when paymentMethod is 'card')
    if (formData.paymentMethod === 'card') {
      if (!formData.cardHolder.trim()) {
        newErrors.cardHolder = "Cardholder's name is required";
      } else if (formData.cardHolder.trim().length < 2) {
        newErrors.cardHolder = 'Cardholder name must be at least 2 characters';
      }

      const cardDigits = formData.cardNumber.replace(/\D/g, '');
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'Bank card number is required';
      } else if (cardDigits.length !== 16) {
        newErrors.cardNumber = 'Bank card number must be 16 digits';
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = 'Card expiration date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate.trim())) {
        newErrors.expiryDate = 'Expiration date must be in MM/YY format';
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = 'Security code (CVV) is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv.trim())) {
        newErrors.cvv = 'CVV must be 3 or 4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Order
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setCartError('');

    const isValid = validateForm();

    // Ensure the shopping cart contains products
    if (cartItems.length === 0) {
      setCartError('Your shopping cart is empty! Please add products before placing an order.');
      return;
    }
    if (selectedItems.length === 0) {
      setCartError('Select at least one product from your cart before placing an order.');
      return;
    }

    if (!isValid) {
      return;
    }

    // Save snapshot of order details
    const orderDetails = {
      orderId: `ORD-${Date.now().toString().slice(-6)}`,
      orderDate: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      comment: formData.comment.trim(),
      paymentMethod: formData.paymentMethod === 'card' ? 'Bank card' : 'Cash on delivery',
      items: selectedItems.map((item) => ({ ...item })),
      totalAmount: currentTotal
    };

    setSubmittedOrder(orderDetails);
    setSuccessMessage('Order successfully placed!');

    // Task 7: After successful order submission, clear the form and shopping cart
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'card',
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      comment: ''
    });
    setErrors({});
    clearCart();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset Form button
  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'card',
      cardHolder: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      comment: ''
    });
    setErrors({});
    setCartError('');
  };

  // Clear Cart button
  const handleClearCart = () => {
    clearCart();
    setCartError('');
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Page Breadcrumb / Navigation */}
        <div className="checkout-top-bar">
          <button
            type="button"
            className="btn-back-nav"
            onClick={() => onNavigate('home')}
          >
            ← Back to Hotels
          </button>
          <span className="checkout-badge">Order Checkout</span>
        </div>

        {/* Success Alert Banner (Conditional Rendering) */}
        {successMessage && (
          <div className="order-success-banner" role="alert">
            <span className="success-icon">✓</span>
            <div className="success-content">
              <h4>Success!</h4>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Section: Your Order (Conditional Rendering - Task 6 & 8) */}
        {submittedOrder && (
          <section className="your-order-section" id="your-order" aria-label="Your Order Details">
            <div className="your-order-card">
              <div className="your-order-header">
                <div className="your-order-title-block">
                  <span className="order-trophy-icon">📦</span>
                  <div>
                    <h2 className="your-order-heading">Your Order</h2>
                    <p className="order-reference">
                      Order Reference: <strong>#{submittedOrder.orderId}</strong> • Placed on {submittedOrder.orderDate}
                    </p>
                  </div>
                </div>
                <div className="order-status-badge">Confirmed</div>
              </div>

              {/* Customer and Delivery Information */}
              <div className="order-info-grid">
                <div className="order-info-item">
                  <span className="order-label">Customer's full name</span>
                  <strong className="order-value">{submittedOrder.fullName}</strong>
                </div>

                <div className="order-info-item">
                  <span className="order-label">Email address</span>
                  <strong className="order-value">{submittedOrder.email}</strong>
                </div>

                <div className="order-info-item">
                  <span className="order-label">Phone number</span>
                  <strong className="order-value">{submittedOrder.phone}</strong>
                </div>

                <div className="order-info-item">
                  <span className="order-label">Delivery address</span>
                  <strong className="order-value">
                    {submittedOrder.address}, {submittedOrder.city}
                  </strong>
                </div>

                <div className="order-info-item">
                  <span className="order-label">Selected payment method</span>
                  <strong className="order-value payment-method-tag">
                    {submittedOrder.paymentMethod === 'Bank card' ? '💳 Bank card' : '💵 Cash on delivery'}
                  </strong>
                </div>

                {submittedOrder.comment && (
                  <div className="order-info-item order-info-full">
                    <span className="order-label">Order comments</span>
                    <p className="order-comment-box">{submittedOrder.comment}</p>
                  </div>
                )}
              </div>

              {/* List of Selected Products from Cart */}
              <div className="order-products-section">
                <h3 className="order-products-heading">
                  Selected Products ({submittedOrder.items.length})
                </h3>
                <div className="order-products-list">
                  {submittedOrder.items.map((item) => {
                    const rooms = item.roomsCount || 1;
                    const nights = item.nights || 1;
                    const itemSubtotal = (item.hotel?.price || 0) * rooms * nights;

                    return (
                      <div key={item.hotel?.id} className="order-product-card">
                        <img
                          src={item.hotel?.image}
                          alt={item.hotel?.name}
                          className="order-product-thumb"
                        />
                        <div className="order-product-details">
                          <h4 className="order-product-name">{item.hotel?.name}</h4>
                          <span className="order-product-location">📍 {item.hotel?.city}</span>
                          <span className="order-product-meta">
                            {rooms} {rooms === 1 ? 'room' : 'rooms'} × {nights} {nights === 1 ? 'night' : 'nights'}
                          </span>
                        </div>
                        <div className="order-product-price-block">
                          <span className="order-product-rate">
                            {(item.hotel?.price || 0).toLocaleString('ru-RU')} ₸ / night
                          </span>
                          <strong className="order-product-subtotal">
                            {itemSubtotal.toLocaleString('ru-RU')} ₸
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Order Amount */}
              <div className="order-total-card">
                <div className="order-total-desc">
                  <span>Total order amount</span>
                  <small>Includes all taxes and services</small>
                </div>
                <div className="order-total-price">
                  {submittedOrder.totalAmount.toLocaleString('ru-RU')} ₸
                </div>
              </div>

              <div className="order-after-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setSubmittedOrder(null);
                    setSuccessMessage('');
                    onNavigate('home', 'hotels');
                  }}
                >
                  ← Browse More Hotels
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSubmittedOrder(null);
                    setSuccessMessage('');
                  }}
                >
                  Create Another Order
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Empty Cart Warning Alert */}
        {cartItems.length === 0 && !submittedOrder && (
          <div className="checkout-empty-cart-alert">
            <span className="empty-alert-icon">🛒</span>
            <div className="empty-alert-text">
              <h4>Your Shopping Cart is Empty</h4>
              <p>Add hotels to your cart to proceed with checkout and place your order.</p>
            </div>
            <button
              type="button"
              className="btn-primary btn-explore"
              onClick={() => onNavigate('home', 'hotels')}
            >
              Explore Hotels →
            </button>
          </div>
        )}

        {/* Main Checkout Grid: Form (Left) & Cart Summary (Right) */}
        <div className="checkout-grid">
          {/* Checkout Form Section */}
          <div className="checkout-form-card">
            <div className="checkout-card-header">
              <div>
                <h2 className="checkout-title">Customer Details & Payment</h2>
                <p className="checkout-subtitle">
                  Please fill in your contact information and select a payment method.
                </p>
              </div>
              <button
                type="button"
                className="btn-quick-fill"
                onClick={handleQuickFill}
                title="Fill with test demo data"
              >
                ⚡ Quick Fill Demo
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="order-checkout-form">
              {/* Field 1: fullName */}
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  <span>Customer's Full Name <span className="required-star">*</span></span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-input ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {/* Conditional Rendering: Error Message */}
                {errors.fullName && (
                  <span className="field-error-message" role="alert">
                    {errors.fullName}
                  </span>
                )}
              </div>

              {/* Contact Row: email & phone */}
              <div className="form-row-2col">
                {/* Field 2: email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <span>Email Address <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="e.g. user@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {/* Conditional Rendering: Error Message */}
                  {errors.email && (
                    <span className="field-error-message" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Field 3: phone */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    <span>Phone Number <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                    placeholder="+7 (701) 000-00-00"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {/* Conditional Rendering: Error Message */}
                  {errors.phone && (
                    <span className="field-error-message" role="alert">
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Address Row: address & city */}
              <div className="form-row-2col">
                {/* Field 4: address */}
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    <span>Delivery Address <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className={`form-input ${errors.address ? 'is-invalid' : ''}`}
                    placeholder="e.g. 45 Abay Avenue, Apt 12"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {/* Conditional Rendering: Error Message */}
                  {errors.address && (
                    <span className="field-error-message" role="alert">
                      {errors.address}
                    </span>
                  )}
                </div>

                {/* Field 5: city */}
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    <span>City <span className="required-star">*</span></span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    className={`form-input ${errors.city ? 'is-invalid' : ''}`}
                    placeholder="e.g. Almaty"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {/* Conditional Rendering: Error Message */}
                  {errors.city && (
                    <span className="field-error-message" role="alert">
                      {errors.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Field 6: paymentMethod */}
              <div className="form-group payment-method-group">
                <label className="form-label">
                  <span>Payment Method <span className="required-star">*</span></span>
                </label>
                <div className="payment-options-grid">
                  <label
                    className={`payment-option-card ${
                      formData.paymentMethod === 'card' ? 'is-active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="payment-radio"
                    />
                    <div className="payment-option-body">
                      <span className="payment-icon">💳</span>
                      <div>
                        <strong>Bank card</strong>
                        <small>Instant payment with debit or credit card</small>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`payment-option-card ${
                      formData.paymentMethod === 'cash' ? 'is-active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="payment-radio"
                    />
                    <div className="payment-option-body">
                      <span className="payment-icon">💵</span>
                      <div>
                        <strong>Cash on delivery</strong>
                        <small>Pay upon arrival / delivery</small>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Bank Card Fields (Conditional Rendering - Task 2 & 8) */}
              {formData.paymentMethod === 'card' && (
                <div className="bank-card-container">
                  <div className="bank-card-header">
                    <span className="card-shield-icon">🔒</span>
                    <h4>Secure Card Details</h4>
                  </div>

                  {/* Field 7: cardHolder */}
                  <div className="form-group">
                    <label htmlFor="cardHolder" className="form-label">
                      <span>Cardholder's Name <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      className={`form-input ${errors.cardHolder ? 'is-invalid' : ''}`}
                      placeholder="e.g. JOHN DOE"
                      value={formData.cardHolder}
                      onChange={handleChange}
                    />
                    {/* Conditional Rendering: Error Message */}
                    {errors.cardHolder && (
                      <span className="field-error-message" role="alert">
                        {errors.cardHolder}
                      </span>
                    )}
                  </div>

                  {/* Field 8: cardNumber */}
                  <div className="form-group">
                    <label htmlFor="cardNumber" className="form-label">
                      <span>Bank Card Number <span className="required-star">*</span></span>
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      className={`form-input ${errors.cardNumber ? 'is-invalid' : ''}`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      value={formData.cardNumber}
                      onChange={handleChange}
                    />
                    {/* Conditional Rendering: Error Message */}
                    {errors.cardNumber && (
                      <span className="field-error-message" role="alert">
                        {errors.cardNumber}
                      </span>
                    )}
                  </div>

                  {/* Expiry & CVV Row */}
                  <div className="form-row-2col">
                    {/* Field 9: expiryDate */}
                    <div className="form-group">
                      <label htmlFor="expiryDate" className="form-label">
                        <span>Card Expiration Date <span className="required-star">*</span></span>
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        className={`form-input ${errors.expiryDate ? 'is-invalid' : ''}`}
                        placeholder="MM/YY"
                        maxLength="5"
                        value={formData.expiryDate}
                        onChange={handleChange}
                      />
                      {/* Conditional Rendering: Error Message */}
                      {errors.expiryDate && (
                        <span className="field-error-message" role="alert">
                          {errors.expiryDate}
                        </span>
                      )}
                    </div>

                    {/* Field 10: cvv */}
                    <div className="form-group">
                      <label htmlFor="cvv" className="form-label">
                        <span>Security Code (CVV) <span className="required-star">*</span></span>
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        name="cvv"
                        className={`form-input ${errors.cvv ? 'is-invalid' : ''}`}
                        placeholder="123"
                        maxLength="4"
                        value={formData.cvv}
                        onChange={handleChange}
                      />
                      {/* Conditional Rendering: Error Message */}
                      {errors.cvv && (
                        <span className="field-error-message" role="alert">
                          {errors.cvv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Field 11: comment */}
              <div className="form-group">
                <label htmlFor="comment" className="form-label">
                  <span>Order Comments <span className="optional-tag">(Optional)</span></span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  className="form-textarea"
                  rows="3"
                  placeholder="Special requests, arrival time, or notes for the hotel..."
                  value={formData.comment}
                  onChange={handleChange}
                />
              </div>

              {/* Cart Error Alert (Conditional Rendering) */}
              {cartError && (
                <div className="cart-error-alert" role="alert">
                  ⚠️ {cartError}
                </div>
              )}

              {/* Form Control Buttons (Task 7) */}
              <div className="form-control-buttons">
                {/* 1. "Place Order" button */}
                <button
                  type="submit"
                  className="btn-primary btn-place-order"
                  title="Submit order after validation"
                >
                  Place Order
                </button>

                {/* 2. "Reset Form" button */}
                <button
                  type="button"
                  className="btn-secondary btn-reset-form"
                  onClick={handleResetForm}
                  title="Clear all entered data"
                >
                  Reset Form
                </button>

                {/* 3. "Clear Cart" button */}
                <button
                  type="button"
                  className="btn-clear-cart-action"
                  onClick={handleClearCart}
                  title="Remove all products from the shopping cart"
                >
                  Clear Cart
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Shopping Cart Live Summary */}
          <aside className="checkout-summary-sidebar">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Shopping Cart</h3>
                <span className="summary-count-badge">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {cartItems.length === 0 ? (
                <div className="summary-empty-state">
                  <span className="empty-cart-icon">🛒</span>
                  <p>No products currently in your cart.</p>
                  <button
                    type="button"
                    className="btn-primary btn-add-hotel-cta"
                    onClick={() => onNavigate('home', 'hotels')}
                  >
                    Select Hotels
                  </button>
                </div>
              ) : (
                <>
                  {selectedItems.length > 0 ? (
                    <div className="summary-items-list">
                      {selectedItems.map((item) => {
                      const rooms = item.roomsCount || 1;
                      const nights = item.nights || 1;
                      const subtotal = (item.hotel?.price || 0) * rooms * nights;

                      return (
                        <div key={item.hotel?.id} className="summary-item-row">
                          <img
                            src={item.hotel?.image}
                            alt={item.hotel?.name}
                            className="summary-item-img"
                          />
                          <div className="summary-item-info">
                            <h4 className="summary-item-title">{item.hotel?.name}</h4>
                            <span className="summary-item-location">📍 {item.hotel?.city}</span>
                            <span className="summary-item-math">
                              {rooms} rm × {nights} nt @ {(item.hotel?.price || 0).toLocaleString('ru-RU')} ₸
                            </span>
                          </div>
                          <div className="summary-item-total">
                            {subtotal.toLocaleString('ru-RU')} ₸
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  ) : (
                    <p className="summary-empty-selection">Select at least one hotel in your cart to continue.</p>
                  )}

                  <div className="summary-totals-box">
                    <div className="summary-line">
                      <span>Total rooms:</span>
                      <strong>{selectedItems.reduce((sum, item) => sum + (item.roomsCount || 1), 0)}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Delivery / Booking fee:</span>
                      <strong className="free-badge">FREE</strong>
                    </div>
                    <div className="summary-grand-line">
                      <span>Grand Total:</span>
                      <strong className="summary-total-sum">
                        {currentTotal.toLocaleString('ru-RU')} ₸
                      </strong>
                    </div>
                  </div>

                  <div className="summary-sidebar-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-full-width"
                      onClick={() => cart.openCart && cart.openCart()}
                    >
                      Open Cart Calculator 🧮
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
