import React from 'react';
import '../styles/Services.css';

export default function Services() {
  const services = [
    {
      title: "Best Price Guarantee",
      desc: "Found the same room cheaper elsewhere? We'll match the price and refund the difference.",
      icon: "💰"
    },
    {
      title: "24/7 Concierge Support",
      desc: "Our multilingual customer care team is available around the clock to assist you.",
      icon: "🎧"
    },
    {
      title: "Instant Confirmation",
      desc: "Receive booking vouchers instantly with seamless, secure payment processing.",
      icon: "⚡"
    },
    {
      title: "Free Cancellation",
      desc: "Flexible booking policies allowing you to cancel or re-book with zero hassle.",
      icon: "🛡️"
    }
  ];

  return (
    <section className="section services-section" id="services">
      <div className="section-header">
        <span className="section-badge">Why Choose Us</span>
        <h2 className="section-title">Premium Travel Experience</h2>
        <p className="section-subtitle">
          We provide seamless booking, trusted hotel guarantees, and peace of mind on every trip.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon-wrap">{service.icon}</div>
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}