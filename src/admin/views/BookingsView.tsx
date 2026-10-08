import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Eye, 
  CheckCircle, 
  Ban
} from 'lucide-react';
import type { AdminBooking, BookingStatus } from '../types/admin.types';

interface BookingsViewProps {
  bookings: AdminBooking[];
  onViewBooking: (booking: AdminBooking) => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onViewBooking,
  onUpdateStatus
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch = 
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      (b.performer?.name && b.performer.name.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="admin-card">
      {/* Header with Filters */}
      <div className="admin-card-header">
        <div>
          <h2>Booking & Time Slot Reservations ({filteredBookings.length})</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Live bookings, scheduled performer hours, and QR payment verifications.
          </p>
        </div>

        <div className="admin-card-actions">
          {/* Search */}
          <div className="admin-search-wrapper">
            <Search size={14} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              style={{ width: '220px' }}
              placeholder="Search code, booker, artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Payment</option>
            <option value="PAYMENT_VERIFIED">Payment Verified</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking Code & Date</th>
              <th>Booker / Customer Info</th>
              <th>Performer Booked</th>
              <th>Slot Timing & Hours</th>
              <th>Total & QR Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No bookings found matching your filters.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id}>
                  {/* Code & Date */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '13px' }}>
                      {b.bookingCode}
                    </div>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                      {b.bookingDate}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      Booked: {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Booker info with exact DB avatar or No-Photo placeholder */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {b.customer?.avatarUrl || (b as any).avatarUrl ? (
                        <img
                          src={(b.customer?.avatarUrl || (b as any).avatarUrl)!}
                          alt={b.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10b981', flexShrink: 0 }}
                          title="Client Photo (Uploaded during booking)"
                        />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px dashed rgba(239, 68, 68, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#f87171',
                            fontSize: '10px',
                            fontWeight: 700,
                            flexShrink: 0
                          }}
                          title="No photo was uploaded during booking"
                        >
                          N/A
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#ffffff' }}>{b.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {b.phone} • <span style={{ color: b.gender === 'FEMALE' ? '#f472b6' : '#60a5fa' }}>{b.gender}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{b.email}</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      📍 {b.address}
                    </div>
                  </td>

                  {/* Performer */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={b.performer?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                        alt={b.performer?.name || 'Performer'}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ec4899', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ec4899', fontSize: '13px' }}>
                          {b.performer?.name || 'Artist'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          ₹{b.hourlyRate || 399}
                        </div>
                      </div>
                    </div>
                    {b.performer?.upiId && (
                      <div style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                        UPI: {b.performer.upiId}
                      </div>
                    )}
                  </td>

                  {/* Slot Timings */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500 }}>
                      <Clock size={13} color="#6366f1" />
                      <span>{b.durationHours} Hours Session</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      Venue: {b.eventAddress || b.city || 'Venue on request'}
                    </div>
                  </td>

                  {/* Total & QR Status */}
                  <td>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '15px' }}>
                      ₹{b.hourlyRate || b.totalAmount || 399}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`status-pill ${b.status}`}>{b.status}</span>
                    </div>
                    {b.payment?.utrNumber && (
                      <div style={{ fontSize: '10px', color: '#fbbf24', marginTop: '4px', fontFamily: 'monospace' }}>
                        UTR: {b.payment.utrNumber}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-admin-primary"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        title="View Full Booking & Payment Details"
                        onClick={() => onViewBooking(b)}
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>

                      {b.status === 'PENDING' || b.status === 'PAYMENT_VERIFIED' ? (
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '6px 8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                          title="Confirm Booking"
                          onClick={() => onUpdateStatus(b.id, 'CONFIRMED')}
                        >
                          <CheckCircle size={14} />
                        </button>
                      ) : null}

                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' ? (
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '6px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Cancel Booking"
                          onClick={() => onUpdateStatus(b.id, 'CANCELLED')}
                        >
                          <Ban size={14} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
