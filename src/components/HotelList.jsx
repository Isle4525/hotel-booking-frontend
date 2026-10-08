import React, { useState } from 'react';
import HotelCard from './HotelCard';
import { hotelsData } from '../data/hotels';
import './HotelList.css';

export default function HotelList({ onAddToCart, onBookHotel, cartItems = [] }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingModalHotel, setBookingModalHotel] = useState(null);
  const [detailsModalHotel, setDetailsModalHotel] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const getInCartCount = (hotelId) => {
    const item = cartItems.find((it) => it.hotel.id === hotelId);
    return item ? item.roomsCount : 0;
  };

  const categories = ['All', ...new Set(hotelsData.map((h) => h.category))];

  const filteredHotels = activeCategory === 'All'
    ? hotelsData
    : hotelsData.filter((h) => h.category === activeCategory);

  const handleCategoryClick = (cat) => {
    if (activeCategory === cat && cat !== 'All') {
      setActiveCategory('All');
    } else {
      setActiveCategory(cat);
    }
  };

  const handleBook = (hotel) => {
    setBookingSuccess(false);
    setBookingModalHotel(hotel);
  };

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingModalHotel(null);
      setBookingSuccess(false);
    }, 2200);
  };

  const handleViewDetails = (hotel) => {
    setDetailsModalHotel(hotel);
  };

  return (
    <section className="section hotel-section" id="hotels">
      <div className="section-header">
        <span className="section-badge">Exclusive Selection</span>
        <h2 className="section-title">Explore Our Hotel Catalog</h2>
        <p className="section-subtitle">
          Handpicked luxury accommodations, mountain resorts, and boutique stays tailored for your journey.
        </p>
      </div>

      {/* Category Filter Buttons */}
      <div className="catalog-toolbar">
        <div className="category-filter-list" role="group" aria-label="Category filter">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-stats">
        <span>
          Showing <strong>{filteredHotels.length}</strong> {filteredHotels.length === 1 ? 'hotel' : 'hotels'}
          {activeCategory !== 'All' && (
            <span> in <strong>{activeCategory}</strong></span>
          )}
        </span>
        {activeCategory !== 'All' && (
          <button
            type="button"
            className="clear-filter-btn"
            onClick={() => setActiveCategory('All')}
          >
            Show all ({hotelsData.length})
          </button>
        )}
      </div>

      {/* Filtered Product Cards */}
      {filteredHotels.length > 0 ? (
        <div className="hotel-grid">
          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onBook={onBookHotel || handleBook}
              onAddToCart={onAddToCart}
              inCartCount={getInCartCount(hotel.id)}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="no-hotels-found">
          <p>No hotels found in this category.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setActiveCategory('All')}
          >
            Show all hotels
          </button>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {bookingModalHotel && (
        <div className="modal-backdrop" onClick={() => setBookingModalHotel(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setBookingModalHotel(null)}
            >
              ×
            </button>
            {bookingSuccess ? (
              <div className="modal-success">
                <div className="success-icon">✓</div>
                <h3>Booking Confirmed!</h3>
                <p>
                  Your reservation at <strong>{bookingModalHotel.name}</strong> has been successfully placed. Check your email for booking voucher details.
                </p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <span className="modal-tag">{bookingModalHotel.category}</span>
                  <h3>Book Your Stay</h3>
                </div>
                <div className="modal-body">
                  <img
                    src={bookingModalHotel.image}
                    alt={bookingModalHotel.name}
                    className="modal-image"
                  />
                  <h4>{bookingModalHotel.name}</h4>
                  <p className="modal-location">📍 {bookingModalHotel.city}</p>
                  <div className="modal-price-row">
                    <span>Rate per night:</span>
                    <strong>{bookingModalHotel.price.toLocaleString('ru-RU')} ₸</strong>
                  </div>
                  <div className="modal-features">
                    {bookingModalHotel.features.map((f, i) => (
                      <span key={i} className="feature-pill">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setBookingModalHotel(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-book"
                    onClick={handleConfirmBooking}
                  >
                    Confirm & Reserve
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalHotel && (
        <div className="modal-backdrop" onClick={() => setDetailsModalHotel(null)}>
          <div className="modal-card details-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setDetailsModalHotel(null)}
            >
              ×
            </button>
            <div className="modal-header">
              <span className="modal-tag">{detailsModalHotel.category}</span>
              <h3>{detailsModalHotel.name}</h3>
              <p className="modal-location">📍 {detailsModalHotel.city} • ★ {detailsModalHotel.rating} ({detailsModalHotel.reviewsCount} reviews)</p>
            </div>
            <div className="modal-body">
              <img
                src={detailsModalHotel.image}
                alt={detailsModalHotel.name}
                className="modal-image"
              />
              <div className="details-description">
                <h5>About the Property</h5>
                <p>{detailsModalHotel.description}</p>
              </div>
              <div className="details-amenities">
                <h5>Included Amenities</h5>
                <div className="modal-features">
                  {detailsModalHotel.features.map((f, i) => (
                    <span key={i} className="feature-pill">✓ {f}</span>
                  ))}
                </div>
              </div>
              <div className="modal-price-row highlight">
                <span>Total per night:</span>
                <strong>{detailsModalHotel.price.toLocaleString('ru-RU')} ₸</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDetailsModalHotel(null)}
              >
                Close
              </button>
              {onAddToCart && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    onAddToCart(detailsModalHotel);
                  }}
                >
                  + Add Room to Cart
                </button>
              )}
              <button
                type="button"
                className="btn-book"
                onClick={() => {
                  const hotel = detailsModalHotel;
                  setDetailsModalHotel(null);
                  if (onBookHotel) {
                    onBookHotel(hotel);
                  } else {
                    handleBook(hotel);
                  }
                }}
              >
                Book with Calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}