import React, { useState, useEffect } from 'react';
import '../styles/BookingCart.css';
import { useAuth, useCart, useNavigation } from '../context';

export default function BookingCart(props) {
  const auth = useAuth();
  const cart = useCart();
  const nav = useNavigation();

  const isOpen = props.isOpen !== undefined ? props.isOpen : cart.cartOpen;
  const onClose = props.onClose || cart.closeCart;
  const cartItems = props.cartItems || cart.cartItems;
  const onUpdateItem = props.onUpdateItem || cart.updateCartItem;
  const onRemoveItem = props.onRemoveItem || cart.removeCartItem;
  const onClearCart = props.onClearCart || cart.clearCart;
  const currentUser = props.currentUser !== undefined ? props.currentUser : auth.currentUser;
  const onNavigateToAuth = props.onNavigateToAuth || nav.navigate;

  const [isSuccess, setIsSuccess] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);

  // 3. События и Cleanup — Escape + очистка обработчика
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Toggle item selection for calculation
  const handleToggleSelect = (hotelId, currentSelected) => {
    onUpdateItem(hotelId, { selected: currentSelected === false });
  };

  // Rooms count stepper
  const handleRoomsChange = (hotelId, currentRooms, delta) => {
    const next = Math.max(1, Math.min(20, (currentRooms || 1) + delta));
    onUpdateItem(hotelId, { roomsCount: next });
  };

  // Nights count stepper
  const handleNightsChange = (hotelId, currentNights, delta) => {
    const next = Math.max(1, Math.min(30, (currentNights || 1) + delta));
    onUpdateItem(hotelId, { nights: next });
  };

  // Select all / deselect all
  const allSelected = cartItems.length > 0 && cartItems.every((it) => it.selected !== false);
  const handleToggleAll = () => {
    const nextState = !allSelected;
    cartItems.forEach((it) => {
      onUpdateItem(it.hotel.id, { selected: nextState });
    });
  };

  // Active items for calculation
  const activeItems = cartItems.filter((it) => it.selected !== false);
  const totalRooms = activeItems.reduce((sum, it) => sum + (it.roomsCount || 1), 0);
  const totalPrice = activeItems.reduce(
    (sum, it) => sum + it.hotel.price * (it.roomsCount || 1) * (it.nights || 1),
    0
  );

  const handleBook = () => {
    if (activeItems.length === 0) return;

    // Require demo user to log in before proceeding to checkout
    if (!currentUser) {
      setLoginRequired(true);
      return;
    }

    setLoginRequired(false);
    setIsSuccess(true);
  };

  const handleResetSuccess = () => {
    setIsSuccess(false);
    onClearCart();
    onClose();
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <span className="cart-icon">🧮</span>
            <div>
              <h3>Booking Calculator</h3>
              <p className="cart-subtitle">
                {cartItems.length > 0
                  ? `Selected: ${activeItems.length} of ${cartItems.length} hotels`
                  : 'Hotel list is empty'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="cart-success-view">
            <div className="success-badge-icon">✓</div>
            <h3>Reservation Confirmed!</h3>
            <p className="success-note">
              Thank you, <strong>{currentUser?.name || 'Guest'}</strong>! You have successfully booked{' '}
              <strong>{totalRooms}</strong> {totalRooms === 1 ? 'room' : 'rooms'} for a total of{' '}
              <strong>{totalPrice.toLocaleString('ru-RU')} ₸</strong>. Confirmation voucher details have been sent to{' '}
              <strong>{currentUser?.email}</strong>.
            </p>
            <button
              type="button"
              className="btn-primary cart-done-btn"
              onClick={handleResetSuccess}
            >
              Done
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <div className="empty-cart-illustration">🏨</div>
            <h4>Your List is Empty</h4>
            <p>
              Add hotels from our catalog using the <strong>«+ Add Room»</strong> button to calculate total stay prices and book.
            </p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Explore Hotels
            </button>
          </div>
        ) : (
          <div className="cart-body">
            {/* Toolbar: Toggle all & Clear */}
            <div className="cart-toolbar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleToggleAll}
                />
                <span>Select all ({cartItems.length})</span>
              </label>
              <button
                type="button"
                className="btn-clear-cart"
                onClick={onClearCart}
              >
                Clear all
              </button>
            </div>

            {/* List of items */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const isSelected = item.selected !== false;
                const rooms = item.roomsCount || 1;
                const nights = item.nights || 1;
                const itemTotal = item.hotel.price * rooms * nights;

                return (
                  <div
                    key={item.hotel.id}
                    className={`cart-item-card ${isSelected ? 'is-selected' : 'is-muted'}`}
                  >
                    {/* Top Row: checkbox, thumbnail, info, delete */}
                    <div className="cart-item-header">
                      <input
                        type="checkbox"
                        className="item-select-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.hotel.id, isSelected)}
                        title="Include in calculation"
                      />
                      <img
                        src={item.hotel.image}
                        alt={item.hotel.name}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-meta">
                        <h4 className="cart-item-title">{item.hotel.name}</h4>
                        <span className="cart-item-city">📍 {item.hotel.city}</span>
                        <div className="cart-item-base-price">
                          <strong>{item.hotel.price.toLocaleString('ru-RU')} ₸</strong> / night
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-item-btn"
                        title="Remove"
                        onClick={() => onRemoveItem(item.hotel.id)}
                      >
                        ×
                      </button>
                    </div>

                    {/* Steppers */}
                    <div className="cart-calculator-grid">
                      <div className="calc-control-group">
                        <span className="calc-label">Rooms:</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={rooms <= 1}
                            onClick={() => handleRoomsChange(item.hotel.id, rooms, -1)}
                          >
                            –
                          </button>
                          <span className="stepper-value">{rooms}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={rooms >= 20}
                            onClick={() => handleRoomsChange(item.hotel.id, rooms, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="calc-control-group">
                        <span className="calc-label">Nights:</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={nights <= 1}
                            onClick={() => handleNightsChange(item.hotel.id, nights, -1)}
                          >
                            –
                          </button>
                          <span className="stepper-value">{nights}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={nights >= 30}
                            onClick={() => handleNightsChange(item.hotel.id, nights, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="calc-control-group calc-item-sum">
                        <span className="calc-label">Subtotal:</span>
                        <strong className="item-calculated-price">
                          {itemTotal.toLocaleString('ru-RU')} ₸
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="cart-summary-calculator">
              <div className="calc-summary-row">
                <span>Selected hotels:</span>
                <strong>{activeItems.length} of {cartItems.length}</strong>
              </div>
              <div className="calc-summary-row">
                <span>Total rooms:</span>
                <strong>{totalRooms}</strong>
              </div>
              <div className="calc-grand-total-row">
                <div className="grand-total-label">
                  <span>Grand Total:</span>
                  <small>Auto-calculated in real time</small>
                </div>
                <div className="grand-total-value">
                  {totalPrice.toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </div>

            {/* Login Required Notice for Demo Checkout */}
            {loginRequired && !currentUser && (
              <div className="cart-login-required-alert" role="alert">
                <span className="login-alert-icon">🔒</span>
                <div className="login-alert-content">
                  <h4>Authentication Required</h4>
                  <p>
                    Please log in or register a demo account before confirming your reservation.
                  </p>
                  <div className="login-alert-buttons">
                    <button
                      type="button"
                      className="btn-primary btn-alert-login"
                      onClick={() => {
                        onClose();
                        if (onNavigateToAuth) onNavigateToAuth('login');
                      }}
                    >
                      Log In →
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-alert-reg"
                      onClick={() => {
                        onClose();
                        if (onNavigateToAuth) onNavigateToAuth('register');
                      }}
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Book Button */}
            <div className="cart-footer-actions">
              <button
                type="button"
                className="btn-primary cart-checkout-btn"
                disabled={activeItems.length === 0}
                onClick={handleBook}
              >
                {activeItems.length === 0
                  ? 'Select hotels to calculate'
                  : !currentUser
                  ? `Log In & Book (${totalPrice.toLocaleString('ru-RU')} ₸)`
                  : `Confirm Reservation (${totalPrice.toLocaleString('ru-RU')} ₸)`}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
