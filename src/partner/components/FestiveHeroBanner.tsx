import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type { GarbaEvent } from '../types/partner.types';

interface FestiveHeroBannerProps {
  events?: GarbaEvent[];
  isLoading?: boolean;
  onSelectEvent?: (event: GarbaEvent) => void;
}

export const FestiveHeroBanner: React.FC<FestiveHeroBannerProps> = ({ 
  events, 
  isLoading = false,
  onSelectEvent 
}) => {
  const slides = useMemo(() => {
    if (events && events.length > 0) {
      return events.map((evt) => ({
        id: evt.id,
        imageUrl: evt.imageUrl || 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=1600&q=80',
        title: evt.title,
        subtitle: evt.description
          ? evt.description.length > 130
            ? `${evt.description.slice(0, 130)}...`
            : evt.description
          : `${evt.venue}, ${evt.city}`,
        venueInfo: `${evt.venue}, ${evt.city}`,
        dateInfo: evt.date || 'Navratri 2026',
        timeInfo: evt.time || '07:30 PM',
        priceInfo: evt.pricePerPass && evt.pricePerPass > 0 ? `₹${evt.pricePerPass}` : 'Free Entry',
        tag: evt.isFeatured ? '⭐ Featured Grand Event' : '🎉 Navratri Garba 2026',
        eventObj: evt,
      }));
    }
    return [];
  }, [events]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Loading skeleton state (prevents flashing static mock data on refresh)
  if (isLoading || (events === undefined && slides.length === 0)) {
    return (
      <section className="partner-hero-section">
        <div className="partner-hero-banner partner-hero-banner-skeleton">
          <div className="partner-hero-skeleton-shimmer" />
          <div className="partner-hero-overlay">
            <div className="partner-hero-skeleton-tag" />
            <div className="partner-hero-skeleton-title" />
            <div className="partner-hero-skeleton-subtitle" />
          </div>
        </div>
      </section>
    );
  }

  // If not loading and no events in DB
  if (slides.length === 0) {
    return (
      <section className="partner-hero-section">
        <div className="partner-hero-banner">
          <img
            src="https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?w=1600&q=80"
            alt="Grand Navratri Garba 2026"
            className="partner-hero-banner-img"
          />
          <div className="partner-hero-overlay">
            <div className="partner-hero-tag">
              <Sparkles size={14} />
              <span>Grand Navratri Garba 2026</span>
            </div>
            <h1 className="partner-hero-title">Grand Navratri Garba Mahotsav 2026</h1>
            <p className="partner-hero-subtitle">Experience 9 nights of divine devotion, Dodhiya & Dandiya Raas with verified partners.</p>
          </div>
        </div>
      </section>
    );
  }

  // Handle slide index bounds safety
  const safeIndex = currentSlide < slides.length ? currentSlide : 0;
  const banner = slides[safeIndex] || slides[0];

  const handleBannerClick = () => {
    if (banner.eventObj && onSelectEvent) {
      onSelectEvent(banner.eventObj);
    }
  };

  return (
    <section className="partner-hero-section">
      <div
        className="partner-hero-banner"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{ cursor: banner.eventObj && onSelectEvent ? 'pointer' : 'default' }}
        onClick={handleBannerClick}
      >
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="partner-hero-banner-img"
        />

        {/* Gradient Overlay */}
        <div className="partner-hero-overlay">
          <div className="partner-hero-tag">
            <Sparkles size={14} />
            <span>{banner.tag}</span>
          </div>

          <h1 className="partner-hero-title">{banner.title}</h1>
          <p className="partner-hero-subtitle">{banner.subtitle}</p>

          {/* Event Quick Meta if event item */}
          {banner.eventObj && (
            <div className="partner-hero-meta-row">
              <div className="partner-hero-meta-item">
                <MapPin size={14} color="#ff1379" />
                <span>{banner.venueInfo}</span>
              </div>
              <span className="partner-hero-meta-divider">•</span>
              <div className="partner-hero-meta-item">
                <Calendar size={14} color="#fde047" />
                <span>{banner.dateInfo}</span>
              </div>
              <span className="partner-hero-meta-divider">•</span>
              <div className="partner-hero-meta-item">
                <Clock size={14} color="#38bdf8" />
                <span>{banner.timeInfo}</span>
              </div>
              <div className="partner-hero-price-tag">
                {banner.priceInfo}
              </div>
            </div>
          )}
        </div>

        {/* Carousel Dots */}
        {slides.length > 1 && (
          <div className="partner-hero-dots" onClick={(e) => e.stopPropagation()}>
            {slides.map((_, index) => (
              <div
                key={index}
                className={`partner-hero-dot ${index === safeIndex ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                title={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FestiveHeroBanner;

