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
        className="partner-modal-card" 
        style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header" style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Festival Event Details</h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose} title="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="partner-modal-body" style={{ padding: '20px 24px' }}>
          {/* Banner Media */}
          <div style={{ position: 'relative', height: '240px', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px', background: '#0f172a' }}>
            <img
              src={event.imageUrl}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Top Badges */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px', zIndex: 2 }}>
              {event.isFeatured && (
                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
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
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', lineHeight: 1.3 }}>
            {event.title}
          </h2>

          {/* Date & Time Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fff0f6', color: '#ff1379', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar size={16} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Event Date</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{event.date}</div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={16} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Daily Hours</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Venue */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '16px' }}>
            <MapPin size={18} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                {event.venue}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                {event.address ? `${event.address}, ` : ''}{event.city}, {event.state} {event.pincode ? `- ${event.pincode}` : ''}
              </div>
            </div>
          </div>

          {/* Pass Price & Capacity Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff0f6', borderRadius: '12px', border: '1px solid #ffd6e7', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ffffff', color: '#ff1379', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                ₹
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>Entry Pass Price</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ff1379' }}>
                  {event.pricePerPass && event.pricePerPass > 0 ? `₹${event.pricePerPass} / Pass` : 'Free Entry'}
                </div>
              </div>
            </div>

            {event.totalCapacity && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Capacity</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                  {event.totalCapacity} Attendees
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>About This Festival</div>
            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </div>

          {/* Guidelines / Dress Code / Organizer Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            {event.dressCode && (
              <div style={{ background: '#fdf4ff', border: '1px solid #fae8ff', padding: '10px 12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#a21caf', marginBottom: '2px' }}>
                  <Shirt size={13} />
                  <span>Dress Code</span>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                  {event.dressCode}
                </div>
              </div>
            )}

            {event.organizerName && (
              <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', padding: '10px 12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 700, color: '#15803d', marginBottom: '2px' }}>
                  <UserCheck size={13} />
                  <span>Organizer</span>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                  {event.organizerName}
                </div>
                {event.organizerContact && (
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{event.organizerContact}</div>
                )}
              </div>
            )}
          </div>

          {/* Rules / Guidelines List if present */}
          {event.rules && event.rules.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                <ShieldCheck size={15} color="#ff1379" />
                <span>Event Rules & Entry Guidelines</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {event.rules.map((rule, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                    <span style={{ color: '#ff1379', fontWeight: 800 }}>•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attendees Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
            <Users size={16} color="#ff1379" />
            <div style={{ fontSize: '12.5px', color: '#334155' }}>
              <strong>+{event.attendeesCount ?? 0} people</strong> attending • <span style={{ color: '#ff1379', fontWeight: 600 }}>{event.lookingForPartnerCount ?? 0} looking for dance partner</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="partner-modal-footer" style={{ position: 'sticky', bottom: 0, background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
          <button
            type="button"
            className="btn-partner-primary"
            style={{ width: '100%' }}
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
