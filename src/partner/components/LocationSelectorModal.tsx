import { Loader2, MapPin, Navigation, RefreshCw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { fetchCurrentLocationViaOlaMaps } from '../../utils/olaMaps';

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
  const [activeStateName, setActiveStateName] = useState(selectedState);
  const [activeCityName, setActiveCityName] = useState(selectedCity);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFetchLiveLocation = async () => {
    setIsDetecting(true);
    try {
      const loc = await fetchCurrentLocationViaOlaMaps();
      if (loc.state) setActiveStateName(loc.state);
      if (loc.city) setActiveCityName(loc.city);
      setFormattedAddress(loc.formattedAddress || `${loc.city}, ${loc.state}`);
      setCoords({ lat: loc.latitude, lng: loc.longitude });
      onSelectLocation(loc.state || selectedState, loc.city || selectedCity);
    } catch (err) {
      console.warn('Location detection error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setActiveStateName(selectedState);
      setActiveCityName(selectedCity);
      handleFetchLiveLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectLocation(activeStateName, activeCityName);
    onClose();
  };

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e11d48'
            }}>
              <MapPin size={17} />
            </div>
            <div>
              <h3 className="partner-modal-title" style={{ fontSize: '16px', margin: 0 }}>
                Your Current Location
              </h3>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                Powered by Ola Maps Live GPS
              </div>
            </div>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="partner-modal-body" style={{ padding: '24px' }}>
          {/* Main Location Info Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              border: '1.5px solid #fecdd3',
              background: 'linear-gradient(145deg, #fff5f7 0%, #ffffff 100%)',
              boxShadow: '0 4px 16px rgba(225, 29, 72, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Live Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isDetecting ? '#f59e0b' : '#10b981',
                    boxShadow: isDetecting ? '0 0 8px #f59e0b' : '0 0 8px #10b981',
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {isDetecting ? 'Detecting via Ola Maps...' : 'Live GPS Detected'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#e11d48',
                  background: '#ffe4e6',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}
              >
                Ola Maps
              </span>
            </div>

            {/* City & State Display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#ff1379',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Navigation size={20} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  {isDetecting ? 'Locating...' : activeCityName}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e11d48', marginTop: '2px' }}>
                  {activeStateName || 'India'}
                </div>
              </div>
            </div>

            {/* Address if available */}
            {formattedAddress && !isDetecting && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px dashed #fecdd3',
                fontSize: '12.5px',
                color: '#475569',
                lineHeight: 1.4
              }}>
                📍 {formattedAddress}
              </div>
            )}

            {/* Coordinates if available */}
            {coords && !isDetecting && (
              <div style={{
                marginTop: '8px',
                fontSize: '11px',
                color: '#94a3b8',
                fontWeight: 500
              }}>
                GPS: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
              </div>
            )}
          </div>

          {/* Re-detect Button */}
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleFetchLiveLocation}
              disabled={isDetecting}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isDetecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {isDetecting ? (
                <Loader2 size={16} className="spin-animate" />
              ) : (
                <RefreshCw size={15} color="#e11d48" />
              )}
              <span>{isDetecting ? 'Detecting Current Location...' : 'Re-Detect Current Location'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="partner-modal-footer">
          <button type="button" className="btn-partner-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-partner-primary"
            onClick={handleApply}
            style={{
              background: 'linear-gradient(135deg, #ff1379 0%, #ff4b93 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <span>Confirm Location ({activeCityName})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectorModal;

