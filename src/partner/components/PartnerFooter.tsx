import React from 'react';
import { Link } from 'react-router-dom';

interface PartnerFooterProps {
  selectedCity?: string;
  onNavigateSection?: (section: string) => void;
}

export const PartnerFooter: React.FC<PartnerFooterProps> = () => {
  return (
    <footer className="partner-footer">
      <div className="partner-container">
        {/* Footer Top Columns */}
        <div className="partner-footer-top">
          {/* Brand Info Left */}
          <div className="partner-footer-brand">
            <div className="partner-footer-brand-logo">
              <div className="partner-brand-logo-wrap" style={{ background: '#ffffff', border: '1.5px solid #ff1379' }}>
                <img 
                  src="/MeetByVibe_logo.png" 
                  alt="MeetByVibe Logo" 
                  className="partner-brand-logo-img" 
                />
              </div>
              <div className="partner-brand-text">
                <div className="partner-brand-name" style={{ color: '#ffffff' }}>
                  MeetBy<span style={{ color: '#ff1379' }}>Vibe</span>
                </div>
                <div className="partner-brand-tagline" style={{ color: '#ff1379' }}>
                  No Partner? We've Got You.
                </div>
              </div>
            </div>

            <p className="partner-footer-desc">
              MeetByVibe is India's premier festival partner discovery platform. We connect verified dancers for public Garba, Dandiya, and Navratri celebrations.
            </p>

            <div className="partner-18-badge">
              <span style={{ color: '#ff1379', fontWeight: 800 }}>18+</span>
              <span>18+ Festival Community</span>
            </div>
          </div>


          {/* Col 3: Legal */}
          <div className="partner-footer-col">
            <h4>Legal</h4>
            <ul className="partner-footer-links">
              <li>
                <Link to="/privacy-policy" className="partner-footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="partner-footer-link">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="partner-footer-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Made with</span>
            <span style={{ color: '#ff1379' }}>❤️</span>
            <span>for Indian Festival Lovers across the nation</span>
          </div>

          {/* Social Icons */}
          <div className="partner-footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="partner-social-icon" title="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="partner-social-icon" title="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="partner-social-icon" title="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <path d="m10 15 5-3-5-3z" />
              </svg>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>© 2026 GarbaMitra. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
