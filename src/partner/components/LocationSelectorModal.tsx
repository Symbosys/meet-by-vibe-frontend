import React, { useState, useMemo, useEffect } from 'react';
import { X, MapPin, Check, Search } from 'lucide-react';
import { State, City } from 'country-state-city';

interface LocationSelectorModalProps {
  isOpen: boolean;
  selectedState: string;
  selectedCity: string;
  onClose: () => void;
  onSelectLocation: (state: string, city: string) => void;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  selectedState,
  selectedCity,
  onClose,
  onSelectLocation,
}) => {
  // All Indian States from country-state-city
  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);

  // Find initial state object
  const initialStateObj = useMemo(() => {
    return (
      indianStates.find((s) => s.name.toLowerCase() === selectedState.toLowerCase()) ||
      indianStates.find((s) => s.isoCode === 'GJ') ||
      indianStates[0]
    );
  }, [indianStates, selectedState]);

  const [activeStateObj, setActiveStateObj] = useState(initialStateObj);
  const [activeCityName, setActiveCityName] = useState(selectedCity);
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      const match = indianStates.find((s) => s.name.toLowerCase() === selectedState.toLowerCase()) || initialStateObj;
      setActiveStateObj(match);
      setActiveCityName(selectedCity);
      setStateSearch('');
      setCitySearch('');
    }
  }, [isOpen, selectedState, selectedCity, indianStates, initialStateObj]);

  // Cities for the active state from country-state-city
  const citiesOfState = useMemo(() => {
    if (!activeStateObj) return [];
    return City.getCitiesOfState('IN', activeStateObj.isoCode);
  }, [activeStateObj]);

  // Filtered States
  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return indianStates;
    return indianStates.filter((s) =>
      s.name.toLowerCase().includes(stateSearch.toLowerCase().trim())
    );
  }, [indianStates, stateSearch]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return citiesOfState;
    return citiesOfState.filter((c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase().trim())
    );
  }, [citiesOfState, citySearch]);

  if (!isOpen) return null;

  const handleStateSelect = (stateObj: typeof indianStates[0]) => {
    setActiveStateObj(stateObj);
    const stateCities = City.getCitiesOfState('IN', stateObj.isoCode);
    if (stateCities.length > 0) {
      setActiveCityName(stateCities[0].name);
    } else {
      setActiveCityName(stateObj.name);
    }
    setCitySearch('');
  };

  const handleApply = () => {
    if (activeStateObj) {
      onSelectLocation(activeStateObj.name, activeCityName);
    }
    onClose();
  };

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '580px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Select Festival State & City</h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="partner-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          {/* 1. State Selector with country-state-city */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Select State ({indianStates.length} Indian States)
              </label>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ff1379' }}>
                Selected: {activeStateObj?.name}
              </span>
            </div>

            {/* State Search Bar */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search state (e.g. Gujarat, Maharashtra, Jharkhand)..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            {/* State Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto', padding: '4px 2px' }}>
              {filteredStates.map((st) => {
                const isSelected = activeStateObj?.isoCode === st.isoCode;
                return (
                  <button
                    key={st.isoCode}
                    type="button"
                    onClick={() => handleStateSelect(st)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #ff1379' : '1px solid #cbd5e1',
                      background: isSelected ? '#fff0f6' : '#ffffff',
                      color: isSelected ? '#ff1379' : '#334155',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st.name} ({st.isoCode})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. City Selector with country-state-city */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                2. Select City ({citiesOfState.length} in {activeStateObj?.name})
              </label>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                Selected: {activeCityName}
              </span>
            </div>

            {/* City Search Bar */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={`Search city in ${activeStateObj?.name || 'state'}...`}
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  paddingLeft: '34px',
                  paddingRight: '12px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            {/* City Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '4px 2px' }}>
              {filteredCities.length === 0 ? (
                <div style={{ gridColumn: 'span 2', padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No cities found for this search.
                </div>
              ) : (
                filteredCities.map((ct) => {
                  const isSelected = activeCityName.toLowerCase() === ct.name.toLowerCase();
                  return (
                    <div
                      key={ct.name}
                      onClick={() => setActiveCityName(ct.name)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #ff1379' : '1px solid #e2e8f0',
                        background: isSelected ? '#fff0f6' : '#f8fafc',
                        color: isSelected ? '#ff1379' : '#0f172a',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🏙️ {ct.name}
                      </span>
                      {isSelected && <Check size={15} color="#ff1379" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="partner-modal-footer">
          <button type="button" className="btn-partner-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-partner-primary" onClick={handleApply}>
            <span>Set Location ({activeCityName}, {activeStateObj?.isoCode})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

