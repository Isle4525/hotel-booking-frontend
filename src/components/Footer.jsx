import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">🏨 Booker</div>
          <p className="footer-tagline">
            Your trusted travel companion for booking premier hotels, mountain resorts, and boutique stays.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul className="footer-links">
            <li><a href="#hero">Main</a></li>
            <li><a href="#hotels">Hotels</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Popular Cities</h4>
          <ul className="footer-links">
            <li><a href="#hotels">Алматы</a></li>
            <li><a href="#hotels">Астана</a></li>
            <li><a href="#hotels">Актау</a></li>
            <li><a href="#hotels">Бурабай (Боровое)</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact & Support</h4>
          <p>📞 +7 number</p>
          <p>✉️ info@booker.kz</p>
          <p>📍 Almaty, Kazakhstan</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Booker Hotel Reservation Platform.</p>
      </div>
    </footer>
  );
}