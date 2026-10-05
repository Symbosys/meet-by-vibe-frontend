import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  X,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ActiveTab } from '../types/admin.types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userCount: number;
  bookingCount: number;
  pendingCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userCount,
  bookingCount,
  pendingCount,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'users' as ActiveTab, label: 'User & Performer Models', icon: Users, badge: userCount },
    { id: 'bookings' as ActiveTab, label: 'Bookings & Slots', icon: CalendarCheck, badge: pendingCount > 0 ? `${pendingCount} Pending` : `${bookingCount}` },
    { id: 'payments' as ActiveTab, label: 'QR Payments & UTR', icon: QrCode },
  ];

  const handleItemClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <div className="admin-logo-badge">
            <Sparkles size={22} />
          </div>
          <div className="admin-brand-info">
            <h2>GarbaMitra</h2>
            <span>Admin Portal</span>
          </div>

          {/* Close button for mobile */}
          <button 
            className="admin-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="badge">{item.badge}</span>
                )}
                {isActive && <ChevronRight size={14} style={{ marginLeft: item.badge ? '4px' : 'auto' }} />}
              </button>
            );
          })}

          <div style={{ padding: '16px 8px 8px 8px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                background: 'rgba(255, 19, 121, 0.12)',
                border: '1px solid rgba(255, 19, 121, 0.3)',
                color: '#ff1379',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 19, 121, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 19, 121, 0.12)')}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span>
                <span>Partner Portal (Home)</span>
              </span>
              <ExternalLink size={14} />
            </button>
          </div>
        </nav>

        {/* Footer Profile */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-profile">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80" 
              alt="Super Admin" 
              className="admin-avatar-sm"
            />
            <div className="admin-user-meta">
              <span className="admin-user-name">Admin Control</span>
              <span className="admin-user-role">Super Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
