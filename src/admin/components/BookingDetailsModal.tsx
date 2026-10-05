import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileCheck,
  Ban
} from 'lucide-react';
import type { AdminBooking, BookingStatus } from '../types/admin.types';

interface BookingDetailsModalProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (bookingId: string, newStatus: BookingStatus) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                {booking.bookingCode}
              </span>
              <span className={`status-pill ${booking.status}`}>{booking.status}</span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
          <button className="btn-admin-secondary" style={{ padding: '6px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Booker / Customer Snapshot */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.5px' }}>
              Booker / Customer Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Name:</span> <strong style={{ color: '#fff' }}>{booking.name}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Gender:</span> <strong style={{ color: '#fff' }}>{booking.gender}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Phone:</span> <strong style={{ color: '#fff' }}>{booking.phone}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Email:</span> <strong style={{ color: '#fff' }}>{booking.email}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#94a3b8' }}>Address:</span> <strong style={{ color: '#fff' }}>{booking.address}</strong>
              </div>
            </div>
          </div>

          {/* Performer & Slot Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', color: '#ec4899', letterSpacing: '0.5px' }}>
                Performer Booked
              </h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>
                {booking.performer?.name || 'Performer'}
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8' }}>
                UPI ID: <span style={{ color: '#38bdf8' }}>{booking.performer?.upiId || 'Not set'}</span>
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Rate: <strong style={{ color: '#fff' }}>₹{booking.hourlyRate}/hr</strong>
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.5px' }}>
                Schedule & Timings
              </h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#f59e0b" />
                <span>{booking.bookingDate}</span>
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#6366f1" />
                <span>{booking.durationHours} Hours Duration</span>
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#ef4444" />
                <span>{booking.eventAddress || booking.city}</span>
              </p>
            </div>
          </div>

          {/* Payment & QR Section */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px' }}>
                QR Payment Details
              </h4>
              <span className={`status-pill ${booking.payment?.paymentStatus || 'PENDING'}`}>
                Payment: {booking.payment?.paymentStatus || 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Total Amount:</span> <strong style={{ color: '#10b981', fontSize: '16px' }}>₹{booking.totalAmount}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Transaction Ref:</span> <span style={{ color: '#f8fafc', fontFamily: 'monospace' }}>{booking.payment?.transactionRef || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Bank UTR No:</span> <strong style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{booking.payment?.utrNumber || 'Awaiting entry'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Method:</span> <strong style={{ color: '#fff' }}>{booking.payment?.paymentMethod || 'UPI_QR_DYNAMIC'}</strong>
              </div>
            </div>

            {/* Proof screenshot if available */}
            {booking.payment?.paymentScreenshotUrl && (
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Payment Screenshot / Receipt Proof:</span>
                <img 
                  src={booking.payment.paymentScreenshotUrl} 
                  alt="Payment Proof" 
                  style={{ maxHeight: '140px', borderRadius: '8px', border: '1px solid #475569' }} 
                />
              </div>
            )}
          </div>

          {/* Notes */}
          {booking.notes && (
            <div style={{ fontSize: '13px', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Notes / Requirements:</span> {booking.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="admin-modal-footer">
          {booking.status === 'PENDING' || booking.status === 'PAYMENT_VERIFIED' ? (
            <>
              <button 
                className="btn-admin-secondary" 
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                onClick={() => {
                  onUpdateStatus(booking.id, 'CANCELLED');
                  onClose();
                }}
              >
                <Ban size={15} />
                <span>Cancel Booking</span>
              </button>

              <button 
                className="btn-admin-primary" 
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                onClick={() => {
                  onUpdateStatus(booking.id, 'CONFIRMED');
                  onClose();
                }}
              >
                <FileCheck size={16} />
                <span>Confirm Booking (Payment Verified)</span>
              </button>
            </>
          ) : booking.status === 'CONFIRMED' ? (
            <button 
              className="btn-admin-primary" 
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              onClick={() => {
                onUpdateStatus(booking.id, 'COMPLETED');
                onClose();
              }}
            >
              <CheckCircle2 size={16} />
              <span>Mark as Completed</span>
            </button>
          ) : null}

          <button className="btn-admin-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
