import React, { useState } from 'react';
import '../styles/BookingCart.css';

export default function BookingCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateItem,
  onRemoveItem,
  onClearCart
}) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  // Checkout form state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('arrival'); // arrival | card | kaspi
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  if (!isOpen) return null;

  // Real-time calculation per item
  const calculateItemTotals = (item) => {
    const baseRoomCost = item.hotel.price * item.roomsCount * item.nights;
    const breakfastCost = item.addOns?.breakfast
      ? 3500 * item.roomsCount * item.nights
      : 0;
    const spaCost = item.addOns?.spa ? 5000 * item.roomsCount : 0;
    const transferCost = item.addOns?.transfer ? 7000 : 0;

    const extrasTotal = breakfastCost + spaCost + transferCost;
    const itemTotal = baseRoomCost + extrasTotal;

    return {
      baseRoomCost,
      breakfastCost,
      spaCost,
      transferCost,
      extrasTotal,
      itemTotal
    };
  };

  // Overall calculations across all items
  const totalRooms = cartItems.reduce((acc, item) => acc + item.roomsCount, 0);
  const totalBaseCost = cartItems.reduce(
    (acc, item) => acc + calculateItemTotals(item).baseRoomCost,
    0
  );
  const totalExtrasCost = cartItems.reduce(
    (acc, item) => acc + calculateItemTotals(item).extrasTotal,
    0
  );

  // Multi-room volume discount calculation
  let autoDiscountPercent = 0;
  if (totalRooms >= 4) {
    autoDiscountPercent = 10;
  } else if (totalRooms >= 2) {
    autoDiscountPercent = 5;
  }

  // Promo code discount
  let promoDiscountPercent = 0;
  if (appliedPromo) {
    promoDiscountPercent = appliedPromo.percent;
  }

  // Combined discount percent (take max or combined, max is standard)
  const effectiveDiscountPercent = Math.max(autoDiscountPercent, promoDiscountPercent);
  const discountAmount = Math.round((totalBaseCost * effectiveDiscountPercent) / 100);
  const grandTotal = Math.max(0, totalBaseCost - discountAmount + totalExtrasCost);

  // Handle promo code application
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError('Please enter a code');
      return;
    }

    if (code === 'HOTEL10' || code === 'BOOK10' || code === 'WELCOME10') {
      setAppliedPromo({ code, percent: 10, label: '10% Welcome Discount' });
      setPromoError('');
    } else if (code === 'LUXURY15' || code === 'PROMO15') {
      setAppliedPromo({ code, percent: 15, label: '15% Special Discount' });
      setPromoError('');
    } else if (code === 'KAZAKHSTAN5' || code === 'SPRING5') {
      setAppliedPromo({ code, percent: 5, label: '5% Travel Discount' });
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "WELCOME10" or "PROMO15"');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  // Handle room quantity changes
  const handleRoomsChange = (hotelId, currentCount, delta) => {
    const newCount = Math.max(1, Math.min(10, currentCount + delta));
    onUpdateItem(hotelId, { roomsCount: newCount });
  };

  // Handle nights count changes
  const handleNightsChange = (hotelId, currentNights, delta) => {
    const newNights = Math.max(1, Math.min(30, currentNights + delta));
    onUpdateItem(hotelId, { nights: newNights });
  };

  // Handle guests count changes
  const handleGuestsChange = (hotelId, currentGuests, delta) => {
    const newGuests = Math.max(1, Math.min(6, currentGuests + delta));
    onUpdateItem(hotelId, { guests: newGuests });
  };

  // Handle extra services toggling
  const handleToggleAddOn = (hotelId, currentAddOns, addOnKey) => {
    onUpdateItem(hotelId, {
      addOns: {
        ...currentAddOns,
        [addOnKey]: !currentAddOns?.[addOnKey]
      }
    });
  };

  // Handle final reservation submission
  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert('Please fill in your name and phone number to confirm reservation.');
      return;
    }

    const reservationNumber = 'BK-' + Math.floor(100000 + Math.random() * 900000);
    const confirmedData = {
      reservationNumber,
      date: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      guestName,
      guestPhone,
      guestEmail,
      paymentMethod,
      totalRooms,
      items: cartItems.map((item) => ({
        hotelName: item.hotel.name,
        city: item.hotel.city,
        roomsCount: item.roomsCount,
        nights: item.nights,
        guests: item.guests,
        pricePerNight: item.hotel.price,
        itemTotal: calculateItemTotals(item).itemTotal
      })),
      grandTotal
    };

    setBookingConfirmed(confirmedData);
    onClearCart();
  };

  const handleFinish = () => {
    setBookingConfirmed(null);
    setIsCheckingOut(false);
    onClose();
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Cart Drawer Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <span className="cart-icon">🛒</span>
            <div>
              <h3>Booking Cart & Calculator</h3>
              <p className="cart-subtitle">
                {totalRooms > 0
                  ? `${totalRooms} ${totalRooms === 1 ? 'room' : 'rooms'} across ${cartItems.length} ${cartItems.length === 1 ? 'hotel' : 'hotels'}`
                  : 'Your booking cart is empty'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="Close booking cart"
          >
            ×
          </button>
        </div>

        {/* Confirmation Screen */}
        {bookingConfirmed ? (
          <div className="cart-success-view">
            <div className="success-badge-icon">✓</div>
            <h3>Reservation Confirmed!</h3>
            <p className="success-reference">
              Booking Ref: <strong>#{bookingConfirmed.reservationNumber}</strong>
            </p>
            <p className="success-note">
              Thank you, <strong>{bookingConfirmed.guestName}</strong>! Confirmation voucher sent to{' '}
              <strong>{bookingConfirmed.guestEmail || bookingConfirmed.guestPhone}</strong>.
            </p>

            <div className="voucher-summary">
              <h4>Reserved Accommodations:</h4>
              <ul className="voucher-list">
                {bookingConfirmed.items.map((it, idx) => (
                  <li key={idx} className="voucher-item">
                    <div className="voucher-item-details">
                      <strong>{it.hotelName}</strong> ({it.city})
                      <span>
                        {it.roomsCount} {it.roomsCount === 1 ? 'room' : 'rooms'} × {it.nights} {it.nights === 1 ? 'night' : 'nights'} • {it.guests} guests/room
                      </span>
                    </div>
                    <span className="voucher-item-price">
                      {it.itemTotal.toLocaleString('ru-RU')} ₸
                    </span>
                  </li>
                ))}
              </ul>

              <div className="voucher-total-row">
                <span>Total Amount Paid / Due:</span>
                <strong>{bookingConfirmed.grandTotal.toLocaleString('ru-RU')} ₸</strong>
              </div>
              <div className="voucher-payment-method">
                Payment: {bookingConfirmed.paymentMethod === 'arrival' ? '💵 Pay at check-in' : bookingConfirmed.paymentMethod === 'card' ? '💳 Bank Card' : '📱 Kaspi QR'}
              </div>
            </div>

            <button type="button" className="btn-primary cart-done-btn" onClick={handleFinish}>
              Return to Catalog
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart View */
          <div className="cart-empty-state">
            <div className="empty-cart-illustration">🏨</div>
            <h4>Your Cart is Empty</h4>
            <p>
              Select hotels from our catalog to book multiple rooms and calculate total prices with instant discounts.
            </p>
            <button type="button" className="btn-primary" onClick={onClose}>
              Browse Hotels
            </button>
          </div>
        ) : (
          /* Cart Content: Items + Calculator + Checkout */
          <div className="cart-body">
            {/* Top Toolbar: Clear all */}
            <div className="cart-toolbar">
              <span className="toolbar-info">
                Live Auto-Calculator is active
              </span>
              <button
                type="button"
                className="btn-clear-cart"
                onClick={onClearCart}
              >
                Clear all
              </button>
            </div>

            {/* List of Cart Items */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const totals = calculateItemTotals(item);

                return (
                  <div key={item.hotel.id} className="cart-item-card">
                    {/* Item Top row: Image & Hotel Header */}
                    <div className="cart-item-header">
                      <img
                        src={item.hotel.image}
                        alt={item.hotel.name}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-meta">
                        <span className="cart-item-category">
                          {item.hotel.category}
                        </span>
                        <h4 className="cart-item-title">{item.hotel.name}</h4>
                        <span className="cart-item-city">📍 {item.hotel.city}</span>
                        <div className="cart-item-base-price">
                          <strong>{item.hotel.price.toLocaleString('ru-RU')} ₸</strong> / room / night
                        </div>
                      </div>
                      <button
                        type="button"
                        className="cart-remove-item-btn"
                        title="Remove from cart"
                        onClick={() => onRemoveItem(item.hotel.id)}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Calculator Controls: Steppers */}
                    <div className="cart-calculator-grid">
                      {/* 1. Rooms Stepper */}
                      <div className="calc-control-group">
                        <span className="calc-label">Rooms:</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.roomsCount <= 1}
                            onClick={() => handleRoomsChange(item.hotel.id, item.roomsCount, -1)}
                          >
                            –
                          </button>
                          <span className="stepper-value">{item.roomsCount}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.roomsCount >= 10}
                            onClick={() => handleRoomsChange(item.hotel.id, item.roomsCount, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 2. Nights Stepper */}
                      <div className="calc-control-group">
                        <span className="calc-label">Nights:</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.nights <= 1}
                            onClick={() => handleNightsChange(item.hotel.id, item.nights, -1)}
                          >
                            –
                          </button>
                          <span className="stepper-value">{item.nights}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.nights >= 30}
                            onClick={() => handleNightsChange(item.hotel.id, item.nights, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 3. Guests Stepper */}
                      <div className="calc-control-group">
                        <span className="calc-label">Guests/room:</span>
                        <div className="stepper-box">
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.guests <= 1}
                            onClick={() => handleGuestsChange(item.hotel.id, item.guests, -1)}
                          >
                            –
                          </button>
                          <span className="stepper-value">{item.guests}</span>
                          <button
                            type="button"
                            className="stepper-btn"
                            disabled={item.guests >= 6}
                            onClick={() => handleGuestsChange(item.hotel.id, item.guests, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Optional Add-on Services */}
                    <div className="cart-addons-section">
                      <span className="addons-title">Additional Options & Services:</span>
                      <div className="addons-grid">
                        <label className="addon-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(item.addOns?.breakfast)}
                            onChange={() => handleToggleAddOn(item.hotel.id, item.addOns, 'breakfast')}
                          />
                          <span>
                            ☕ Breakfast buffet (+3,500 ₸ / room / night)
                          </span>
                        </label>

                        <label className="addon-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(item.addOns?.spa)}
                            onChange={() => handleToggleAddOn(item.hotel.id, item.addOns, 'spa')}
                          />
                          <span>
                            🧖 Spa & Wellness pass (+5,000 ₸ / room)
                          </span>
                        </label>

                        <label className="addon-checkbox-label">
                          <input
                            type="checkbox"
                            checked={Boolean(item.addOns?.transfer)}
                            onChange={() => handleToggleAddOn(item.hotel.id, item.addOns, 'transfer')}
                          />
                          <span>
                            🚗 Airport VIP transfer (+7,000 ₸ one-time)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Real-time Subtotal row for this hotel */}
                    <div className="cart-item-subtotal-row">
                      <div className="subtotal-formula">
                        {item.roomsCount} {item.roomsCount === 1 ? 'room' : 'rooms'} × {item.nights} {item.nights === 1 ? 'night' : 'nights'}
                        {totals.extrasTotal > 0 && ` + extras (${totals.extrasTotal.toLocaleString('ru-RU')} ₸)`}
                      </div>
                      <div className="subtotal-amount">
                        <span>Hotel Subtotal:</span>
                        <strong>{totals.itemTotal.toLocaleString('ru-RU')} ₸</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Promo Code & Discounts Block */}
            <div className="cart-discount-card">
              {/* Auto Multi-Room Discount banner */}
              {autoDiscountPercent > 0 ? (
                <div className="discount-alert success">
                  🎉 Multi-Room Discount applied: <strong>{autoDiscountPercent}% OFF</strong> accommodation for booking {totalRooms} rooms!
                </div>
              ) : (
                <div className="discount-alert info">
                  💡 Tip: Book 2 or more rooms to automatically unlock a <strong>5% discount</strong> (or 4+ rooms for <strong>10%</strong>)!
                </div>
              )}

              {/* Promo input */}
              <div className="promo-input-group">
                {appliedPromo ? (
                  <div className="applied-promo-tag">
                    <span>Applied code: <strong>{appliedPromo.code}</strong> ({appliedPromo.label})</span>
                    <button type="button" onClick={handleRemovePromo} className="remove-promo-btn">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="promo-form">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="submit" className="btn-apply-promo">
                      Apply
                    </button>
                  </form>
                )}
                {promoError && <p className="promo-error-msg">{promoError}</p>}
              </div>
            </div>

            {/* Total Price Summary Calculator Box */}
            <div className="cart-summary-calculator">
              <h4>Total Price Breakdown</h4>
              <div className="calc-summary-row">
                <span>Rooms Accommodation ({totalRooms} rooms):</span>
                <strong>{totalBaseCost.toLocaleString('ru-RU')} ₸</strong>
              </div>

              {totalExtrasCost > 0 && (
                <div className="calc-summary-row">
                  <span>Additional Services & Amenities:</span>
                  <strong>+{totalExtrasCost.toLocaleString('ru-RU')} ₸</strong>
                </div>
              )}

              {effectiveDiscountPercent > 0 && (
                <div className="calc-summary-row discount-row">
                  <span>Discount ({effectiveDiscountPercent}%):</span>
                  <strong>-{discountAmount.toLocaleString('ru-RU')} ₸</strong>
                </div>
              )}

              <div className="calc-summary-row">
                <span>Taxes & Service fees:</span>
                <span className="text-free">Included (0 ₸)</span>
              </div>

              <div className="calc-grand-total-row">
                <div className="grand-total-label">
                  <span>Grand Total:</span>
                  <small>Auto-calculated in real time</small>
                </div>
                <div className="grand-total-value">
                  {grandTotal.toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </div>

            {/* Checkout Form or Proceed Button */}
            {!isCheckingOut ? (
              <div className="cart-footer-actions">
                <button
                  type="button"
                  className="btn-primary cart-checkout-btn"
                  onClick={() => setIsCheckingOut(true)}
                >
                  Proceed to Booking ({totalRooms} {totalRooms === 1 ? 'room' : 'rooms'}) • {grandTotal.toLocaleString('ru-RU')} ₸
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="checkout-form-container">
                <div className="checkout-form-header">
                  <h4>Guest & Payment Details</h4>
                  <button
                    type="button"
                    className="btn-back-to-cart"
                    onClick={() => setIsCheckingOut(false)}
                  >
                    ← Back to items
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aslan Kairatov"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+7 (701) 123-45-67"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="for confirmation voucher, e.g. aslan@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-options">
                    <label className={`payment-pill ${paymentMethod === 'arrival' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="arrival"
                        checked={paymentMethod === 'arrival'}
                        onChange={() => setPaymentMethod('arrival')}
                      />
                      <span>💵 Pay at Check-in</span>
                    </label>
                    <label className={`payment-pill ${paymentMethod === 'card' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <span>💳 Bank Card Online</span>
                    </label>
                    <label className={`payment-pill ${paymentMethod === 'kaspi' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="kaspi"
                        checked={paymentMethod === 'kaspi'}
                        onChange={() => setPaymentMethod('kaspi')}
                      />
                      <span>📱 Kaspi QR</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Quiet room, high floor, early check-in, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-primary cart-confirm-btn">
                  Confirm & Book All {totalRooms} Rooms ({grandTotal.toLocaleString('ru-RU')} ₸)
                </button>
              </form>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
