import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import type { GarbaPartner } from '../types/partner.types';

interface PartnerProfileModalProps {
  partner: GarbaPartner | null;
  isOpen: boolean;
  onClose: () => void;
  onBookPartner: (partner: GarbaPartner) => void;
}

export const PartnerProfileModal: React.FC<PartnerProfileModalProps> = ({
  partner,
  isOpen,
  onClose,
  onBookPartner,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!isOpen || !partner) return null;

  const photos = partner.photos && partner.photos.length > 0 ? partner.photos : [partner.avatarUrl];

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '600px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Performer & Partner Profile</h3>
          </div>
          <button 
            className="partner-round-arrow-btn" 
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="partner-modal-body" style={{ padding: '20px' }}>
          {/* Main Photo Carousel */}
          <div style={{ position: 'relative', height: '320px', borderRadius: '14px', overflow: 'hidden', marginBottom: '14px', background: '#0f172a' }}>
            <img
              src={photos[selectedPhotoIndex]}
              alt={partner.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Photo nav controls */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Match Badge */}
            <div className="partner-match-badge" style={{ top: '12px', left: '12px' }}>
              <span>⚡</span>
              <span>{partner.matchScore}% Match Score</span>
            </div>

            {/* Hourly Rate Float */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#10b981',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '14px',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}>
              ₹{partner.hourlyRate || 1200} / hr
            </div>
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
              {photos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt={`Thumb ${idx}`}
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: idx === selectedPhotoIndex ? '2px solid #ff1379' : '1px solid #e2e8f0'
                  }}
                  onClick={() => setSelectedPhotoIndex(idx)}
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                {partner.name}, {partner.age}
              </h2>
              {partner.isVerified && (
                <CheckCircle size={18} className="partner-verified-check" fill="#0284c7" color="#ffffff" />
              )}
            </div>

            <span className="partner-tag-pill tag-partner">
              {partner.tag}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff1379', fontWeight: 600 }}>
              <MapPin size={14} />
              <span>{partner.city}, {partner.state}</span>
            </div>
            <div>•</div>
            <div>Height: <strong style={{ color: '#0f172a' }}>{partner.heightCm} cm</strong></div>
            {partner.instagram && (
              <>
                <div>•</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ec4899' }}>
                  <span>📸 @{partner.instagram}</span>
                </div>
              </>
            )}
          </div>

          {/* Bio */}
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
            {partner.bio}
          </div>

          {/* Dance Styles */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
              Specialty Dance Styles
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {partner.danceStyles.map((style) => (
                <span
                  key={style}
                  style={{
                    background: '#fff0f6',
                    color: '#ff1379',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: '1px solid #ffd6e7'
                  }}
                >
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Book Me Action */}
        <div className="partner-modal-footer">
          <button 
            className="btn-partner-outline" 
            onClick={onClose}
          >
            Cancel
          </button>

          <button 
            className="btn-partner-primary"
            style={{ background: 'linear-gradient(135deg, #ff1379 0%, #e11d48 100%)' }}
            onClick={() => {
              onClose();
              onBookPartner(partner);
            }}
          >
            <CreditCard size={15} />
            <span>Book Me (₹{partner.hourlyRate || 1200}/hr)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
