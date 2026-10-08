import React from 'react';
import './Header.css';

export default function Header({ cartCount = 0, onOpenCart }) {
  const scrollToHotels = () => {
    const el = document.getElementById('hotels');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <a href="#hero" className="logo">
          🏨 Booker
        </a>
        <nav className="nav">
          <a href="#hero">Main</a>
          <a href="#hotels">Hotels</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="btn-cart-header"
            onClick={onOpenCart}
            aria-label="Open booking cart"
          >
            <span className="cart-header-icon">🛒</span>
            <span className="cart-header-text">Cart</span>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </button>
          <button
            type="button"
            className="btn-primary header-cta"
            onClick={scrollToHotels}
          >
            View Catalog
          </button>
        </div>
      </div>
    </header>
  );
}