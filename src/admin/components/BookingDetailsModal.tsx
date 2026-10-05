import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  FileCheck,
  Ban,
  User,
  Phone,
  Mail,
  Sparkles,
  AlertCircle,
  ImageOff,
  Maximize2
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
  const [showFullPhoto, setShowFullPhoto] = useState(false);

  if (!isOpen || !booking) return null;

  // Retrieve exact uploaded client photo from database
  const clientUploadedPhoto = booking.customer?.avatarUrl || (booking as any).avatarUrl || null;
  const hasClientPhoto = Boolean(clientUploadedPhoto && clientUploadedPhoto.trim().length > 0);

  // Performer Avatar
  const performerAvatarUrl = booking.performer?.avatarUrl || null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
          {/* Booker / Customer Snapshot with Exact Uploaded Photo from DB */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #334155',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '12.5px', textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} color="#f59e0b" />
                <span>Booker / Customer Information</span>
              </h4>
              <span style={{
                background: booking.gender === 'FEMALE' ? 'rgba(236, 72, 153, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: booking.gender === 'FEMALE' ? '#f472b6' : '#60a5fa',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {booking.gender}
              </span>
            </div>

            {/* Profile Row: Avatar + Details */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Client Photo Thumbnail (or explicit message if not in DB) */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {hasClientPhoto ? (
                  <div 
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onClick={() => setShowFullPhoto(true)}
                    title="Click to view full photo"
                  >
                    <img
                      src={clientUploadedPhoto!}
                      alt={booking.name}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2.5px solid #10b981',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                        background: '#0f172a',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#10b981',
                      color: '#ffffff',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #1e293b'
                    }}>
                      <Maximize2 size={10} />
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '2px dashed rgba(239, 68, 68, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f87171'
                  }}>
                    <ImageOff size={22} />
                    <span style={{ fontSize: '9px', fontWeight: 700, marginTop: '2px' }}>NO PHOTO</span>
                  </div>
                )}
              </div>

              {/* Client Bio & Contact Grid */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Full Name</span>
                  <strong style={{ color: '#ffffff', fontSize: '14px' }}>{booking.name}</strong>
                </div>

                <div>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Phone</span>
                  <div style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Phone size={12} color="#38bdf8" />
                    <span>{booking.phone}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Email</span>
                  <div style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={12} color="#a855f7" />
                    <span>{booking.email}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Billing / Ground Address</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{booking.address}</span>
                </div>

                {/* Database Photo Status Banner */}
                <div style={{ gridColumn: 'span 2', marginTop: '2px' }}>
                  {hasClientPhoto ? (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      color: '#6ee7b7',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Photo uploaded by client during booking (Verified in DB).</span>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#fca5a5',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <AlertCircle size={13} color="#ef4444" />
                      <span>No photo was uploaded during booking (Not in Database).</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Performer & Slot Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', textTransform: 'uppercase', color: '#ec4899', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="#ec4899" />
                <span>Performer Booked</span>
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {performerAvatarUrl ? (
                  <img
                    src={performerAvatarUrl}
                    alt={booking.performer?.name || 'Performer'}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ec4899' }}
                  />
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    <User size={20} />
                  </div>
                )}
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                    {booking.performer?.name || 'Performer'}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
                    Rate: <strong style={{ color: '#ec4899' }}>₹{booking.hourlyRate}/hr</strong>
                  </p>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8' }}>
                UPI ID: <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{booking.performer?.upiId || 'Not set'}</span>
              </p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '12.5px', textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} color="#6366f1" />
                <span>Schedule & Timings</span>
              </h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} color="#f59e0b" />
                <strong style={{ color: '#ffffff' }}>{booking.bookingDate}</strong>
              </p>
              <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} color="#6366f1" />
                <span style={{ color: '#cbd5e1' }}>{booking.durationHours} Hours Duration</span>
              </p>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} color="#ef4444" />
                <span>{booking.eventAddress || booking.city}</span>
              </p>
            </div>
          </div>

          {/* Payment & QR Section */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '12.5px', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px' }}>
                QR Payment Details
              </h4>
              <span className={`status-pill ${booking.payment?.paymentStatus || 'PENDING'}`}>
                Payment: {booking.payment?.paymentStatus || 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
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
            <div style={{ fontSize: '12.5px', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
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

      {/* Full Size Photo Zoom Overlay */}
      {showFullPhoto && clientUploadedPhoto && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowFullPhoto(false);
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={clientUploadedPhoto}
              alt="Full Size Client Photo"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', border: '2px solid #10b981', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            />
            <button
              onClick={() => setShowFullPhoto(false)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#ff1379',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
