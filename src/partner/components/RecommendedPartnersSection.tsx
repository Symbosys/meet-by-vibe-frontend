import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, UserX } from 'lucide-react';
import type { GarbaPartner } from '../types/partner.types';
import { PartnerCard } from './PartnerCard';

interface RecommendedPartnersSectionProps {
  partners: GarbaPartner[];
  isLoading?: boolean;
  onOpenProfile: (partner: GarbaPartner) => void;
  onBookPartner: (partner: GarbaPartner) => void;
  onToggleFavorite: (partnerId: string) => void;
  onViewAllPartners?: () => void;
}

export const RecommendedPartnersSection: React.FC<RecommendedPartnersSectionProps> = ({
  partners,
  isLoading = false,
  onOpenProfile,
  onBookPartner,
  onToggleFavorite,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 4;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(Math.max(0, partners.length - itemsPerPage), prev + 1));
  };

  const visiblePartners = partners.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section>
      {/* Section Header */}
      <div className="partner-section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="partner-section-title">
            Recommended <span style={{ color: '#ff1379' }}>Performers & Partners</span> for You ✨
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Book verified dance choreographers and partners matching your schedule & events.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Tagline */}
          <div className="partner-rec-header-tagline">
            <span style={{ color: '#e11d48' }}>⚔️</span>
            <span style={{ color: '#475569' }}>Same Events</span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#475569' }}>Same Vibe</span>
            <span className="accent">Instant Booking! 💖</span>
          </div>

          <div className="partner-nav-arrows">
            <button 
              className="partner-round-arrow-btn" 
              onClick={handlePrev}
              disabled={startIndex === 0 || isLoading || partners.length <= itemsPerPage}
              style={{ opacity: startIndex === 0 || partners.length <= itemsPerPage ? 0.4 : 1 }}
              title="Previous performers"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="partner-round-arrow-btn" 
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= partners.length || isLoading || partners.length <= itemsPerPage}
              style={{ opacity: startIndex + itemsPerPage >= partners.length || partners.length <= itemsPerPage ? 0.4 : 1 }}
              title="Next performers"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="partner-cards-grid">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '380px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ width: '100%', height: '220px', borderRadius: '14px', background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
              <div style={{ height: '20px', width: '60%', background: '#f1f5f9', borderRadius: '4px' }} />
              <div style={{ height: '14px', width: '40%', background: '#f1f5f9', borderRadius: '4px' }} />
              <div style={{ marginTop: 'auto', height: '40px', background: '#fce7f3', borderRadius: '8px' }} />
            </div>
          ))}
        </div>
      ) : partners.length === 0 ? (
        /* Empty State */
        <div
          style={{
            background: '#ffffff',
            border: '1.5px dashed #e2e8f0',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fdf2f8', color: '#ff1379', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <UserX size={26} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            No Performers Found
          </h3>
          <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto', color: '#64748b' }}>
            There are currently no active performers or dancers matching your selected search/city filters.
          </p>
        </div>
      ) : (
        /* Dynamic Cards Grid */
        <div className="partner-cards-grid">
          {visiblePartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onOpenProfile={onOpenProfile}
              onBookPartner={onBookPartner}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </section>
  );
};

