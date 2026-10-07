import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Sparkles,
  Check,
  Shirt,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type { GarbaEvent } from '../types/partner.types';

interface EventDetailsModalProps {
  event: GarbaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onFindPartner: (event: GarbaEvent) => void;
  onToggleJoin?: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onFindPartner,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card event-details-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header event-details-modal-header">
          <div className="event-details-title-wrap">
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title event-details-modal-title">Festival Event Details</h3>
          </div>
          <button 
            type="button"
            className="partner-round-arrow-btn" 
            onClick={onClose} 
            title="Close modal"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="partner-modal-body event-details-modal-body">
          {/* Banner Media */}
          <div className="event-details-banner-wrap">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="event-details-banner-img"
            />

            {/* Top Badges */}
            <div className="event-details-badges">
              {event.isFeatured && (
                <div className="event-details-featured-badge">
                  <Sparkles size={11} />
                  <span>Featured</span>
                </div>
              )}
              {event.isJoined && (
                <div className="partner-event-joined-tag" style={{ position: 'static' }}>
                  <Check size={12} strokeWidth={3} />
                  <span>Joined RSVP</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="event-details-heading">
            {event.title}
          </h2>

          {/* Date & Time Grid */}
          <div className="event-details-datetime-grid">
            <div className="event-details-info-tile">
              <div className="event-details-tile-icon date">
                <Calendar size={16} />
              </div>
              <div>
                <div className="event-details-tile-label">Event Date</div>
                <div className="event-details-tile-val">{event.date}</div>
              </div>
            </div>

            <div className="event-details-info-tile">
              <div className="event-details-tile-icon time">
                <Clock size={16} />
              </div>
              <div>
                <div className="event-details-tile-label">Daily Hours</div>
                <div className="event-details-tile-val">
                  {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Venue */}
          <div className="event-details-venue-card">
            <MapPin size={18} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div className="event-details-venue-title">
                {event.venue}
              </div>
              <div className="event-details-venue-sub">
                {event.address ? `${event.address}, ` : ''}{event.city}, {event.state} {event.pincode ? `- ${event.pincode}` : ''}
              </div>
            </div>
          </div>

          {/* Pass Price & Capacity Card */}
          <div className="event-details-pricing-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="event-details-price-badge-icon">
                ₹
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>Entry Pass Price</div>
                <div className="event-details-price-val">
                  {event.pricePerPass && event.pricePerPass > 0 ? `₹${event.pricePerPass} / Pass` : 'Free Entry'}
                </div>
              </div>
            </div>

            {event.totalCapacity && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Capacity</div>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                  {event.totalCapacity} Attendees
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="event-details-about-section">
              <div className="event-details-section-heading">About This Festival</div>
              <p className="event-details-description-text">
                {event.description}
              </p>
            </div>
          )}

          {/* Guidelines / Dress Code / Organizer Grid */}
          {(event.dressCode || event.organizerName) && (
            <div className="event-details-organizer-grid">
              {event.dressCode && (
                <div style={{ background: '#fdf4ff', border: '1px solid #fae8ff', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#a21caf', marginBottom: '2px' }}>
                    <Shirt size={13} />
                    <span>Dress Code</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                    {event.dressCode}
                  </div>
                </div>
              )}

              {event.organizerName && (
                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
                    <UserCheck size={13} />
                    <span>Organizer</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                    {event.organizerName}
                  </div>
                  {event.organizerContact && (
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>{event.organizerContact}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rules / Guidelines List if present */}
          {event.rules && event.rules.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                <ShieldCheck size={14} color="#ff1379" />
                <span>Event Rules & Entry Guidelines</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.rules.map((rule, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#ff1379', fontWeight: 800 }}>•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendees Summary */}
          <div className="event-details-attendees-strip">
            <Users size={15} color="#ff1379" />
            <div style={{ fontSize: '12px', color: '#334155' }}>
              <strong>+{event.attendeesCount ?? 0} people</strong> attending • <span style={{ color: '#ff1379', fontWeight: 600 }}>{event.lookingForPartnerCount ?? 0} looking for partner</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="partner-modal-footer event-details-modal-footer">
          <button
            type="button"
            className="btn-partner-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => {
              onClose();
              onFindPartner(event);
            }}
          >
            <span>Find Partner for This Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
