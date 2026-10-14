import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import { useAuth, useCart, useNavigation, useTheme } from '../context';

export default function Header(props) {
  const auth = useAuth();
  const cart = useCart();
  const nav = useNavigation();
  const { isDark, toggleTheme } = useTheme();

  const currentUser = props.currentUser !== undefined ? props.currentUser : auth.currentUser;
  const onLogout = props.onLogout || auth.logout;
  const cartCount = props.cartCount !== undefined ? props.cartCount : cart.cartCount;
  const onOpenCart = props.onOpenCart || cart.openCart;
  const currentPage = props.currentPage || nav.currentPage;
  const onNavigate = props.onNavigate || nav.navigate;

  // 3. События и Cleanup — resize + очистка обработчика
  const [, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleNavClick = (targetId) => {
    onNavigate('home', targetId);
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    onNavigate('home');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Logo */}
        <a href="#hero" className="logo" onClick={handleLogoClick}>
          🏨 Booker
        </a>

        {/* Navigation Links */}
        <nav className="nav">
          <a
            href="#hero"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
          >
            Main
          </a>
          <a
            href="#hotels"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hotels');
            }}
          >
            Hotels
          </a>
          <a
            href="#services"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('services');
            }}
          >
            Services
          </a>
          <a
            href="#contact"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('contact');
            }}
          >
            Contact
          </a>
        </nav>

        {/* Actions Block: Cart & Auth */}
        <div className="header-actions">
          {/* Cart Button with Counter Badge */}
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

          {/* Theme Switcher Button (4. Смена темы сайта — useEffect) */}
          <button
            type="button"
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle dark and light theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* User Profile or Guest Auth Buttons */}
          {currentUser ? (
            <div className="user-nav-block">
              <div
                className="user-profile-badge"
                title={`Logged in as ${currentUser.name} (${currentUser.email})`}
              >
                <span className="user-avatar-icon">👤</span>
                <span className="user-name">{currentUser.name}</span>
              </div>
              <button
                type="button"
                className="btn-logout"
                onClick={onLogout}
                aria-label="Log out from demo account"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="auth-nav-buttons">
              <button
                type="button"
                className={`btn-nav-auth ${currentPage === 'login' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('login')}
              >
                Log In
              </button>
              <button
                type="button"
                className={`btn-primary btn-nav-register ${currentPage === 'register' ? 'active' : ''}`}
                onClick={() => onNavigate && onNavigate('register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}