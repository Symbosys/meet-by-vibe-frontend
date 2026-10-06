import { State } from 'country-state-city';
import {
  ChevronDown,
  MapPin,
  Search
} from 'lucide-react';
import React, { useMemo } from 'react';

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
}) => {
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default PartnerNavbar;
