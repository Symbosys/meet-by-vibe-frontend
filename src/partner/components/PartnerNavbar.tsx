import { State } from 'country-state-city';
import {
    ChevronDown,
    Crown,
    MapPin,
    Search,
    Shield,
    SlidersHorizontal
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { CURRENT_USER } from '../data/partnerMockData';

interface PartnerNavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedState: string;
  selectedCity: string;
  onOpenLocationModal: () => void;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  onSwitchToAdmin: () => void;
}

export const PartnerNavbar: React.FC<PartnerNavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  selectedCity,
  onOpenLocationModal,
  onSwitchToAdmin,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dynamic State ISO Code from country-state-city
  const stateIsoCode = useMemo(() => {
    const indianStates = State.getStatesOfCountry('IN');
    const matched = indianStates.find(
      (s) => s.name.toLowerCase() === selectedState.toLowerCase()
    );
    return matched ? matched.isoCode : 'IN';
  }, [selectedState]);

  return (
    <header className="partner-navbar-wrap">
      <div className="partner-container">
        <div className="partner-navbar">
          {/* Logo & Brand */}
          <div className="partner-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="partner-brand-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="partner-brand-text">
              <div className="partner-brand-name">
                Garba<span>Mitra</span>
              </div>
              <div className="partner-brand-tagline">
                No Partner? We've Got You.
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="partner-nav-search">
            <Search size={16} className="partner-nav-search-icon" />
            <input
              type="text"
              className="partner-nav-search-input"
              placeholder="Search events, partners or groups..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Nav Actions */}
          <div className="partner-nav-actions">
            {/* State Selector */}
            <button className="partner-loc-pill" onClick={onOpenLocationModal} title="Change State">
              <MapPin size={13} />
              <span>{selectedState}</span>
              <span className="partner-loc-code">{stateIsoCode}</span>
              <ChevronDown size={13} />
            </button>

            {/* City Selector */}
            <button className="partner-loc-pill city-pill" onClick={onOpenLocationModal} title="Change City">
              <span>🏙️</span>
              <span>{selectedCity}</span>
              <ChevronDown size={13} />
            </button>

            {/* User Profile Pill */}
            <div style={{ position: 'relative' }}>
              <button 
                className="partner-user-nav-pill"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <img
                  src={CURRENT_USER.avatarUrl}
                  alt={CURRENT_USER.name}
                  className="partner-user-nav-avatar"
                />
                <div className="partner-user-nav-info">
                  <span className="partner-user-nav-name">{CURRENT_USER.name}</span>
                  <span className="partner-user-nav-badge">
                    <Crown size={11} />
                    <span>Premium</span>
                  </span>
                </div>
                <ChevronDown size={13} color="#64748b" />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '220px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  boxShadow: '0 10px 28px rgba(15, 23, 42, 0.15)',
                  border: '1px solid #e2e8f0',
                  padding: '8px',
                  zIndex: 200,
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{CURRENT_USER.fullName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Verified VIP Member</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSwitchToAdmin();
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#0f172a',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf2f8')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <Shield size={14} color="#ff1379" />
                    <span>Switch to Admin Panel</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenLocationModal();
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#0f172a',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <SlidersHorizontal size={14} color="#64748b" />
                    <span>Change Preferences</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
