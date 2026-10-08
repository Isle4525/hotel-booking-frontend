import React from 'react';
import './HotelCard.css';

export default function HotelCard({
  hotel,
  onBook,
  onViewDetails,
  onAddToCart,
  inCartCount = 0
}) {
  return (
    <article className="hotel-card">
      {/* 1. Product Image with Badges */}
      <div className="hotel-image-wrapper">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="hotel-card-image"
          loading="lazy"
        />
        {hotel.badge && (
          <span className="hotel-badge">{hotel.badge}</span>
        )}
        <span className="hotel-category-badge">{hotel.category}</span>
        {inCartCount > 0 && (
          <span className="hotel-incart-badge">
            ✓ In cart: {inCartCount} {inCartCount === 1 ? 'room' : 'rooms'}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="hotel-card-content">
        {/* Category / Location / Rating */}
        <div className="hotel-meta">
          <span className="hotel-city">📍 {hotel.city}</span>
          <div className="hotel-rating" title={`${hotel.rating} out of 5 stars`}>
            <span className="rating-star">★</span>
            <span className="rating-value">{hotel.rating}</span>
            <span className="reviews-count">({hotel.reviewsCount})</span>
          </div>
        </div>

        {/* 2. Product Name */}
        <h3 className="hotel-name">{hotel.name}</h3>

        {/* 3. Short Description */}
        <p className="hotel-description">{hotel.description}</p>

        {/* Relevant Information: Amenities / Features */}
        <div className="hotel-features">
          {hotel.features.map((feature, index) => (
            <span key={index} className="feature-pill">
              {feature}
            </span>
          ))}
        </div>

        {/* 4. Price & 5. Action Buttons */}
        <div className="hotel-card-footer">
          <div className="price-block">
            <span className="price-caption">Starting from</span>
            <div className="price-value-row">
              <span className="price-amount">{hotel.price.toLocaleString('ru-RU')} ₸</span>
              <span className="price-unit">/ night</span>
            </div>
          </div>

          <div className="card-actions">
            {onViewDetails && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onViewDetails(hotel)}
                aria-label={`View details for ${hotel.name}`}
              >
                Details
              </button>
            )}
            {onAddToCart && (
              <button
                type="button"
                className="btn-add-cart"
                onClick={() => onAddToCart(hotel)}
                aria-label={`Add room at ${hotel.name} to cart`}
              >
                + Add Room
              </button>
            )}
            <button
              type="button"
              className="btn-book"
              onClick={() => onBook(hotel)}
              aria-label={`Book ${hotel.name}`}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}