import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, AlertCircle, CheckCircle, Scale, Mail, MapPin } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="partner-modal-container legal-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '850px',
          width: '94%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px',
          background: '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div 
          className="legal-modal-header"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 19, 121, 0.15)',
                border: '1.5px solid #ff1379',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff1379',
              }}
            >
              {activeTab === 'privacy' ? <ShieldCheck size={22} /> : <FileText size={22} />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                MeetBy<span style={{ color: '#ff1379' }}>Vibe</span> Legal Center
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Last updated: October 2026 • Official Platform Policies
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="partner-modal-close-btn"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div 
          className="legal-tab-selector"
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            padding: '4px 20px 0',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              border: 'none',
              borderBottom: activeTab === 'privacy' ? '2.5px solid #ff1379' : '2.5px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'privacy' ? '#ff1379' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Lock size={15} />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              border: 'none',
              borderBottom: activeTab === 'terms' ? '2.5px solid #ff1379' : '2.5px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '14px',
              color: activeTab === 'terms' ? '#ff1379' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Scale size={15} />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div 
          className="legal-modal-body"
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: 1.7,
            color: '#334155',
            flex: 1,
          }}
        >
          {activeTab === 'privacy' ? (
            /* ==================== PRIVACY POLICY ==================== */
            <div className="legal-content-wrapper">
              <div 
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 19, 121, 0.06) 0%, rgba(255, 19, 121, 0.01) 100%)',
                  border: '1px solid rgba(255, 19, 121, 0.2)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={20} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '14px', fontWeight: 800 }}>
                    Our Privacy Commitment
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    At <strong>MeetByVibe</strong>, your personal safety, data integrity, and privacy are paramount. We never sell your personal information or disclose private contact details without your explicit consent.
                  </p>
                </div>
              </div>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  1. Introduction & Scope
                </h3>
                <p>
                  MeetByVibe ("we", "us", "our") operates the platform <strong>MeetByVibe</strong> designed to connect festival enthusiasts, cultural dancers, and performers for public Navratri, Garba, Dandiya, and festive gatherings across India. This Privacy Policy outlines our practices concerning data collection, storage, and user privacy protection in accordance with India's <em>Information Technology Act, 2000</em> and the <em>Digital Personal Data Protection Act (DPDP)</em>.
                </p>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  2. 18+ Age Eligibility Restriction
                </h3>
                <p>
                  MeetByVibe is strictly an <strong>18+ community</strong>. We do not knowingly collect personal data from anyone under the age of 18. If we discover an account created by an underage individual, it will be immediately deactivated and all related data purged from our servers.
                </p>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  3. Information We Collect
                </h3>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Profile Information:</strong> Full name, verified phone number, gender, date of birth, bio, dance styles (e.g. Traditional Garba, Dodhiya, Bollywood Dandiya), skill level, and authentic profile photos.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Performer & Booking Data:</strong> Hourly booking rates, dance achievements, UPI ID (for direct payout settlement), and booking inquiry records.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Location Information:</strong> City, state, and pincode/neighborhood coordinates (via Ola Maps API or device location) to suggest nearby dancing partners, garba venues, and local hubs.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Device & Technical Logs:</strong> IP address, device model, operating system, and session tokens to maintain security and prevent unauthorized access.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  4. How We Use Your Information
                </h3>
                <p>Your collected information is strictly utilized to:</p>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>Accurately match you with compatible dance partners based on preferred city, dance styles, and events.</li>
                  <li>Enable clients and event organizers to review and book verified Garba performers.</li>
                  <li>Verify accounts to combat bots, spam, and fraudulent profiles.</li>
                  <li>Send transactional alerts, booking confirmation SMS/notifications, and safety updates.</li>
                </ul>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  5. Public Visibility vs. Private Data
                </h3>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>Visible on your Public Profile:</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    First name, age, gender, city/state, profile gallery, dance style tags, skill level badge, and performer rates (if registered as a performer).
                  </p>
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>Strictly Confidential & Never Publicized:</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Exact home address, private phone number, exact birthdate, UPI security PIN, and private chat histories.
                  </p>
                </div>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  6. Data Security & Storage
                </h3>
                <p>
                  All database communications use TLS 1.3 cryptographic protocols. Passwords and sensitive tokens are hashed using bcrypt. Our cloud servers are safeguarded behind strict enterprise firewalls with continuous intrusion monitoring.
                </p>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  7. Your Rights & Account Deletion
                </h3>
                <p>
                  You retain full control over your personal data. You may update your profile details, toggle profile availability (online/offline status), or request permanent deletion of your account and all associated media by contacting our team.
                </p>
              </section>

              <section style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  8. Contact & Grievance Redressal
                </h3>
                <p style={{ margin: '0 0 10px' }}>
                  For any privacy inquiries, grievance reporting, or data deletion requests, reach out to our appointed Grievance Officer:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#f1f5f9', padding: '12px 16px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Mail size={15} color="#ff1379" />
                    <span><strong>Email:</strong> support@meetbyvibe.com / grievance@meetbyvibe.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <MapPin size={15} color="#ff1379" />
                    <span><strong>Headquarters:</strong> MeetByVibe Technologies, Ranchi & Ahmedabad, India</span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* ==================== TERMS OF SERVICE ==================== */
            <div className="legal-content-wrapper">
              <div 
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 19, 121, 0.06) 0%, rgba(255, 19, 121, 0.01) 100%)',
                  border: '1px solid rgba(255, 19, 121, 0.2)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Scale size={20} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '14px', fontWeight: 800 }}>
                    Welcome to MeetByVibe
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
                    Please read these Terms of Service carefully before utilizing our festival partner discovery and performer booking services. By using MeetByVibe, you agree to these legally binding terms.
                  </p>
                </div>
              </div>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  1. Acceptance & Agreement
                </h3>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of <strong>MeetByVibe</strong>, our website, and associated applications. If you do not agree to these terms in their entirety, you must not access or use the platform.
                </p>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  2. Eligibility & Community Rules (Strict 18+)
                </h3>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Age Requirement:</strong> You must be at least 18 years old to create an account or book performers on MeetByVibe.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Authenticity:</strong> You agree to provide true, current, and verifiable information including authentic photos of yourself. Impersonation of other individuals is strictly prohibited.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Single Account:</strong> Each user is permitted one active profile. Duplicate or abusive bot accounts will be permanently banned.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  3. Code of Conduct & Zero Tolerance Policy
                </h3>
                <p>
                  MeetByVibe is committed to fostering a safe, joyous, and celebratory environment for Indian festival lovers. We enforce a <strong>strict Zero-Tolerance Policy</strong> against:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff1f2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#9f1239' }}>Harassment, stalking, intimidation, or inappropriate sexual advances.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff1f2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#9f1239' }}>Hate speech, discrimination based on caste, religion, gender, or appearance.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff1f2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: '#9f1239' }}>Solicitation of illegal activities, commercial spam, or unauthorized financial extortion.</span>
                  </div>
                </div>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  4. Performer Booking & Financial Terms
                </h3>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Facilitator Role:</strong> MeetByVibe serves as a discovery and booking connection facilitator between clients/organizers and independent performers or choreographers.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Rates & Payments:</strong> Hourly rates and session fees listed on performer profiles are transparently presented. Payment settlements, UPI transfers, and booking deposits are confirmed directly between the booking party and the performer.
                  </li>
                  <li style={{ marginBottom: '6px' }}>
                    <strong>Cancellation & No-Show:</strong> Bookings cancelled less than 6 hours prior to an event schedule may be subject to non-refundable advance fee policies set by the performer.
                  </li>
                </ul>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  5. Safety & Meeting Guidelines
                </h3>
                <p>
                  For the safety of all dancers:
                </p>
                <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Always meet in public, authorized Garba and festival grounds.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Inform your friends or family of your event plans and venue coordinates.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Use the in-app Report button immediately if anyone displays suspicious behavior.</span>
                  </div>
                </div>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  6. Intellectual Property
                </h3>
                <p>
                  All trademarks, logos (including MeetByVibe logo), graphics, user interface designs, and code are the exclusive intellectual property of MeetByVibe. Users retain ownership of their uploaded profile photos, granting MeetByVibe a non-exclusive license to display them for service discovery purposes.
                </p>
              </section>

              <section style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  7. Disclaimer & Limitation of Liability
                </h3>
                <p>
                  MeetByVibe provides its matching and booking platform on an "as is" and "as available" basis. While we strive for rigorous profile verification, users are expected to exercise personal judgment and precaution during offline festival interactions.
                </p>
              </section>

              <section style={{ marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  8. Governing Law & Dispute Resolution
                </h3>
                <p>
                  These Terms shall be construed in accordance with and governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Ranchi / Ahmedabad, India.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div 
          className="legal-modal-footer"
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748b' }}>
            <CheckCircle size={15} color="#10b981" />
            <span>Official & Verified MeetByVibe Legal Policy</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 22px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ff1379')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
