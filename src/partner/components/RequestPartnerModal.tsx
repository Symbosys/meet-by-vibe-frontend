import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import type { GarbaPartner, GarbaEvent } from '../types/partner.types';
import { getPartnerAge } from '../utils/age.util';

interface RequestPartnerModalProps {
  partner: GarbaPartner | null;
  events: GarbaEvent[];
  isOpen: boolean;
  onClose: () => void;
  onSendRequest: (partnerId: string, eventId: string, note: string) => void;
}

export const RequestPartnerModal: React.FC<RequestPartnerModalProps> = ({
  partner,
  events,
  isOpen,
  onClose,
  onSendRequest,
}) => {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');
  const [note, setNote] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen || !partner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendRequest(partner.id, selectedEventId, note);
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '480px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Request Garba Partner</h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {sentSuccess ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Request Sent!
            </h3>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
              {partner.name} has been notified. You will get a notification as soon as they accept!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="partner-modal-body">
              {/* Partner Card Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                <img
                  src={partner.avatarUrl}
                  alt={partner.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff1379' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                    {partner.name}, {partner.age || getPartnerAge(partner.id, partner.name)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    📍 {partner.city}
                  </div>
                </div>
              </div>

              {/* Event Selection */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Select Festival Event *
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Personalized Invite Message
                </label>
                <textarea
                  rows={3}
                  placeholder={`Hey ${partner.name}! I am attending this Garba event and would love to team up for the rounds...`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            </div>

            <div className="partner-modal-footer">
              <button type="button" className="btn-partner-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-partner-primary">
                <Send size={14} />
                <span>Send Invitation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
