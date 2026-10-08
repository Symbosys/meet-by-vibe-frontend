import React from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Crown, 
  Swords, 
  Calendar, 
  Sparkles, 
  Image as ImageIcon
} from 'lucide-react';
import type { GarbaPartner } from '../types/partner.types';

interface PartnerCardProps {
  partner: GarbaPartner;
  onOpenProfile: (partner: GarbaPartner) => void;
  onBookPartner: (partner: GarbaPartner) => void;
  onToggleFavorite?: (partnerId: string) => void;
}

export const PartnerCard: React.FC<PartnerCardProps> = ({
  partner,
  onOpenProfile,
  onBookPartner,
}) => {
  const getTagClass = (tag: string) => {
    switch (tag) {
      case 'Partner':
        return 'tag-partner';
      case 'Group':
        return 'tag-group';
      default:
        return 'tag-newfriends';
    }
  };

  return (
    <div className="partner-card">
      {/* Top Media */}
      <div className="partner-card-media">
        <img
          src={partner.avatarUrl}
          alt={partner.name}
          className="partner-card-img"
          onClick={() => onOpenProfile(partner)}
          style={{ cursor: 'pointer' }}
        />

        {/* Bottom floating status tags */}
        <div className="partner-card-media-bottom" style={{ justifyContent: 'flex-end' }}>
          <div
            className="partner-photos-count-badge"
            onClick={(e) => {
              e.stopPropagation();
              onOpenProfile(partner);
            }}
            title="View photo gallery"
          >
            <ImageIcon size={12} />
            <span>{partner.photosCount}+ Photos</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="partner-card-body">
        {/* Name, Age, Verification & Tag */}
        <div className="partner-card-name-row">
          <div 
            className="partner-card-name" 
            onClick={() => onOpenProfile(partner)}
            style={{ cursor: 'pointer' }}
          >
            <span>{partner.name}, {partner.age}</span>
            {partner.isVerified && (
              <CheckCircle size={15} className="partner-verified-check" fill="#0284c7" color="#ffffff" />
            )}
          </div>

          <span className={`partner-tag-pill ${getTagClass(partner.tag)}`}>
            {partner.tag === 'Partner' ? '★ Partner' : partner.tag}
          </span>
        </div>

        {/* City Location & Booking Rate */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div className="partner-card-location" style={{ marginBottom: 0 }}>
            <MapPin size={13} />
            <span>{partner.city}</span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 800, color: '#10b981' }}>
            ₹{partner.hourlyRate || 399}
          </div>
        </div>

        {/* Skills & Dates */}
        <div className="partner-card-skills-row">
          <div className="partner-skill-item">
            <Crown size={13} color="#f59e0b" />
            <span>{partner.mySkill}</span>
            <Swords size={12} color="#e11d48" style={{ margin: '0 2px' }} />
            <span>{partner.theirSkill}</span>
          </div>

          <div className="partner-card-date">
            <Calendar size={13} />
            <span>{partner.preferredDate}</span>
          </div>
        </div>

        {/* Card Actions: Book Now */}
        <div className="partner-card-actions">
          <button
            className="btn-request-partner"
            onClick={() => onBookPartner(partner)}
            style={{
              background: 'linear-gradient(135deg, #ff1379 0%, #e11d48 100%)',
              gap: '6px',
              width: '100%',
              height: '40px',
              fontSize: '13px'
            }}
          >
            <Sparkles size={15} />
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
