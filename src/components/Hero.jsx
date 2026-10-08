import React, { useState } from 'react';
import '../styles/Hero.css';

export default function Hero() {
  const [destination, setDestination] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const hotelCatalog = document.getElementById('hotels');
    if (hotelCatalog) {
      hotelCatalog.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-content">
        <span className="hero-badge">✨ Best Hotel Deals in Kazakhstan & Beyond</span>
        <h1 className="hero-title">Find Your Perfect Stay</h1>
        <p className="hero-subtitle">
          Discover top-rated hotels, mountain hideaways, and seaside resorts at unbeatable rates
        </p>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-group">
            <span className="input-icon">📍</span>
            <input
              type="text"
              placeholder="Where are you going? (e.g. Almaty, Astana)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="search-input-group">
            <span className="input-icon">📅</span>
            <input type="date" aria-label="Check-in date" />
          </div>
          <div className="search-input-group">
            <span className="input-icon">📅</span>
            <input type="date" aria-label="Check-out date" />
          </div>
          <button type="submit" className="btn-primary search-submit-btn">
            Explore Deals
          </button>
        </form>
      </div>
    </section>
  );
}