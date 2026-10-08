import {
  AlertCircle,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileCheck2,
  Image as ImageIcon,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { Gender } from '../../admin/types/admin.types';
import { useInitiateBooking, useSubmitPaymentProof } from '../../hooks/useBookings';
import { useActiveQRCode } from '../../hooks/useQR';
import { compressImage } from '../../utils/imageCompression';
import type { GarbaEvent, GarbaPartner } from '../types/partner.types';
import { getPartnerAge } from '../utils/age.util';

interface BookPerformerModalProps {
  partner: GarbaPartner | null;
  events: GarbaEvent[];
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (bookingData: any) => void;
}

export const BookPerformerModal: React.FC<BookPerformerModalProps> = ({
  partner,
  events,
  isOpen,
  onClose,
  onBookingComplete,
}) => {
  // TanStack Query hooks
  const initiateBooking = useInitiateBooking();
  const submitPaymentProof = useSubmitPaymentProof();
  const { data: activeQR, refetch: refetchActiveQR } = useActiveQRCode();

  // Step 1: Booking Details, Step 2: QR Payment & UTR, Step 3: Success
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  // Booker / Client Details matching Prisma schema
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<Gender>('FEMALE');

  // Client Profile Picture Dynamic State with <= 100 KB compression
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState<boolean>(false);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment Proof Screenshot Dynamic State with <= 100 KB auto-compression
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);
  const [proofCompressedSizeKB, setProofCompressedSizeKB] = useState<number | null>(null);
  const [proofOriginalSizeKB, setProofOriginalSizeKB] = useState<number | null>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);

  // Event & Slot Timings
  const [bookingDate, setBookingDate] = useState('2026-10-18');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('23:00');
  const [durationHours, setDurationHours] = useState(4);
  const [eventAddress, setEventAddress] = useState(events[0]?.venue || '');
  const [city, setCity] = useState(partner?.city || '');
  const [notes, setNotes] = useState('');

  // Fixed Booking Fee
  const bookingFee = partner?.hourlyRate ? Number(partner.hourlyRate) : 399;

  // Payment state
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [bookingCode, setBookingCode] = useState('');
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('');
  const [dynamicUpiPayload, setDynamicUpiPayload] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refetchActiveQR();
      setStep('form');
      setErrorMsg(null);
      setCopiedUpi(false);
      setTimeLeftSeconds(900);
      setCreatedBookingId('');
      setUtrNumber('');
      setProofFile(null);
      setProofPreviewUrl('');
      setProofCompressedSizeKB(null);
      setProofOriginalSizeKB(null);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setAvatarUrl('');
      setAvatarFile(null);
      setCompressedSizeKB(null);
      setNotes('');
      if (partner) {
        setCity(partner.city);
      }
    }
  }, [isOpen, partner, refetchActiveQR]);

  // Recalculate duration when time changes
  useEffect(() => {
    try {
      const [startH] = startTime.split(':').map(Number);
      const [endH] = endTime.split(':').map(Number);
      let diff = endH - startH;
      if (diff <= 0) diff += 24; // overnight event
      setDurationHours(Math.max(1, diff));
    } catch {
      setDurationHours(4);
    }
  }, [startTime, endTime]);

  // Timer for QR Payment
  useEffect(() => {
    if (step === 'payment' && timeLeftSeconds > 0) {
      const timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeftSeconds]);

  // Handle Client Profile Picture File Upload with 100 KB compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    try {
      setErrorMsg(null);
      setIsCompressingAvatar(true);

      // Compress strictly <= 95 KB (under 100 KB limit)
      const compressed = await compressImage(file, file.name, {
        maxSizeKB: 95,
        maxWidthOrHeight: 800,
        initialQuality: 0.82
      });

      setAvatarFile(compressed.file);
      setAvatarUrl(compressed.dataUrl);
      setCompressedSizeKB(compressed.sizeKB);
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrorMsg('Failed to compress image. Please try another photo.');
    } finally {
      setIsCompressingAvatar(false);
    }
  };

  // Reset or Remove Photo
  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setCompressedSizeKB(null);
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Switch gender
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
  };

  // Handle Payment Screenshot Upload with strict <= 100 KB auto-compression
  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, etc.) for payment receipt.');
      return;
    }

    try {
      setErrorMsg(null);
      setIsCompressingProof(true);

      // Compress strictly to <= 95 KB (under 100 KB limit)
      const compressed = await compressImage(file, `utr-proof-${Date.now()}.jpg`, {
        maxSizeKB: 95,
        maxWidthOrHeight: 1024,
        initialQuality: 0.82
      });

      setProofFile(compressed.file);
      setProofPreviewUrl(compressed.dataUrl);
      setProofCompressedSizeKB(compressed.sizeKB);
      setProofOriginalSizeKB(compressed.originalSizeKB);
    } catch (err: any) {
      console.error('Screenshot compression error:', err);
      setErrorMsg('Failed to process and compress screenshot. Please try another image.');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreviewUrl('');
    setProofCompressedSizeKB(null);
    setProofOriginalSizeKB(null);
    if (proofFileInputRef.current) {
      proofFileInputRef.current.value = '';
    }
  };

  if (!isOpen || !partner) return null;

  // Dynamic active QR & UPI ID from backend qr.routes / activeQR or performer fallback
  const upiId = activeQR?.upiId || partner.upiId || 'meetbyvibe@ybl';
  const payeeName = activeQR?.accountHolderName || activeQR?.title || partner.name || 'Meet By Vibe UPI';
  const fallbackUpiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${bookingFee}&tn=${encodeURIComponent(`Booking ${bookingCode || 'GARBA'}`)}&cu=INR`;
  
  // Prioritize the actual QR code uploaded by the admin
  const qrCodeUrl = activeQR?.imageUrl || dynamicQrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dynamicUpiPayload || fallbackUpiPayload)}`;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('Please complete all client contact & address details.');
      return;
    }

    try {
      setErrorMsg(null);
      // Clean ISO timestamp strings
      const startDateTime = `${bookingDate}T${startTime}:00.000Z`;
      const endDateTime = `${bookingDate}T${endTime}:00.000Z`;

      const response = await initiateBooking.mutateAsync({
        name,
        email,
        phone,
        address,
        gender,
        avatarUrl,
        performerId: partner.id,
        bookingDate,
        startTime: startDateTime,
        endTime: endDateTime,
        eventAddress,
        city,
        notes,
      });

      if (response && response.booking) {
        setCreatedBookingId(response.booking.id);
        setBookingCode(response.booking.bookingCode);
        if (response.payment?.qrCodeUrl) {
          setDynamicQrUrl(response.payment.qrCodeUrl);
        }
        if (response.payment?.upiPayload) {
          setDynamicUpiPayload(response.payment.upiPayload);
        }
        setStep('payment');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to initiate booking. Please try again.';
      setErrorMsg(msg);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter valid 12-digit UPI UTR / Bank Reference number.');
      return;
    }

    try {
      setErrorMsg(null);
      if (createdBookingId) {
        if (proofFile) {
          const formData = new FormData();
          formData.append('utrNumber', utrNumber.trim());
          formData.append('screenshot', proofFile);
          await submitPaymentProof.mutateAsync({
            id: createdBookingId,
            payload: formData,
          });
        } else if (proofPreviewUrl) {
          await submitPaymentProof.mutateAsync({
            id: createdBookingId,
            payload: { utrNumber: utrNumber.trim(), paymentScreenshotUrl: proofPreviewUrl },
          });
        } else {
          await submitPaymentProof.mutateAsync({
            id: createdBookingId,
            payload: { utrNumber: utrNumber.trim() },
          });
        }
      }

      const bookingRecord = {
        id: createdBookingId,
        bookingCode,
        name,
        email,
        phone,
        address,
        gender,
        avatarUrl,
        performerId: partner.id,
        performerName: partner.name,
        bookingDate,
        startTime: `${bookingDate}T${startTime}:00Z`,
        endTime: `${bookingDate}T${endTime}:00Z`,
        durationHours,
        eventAddress,
        city,
        notes,
        totalAmount: bookingFee,
        advanceAmount: bookingFee,
        utrNumber,
        screenshotUrl: proofPreviewUrl,
        status: 'PAYMENT_VERIFIED',
      };

      if (onBookingComplete) onBookingComplete(bookingRecord);
      setStep('success');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to submit payment verification. Please try again.';
      setErrorMsg(msg);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card book-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header book-modal-header">
          <div className="book-modal-title-wrap">
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title book-modal-title">
              {step === 'form' && `Book Performer: ${partner.name}`}
              {step === 'payment' && `UPI Payment & Slot Confirmation`}
              {step === 'success' && `Booking Successfully Confirmed!`}
            </h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: Full Booking Form matching Prisma Model */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPayment} className="book-modal-form">
            <div className="partner-modal-body book-modal-body">
              {errorMsg && (
                <div className="book-error-alert">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Performer Summary Strip */}
              <div className="book-performer-summary">
                <div className="book-performer-left">
                  <img
                    src={partner.avatarUrl}
                    alt={partner.name}
                    className="book-performer-avatar"
                  />
                  <div className="book-performer-info">
                    <div className="book-performer-name">
                      {partner.name}, {partner.age || getPartnerAge(partner.id, partner.name)}
                    </div>
                    <div className="book-performer-sub">
                      📍 {partner.city} • 👑 {partner.mySkill}
                    </div>
                  </div>
                </div>

                <div className="book-performer-rate">
                  <div className="book-rate-label">Booking Fee</div>
                  <div className="book-rate-value">
                    ₹{bookingFee}
                  </div>
                </div>
              </div>

              {/* 1. Booker / Client Details */}
              <div className="book-section-group">
                <div className="book-section-label">
                  <User size={14} color="#ff1379" />
                  <span>1. Client Contact & Personal Details</span>
                </div>

                {/* DYNAMIC CLIENT PROFILE PICTURE UPLOADER (Strictly <= 100 KB) */}
                <div className="book-avatar-uploader-card">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <div className="book-avatar-uploader-inner">
                    {/* Avatar Preview Box with Camera Badge & Compression Indicator */}
                    <div 
                      className="book-avatar-preview-wrap"
                      onClick={() => !isCompressingAvatar && fileInputRef.current?.click()}
                      title="Click to upload profile photo / selfie"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Client Profile"
                          className="book-avatar-preview-img"
                          style={{ opacity: isCompressingAvatar ? 0.5 : 1 }}
                        />
                      ) : (
                        <div className="book-avatar-placeholder-box">
                          <User size={26} color="#94a3b8" />
                        </div>
                      )}
                      <div className="book-avatar-camera-badge">
                        {isCompressingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                      </div>
                    </div>

                    {/* Actions and Info */}
                    <div className="book-avatar-actions-wrap">
                      <div className="book-avatar-header-row">
                        <div className="book-avatar-title-wrap">
                          <span className="book-avatar-title">
                            Client Profile Photo / Selfie
                          </span>
                          {compressedSizeKB !== null && (
                            <span className="book-badge-compressed">
                              <ShieldCheck size={11} />
                              <span>{compressedSizeKB} KB (Optimized)</span>
                            </span>
                          )}
                        </div>
                        {avatarFile && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="book-btn-reset-photo"
                          >
                            <Trash2 size={12} />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>

                      <div className="book-avatar-btn-row">
                        <button
                          type="button"
                          disabled={isCompressingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                          className="book-btn-upload"
                        >
                          {isCompressingAvatar ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Compressing &lt;100KB...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={13} />
                              <span>{avatarFile ? 'Change Photo' : 'Upload Photo'}</span>
                            </>
                          )}
                        </button>

                        <span className="book-compression-note">
                          ⚡ Auto-compressed &lt;100 KB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="book-form-grid-2">
                  <div className="book-field">
                    <label className="book-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="book-input"
                      required
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => handleGenderChange(e.target.value as Gender)}
                      className="book-select"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="book-form-grid-2">
                  <div className="book-field">
                    <label className="book-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="book-input"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      className="book-input"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="book-field">
                  <label className="book-label">
                    Client Billing / Residential Address *
                  </label>
                  <input
                    type="text"
                    className="book-input"
                    required
                    placeholder="Enter flat / house no., street, locality"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* 2. Slot Timings */}
              <div className="book-section-group">
                <div className="book-section-label">
                  <Clock size={14} color="#ff1379" />
                  <span>2. Slot Timings & Duration</span>
                </div>

                <div className="book-form-grid-3">
                  <div className="book-field">
                    <label className="book-label">
                      <Calendar size={12} color="#ff1379" />
                      <span>Booking Date *</span>
                    </label>
                    <input
                      type="date"
                      className="book-input"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      <Clock size={12} color="#ff1379" />
                      <span>Start Time *</span>
                    </label>
                    <input
                      type="time"
                      className="book-input"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      <Clock size={12} color="#ff1379" />
                      <span>End Time *</span>
                    </label>
                    <input
                      type="time"
                      className="book-input"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Event Venue Location & Notes */}
              <div className="book-section-group">
                <div className="book-section-label">
                  <MapPin size={14} color="#ff1379" />
                  <span>3. Event Location & Custom Notes</span>
                </div>

                <div className="book-form-grid-venue">
                  <div className="book-field">
                    <label className="book-label">
                      Event Ground / Venue Address
                    </label>
                    <input
                      type="text"
                      className="book-input"
                      value={eventAddress}
                      onChange={(e) => setEventAddress(e.target.value)}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      City
                    </label>
                    <input
                      type="text"
                      className="book-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="book-field">
                  <label className="book-label">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter dance style preferences, choreography requests, costume synchronization details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="book-textarea"
                  />
                </div>
              </div>

              {/* 4. Financial Breakdown Strip with Fixed Fee 399 */}
              <div className="book-finance-strip">
                <div className="book-finance-row">
                  <span>Performer Booking Fee:</span>
                  <strong className="book-finance-advance">₹{bookingFee}</strong>
                </div>
                <div className="book-finance-note">
                  🔒 Fixed one-time booking fee. Performer is reserved exclusively for your selected date & time slot.
                </div>
              </div>
            </div>

            <div className="partner-modal-footer book-modal-footer">
              <button type="button" className="btn-partner-outline" onClick={onClose} disabled={initiateBooking.isPending}>
                Cancel
              </button>
              <button type="submit" className="btn-partner-primary" disabled={initiateBooking.isPending || isCompressingAvatar}>
                {initiateBooking.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Locking Slot & Generating QR...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={15} />
                    <span>Proceed to QR Payment (₹{bookingFee})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Dynamic UPI QR Code Payment & Screenshot Upload */}
        {step === 'payment' && (
          <form onSubmit={handleConfirmPayment} className="book-modal-form">
            <div className="partner-modal-body book-modal-body text-center">
              {errorMsg && (
                <div className="book-error-alert">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Countdown & Booking Code & Client Tag */}
              <div className="book-payment-status-strip">
                <div className="book-payment-client-tag">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="book-payment-client-avatar"
                  />
                  <span>Booking ID: <strong style={{ color: '#0f172a' }}>{bookingCode}</strong></span>
                </div>
                <div className="book-payment-countdown">
                  <Clock size={14} />
                  <span>Expires in: {formatTimer(timeLeftSeconds)}</span>
                </div>
              </div>

              {/* Admin-Uploaded Active QR Branding Badge */}
              <div className="book-qr-branding-badge">
                <span className="book-qr-title">
                  {activeQR?.title || payeeName}
                </span>
                {activeQR?.bankName && (
                  <span className="book-qr-bank-tag">
                    {activeQR.bankName}
                  </span>
                )}
              </div>

              {/* Dynamic QR Image (Live Admin Uploaded QR Code) */}
              <div className="book-qr-code-box">
                <img
                  src={qrCodeUrl}
                  alt={activeQR?.title || "UPI Payment QR Code"}
                  className="book-qr-img"
                />
              </div>

              {/* Payee Info & Copy UPI */}
              <div className="book-pay-amount-heading">
                Scan to Pay ₹{bookingFee} via {activeQR?.bankName || 'GPay / PhonePe / Paytm'}
              </div>

              <div className="book-upi-pill">
                <span className="book-upi-text">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="book-copy-btn"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>

              {/* UTR Number Input */}
              <div className="book-utr-card">
                <label className="book-label" style={{ color: '#0f172a' }}>
                  Enter 12-Digit Bank UTR / Transaction Reference ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 427819283921"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="book-utr-input"
                />
                <span className="book-utr-helper">
                  Found on your payment app receipt after completing payment.
                </span>
              </div>

              {/* PAYMENT SCREENSHOT UPLOAD FIELD (Strictly Compressed to <= 100 KB) */}
              <div className="book-proof-card">
                <div className="book-proof-header">
                  <div className="book-proof-title-wrap">
                    <ImageIcon size={15} color="#c026d3" />
                    <span className="book-proof-title">
                      Payment Proof Screenshot (Optional)
                    </span>
                  </div>

                  {proofCompressedSizeKB !== null && (
                    <span className="book-badge-compressed">
                      <ShieldCheck size={12} />
                      <span>{proofCompressedSizeKB} KB (&lt;100KB Safe)</span>
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={proofFileInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleProofFileChange}
                  style={{ display: 'none' }}
                />

                {!proofPreviewUrl ? (
                  <div
                    onClick={() => !isCompressingProof && proofFileInputRef.current?.click()}
                    className="book-proof-dropzone"
                  >
                    {isCompressingProof ? (
                      <div className="book-proof-compressing-state">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Compressing screenshot to &lt; 100 KB...</span>
                      </div>
                    ) : (
                      <div className="book-proof-idle-state">
                        <div className="book-proof-upload-icon">
                          <Upload size={16} />
                        </div>
                        <div className="book-proof-idle-text">
                          <div className="book-proof-drop-title">
                            Click or Drop Screenshot Here
                          </div>
                          <div className="book-proof-drop-sub">
                            Auto-compressed to &lt; 100 KB instantly
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="book-proof-preview-bar">
                    <div className="book-proof-preview-left">
                      <img
                        src={proofPreviewUrl}
                        alt="Payment Proof"
                        className="book-proof-thumb"
                      />
                      <div>
                        <div className="book-proof-status-label">
                          <FileCheck2 size={14} color="#10b981" />
                          <span>Screenshot Ready</span>
                        </div>
                        <div className="book-proof-size-info">
                          {proofOriginalSizeKB ? `${proofOriginalSizeKB} KB ➔ ` : ''}
                          <strong>{proofCompressedSizeKB} KB</strong> (Ready to Upload)
                        </div>
                      </div>
                    </div>

                    <div className="book-proof-btn-group">
                      <button
                        type="button"
                        onClick={() => proofFileInputRef.current?.click()}
                        className="book-btn-change-proof"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        className="book-btn-remove-proof"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="partner-modal-footer book-modal-footer">
              <button type="button" className="btn-partner-outline" onClick={() => setStep('form')} disabled={submitPaymentProof.isPending || isCompressingProof}>
                Back to Details
              </button>
              <button type="submit" className="btn-partner-primary" disabled={submitPaymentProof.isPending || isCompressingProof}>
                {submitPaymentProof.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying & Uploading Proof...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify Payment & Confirm</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'success' && (
          <div className="book-success-card">
            <CheckCircle2 size={54} color="#10b981" className="book-success-icon" />
            <h2 className="book-success-heading">
              Booking Confirmed! 🎉
            </h2>
            <p className="book-success-sub">
              Performer <strong>{partner.name}</strong> is reserved for <strong>{bookingDate} ({startTime} - {endTime})</strong>.
            </p>

            <div className="book-success-details-box">
              {/* Client Snapshot with Avatar */}
              <div className="book-success-client-row">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="book-success-client-avatar"
                />
                <div>
                  <div className="book-success-client-name">{name}</div>
                  <div className="book-success-client-contact">{phone} • {email}</div>
                </div>
              </div>

              <div className="book-success-meta-row">Booking Code: <strong style={{ color: '#ff1379' }}>{bookingCode}</strong></div>
              <div className="book-success-meta-row">Booking Fee Paid: <strong style={{ color: '#059669' }}>₹{bookingFee}</strong></div>
              <div className="book-success-meta-row">UTR Reference: <code style={{ color: '#0284c7' }}>{utrNumber}</code></div>

              {/* Payment Proof Preview if uploaded */}
              {proofPreviewUrl && (
                <div className="book-success-proof-row">
                  <img
                    src={proofPreviewUrl}
                    alt="Receipt"
                    className="book-success-proof-thumb"
                  />
                  <div className="book-success-proof-status">
                    Payment screenshot verified (&lt;100 KB)
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                className="btn-partner-primary"
                style={{ padding: '10px 24px', width: 'auto', margin: '0 auto' }}
                onClick={onClose}
              >
                Done / Back to Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPerformerModal;



