import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  Eye, 
  CheckCircle, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { AdminBooking, BookingStatus } from '../types/admin.types';

interface BookingsViewProps {
  bookings: AdminBooking[];
  onViewBooking: (booking: AdminBooking) => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
  onDeleteBooking?: (booking: AdminBooking) => void;
}

// Helper to extract uploaded client photo from JSON image or avatar fields
function getBookingClientPhoto(b: AdminBooking): string | null {
  if (!b) return null;
  const img = b.image;
  if (img) {
    if (typeof img === 'string' && img.trim().length > 0) return img.trim();
    if (typeof img === 'object') {
      if (img.url && typeof img.url === 'string') return img.url;
      if (img.imageUrl && typeof img.imageUrl === 'string') return img.imageUrl;
      if (img.avatarUrl && typeof img.avatarUrl === 'string') return img.avatarUrl;
      if (Array.isArray(img) && img.length > 0) {
        const first = img[0];
        if (typeof first === 'string') return first;
        if (first?.url) return first.url;
        if (first?.imageUrl) return first.imageUrl;
      }
    }
  }
  if (b.avatarUrl && typeof b.avatarUrl === 'string' && b.avatarUrl.trim().length > 0) {
    return b.avatarUrl.trim();
  }
  if (b.customer?.avatarUrl && typeof b.customer.avatarUrl === 'string' && b.customer.avatarUrl.trim().length > 0) {
    return b.customer.avatarUrl.trim();
  }
  return null;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onViewBooking,
  onUpdateStatus,
  onDeleteBooking
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, pageSize]);

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch = 
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone.includes(search) ||
      (b.performer?.name && b.performer.name.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

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
              paginatedBookings.map((b) => (
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
                    {(() => {
                      const clientPhoto = getBookingClientPhoto(b);
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {clientPhoto ? (
                            <img
                              src={clientPhoto}
                              alt={b.name}
                              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #10b981', flexShrink: 0 }}
                              title="Client Photo (Uploaded during booking)"
                            />
                          ) : (
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
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
                      );
                    })()}
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

                      {onDeleteBooking && (
                        <button
                          className="btn-admin-secondary"
                          style={{ padding: '6px 8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Delete Booking"
                          onClick={() => onDeleteBooking(b)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalItems > 0 && (
        <div className="admin-pagination">
          <div className="admin-pagination-info">
            Showing <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> of <strong>{totalItems}</strong> bookings
            <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '14px', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Per page:</span>
              <select
                className="admin-select"
                style={{ height: '28px', padding: '0 6px', fontSize: '11px' }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="admin-pagination-controls">
            <button
              className="admin-page-btn"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - safeCurrentPage) <= 1;
              })
              .map((page, idx, arr) => {
                const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span style={{ color: '#64748b', padding: '0 4px', fontSize: '12px' }}>...</span>
                    )}
                    <button
                      className={`admin-page-btn ${page === safeCurrentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="admin-page-btn"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              title="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
