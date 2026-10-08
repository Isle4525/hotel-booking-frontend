import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Footer from './components/Footer';
import HotelList from './components/HotelList';
import BookingCart from './components/BookingCart';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (hotel) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.hotel.id === hotel.id);
      if (existing) {
        showToast(`Added another room for "${hotel.name}" (Total: ${existing.roomsCount + 1})`);
        return prevItems.map((item) =>
          item.hotel.id === hotel.id
            ? { ...item, roomsCount: item.roomsCount + 1 }
            : item
        );
      } else {
        showToast(`Added 1 room at "${hotel.name}" to your cart`);
        return [
          ...prevItems,
          {
            hotel,
            roomsCount: 1,
            nights: 1,
            guests: 2,
            addOns: { breakfast: false, spa: false, transfer: false }
          }
        ];
      }
    });
  };

  const handleBookHotel = (hotel) => {
    // Add room if not present, then open cart calculator
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.hotel.id === hotel.id);
      if (existing) {
        return prevItems;
      }
      return [
        ...prevItems,
        {
          hotel,
          roomsCount: 1,
          nights: 1,
          guests: 2,
          addOns: { breakfast: false, spa: false, transfer: false }
        }
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateItem = (hotelId, updates) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.hotel.id === hotelId ? { ...item, ...updates } : item
      )
    );
  };

  const handleRemoveItem = (hotelId) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.hotel.id === hotelId);
      if (removedItem) {
        showToast(`Removed "${removedItem.hotel.name}" from cart`);
      }
      return prevItems.filter((item) => item.hotel.id !== hotelId);
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('All items cleared from cart');
  };

  const totalRooms = cartItems.reduce((acc, item) => acc + item.roomsCount, 0);

  const totalEstimatedPrice = cartItems.reduce((acc, item) => {
    const roomCost = item.hotel.price * item.roomsCount * item.nights;
    const b = item.addOns?.breakfast ? 3500 * item.roomsCount * item.nights : 0;
    const s = item.addOns?.spa ? 5000 * item.roomsCount : 0;
    const t = item.addOns?.transfer ? 7000 : 0;
    return acc + roomCost + b + s + t;
  }, 0);

  return (
    <div className="App">
      <Header
        cartCount={totalRooms}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        <Hero />
        <HotelList
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
          onBookHotel={handleBookHotel}
        />
        <Services />
      </main>

      <Footer />

      {/* Floating Quick-Access Cart Bar */}
      {totalRooms > 0 && !isCartOpen && (
        <div
          className="floating-cart-bar"
          onClick={() => setIsCartOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Open booking cart"
        >
          <div className="floating-cart-info">
            <span className="floating-cart-icon">🛒</span>
            <div className="floating-cart-text">
              <strong>{totalRooms} {totalRooms === 1 ? 'room' : 'rooms'} in Cart</strong>
              <span className="floating-cart-sub">
                ~{totalEstimatedPrice.toLocaleString('ru-RU')} ₸ • Multi-room calculator
              </span>
            </div>
          </div>
          <button type="button" className="floating-cart-btn">
            View & Calculate →
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="app-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Booking Cart & Price Calculator Drawer / Modal */}
      <BookingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

export default App;
