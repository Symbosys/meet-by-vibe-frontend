import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  IndianRupee, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck 
} from 'lucide-react';
import type { AdminUser, AdminBooking, ActiveTab } from '../types/admin.types';
import { StatsCard } from '../components/StatsCard';

interface OverviewViewProps {
  users: AdminUser[];
  bookings: AdminBooking[];
  setActiveTab: (tab: ActiveTab) => void;
  onViewBooking: (b: AdminBooking) => void;
  onViewUser: (u: AdminUser) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  users,
  bookings,
  setActiveTab,
  onViewBooking,
  onViewUser
}) => {
  const performers = users.filter(u => u.role === 'PERFORMER');
  const pendingBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'PAYMENT_VERIFIED');
  
  const totalRevenue = bookings.reduce((sum, b) => {
    return b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? sum + b.totalAmount : sum;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Metric Cards */}
      <div className="admin-stats-grid">
        <StatsCard
          label="Total Revenue Collected"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          trend="+18.4% this week"
          color="#10b981"
        />
        <StatsCard
          label="Total Bookings"
          value={bookings.length}
          icon={CalendarCheck}
          trend={`${pendingBookings.length} pending QR verify`}
          color="#6366f1"
        />
        <StatsCard
          label="Registered Performers & Dancers"
          value={performers.length}
          icon={Sparkles}
          trend={`${performers.filter(p => p.isAvailable).length} available right now`}
          color="#f59e0b"
        />
        <StatsCard
          label="Total User Base"
          value={users.length}
          icon={Users}
          trend="100% active database"
          color="#ec4899"
        />
      </div>

      {/* Quick Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(99, 102, 241, 0.12))',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 700 }}>
            Navratri Performer Booking Engine Ready 🚀
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Instant QR code payments with 15-minute slot lock and anti-collision checking enabled.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-admin-primary" onClick={() => setActiveTab('bookings')}>
            <span>Manage Bookings ({bookings.length})</span>
            <ArrowUpRight size={15} />
          </button>
          <button className="btn-admin-secondary" onClick={() => setActiveTab('users')}>
            <span>View All Performers</span>
          </button>
        </div>
      </div>

      {/* Grid: Recent Bookings & Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Bookings Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Performer Bookings</h2>
            <button className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveTab('bookings')}>
              View All
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Performer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => onViewBooking(b)}>
                    <td>
                      <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: '12px' }}>{b.bookingCode}</span>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.bookingDate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.phone}</div>
                    </td>
                    <td>{b.performer?.name || 'Artist'}</td>
                    <td>
                      <strong style={{ color: '#10b981' }}>₹{b.totalAmount}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${b.status}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performer Models Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Rated Performers</h2>
            <button className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveTab('users')}>
              View All
            </button>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {performers.slice(0, 4).map((p) => (
              <div 
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onClick={() => onViewUser(p)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={p.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {p.name}
                      {p.isVerified && <ShieldCheck size={14} color="#10b981" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {p.city} • {p.danceStyles.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '14px' }}>₹{p.hourlyRate}/hr</div>
                  <div style={{ fontSize: '11px', color: '#10b981' }}>⭐ {p.rating} ({p.totalBookingsDone} bookings)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
