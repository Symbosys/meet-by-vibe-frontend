import { State } from 'country-state-city';
import {
    CalendarPlus,
    ChevronDown,
    ChevronRight,
    Compass,
    Loader2,
    LocateFixed,
    MapPin,
    Menu,
    Search,
    Sparkles,
    Users,
    X
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PartnerNavbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedState: string;
  selectedCity: string;
  onOpenLocationModal: () => void;
  onOpenNotifications?: () => void;
  onOpenMessages?: () => void;
  onSwitchToAdmin: () => void;
  onRegisterEvent?: () => void;
  isLocating?: boolean;
  locationDetected?: boolean;
  onDetectLocation?: () => void;
}

export const PartnerNavbar: React.FC<PartnerNavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  selectedCity,
  onOpenLocationModal,
  onRegisterEvent,
  isLocating = false,
  locationDetected = false,
  onDetectLocation,
}) => {
  const navigate = useNavigate();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dynamic State ISO Code from country-state-city
  const stateIsoCode = useMemo(() => {
    const indianStates = State.getStatesOfCountry('IN');
    const matched = indianStates.find(
      (s) => s.name.toLowerCase() === selectedState.toLowerCase()
    );
    return matched ? matched.isoCode : '';
  }, [selectedState]);

  // Formatted location display text (e.g. "Ranchi, Jharkhand")
  const locationDisplayText = useMemo(() => {
    if (selectedCity && selectedState) {
      if (selectedCity.toLowerCase() === selectedState.toLowerCase()) {
        return selectedCity;
      }
      return `${selectedCity}, ${selectedState}`;
    }
    return selectedCity || selectedState || 'Select Location';
  }, [selectedCity, selectedState]);

  // Short location for compact mobile top bar (e.g. "Ranchi, JH")
  const shortLocationText = useMemo(() => {
    if (selectedCity) {
      return stateIsoCode ? `${selectedCity}, ${stateIsoCode}` : selectedCity;
    }
    return selectedState || 'Location';
  }, [selectedCity, selectedState, stateIsoCode]);

  return (
    <header className="partner-navbar-wrap">
      <div className="partner-container">
        <div className="partner-navbar">
          {/* 1. Left: Brand Logo & Title */}
          <div
            className="partner-brand"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsMobileDrawerOpen(false);
            }}
          >
            <div className="partner-brand-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="partner-brand-text">
              <div className="partner-brand-name">
                MeetBy<span>Vibe</span>
              </div>
              <div className="partner-brand-tagline">
                No Partner? We've Got You.
              </div>
            </div>
          </div>

          {/* 2. Mobile Center Location Pill (Shown in place of search bar on mobile) */}
          <div className="partner-mobile-loc-center">
            <button
              type="button"
              className={`partner-loc-pill mobile-center-loc ${locationDetected ? 'live-location' : ''}`}
              onClick={onOpenLocationModal}
              title={isLocating ? 'Detecting location via Ola Maps...' : 'Tap to change city/state'}
            >
              {isLocating ? (
                <Loader2 size={13} className="spin-animate" />
              ) : (
                <MapPin size={13} style={{ color: '#e11d48', flexShrink: 0 }} />
              )}
              <span className="loc-text-truncate">
                {isLocating ? 'Locating...' : shortLocationText}
              </span>
              <ChevronDown size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
            </button>
          </div>

          {/* 3. Desktop Center Search Bar (Hidden on Mobile) */}
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

          {/* 4. Desktop Right Actions (Hidden on Mobile) */}
          <div className="partner-nav-actions">
            {/* Unified Fetched Location Field */}
            <button
              className={`partner-loc-pill ${locationDetected ? 'live-location' : ''}`}
              onClick={onOpenLocationModal}
              title={isLocating ? 'Detecting current location via Ola Maps...' : 'Click to change location'}
            >
              {isLocating ? (
                <Loader2 size={14} className="spin-animate" />
              ) : (
                <MapPin size={14} style={{ color: '#e11d48', flexShrink: 0 }} />
              )}
              <span style={{ fontWeight: 600 }}>
                {isLocating ? 'Locating...' : locationDisplayText}
              </span>
              {stateIsoCode && !isLocating && (
                <span className="partner-loc-code">{stateIsoCode}</span>
              )}
              <ChevronDown size={13} style={{ opacity: 0.7, flexShrink: 0 }} />
            </button>

            {/* GPS Auto-Detect Button */}
            {onDetectLocation && (
              <button
                type="button"
                className="partner-nav-gps-btn"
                onClick={onDetectLocation}
                disabled={isLocating}
                title="Fetch live location via Ola Maps"
              >
                {isLocating ? (
                  <Loader2 size={15} className="spin-animate" />
                ) : (
                  <LocateFixed size={15} />
                )}
              </button>
            )}

            {/* Event Register Button */}
            <button
              className="partner-event-reg-btn"
              onClick={() => {
                if (onRegisterEvent) {
                  onRegisterEvent();
                } else {
                  navigate('/create-event');
                }
              }}
              title="Register for Garba Event"
            >
              <CalendarPlus size={15} />
              <span>Event Register</span>
            </button>
          </div>

          {/* 5. Mobile 3-Line Hamburger Menu Icon (On the Right) */}
          <button
            type="button"
            className="partner-mobile-menu-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            title="Menu"
          >
            <Menu size={20} color="var(--gm-primary)" />
          </button>
        </div>
      </div>

      {/* Right-Side Slide-in Sidebar Drawer */}
      {isMobileDrawerOpen && (
        <>
          <div
            className="partner-mobile-drawer-backdrop"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="partner-mobile-menu-drawer">
            {/* Sidebar Header */}
            <div className="partner-mobile-drawer-header">
              <div className="partner-drawer-brand">
                <div className="partner-brand-logo-icon" style={{ width: '28px', height: '28px' }}>
                  <Sparkles size={16} color="#ffffff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e1b4b' }}>
                  MeetBy<span style={{ color: 'var(--gm-primary)' }}>Vibe</span>
                </span>
              </div>
              <button
                type="button"
                className="partner-mobile-drawer-close"
                onClick={() => setIsMobileDrawerOpen(false)}
                title="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="partner-mobile-drawer-body">
              {/* Search Bar in Sidebar */}
              <div className="partner-drawer-search-wrap">
                <Search size={15} className="partner-drawer-search-icon" />
                <input
                  type="text"
                  className="partner-drawer-search-input"
                  placeholder="Search events, performers..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>

              <div className="partner-drawer-section-lbl">LOCATION & GPS</div>

              {/* 1. Location Selector Tile */}
              <div
                className="partner-mobile-menu-item"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  onOpenLocationModal();
                }}
              >
                <div className="partner-menu-item-icon icon-rose">
                  <MapPin size={18} />
                </div>
                <div className="partner-menu-item-text">
                  <span className="partner-menu-label">Current Location</span>
                  <strong className="partner-menu-val">{locationDisplayText}</strong>
                </div>
                <ChevronRight size={16} className="partner-menu-arrow" />
              </div>

              {/* 2. GPS Auto-Detect via Ola Maps Tile */}
              {onDetectLocation && (
                <div
                  className="partner-mobile-menu-item"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onDetectLocation();
                  }}
                >
                  <div className="partner-menu-item-icon icon-blue">
                    {isLocating ? <Loader2 size={18} className="spin-animate" /> : <LocateFixed size={18} />}
                  </div>
                  <div className="partner-menu-item-text">
                    <span className="partner-menu-label">GPS Auto-Detect</span>
                    <strong className="partner-menu-val">
                      {isLocating ? 'Detecting via Ola Maps...' : 'Fetch Live GPS Location'}
                    </strong>
                  </div>
                  <ChevronRight size={16} className="partner-menu-arrow" />
                </div>
              )}

              <div className="partner-drawer-section-lbl">QUICK ACTIONS</div>

              {/* 3. Event Register Primary CTA */}
              <button
                type="button"
                className="partner-mobile-menu-cta"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (onRegisterEvent) {
                    onRegisterEvent();
                  } else {
                    navigate('/create-event');
                  }
                }}
              >
                <CalendarPlus size={18} />
                <span>Create & Register Garba Event</span>
              </button>

              {/* 4. Quick Links */}
              <div className="partner-drawer-links-group">
                <div
                  className="partner-drawer-quick-link"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Compass size={16} color="var(--gm-primary)" />
                  <span>Garba Events Carousel</span>
                </div>
                <div
                  className="partner-drawer-quick-link"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    const el = document.getElementById('partners-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Users size={16} color="#0284c7" />
                  <span>Find Garba Partners</span>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
};

export default PartnerNavbar;
