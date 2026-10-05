import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Heart, 
  Sparkles
} from 'lucide-react';
import type { GarbaEvent } from '../types/partner.types';

interface UpcomingEventsSectionProps {
  events: GarbaEvent[];
  onViewEventDetails?: (event: GarbaEvent) => void;
  onFindPartnerForEvent?: (event: GarbaEvent) => void;
  onToggleSaveEvent: (eventId: string) => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  onToggleSaveEvent,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!events || events.length === 0) return null;

  const currentEvent = events[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
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
      <div className="partner-event-card">
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
            className="partner-event-heart-btn"
            onClick={() => onToggleSaveEvent(currentEvent.id)}
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
              {currentEvent.attendeeAvatars.map((av, idx) => (
                <img key={idx} src={av} alt="Attendee" />
              ))}
            </div>
            <span className="partner-attendee-count">
              +{currentEvent.attendeesCount} people going
            </span>
            <span className="partner-looking-badge">
              {currentEvent.lookingForPartnerCount} looking for partner
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
