import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Maximize2
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedPhotoIndex(0);
      setIsLightboxOpen(false);
    }
  }, [isOpen, partner]);

  // Keyboard navigation for full photo lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') {
        setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
      }
      if (e.key === 'ArrowRight') {
        setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  if (!isOpen || !partner) return null;

  const photos = partner.photos && partner.photos.length > 0 ? partner.photos : [partner.avatarUrl];

  return (
    <>
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
            {/* Main Photo Carousel - Clickable for Full Photo */}
            <div 
              className="profile-carousel-container"
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view complete full photo"
            >
              <img
                src={photos[selectedPhotoIndex]}
                alt={partner.name}
                className="profile-carousel-img"
              />

              {/* View Full Photo Badge */}
              <div 
                className="profile-zoom-badge"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
              >
                <Maximize2 size={12} />
                <span>Full Photo</span>
              </div>

              {/* Photo nav controls */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
                    }}
                    className="profile-carousel-nav-btn prev"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
                    }}
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

    {/* Complete Full Photo Lightbox Overlay */}
    {isLightboxOpen && (
      <div 
        className="profile-lightbox-overlay" 
        onClick={() => setIsLightboxOpen(false)}
      >
        <div className="profile-lightbox-header" onClick={(e) => e.stopPropagation()}>
          <div className="profile-lightbox-title">
            <Sparkles size={16} color="#ff1379" />
            <span>{partner.name} - Full Photo {selectedPhotoIndex + 1} of {photos.length}</span>
          </div>
          <button 
            type="button"
            className="profile-lightbox-close-btn"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close full photo"
          >
            <X size={20} />
          </button>
        </div>

        <div className="profile-lightbox-content" onClick={(e) => e.stopPropagation()}>
          <img
            src={photos[selectedPhotoIndex]}
            alt={`${partner.name} Full Photo ${selectedPhotoIndex + 1}`}
            className="profile-lightbox-img"
          />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="profile-lightbox-nav-btn prev"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                aria-label="Previous full photo"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="profile-lightbox-nav-btn next"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                aria-label="Next full photo"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        <div className="profile-lightbox-footer" onClick={(e) => e.stopPropagation()}>
          <span>Photo {selectedPhotoIndex + 1} of {photos.length}</span>
          <span>•</span>
          <span style={{ color: '#ff1379', fontWeight: 700 }}>{partner.city}</span>
        </div>
      </div>
    )}
  </>
);
};

