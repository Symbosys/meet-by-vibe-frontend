import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { HERO_BANNERS } from '../data/partnerMockData';

export const FestiveHeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = HERO_BANNERS[currentSlide];

  return (
    <section className="partner-hero-section">
      <div className="partner-hero-banner">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="partner-hero-banner-img"
        />

        {/* Gradient Overlay */}
        <div className="partner-hero-overlay">
          <div className="partner-hero-tag">
            <Sparkles size={14} />
            <span>Grand Navratri Partner Match 2026</span>
          </div>
          <h1 className="partner-hero-title">{banner.title}</h1>
          <p className="partner-hero-subtitle">{banner.subtitle}</p>
        </div>

        {/* Carousel Dots */}
        <div className="partner-hero-dots">
          {HERO_BANNERS.map((_, index) => (
            <div
              key={index}
              className={`partner-hero-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
