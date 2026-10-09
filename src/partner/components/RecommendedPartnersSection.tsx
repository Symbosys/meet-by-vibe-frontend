import { Loader2, Sparkles, UserX } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import type { GarbaPartner } from '../types/partner.types';
import { PartnerCard } from './PartnerCard';

interface RecommendedPartnersSectionProps {
  partners: GarbaPartner[];
  isLoading?: boolean;
  onOpenProfile: (partner: GarbaPartner) => void;
  onBookPartner: (partner: GarbaPartner) => void;
  onToggleFavorite: (partnerId: string) => void;
  onViewAllPartners?: () => void;
  selectedGender?: 'MALE' | 'FEMALE' | 'ALL';
  onChangeGender?: (gender: 'MALE' | 'FEMALE' | 'ALL') => void;
  onOpenGenderModal?: () => void;
}

const INITIAL_BATCH_SIZE = 8;
const LOAD_MORE_STEP = 8;

export const RecommendedPartnersSection: React.FC<RecommendedPartnersSectionProps> = ({
  partners,
  isLoading = false,
  onOpenProfile,
  onBookPartner,
  onToggleFavorite,
  selectedGender = 'ALL',
  onChangeGender,
  onOpenGenderModal,
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination when gender filter or partners list changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
    setIsLoadingMore(false);
  }, [selectedGender, partners]);

  const totalPartners = partners.length;
  const hasMore = visibleCount < totalPartners;
  const visiblePartners = partners.slice(0, visibleCount);

  // Infinite Scroll / Scroll-based pagination via IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setIsLoadingMore(true);
          // Micro delay to ensure smooth scrolling animation & prevent abrupt jumps
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, totalPartners));
            setIsLoadingMore(false);
          }, 350);
        }
      },
      {
        root: null,
        rootMargin: '200px', // trigger 200px before reaching bottom
        threshold: 0.1,
      }
    );

    const el = loadMoreTriggerRef.current;
    if (el) {
      observer.observe(el);
    }

    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, totalPartners]);

  const handleManualLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, totalPartners));
      setIsLoadingMore(false);
    }, 250);
  };

  return (
    <section>
      {/* Section Header */}
      <div className="partner-section-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 className="partner-section-title" style={{ margin: 0 }}>
              Recommended <span style={{ color: '#ff1379' }}>
                {selectedGender === 'FEMALE' ? 'Female Performers' : selectedGender === 'MALE' ? 'Male Performers' : 'Performers & Partners'}
              </span> for You ✨
            </h2>

            {totalPartners > 0 && !isLoading && (
              <span style={{
                fontSize: '11px',
                background: '#fdf2f8',
                color: '#db2777',
                border: '1px solid #fbcfe8',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Sparkles size={11} />
                Showing {Math.min(visibleCount, totalPartners)} of {totalPartners}
              </span>
            )}
          </div>
          
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            Scroll down to discover verified dancers & choreography models matching your preference.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Gender Filter Toggle Pills */}
          {onChangeGender && (
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '24px', gap: '2px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                id="filter-gender-all"
                onClick={() => onChangeGender('ALL')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedGender === 'ALL' ? '#1e1b4b' : 'transparent',
                  color: selectedGender === 'ALL' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                All
              </button>
              <button
                type="button"
                id="filter-gender-female"
                onClick={() => onChangeGender('FEMALE')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedGender === 'FEMALE' ? '#ff1379' : 'transparent',
                  color: selectedGender === 'FEMALE' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                💃 Female
              </button>
              <button
                type="button"
                id="filter-gender-male"
                onClick={() => onChangeGender('MALE')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedGender === 'MALE' ? '#0284c7' : 'transparent',
                  color: selectedGender === 'MALE' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                🕺 Male
              </button>
              {onOpenGenderModal && (
                <button
                  type="button"
                  id="filter-gender-modal-open"
                  onClick={onOpenGenderModal}
                  style={{
                    padding: '5px 8px',
                    borderRadius: '20px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: 'transparent',
                    color: '#ff1379',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Select Partner Preference"
                >
                  ✨
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading Initial Skeleton */}
      {isLoading ? (
        <div className="partner-cards-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
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
      ) : totalPartners === 0 ? (
        /* Empty State */
        <div
          style={{
            background: '#ffffff',
            border: '1.5px dashed #e2e8f0',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b',
            marginTop: '16px'
          }}
        >
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fdf2f8', color: '#ff1379', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <UserX size={26} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            No Performers Found
          </h3>
          <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto', color: '#64748b' }}>
            There are currently no active performers matching your selected search or gender filters.
          </p>
        </div>
      ) : (
        /* Dynamic Scrollable Cards Grid */
        <>
          <div className="partner-cards-grid" style={{ marginBottom: '24px' }}>
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

          {/* Skeletons when loading next batch while scrolling */}
          {isLoadingMore && (
            <div className="partner-cards-grid" style={{ marginTop: '0', marginBottom: '24px' }}>
              {[1, 2, 3, 4].map((idx) => (
                <div
                  key={`skeleton-${idx}`}
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
          )}

          {/* Infinite Scroll Trigger Sentinel & Status Indicator */}
          {hasMore ? (
            <div
              ref={loadMoreTriggerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 0 40px 0',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={handleManualLoadMore}
                disabled={isLoadingMore}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  color: '#ff1379',
                  border: '1.5px solid #fbcfe8',
                  padding: '10px 24px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 19, 121, 0.08)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Loading more performers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Scroll down or click to load more</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Reached end of performers */
            <div style={{
              textAlign: 'center',
              padding: '20px 0 48px 0',
              color: '#94a3b8',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <span style={{ height: '1px', width: '40px', background: '#e2e8f0' }} />
              <span>✨ You've reached the end of verified performers</span>
              <span style={{ height: '1px', width: '40px', background: '#e2e8f0' }} />
            </div>
          )}
        </>
      )}
    </section>
  );
};
