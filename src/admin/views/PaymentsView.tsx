import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Check, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Plus, 
  ShieldCheck, 
  Loader2, 
  Copy,
  QrCode
} from 'lucide-react';
import type { AdminBooking } from '../types/admin.types';
import { 
  useActiveQRCode, 
  useAllQRCodes, 
  useCreateQRCode, 
  useUpdateQRCode, 
  useSetPrimaryQRCode, 
  useDeleteQRCode 
} from '../../hooks/useQR';
import type { QRCodeData } from '../../api/qr.api';
import { useUpdateBookingStatus } from '../../hooks/useBookings';
import { compressImage } from '../../utils/imageCompression';

interface PaymentsViewProps {
  bookings: AdminBooking[];
}

// Branded Payment Method Logos
export const PaymentBrandLogos = {
  PhonePe: () => (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#5f259f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '15px', flexShrink: 0, boxShadow: '0 2px 4px rgba(95, 37, 159, 0.2)' }}>
      पे
    </div>
  ),
  GooglePay: () => (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </svg>
    </div>
  ),
  Paytm: () => (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#002e6e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00b9f5', fontWeight: 900, fontSize: '9px', letterSpacing: '-0.5px', flexShrink: 0 }}>
      paytm
    </div>
  ),
  BharatPe: () => (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffffff', border: '1.5px solid #00a8a8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
      <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2.5px solid #00a8a8', borderTopColor: '#ff6600', transform: 'rotate(-45deg)' }} />
    </div>
  ),
  GenericUPI: () => (
    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>
      UPI
    </div>
  )
};

export const PaymentsView: React.FC<PaymentsViewProps> = ({ bookings }) => {
  // TanStack Query Hooks for Real-Time Backend Connectivity
  const { data: activeQR } = useActiveQRCode();
  const { data: qrCodes = [], isLoading: isLoadingQRs } = useAllQRCodes();
  const createQRMutation = useCreateQRCode();
  const updateQRMutation = useUpdateQRCode();
  const setPrimaryMutation = useSetPrimaryQRCode();
  const deleteQRMutation = useDeleteQRCode();
  const updateBookingStatusMutation = useUpdateBookingStatus();

  // Top Section: Upload Form State
  const [paymentMethod, setPaymentMethod] = useState<'UPI (PhonePe)' | 'UPI (Google Pay)' | 'UPI (Paytm)' | 'UPI (BharatPe)' | 'Other Bank UPI'>('UPI (PhonePe)');
  const [displayName, setDisplayName] = useState('Meet By Vibe UPI');
  const [upiId, setUpiId] = useState('meetbyvibe@ybl');
  const [isActive, setIsActive] = useState(true);

  // File Upload & Compression State (< 100 KB)
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topUploadCardRef = useRef<HTMLDivElement>(null);

  // Table Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Verified' | 'Pending' | 'Rejected'>('ALL');

  // Modals State
  const [viewingQR, setViewingQR] = useState<QRCodeData | null>(null);
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<any | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Live timestamp for top header
  const [currentDateTime, setCurrentDateTime] = useState('05 Oct 2026, 01:30 PM');
  useEffect(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      };
      setCurrentDateTime(now.toLocaleDateString('en-GB', options));
    } catch {
      setCurrentDateTime('05 Oct 2026, 01:30 PM');
    }
  }, []);

  // Update Display Name & UPI ID suggestions when method changes
  const handleMethodChange = (method: typeof paymentMethod) => {
    setPaymentMethod(method);
    if (method === 'UPI (PhonePe)') {
      setDisplayName('Meet By Vibe UPI');
      setUpiId('meetbyvibe@ybl');
    } else if (method === 'UPI (Google Pay)') {
      setDisplayName('Meet By Vibe GPay');
      setUpiId('meetbyvibe@okaxis');
    } else if (method === 'UPI (Paytm)') {
      setDisplayName('Meet By Vibe Paytm');
      setUpiId('meetbyvibe@paytm');
    } else if (method === 'UPI (BharatPe)') {
      setDisplayName('Meet By Vibe BharatPe');
      setUpiId('meetbyvibe@bharatpe');
    } else {
      setDisplayName('GarbaMitra Official UPI');
      setUpiId('garbamitra.pay@okhdfcbank');
    }
  };

  // Image Selection & Client-Side Compression to <= 100 KB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    try {
      setFormError(null);
      setIsCompressing(true);

      // Compress strictly <= 95 KB
      const compressed = await compressImage(file, `qr-${Date.now()}.jpg`, {
        maxSizeKB: 95,
        maxWidthOrHeight: 800,
        initialQuality: 0.85
      });

      setQrPreviewUrl(compressed.dataUrl);
      setCompressedSizeKB(compressed.sizeKB);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setFormError('Failed to compress QR image. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload QR Code directly to Backend via TanStack Query Mutation
  const handleUploadQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setFormError('Please enter a display name for the QR code.');
      return;
    }
    if (!upiId.trim()) {
      setFormError('Please enter a UPI ID (VPA).');
      return;
    }

    // If no custom file chosen, auto-generate standard high-res UPI QR payload
    const fallbackQrData = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(displayName.trim())}&cu=INR`)}`;
    const finalImageUrl = qrPreviewUrl || fallbackQrData;

    try {
      setFormError(null);
      const bankBrand = paymentMethod.replace('UPI (', '').replace(')', '');

      await createQRMutation.mutateAsync({
        title: displayName.trim(),
        imageUrl: finalImageUrl,
        upiId: upiId.trim(),
        accountHolderName: displayName.trim(),
        bankName: bankBrand,
        isActive: isActive,
        isPrimary: isActive,
        description: `Created for ${displayName.trim()}`
      });

      setFormSuccess(`QR Code "${displayName}" uploaded successfully to backend and activated for client payments!`);
      setTimeout(() => setFormSuccess(null), 5000);

      // Reset form
      setQrPreviewUrl('');
      setCompressedSizeKB(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      const msg = err?.message || 'Failed to upload QR code to backend.';
      setFormError(msg);
    }
  };

  // Helper to render method logo by bankName string
  const renderMethodIcon = (methodName?: string | null) => {
    const str = (methodName || '').toLowerCase();
    if (str.includes('phonepe') || str.includes('ybl')) return <PaymentBrandLogos.PhonePe />;
    if (str.includes('google') || str.includes('gpay') || str.includes('okaxis')) return <PaymentBrandLogos.GooglePay />;
    if (str.includes('paytm')) return <PaymentBrandLogos.Paytm />;
    if (str.includes('bharatpe') || str.includes('bharat')) return <PaymentBrandLogos.BharatPe />;
    return <PaymentBrandLogos.GenericUPI />;
  };

  // Real Dynamic Transactions mapped from backend bookings
  const transactions = bookings
    .map((b) => {
      const rawStatus = b.payment?.paymentStatus || (b.status === 'CONFIRMED' ? 'SUCCESS' : b.status === 'PAYMENT_VERIFIED' ? 'SUBMITTED' : 'PENDING');
      let mappedStatus: 'Verified' | 'Pending' | 'Rejected' = 'Pending';
      if (rawStatus === 'SUCCESS' || b.status === 'CONFIRMED' || b.status === 'PAYMENT_VERIFIED') mappedStatus = 'Verified';
      if (b.status === 'REJECTED' || b.status === 'CANCELLED') mappedStatus = 'Rejected';

      const bookingDateObj = b.createdAt ? new Date(b.createdAt) : new Date();
      const formattedDate = bookingDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

      const utr = b.payment?.utrNumber || (b as any).utrNumber || `UTR-${b.bookingCode}`;
      const amount = b.totalAmount || (b.hourlyRate ? b.hourlyRate * b.durationHours : 1200);

      return {
        id: b.id,
        bookingCode: b.bookingCode,
        userName: b.name || 'Client',
        userInitial: (b.name || 'C').charAt(0).toUpperCase(),
        utrNumber: utr,
        amount: Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        paymentMethod: b.payment?.paymentMethod ? b.payment.paymentMethod.replace('UPI_QR_', '').replace('GATEWAY_', '') : 'PhonePe',
        qrCodeName: activeQR?.title || 'Meet By Vibe UPI',
        status: mappedStatus,
        transactionDate: formattedDate,
        screenshotUrl: b.payment?.paymentScreenshotUrl || null,
        performerName: b.performer?.name,
        booking: b
      };
    })
    .filter((item) => {
      const matchesSearch = 
        item.utrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amount.includes(searchQuery) ||
        item.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

  const handleVerifyTransaction = async (bookingId: string) => {
    try {
      await updateBookingStatusMutation.mutateAsync({ id: bookingId, status: 'CONFIRMED' });
    } catch (err: any) {
      console.error('Failed to verify transaction:', err);
    }
  };

  const handleRejectTransaction = async (bookingId: string) => {
    if (confirm('Are you sure you want to reject this payment transaction?')) {
      try {
        await updateBookingStatusMutation.mutateAsync({ id: bookingId, status: 'REJECTED' });
      } catch (err: any) {
        console.error('Failed to reject transaction:', err);
      }
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', color: '#0f172a' }}>
      
      {/* 1. Header Title & Top Actions (Matching Reference Image) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '2px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
            QR Code Payments & UTR Audit
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Manage payment QR codes and verify UTR transactions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <CalendarIcon size={15} color="#64748b" />
            <span>{currentDateTime}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              topUploadCardRef.current?.scrollIntoView({ behavior: 'smooth' });
              fileInputRef.current?.click();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#5b4df2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(91, 77, 242, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Upload QR Code</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {formSuccess && (
        <div style={{
          background: '#ecfdf5',
          border: '1.5px solid #10b981',
          padding: '12px 16px',
          borderRadius: '10px',
          color: '#065f46',
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* 2. Top Card: Upload New QR Code (100% Dynamic) */}
      <div 
        ref={topUploadCardRef}
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
            Upload New QR Code
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
            Upload UPI/Payment QR code to receive payments
          </p>
        </div>

        {formError && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#ef4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <AlertCircle size={15} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleUploadQRCode}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'stretch' }}>
            
            {/* Left: Drag & drop QR code image dropzone */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  border: '1.5px dashed #93c5fd',
                  borderRadius: '12px',
                  background: '#f8faff',
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: isCompressing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px'
                }}
              >
                {isCompressing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#5b4df2' }}>
                    <Loader2 size={30} className="animate-spin" />
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>Compressing image to &lt; 100 KB...</span>
                  </div>
                ) : qrPreviewUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={qrPreviewUrl}
                      alt="Selected QR Preview"
                      style={{ width: '82px', height: '82px', borderRadius: '8px', objectFit: 'contain', background: '#ffffff', border: '1.5px solid #5b4df2', padding: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <ShieldCheck size={14} />
                        <span>Ready & Compressed ({compressedSizeKB} KB)</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Click to choose another photo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '10px',
                      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)'
                    }}>
                      <Upload size={22} />
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                      Drag & drop QR code image here
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                      or click to browse
                    </div>

                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Supported formats: PNG, JPG, JPEG (Max 2MB)
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right: Form Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'space-between' }}>
              
              {/* Row 1: Payment Method * & Display Name * */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Payment Method <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={paymentMethod}
                      onChange={(e) => handleMethodChange(e.target.value as any)}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '0 12px 0 38px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                      <option value="UPI (Google Pay)">UPI (Google Pay)</option>
                      <option value="UPI (Paytm)">UPI (Paytm)</option>
                      <option value="UPI (BharatPe)">UPI (BharatPe)</option>
                      <option value="Other Bank UPI">Other Bank UPI</option>
                    </select>
                    <div style={{ position: 'absolute', left: '7px', top: '6px', pointerEvents: 'none' }}>
                      {renderMethodIcon(paymentMethod)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Display Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Meet By Vibe UPI"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: UPI ID * & Status Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    UPI ID <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. meetbyvibe@ybl"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 12px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Status
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}>
                    {/* Toggle Switch */}
                    <div
                      onClick={() => setIsActive(!isActive)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: isActive ? '#5b4df2' : '#cbd5e1',
                        padding: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          transform: isActive ? 'translateX(20px)' : 'translateX(0)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: isActive ? '#0f172a' : '#64748b' }}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload QR Code Button */}
              <button
                type="submit"
                disabled={createQRMutation.isPending || isCompressing}
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#5b4df2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(91, 77, 242, 0.3)',
                  transition: 'all 0.15s ease',
                  marginTop: '4px'
                }}
              >
                {createQRMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading QR Code...</span>
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Upload QR Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Middle Card: Uploaded QR Codes (Dynamic from Backend) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
            Uploaded QR Codes
          </h2>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
            Manage your uploaded payment QR codes
          </p>
        </div>

        {isLoadingQRs ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 8px auto', color: '#5b4df2' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading backend payment QR codes...</span>
          </div>
        ) : qrCodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', border: '1.5px dashed #cbd5e1', borderRadius: '12px', color: '#64748b' }}>
            <QrCode size={36} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>No QR Codes in Database</div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
              Upload your PhonePe, Google Pay, or Paytm QR code using the form above to start receiving booking payments.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {qrCodes.map((qr) => {
              const brand = qr.bankName || 'UPI';
              return (
                <div
                  key={qr.id}
                  style={{
                    background: '#ffffff',
                    border: qr.isPrimary ? '1.5px solid #5b4df2' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: qr.isPrimary ? '0 4px 14px rgba(91, 77, 242, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Header: Logo + Name & Active Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderMethodIcon(brand)}
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                        {brand}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: qr.isActive ? '#ecfdf5' : '#f1f5f9',
                      color: qr.isActive ? '#059669' : '#64748b',
                      border: qr.isActive ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                    }}>
                      {qr.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* QR Image Box */}
                  <div style={{
                    width: '135px',
                    height: '135px',
                    margin: '0 auto 12px auto',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}>
                    <img
                      src={qr.imageUrl}
                      alt={qr.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>

                  {/* Display Name & UPI ID */}
                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {qr.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {qr.upiId || 'No UPI ID'}
                    </div>
                  </div>

                  {/* Actions: View, Edit, Delete */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setViewingQR(qr)}
                      style={{
                        padding: '6px 0',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingQR(qr)}
                      style={{
                        padding: '6px 0',
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete QR "${qr.title}"?`)) {
                          deleteQRMutation.mutate(qr.id);
                        }
                      }}
                      style={{
                        padding: '6px 0',
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Bottom Card: UTR Transactions (Dynamic from Backend Bookings) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>
              UTR Transactions
            </h2>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              Verify and manage payment transactions
            </p>
          </div>

          {/* Search, Date Range, Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            
            {/* Search */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search by UTR, amount or user name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 10px 0 32px',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#0f172a',
                  outline: 'none'
                }}
              />
            </div>

            {/* Date Range */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              padding: '0 12px',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#475569',
              background: '#ffffff'
            }}>
              <CalendarIcon size={14} color="#64748b" />
              <span>Select date range</span>
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                height: '38px',
                padding: '0 12px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <th style={{ padding: '10px 8px', width: '36px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>User</th>
                <th style={{ padding: '10px 12px' }}>UTR Number</th>
                <th style={{ padding: '10px 12px' }}>Amount (₹)</th>
                <th style={{ padding: '10px 12px' }}>Payment Method</th>
                <th style={{ padding: '10px 12px' }}>QR Code</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Transaction Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No payment transactions matching your filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr 
                    key={tx.id || idx}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* # */}
                    <td style={{ padding: '12px 8px', color: '#64748b', fontWeight: 600 }}>
                      {idx + 1}
                    </td>

                    {/* User */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '12px',
                          flexShrink: 0
                        }}>
                          {tx.userInitial}
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          {tx.userName}
                        </span>
                      </div>
                    </td>

                    {/* UTR Number */}
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                      {tx.utrNumber}
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {tx.amount}
                    </td>

                    {/* Payment Method */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderMethodIcon(tx.paymentMethod)}
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </td>

                    {/* QR Code */}
                    <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>
                      {tx.qrCodeName}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: tx.status === 'Verified' ? '#ecfdf5' : tx.status === 'Pending' ? '#fffbeb' : '#fef2f2',
                        color: tx.status === 'Verified' ? '#059669' : tx.status === 'Pending' ? '#d97706' : '#dc2626',
                        border: tx.status === 'Verified' ? '1px solid #a7f3d0' : tx.status === 'Pending' ? '1px solid #fde68a' : '1px solid #fecaca'
                      }}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Transaction Date */}
                    <td style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>
                      {tx.transactionDate}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setViewingTransaction(tx)}
                          style={{
                            padding: '5px 9px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVerifyTransaction(tx.id)}
                          style={{
                            padding: '5px 9px',
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Check size={12} />
                          <span>Verify</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRejectTransaction(tx.id)}
                          style={{
                            padding: '5px 9px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <X size={12} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: View Full QR Code */}
      {viewingQR && (
        <div className="partner-modal-overlay" onClick={() => setViewingQR(null)}>
          <div
            className="partner-modal-card"
            style={{ maxWidth: '400px', background: '#ffffff', color: '#0f172a', padding: '20px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {renderMethodIcon(viewingQR.bankName)}
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{viewingQR.title}</h3>
              </div>
              <button onClick={() => setViewingQR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
              <img
                src={viewingQR.imageUrl}
                alt={viewingQR.title}
                style={{ width: '220px', height: '220px', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>{viewingQR.upiId}</span>
              <button
                type="button"
                onClick={() => handleCopy(viewingQR.upiId || '')}
                style={{ background: 'none', border: 'none', color: '#5b4df2', fontWeight: 700, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!viewingQR.isPrimary && (
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryMutation.mutate(viewingQR.id);
                    setViewingQR(null);
                  }}
                  style={{ flex: 1, padding: '10px', background: '#5b4df2', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Set as Active QR
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingQR(null)}
                style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit QR Code */}
      {editingQR && (
        <div className="partner-modal-overlay" onClick={() => setEditingQR(null)}>
          <div
            className="partner-modal-card"
            style={{ maxWidth: '460px', background: '#ffffff', color: '#0f172a', padding: '22px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Edit QR Code Details</h3>
              <button onClick={() => setEditingQR(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Display Name</label>
                <input
                  type="text"
                  value={editingQR.title}
                  onChange={(e) => setEditingQR({ ...editingQR, title: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>UPI ID (VPA)</label>
                <input
                  type="text"
                  value={editingQR.upiId || ''}
                  onChange={(e) => setEditingQR({ ...editingQR, upiId: e.target.value })}
                  style={{ width: '100%', height: '38px', padding: '0 10px', border: '1.5px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editingQR.isActive}
                  onChange={(e) => setEditingQR({ ...editingQR, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: '#5b4df2' }}
                />
                <label htmlFor="editIsActive" style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Mark as Active Payment QR
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setEditingQR(null)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateQRMutation.mutateAsync({
                      id: editingQR.id,
                      data: {
                        title: editingQR.title,
                        upiId: editingQR.upiId || undefined,
                        isActive: editingQR.isActive
                      }
                    });
                    setEditingQR(null);
                  }}
                  style={{ padding: '8px 16px', background: '#5b4df2', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: View Transaction & Receipt Proof */}
      {viewingTransaction && (
        <div className="partner-modal-overlay" onClick={() => setViewingTransaction(null)}>
          <div
            className="partner-modal-card"
            style={{ maxWidth: '440px', background: '#ffffff', color: '#0f172a', padding: '20px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Transaction & Payment Details</h3>
              <button onClick={() => setViewingTransaction(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '12.5px' }}>
              <div style={{ marginBottom: '6px' }}>User: <strong>{viewingTransaction.userName}</strong></div>
              <div style={{ marginBottom: '6px' }}>Amount: <strong style={{ color: '#059669', fontSize: '14px' }}>₹{viewingTransaction.amount}</strong></div>
              <div style={{ marginBottom: '6px' }}>Bank UTR: <code style={{ color: '#5b4df2', fontWeight: 700 }}>{viewingTransaction.utrNumber}</code></div>
              <div style={{ marginBottom: '6px' }}>Booking Code: <strong>{viewingTransaction.bookingCode}</strong></div>
              <div>Payment Method: <strong>{viewingTransaction.paymentMethod}</strong></div>
            </div>

            {viewingTransaction.screenshotUrl ? (
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textAlign: 'left' }}>
                  Uploaded Payment Screenshot:
                </div>
                <img
                  src={viewingTransaction.screenshotUrl}
                  alt="Receipt Screenshot"
                  style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              {viewingTransaction.status !== 'Verified' && (
                <button
                  type="button"
                  onClick={() => {
                    handleVerifyTransaction(viewingTransaction.id);
                    setViewingTransaction(null);
                  }}
                  style={{ padding: '8px 14px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
                >
                  ✓ Verify Payment
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingTransaction(null)}
                style={{ padding: '8px 14px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
