import React from 'react';
import { Users, Heart, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import type { PartnerStats } from '../types/partner.types';

interface StatsRowProps {
  stats: PartnerStats;
  onSelectStat: (type: 'requests' | 'matches' | 'messages' | 'events') => void;
}

export const StatsRow: React.FC<StatsRowProps> = ({ stats, onSelectStat }) => {
  return (
    <div className="partner-stats-grid">
      {/* 1. Partner Requests */}
      <div className="partner-stat-card" onClick={() => onSelectStat('requests')}>
        <div className="partner-stat-left">
          <div className="partner-stat-icon-box pink">
            <Users size={22} />
          </div>
          <div>
            <div className="partner-stat-value">{stats.partnerRequests}</div>
            <div className="partner-stat-label">Partner Requests</div>
          </div>
        </div>
        <ChevronRight size={18} className="partner-stat-arrow" />
      </div>

      {/* 2. Matches */}
      <div className="partner-stat-card" onClick={() => onSelectStat('matches')}>
        <div className="partner-stat-left">
          <div className="partner-stat-icon-box purple">
            <Heart size={22} fill="#ffffff" />
          </div>
          <div>
            <div className="partner-stat-value">{stats.matches}</div>
            <div className="partner-stat-label">Matches</div>
          </div>
        </div>
        <ChevronRight size={18} className="partner-stat-arrow" />
      </div>

      {/* 3. New Messages */}
      <div className="partner-stat-card" onClick={() => onSelectStat('messages')}>
        <div className="partner-stat-left">
          <div className="partner-stat-icon-box blue">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="partner-stat-value">{stats.newMessages}</div>
            <div className="partner-stat-label">New Messages</div>
          </div>
        </div>
        <ChevronRight size={18} className="partner-stat-arrow" />
      </div>

      {/* 4. Upcoming Events */}
      <div className="partner-stat-card" onClick={() => onSelectStat('events')}>
        <div className="partner-stat-left">
          <div className="partner-stat-icon-box orange">
            <Calendar size={22} />
          </div>
          <div>
            <div className="partner-stat-value">{stats.upcomingEvents}</div>
            <div className="partner-stat-label">Upcoming Events</div>
          </div>
        </div>
        <ChevronRight size={18} className="partner-stat-arrow" />
      </div>
    </div>
  );
};
