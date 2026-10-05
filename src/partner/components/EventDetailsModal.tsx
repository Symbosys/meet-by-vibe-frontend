import React from 'react';
import { X, Calendar, Clock, MapPin, Users, Sparkles, Check } from 'lucide-react';
import type { GarbaEvent } from '../types/partner.types';

interface EventDetailsModalProps {
  event: GarbaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onFindPartner: (event: GarbaEvent) => void;
  onToggleJoin: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onFindPartner,
  onToggleJoin,
}) => {
  if (!isOpen || !event) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '600px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Festival Event Details</h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="partner-modal-body">
          {/* Banner */}
          <div style={{ position: 'relative', height: '220px', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
            <img
              src={event.imageUrl}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {event.isJoined && (
              <div className="partner-event-joined-tag" style={{ top: '12px', left: '12px' }}>
                <Check size={12} strokeWidth={3} />
                <span>Joined RSVP</span>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            {event.title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="#ff1379" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Date</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{event.date}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#ff1379" />
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Timing</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{event.time}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13.5px', marginBottom: '14px' }}>
            <MapPin size={16} color="#ff1379" style={{ flexShrink: 0 }} />
            <span><strong>{event.venue}</strong>, {event.city}, {event.state}</span>
          </div>

          <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, marginBottom: '16px' }}>
            {event.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff0f6', borderRadius: '12px', border: '1px solid #ffd6e7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} color="#ff1379" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {event.attendeesCount}+ Dancers Attending
                </div>
                <div style={{ fontSize: '11.5px', color: '#be185d' }}>
                  {event.lookingForPartnerCount} currently searching for dance partner
                </div>
              </div>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff1379' }}>
              ₹{event.pricePerPass || 500} / Pass
            </div>
          </div>
        </div>

        <div className="partner-modal-footer">
          <button
            className="btn-partner-outline"
            onClick={() => onToggleJoin(event.id)}
          >
            {event.isJoined ? 'Leave Event' : 'RSVP / Join Event'}
          </button>
          
          <button
            className="btn-partner-primary"
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
