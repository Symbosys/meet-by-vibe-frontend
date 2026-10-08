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
        className="partner-modal-card profile-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="partner-modal-header profile-modal-header">
          <div className="profile-modal-title-wrap">
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title profile-modal-title">Performer & Partner Profile</h3>
          </div>
          <button 
            className="partner-round-arrow-btn profile-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="partner-modal-body profile-modal-body">
          {/* Main Photo Carousel */}
          <div className="profile-carousel-container">
            <img
              src={photos[selectedPhotoIndex]}
              alt={partner.name}
              className="profile-carousel-img"
            />

            {/* Photo nav controls */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="profile-carousel-nav-btn prev"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="profile-carousel-nav-btn next"
                  aria-label="Next photo"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Rate Float Badge */}
            <div className="profile-rate-badge">
              ₹{partner.hourlyRate || 399}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {photos.length > 1 && (
            <div className="profile-thumbnails-row">
              {photos.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  alt={`Thumb ${idx + 1}`}
                  className={`profile-thumb-img ${idx === selectedPhotoIndex ? 'active' : ''}`}
                  onClick={() => setSelectedPhotoIndex(idx)}
                />
              ))}
            </div>
          )}

          {/* Title & Badge Details */}
          <div className="profile-header-details">
            <div className="profile-name-verified-wrap">
              <h2 className="profile-name-text">
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

          {/* Meta Information Row */}
          <div className="profile-meta-row">
            <div className="profile-meta-item location">
              <MapPin size={14} />
              <span>{partner.city}, {partner.state}</span>
            </div>
            <span className="profile-meta-dot">•</span>
            <div className="profile-meta-item">
              <span>Height: <strong style={{ color: '#0f172a' }}>{partner.heightCm} cm</strong></span>
            </div>
            {partner.instagram && (
              <>
                <span className="profile-meta-dot">•</span>
                <div className="profile-meta-item instagram">
                  <span>📸 @{partner.instagram}</span>
                </div>
              </>
            )}
          </div>

          {/* Bio */}
          {partner.bio && (
            <div className="profile-bio-box">
              {partner.bio}
            </div>
          )}

          {/* Specialty Dance Styles */}
          {partner.danceStyles && partner.danceStyles.length > 0 && (
            <div className="profile-dance-section">
              <div className="profile-section-label">
                Specialty Dance Styles
              </div>
              <div className="profile-dance-pills-wrap">
                {partner.danceStyles.map((style) => (
                  <span
                    key={style}
                    className="profile-dance-pill"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Book Me Action */}
        <div className="partner-modal-footer profile-modal-footer">
          <button 
            type="button"
            className="btn-partner-outline profile-btn-cancel" 
            onClick={onClose}
          >
            Cancel
          </button>

          <button 
            type="button"
            className="btn-partner-primary profile-btn-book"
            onClick={() => {
              onClose();
              onBookPartner(partner);
            }}
          >
            <CreditCard size={15} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
