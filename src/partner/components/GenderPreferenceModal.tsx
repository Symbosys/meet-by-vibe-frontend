import React from 'react';
import { Sparkles, X, Heart, Users, UserCheck } from 'lucide-react';

interface GenderPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGender: 'MALE' | 'FEMALE' | 'ALL';
  onSelectGender: (gender: 'MALE' | 'FEMALE' | 'ALL') => void;
}

export const GenderPreferenceModal: React.FC<GenderPreferenceModalProps> = ({
  isOpen,
  onClose,
  selectedGender,
  onSelectGender,
}) => {
  if (!isOpen) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div
        className="partner-modal-card"
        style={{
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)',
          border: '1px solid rgba(255, 19, 121, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4a044e 100%)',
            padding: '24px 24px 20px',
            color: '#ffffff',
            position: 'relative',
            textAlign: 'center'
          }}
        >
          <button
            className="partner-round-arrow-btn"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff'
            }}
            title="Close"
          >
            <X size={16} />
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 19, 121, 0.25)',
              border: '1px solid rgba(255, 19, 121, 0.5)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '11.5px',
              fontWeight: 800,
              color: '#ff7eb6',
              marginBottom: '10px',
              letterSpacing: '0.5px'
            }}
          >
            <Sparkles size={13} color="#ff7eb6" />
            <span>WELCOME TO MEETBYVIBE</span>
          </div>

          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '22px',
              fontWeight: 800,
              margin: '0 0 6px',
              letterSpacing: '-0.3px',
              color: '#ffffff'
            }}
          >
            Who Are You Looking To Connect With?
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: '#cbd5e1',
              margin: 0,
              maxWidth: '420px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.4
            }}
          >
            Select your preferred partner category to view matching verified dancers & performers:
          </p>
        </div>

        {/* Modal Body with 2 Interactive Choice Cards */}
        <div style={{ padding: '24px 22px 18px', background: '#fdf4f8' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '18px'
            }}
          >
            {/* OPTION 1: Female Performers */}
            <div
              onClick={() => {
                onSelectGender('FEMALE');
                onClose();
              }}
              style={{
                background: selectedGender === 'FEMALE' ? '#fff1f2' : '#ffffff',
                border: selectedGender === 'FEMALE' ? '2.5px solid #ff1379' : '1.5px solid #fbcfe8',
                borderRadius: '18px',
                padding: '20px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedGender === 'FEMALE' ? '0 10px 25px rgba(255, 19, 121, 0.22)' : '0 4px 14px rgba(0,0,0,0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#ff1379';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 19, 121, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = selectedGender === 'FEMALE' ? '#ff1379' : '#fbcfe8';
                e.currentTarget.style.boxShadow = selectedGender === 'FEMALE' ? '0 10px 25px rgba(255, 19, 121, 0.22)' : '0 4px 14px rgba(0,0,0,0.04)';
              }}
            >
              {/* Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#ff1379',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                POPULAR
              </div>

              {/* Avatar Icon */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff1379 0%, #fb7185 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '12px',
                  boxShadow: '0 8px 18px rgba(255, 19, 121, 0.35)',
                  border: '3px solid #ffffff'
                }}
              >
                💃
              </div>

              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  margin: '0 0 4px'
                }}
              >
                Female
              </h3>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#ff1379',
                  marginBottom: '6px'
                }}
              >
                Dancers & Models
              </div>
              <p
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Chaniya Choli, Dodhiya & Raas partners
              </p>

              <div
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '8px 0',
                  background: '#ff1379',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Heart size={13} fill="#ffffff" />
                <span>Select Female</span>
              </div>
            </div>

            {/* OPTION 2: Male Performers */}
            <div
              onClick={() => {
                onSelectGender('MALE');
                onClose();
              }}
              style={{
                background: selectedGender === 'MALE' ? '#f0f9ff' : '#ffffff',
                border: selectedGender === 'MALE' ? '2.5px solid #0284c7' : '1.5px solid #bae6fd',
                borderRadius: '18px',
                padding: '20px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: selectedGender === 'MALE' ? '0 10px 25px rgba(2, 132, 199, 0.22)' : '0 4px 14px rgba(0,0,0,0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(2, 132, 199, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = selectedGender === 'MALE' ? '#0284c7' : '#bae6fd';
                e.currentTarget.style.boxShadow = selectedGender === 'MALE' ? '0 10px 25px rgba(2, 132, 199, 0.22)' : '0 4px 14px rgba(0,0,0,0.04)';
              }}
            >
              {/* Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                VERIFIED
              </div>

              {/* Avatar Icon */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '12px',
                  boxShadow: '0 8px 18px rgba(2, 132, 199, 0.35)',
                  border: '3px solid #ffffff'
                }}
              >
                🕺
              </div>

              <h3
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  margin: '0 0 4px'
                }}
              >
                Male
              </h3>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0284c7',
                  marginBottom: '6px'
                }}
              >
                Dancers & Models
              </div>
              <p
                style={{
                  fontSize: '11.5px',
                  color: '#64748b',
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Kurta Kediya, Dandiya & Choreographers
              </p>

              <div
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '8px 0',
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <UserCheck size={13} />
                <span>Select Male</span>
              </div>
            </div>
          </div>

          {/* Option to show all */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                onSelectGender('ALL');
                onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ff1379')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <Users size={14} />
              <span>Show All Performers (Both Male & Female)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
