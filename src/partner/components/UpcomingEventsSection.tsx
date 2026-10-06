import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Heart,
    MapPin,
    Sparkles
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { GarbaEvent } from '../types/partner.types';

interface UpcomingEventsSectionProps {
  events: GarbaEvent[];
  onViewEventDetails?: (event: GarbaEvent) => void;
  onFindPartnerForEvent?: (event: GarbaEvent) => void;
  onToggleSaveEvent: (eventId: string) => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onViewEventDetails,
  onToggleSaveEvent,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!events || events.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [events, isPaused]);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = () => {
    if (onViewEventDetails) {
      onViewEventDetails(currentEvent);
    }
  };

  return (
    <section>
      {/* Section Header */}
      <div className="partner-section-header">
        <div className="partner-section-title-wrap">
          <h2 className="partner-section-title">
            Your Upcoming Event
          </h2>
          <span className="partner-counter-badge">
            {currentIndex + 1}/{events.length}
          </span>
        </div>

        <div className="partner-nav-arrows">
          <button className="partner-round-arrow-btn" onClick={handlePrev} title="Previous event">
            <ChevronLeft size={16} />
          </button>
          <button className="partner-round-arrow-btn" onClick={handleNext} title="Next event">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Event Card */}
      <div 
        className="partner-event-card"
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        title="Click to view full event details"
      >
        {/* Event Media Left */}
        <div className="partner-event-img-wrap">
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.title}
            className="partner-event-img"
          />

          {currentEvent.isJoined && (
            <div className="partner-event-joined-tag">
              <Check size={12} strokeWidth={3} />
              <span>Joined</span>
            </div>
          )}

          <button
            type="button"
            className="partner-event-heart-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSaveEvent(currentEvent.id);
            }}
            title="Save to favorites"
          >
            <Heart size={16} fill={currentEvent.isFavorite ? '#ff1379' : 'none'} />
          </button>
        </div>

        {/* Event Content Right */}
        <div className="partner-event-content">
          <div className="partner-event-title-row">
            <h3 className="partner-event-title">{currentEvent.title}</h3>
            {currentEvent.isFeatured && (
              <span className="partner-featured-badge">
                <Sparkles size={11} />
                <span>Featured</span>
              </span>
            )}
          </div>

          <div className="partner-event-meta">
            <div className="partner-event-meta-item">
              <Calendar size={14} color="#64748b" />
              <span>{currentEvent.date}</span>
            </div>
            <span>•</span>
            <div className="partner-event-meta-item">
              <Clock size={14} color="#64748b" />
              <span>{currentEvent.time}</span>
            </div>
          </div>

          <div className="partner-event-location">
            <MapPin size={14} color="#ff1379" />
            <span>{currentEvent.venue}, {currentEvent.city}</span>
          </div>

          <div className="partner-event-attendees">
            <div className="partner-avatar-group">
              {(currentEvent.attendeeAvatars || []).map((av, idx) => (
                <img key={idx} src={av} alt="Attendee" />
              ))}
            </div>
            <span className="partner-attendee-count">
              +{currentEvent.attendeesCount ?? 0} people going
            </span>
            <span className="partner-looking-badge">
              {currentEvent.lookingForPartnerCount ?? 0} looking for partner
            </span>
          </div>
        </div>


      </div>

      {/* Pagination Dots */}
      <div className="partner-event-pagination-dots">
        {events.map((_, idx) => (
          <div
            key={idx}
            className={`partner-event-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </section>
  );
};
