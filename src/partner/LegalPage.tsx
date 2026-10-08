import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Scale, Lock, AlertCircle, CheckCircle, Mail, MapPin } from 'lucide-react';
import { PartnerNavbar } from './components/PartnerNavbar';
import { PartnerFooter } from './components/PartnerFooter';

export const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTerms = location.pathname.includes('terms');
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(isTerms ? 'terms' : 'privacy');

  useEffect(() => {
    if (location.pathname.includes('terms')) {
      setActiveTab('terms');
    } else {
      setActiveTab('privacy');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="partner-portal" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0d14' }}>
      <PartnerNavbar
        searchQuery=""
        onSearchChange={() => {}}
        selectedState="Jharkhand"
        selectedCity="Ranchi"
        isLocating={false}
        locationDetected={false}
        onDetectLocation={() => {}}
        onOpenLocationModal={() => {}}
        onOpenNotifications={() => {}}
        onOpenMessages={() => {}}
        onSwitchToAdmin={() => navigate('/admin')}
        onRegisterEvent={() => navigate('/create-event')}
      />

      <main className="legal-page-main">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="legal-back-btn"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        {/* Header Hero Box */}
        <div className="legal-hero-card">
          <div className="legal-hero-badge">
            <div className="legal-badge-icon">
              {activeTab === 'privacy' ? <ShieldCheck size={20} /> : <Scale size={20} />}
            </div>
            <span className="legal-badge-tag">
              MeetByVibe Legal Center
            </span>
          </div>

          <h1 className="legal-hero-title">
            {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </h1>
          <p className="legal-hero-subtitle">
            Last Updated: October 2026 • Official Platform Policies for India
          </p>

          {/* Quick Toggle Tabs */}
          <div className="legal-tabs-row">
            <button
              onClick={() => {
                setActiveTab('privacy');
                navigate('/privacy-policy', { replace: true });
              }}
              className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : 'inactive'}`}
            >
              <Lock size={14} />
              <span>Privacy Policy</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('terms');
                navigate('/terms-of-service', { replace: true });
              }}
              className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : 'inactive'}`}
            >
              <Scale size={14} />
              <span>Terms of Service</span>
            </button>
          </div>
        </div>

        {/* Policy Content Card */}
        <div className="legal-doc-card">
          {activeTab === 'privacy' ? (
            <div>
              <div className="legal-intro-banner">
                <ShieldCheck size={22} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '15px', fontWeight: 800 }}>
                    Our Privacy Commitment
                  </h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
                    At <strong>MeetByVibe</strong>, your personal safety, data integrity, and privacy are paramount. We never sell your personal information or disclose private contact details without your explicit consent.
                  </p>
                </div>
              </div>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  1. Introduction & Scope
                </h3>
                <p>
                  MeetByVibe ("we", "us", "our") operates the platform <strong>MeetByVibe</strong> designed to connect festival enthusiasts, cultural dancers, and performers for public Navratri, Garba, Dandiya, and festive gatherings across India. This Privacy Policy outlines our practices concerning data collection, storage, and user privacy protection in accordance with India's <em>Information Technology Act, 2000</em> and the <em>Digital Personal Data Protection Act (DPDP)</em>.
                </p>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  2. 18+ Age Eligibility Restriction
                </h3>
                <p>
                  MeetByVibe is strictly an <strong>18+ community</strong>. We do not knowingly collect personal data from anyone under the age of 18. If we discover an account created by an underage individual, it will be immediately deactivated and all related data purged from our servers.
                </p>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  3. Information We Collect
                </h3>
                <ul className="legal-list">
                  <li>
                    <strong>Profile Information:</strong> Full name, verified phone number, gender, date of birth, bio, dance styles (e.g. Traditional Garba, Dodhiya, Bollywood Dandiya), skill level, and authentic profile photos.
                  </li>
                  <li>
                    <strong>Performer & Booking Data:</strong> Hourly booking rates, dance achievements, UPI ID (for direct payout settlement), and booking inquiry records.
                  </li>
                  <li>
                    <strong>Location Information:</strong> City, state, and pincode/neighborhood coordinates (via Ola Maps API or device location) to suggest nearby dancing partners, garba venues, and local hubs.
                  </li>
                  <li>
                    <strong>Device & Technical Logs:</strong> IP address, device model, operating system, and session tokens to maintain security and prevent unauthorized access.
                  </li>
                </ul>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  4. How We Use Your Information
                </h3>
                <p>Your collected information is strictly utilized to:</p>
                <ul className="legal-list">
                  <li>Accurately match you with compatible dance partners based on preferred city, dance styles, and events.</li>
                  <li>Enable clients and event organizers to review and book verified Garba performers.</li>
                  <li>Verify accounts to combat bots, spam, and fraudulent profiles.</li>
                  <li>Send transactional alerts, booking confirmation SMS/notifications, and safety updates.</li>
                </ul>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  5. Public Visibility vs. Private Data
                </h3>
                <div className="legal-info-card">
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>Visible on your Public Profile:</p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                    First name, age, gender, city/state, profile gallery, dance style tags, skill level badge, and performer rates (if registered as a performer).
                  </p>
                </div>
                <div className="legal-info-card">
                  <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f172a' }}>Strictly Confidential & Never Publicized:</p>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b' }}>
                    Exact home address, private phone number, exact birthdate, UPI security PIN, and private chat histories.
                  </p>
                </div>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  6. Data Security & Storage
                </h3>
                <p>
                  All database communications use TLS 1.3 cryptographic protocols. Passwords and sensitive tokens are hashed using bcrypt. Our cloud servers are safeguarded behind strict enterprise firewalls with continuous intrusion monitoring.
                </p>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  7. Your Rights & Account Deletion
                </h3>
                <p>
                  You retain full control over your personal data. You may update your profile details, toggle profile availability (online/offline status), or request permanent deletion of your account and all associated media by contacting our team.
                </p>
              </section>

              <section style={{ marginBottom: '10px' }}>
                <h3 className="legal-section-title">
                  8. Contact & Grievance Redressal
                </h3>
                <p style={{ margin: '0 0 12px' }}>
                  For any privacy inquiries, grievance reporting, or data deletion requests, reach out to our appointed Grievance Officer:
                </p>
                <div className="legal-contact-wrap">
                  <div className="legal-contact-item">
                    <Mail size={16} color="#ff1379" style={{ flexShrink: 0 }} />
                    <span><strong>Email:</strong> support@meetbyvibe.com / grievance@meetbyvibe.com</span>
                  </div>
                  <div className="legal-contact-item">
                    <MapPin size={16} color="#ff1379" style={{ flexShrink: 0 }} />
                    <span><strong>Headquarters:</strong> MeetByVibe Technologies, Ranchi & Ahmedabad, India</span>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div>
              <div className="legal-intro-banner">
                <Scale size={22} color="#ff1379" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontSize: '15px', fontWeight: 800 }}>
                    Welcome to MeetByVibe
                  </h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#475569' }}>
                    Please read these Terms of Service carefully before utilizing our festival partner discovery and performer booking services. By using MeetByVibe, you agree to these legally binding terms.
                  </p>
                </div>
              </div>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  1. Acceptance & Agreement
                </h3>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of <strong>MeetByVibe</strong>, our website, and associated applications. If you do not agree to these terms in their entirety, you must not access or use the platform.
                </p>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  2. Eligibility & Community Rules (Strict 18+)
                </h3>
                <ul className="legal-list">
                  <li>
                    <strong>Age Requirement:</strong> You must be at least 18 years old to create an account or book performers on MeetByVibe.
                  </li>
                  <li>
                    <strong>Authenticity:</strong> You agree to provide true, current, and verifiable information including authentic photos of yourself. Impersonation of other individuals is strictly prohibited.
                  </li>
                  <li>
                    <strong>Single Account:</strong> Each user is permitted one active profile. Duplicate or abusive bot accounts will be permanently banned.
                  </li>
                </ul>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  3. Code of Conduct & Zero Tolerance Policy
                </h3>
                <p>
                  MeetByVibe is committed to fostering a safe, joyous, and celebratory environment for Indian festival lovers. We enforce a <strong>strict Zero-Tolerance Policy</strong> against:
                </p>
                <div className="legal-alert-grid">
                  <div className="legal-alert-item">
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span>Harassment, stalking, intimidation, or inappropriate sexual advances.</span>
                  </div>
                  <div className="legal-alert-item">
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span>Hate speech, discrimination based on caste, religion, gender, or appearance.</span>
                  </div>
                  <div className="legal-alert-item">
                    <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                    <span>Solicitation of illegal activities, commercial spam, or unauthorized financial extortion.</span>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  4. Performer Booking & Financial Terms
                </h3>
                <ul className="legal-list">
                  <li>
                    <strong>Facilitator Role:</strong> MeetByVibe serves as a discovery and booking connection facilitator between clients/organizers and independent performers or choreographers.
                  </li>
                  <li>
                    <strong>Rates & Payments:</strong> Hourly rates and session fees listed on performer profiles are transparently presented. Payment settlements, UPI transfers, and booking deposits are confirmed directly between the booking party and the performer.
                  </li>
                  <li>
                    <strong>Cancellation & No-Show:</strong> Bookings cancelled less than 6 hours prior to an event schedule may be subject to non-refundable advance fee policies set by the performer.
                  </li>
                </ul>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  5. Safety & Meeting Guidelines
                </h3>
                <p>
                  For the safety of all dancers:
                </p>
                <div className="legal-safety-box">
                  <div className="legal-safety-row">
                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>Always meet in public, authorized Garba and festival grounds.</span>
                  </div>
                  <div className="legal-safety-row">
                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>Inform your friends or family of your event plans and venue coordinates.</span>
                  </div>
                  <div className="legal-safety-row">
                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>Use the in-app Report button immediately if anyone displays suspicious behavior.</span>
                  </div>
                </div>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  6. Intellectual Property
                </h3>
                <p>
                  All trademarks, logos (including MeetByVibe logo), graphics, user interface designs, and code are the exclusive intellectual property of MeetByVibe. Users retain ownership of their uploaded profile photos, granting MeetByVibe a non-exclusive license to display them for service discovery purposes.
                </p>
              </section>

              <section className="legal-section">
                <h3 className="legal-section-title">
                  7. Disclaimer & Limitation of Liability
                </h3>
                <p>
                  MeetByVibe provides its matching and booking platform on an "as is" and "as available" basis. While we strive for rigorous profile verification, users are expected to exercise personal judgment and precaution during offline festival interactions.
                </p>
              </section>

              <section style={{ marginBottom: '10px' }}>
                <h3 className="legal-section-title">
                  8. Governing Law & Dispute Resolution
                </h3>
                <p>
                  These Terms shall be construed in accordance with and governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts in Ranchi / Ahmedabad, India.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>

      <PartnerFooter selectedCity="Ranchi" />
    </div>
  );
};
