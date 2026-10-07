import { State } from 'country-state-city';
import {
  CalendarPlus,
  ChevronDown,
  Loader2,
  LocateFixed,
  MapPin,
  Search
} from 'lucide-react';
import React, { useMemo } from 'react';
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
                MeetBy<span>Vibe</span>
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

          {/* Nav Actions - Right side of Search Bar: Fetched Current Location */}
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
        </div>
      </div>
    </header>
  );
};

export default PartnerNavbar;
