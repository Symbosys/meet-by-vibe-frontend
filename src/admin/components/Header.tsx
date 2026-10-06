import React from 'react';
import { Search, Bell, ShieldCheck, Menu } from 'lucide-react';
import type { ActiveTab } from '../types/admin.types';

interface HeaderProps {
  activeTab: ActiveTab;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  onToggleSidebar
}) => {
  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    users: {
      title: 'User & Performer Models',
      subtitle: 'Manage dancer profiles, height, dance styles, and hourly rates.'
    },
    events: {
      title: 'Garba & Dandiya Events',
      subtitle: 'Create Navratri Mahotsavs, configure ticket passes, timing & venue details.'
    },
    bookings: {
      title: 'Booking & Slot Management',
      subtitle: 'Track reservations, timing slots, and QR payment confirmations.'
    },
    payments: {
      title: 'QR Code Payments & UTR Audit',
      subtitle: 'Verify UPI payments, bank UTR numbers, and dynamic QR transactions.'
    }
  };

  const current = titles[activeTab] || titles.users;

  return (
    <header className="admin-header">
      {/* Left section: Hamburger (Mobile) + Titles */}
      <div className="admin-header-left">
        <button 
          className="admin-menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <div className="admin-header-title">
          <h1>{current.title}</h1>
          <p className="admin-header-subtitle">{current.subtitle}</p>
        </div>
      </div>

      {/* Right section: Search bar + Status + Notifications */}
      <div className="admin-header-actions">
        <div className="admin-search-wrapper">
          <Search size={15} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-admin-secondary admin-icon-btn" title="System Notifications">
          <Bell size={16} />
        </button>

        <div className="admin-status-badge">
          <ShieldCheck size={15} />
          <span>DB Synced</span>
        </div>
      </div>
    </header>
  );
};
