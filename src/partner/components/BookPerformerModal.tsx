import {
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
import { toast } from 'sonner';
import type { Gender } from '../../admin/types/admin.types';
import { useInitiateBooking, useSubmitPaymentProof } from '../../hooks/useBookings';
import { useActiveQRCode } from '../../hooks/useQR';
import { compressImage } from '../../utils/imageCompression';
import { fetchCurrentLocationViaOlaMaps } from '../../utils/olaMaps';
import type { GarbaEvent, GarbaPartner } from '../types/partner.types';
import { getPartnerAge } from '../utils/age.util';

// Clean 30-minute interval format with clean standard labels
export const TIME_SLOT_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const val = `${h < 10 ? '0' + h : h}:${m}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const hDisplay = h12 < 10 ? `0${h12}` : `${h12}`;
  return {
    value: val,
    label: `${hDisplay}:${m} ${period}`,
  };
});

// Calculates end time automatically for 5 hours from start time
export const calculateEndTime5Hours = (start24: string): string => {
  const parts = start24.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parts[1] || '00';
  const endH = (h + 5) % 24;
  return `${endH < 10 ? '0' + endH : endH}:${m}`;
};

// Calculates duration in hours between two 24h timestamps (supports overnight)
export const calculateDurationHours = (start24: string, end24: string): number => {
  try {
    const [startH, startM] = start24.split(':').map(Number);
    const [endH, endM] = end24.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes <= 0) diffMinutes += 24 * 60; // overnight event
    return Math.round((diffMinutes / 60) * 10) / 10;
  } catch {
    return 5;
  }
};

interface BookPerformerModalProps {
  partner: GarbaPartner | null;
  events: GarbaEvent[];
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (bookingData: any) => void;
}

export const BookPerformerModal: React.FC<BookPerformerModalProps> = ({
  partner,
  events: _events,
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

  // Event & Slot Timings (Default: 5 hours slot)
  const [bookingDate, setBookingDate] = useState('2026-10-18');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('00:00');
  const [durationHours, setDurationHours] = useState(5);
  const [eventAddress, setEventAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Auto-fetch Client Billing / Residential Address using Ola Maps API
  const handleAutoFetchLocation = async () => {
    setIsFetchingLocation(true);
    try {
      // 1. Immediately read any stored address from localStorage if available
      try {
        const savedAddr = localStorage.getItem('meetbyvibe_user_address');
        if (savedAddr) setAddress(savedAddr);
      } catch {}

      // 2. Fetch fresh live GPS/reverse-geocoded location via Ola Maps
      const loc = await fetchCurrentLocationViaOlaMaps();
      if (loc) {
        if (loc.formattedAddress) {
          setAddress(loc.formattedAddress);
          try { localStorage.setItem('meetbyvibe_user_address', loc.formattedAddress); } catch {}
        } else if (loc.locality || loc.city) {
          const fallbackAddr = [loc.locality, loc.city, loc.state].filter(Boolean).join(', ');
          if (fallbackAddr) {
            setAddress(fallbackAddr);
            try { localStorage.setItem('meetbyvibe_user_address', fallbackAddr); } catch {}
          }
        }
      }
    } catch (err) {
      console.warn('Auto-fetch location via Ola Maps failed:', err);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  // Fixed Booking Fee
  const bookingFee = partner?.hourlyRate ? Number(partner.hourlyRate) : 399;

  // Payment state
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [bookingCode, setBookingCode] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(900); // 15 mins

  // When start time is selected, end time is automatically set to 5 hours later
  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const autoEnd = calculateEndTime5Hours(newStart);
    setEndTime(autoEnd);
    setDurationHours(5);
  };

  // When end time is selected, strictly prevent booking for more than 5 hours
  const handleEndTimeChange = (newEnd: string) => {
    const dur = calculateDurationHours(startTime, newEnd);
    if (dur > 5) {
      setEndTime(calculateEndTime5Hours(startTime));
      setDurationHours(5);
    } else {
      setEndTime(newEnd);
      setDurationHours(Math.max(1, Math.round(dur)));
    }
  };

  // Filter end time options so user cannot select more than 5 hours from start time
  const validEndTimeOptions = TIME_SLOT_OPTIONS.filter((slot) => {
    const dur = calculateDurationHours(startTime, slot.value);
    return dur > 0 && dur <= 5;
  });

  useEffect(() => {
    if (isOpen) {
      refetchActiveQR();
      setStep('form');
      setCopiedUpi(false);
      setTimeLeftSeconds(900);
      setCreatedBookingId('');
      setBookingCode('');
      setUtrNumber('');
      setProofFile(null);
      setProofPreviewUrl('');
      setProofCompressedSizeKB(null);
      setProofOriginalSizeKB(null);
      setName('');
      setEmail('');
      setPhone('');
      setAvatarUrl('');
      setAvatarFile(null);
      setCompressedSizeKB(null);
      setNotes('');
      // City remains empty by default, user will manually fill that
      setCity('');
      // Event ground / venue address is manually filled by the client
      setEventAddress('');
      // Default to 19:00 - 00:00 (5 hours)
      setStartTime('19:00');
      setEndTime('00:00');
      setDurationHours(5);

      // Auto-fetch Client Billing / Residential Address using Ola Maps
      handleAutoFetchLocation();
    }
  }, [isOpen, partner, refetchActiveQR]);

  // Recalculate duration when time changes
  useEffect(() => {
    const dur = calculateDurationHours(startTime, endTime);
    setDurationHours(Math.max(1, Math.round(dur)));
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

  // Handle mobile browser / in-app webview back button to safely dismiss modal without leaving the page
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'bookPerformer' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  // Handle Client Profile Picture File Upload with 100 KB compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    try {
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
      toast.error('Failed to compress image. Please try another photo.');
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
      toast.error('Please select a valid image file (PNG, JPG, WEBP, etc.) for payment receipt.');
      return;
    }

    try {
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
      toast.error('Failed to process and compress screenshot. Please try another image.');
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
  const qrCodeUrl = activeQR?.imageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackUpiPayload)}`;

  // Step 1: Proceed to QR Payment - validates details locally without triggering booking creation API
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrl && !avatarFile) {
      toast.error('Profile picture is mandatory. Please upload your profile photo / selfie.');
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please complete all client contact & address details.');
      return;
    }
    setStep('payment');
  };

  // Step 2: Final API Call - initiates booking and submits payment proof (screenshot + UTR)
  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile && !proofPreviewUrl) {
      toast.error('Please upload your payment screenshot proof before confirming.');
      return;
    }
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      toast.error('Please enter valid 12-digit UPI UTR / Bank Reference number.');
      return;
    }

    try {
      // Clean ISO timestamp strings
      const startDateTime = `${bookingDate}T${startTime}:00.000Z`;
      const endDateTime = `${bookingDate}T${endTime}:00.000Z`;

      // 1. Create booking in database with all details filled by user
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

      const finalBookingId = response?.booking?.id || '';
      const finalBookingCode = response?.booking?.bookingCode || '';
      setCreatedBookingId(finalBookingId);
      setBookingCode(finalBookingCode);

      // 2. Submit payment proof (screenshot and UTR number) for this booking
      if (finalBookingId) {
        if (proofFile) {
          const formData = new FormData();
          formData.append('utrNumber', utrNumber.trim());
          formData.append('screenshot', proofFile);
          await submitPaymentProof.mutateAsync({
            id: finalBookingId,
            payload: formData,
          });
        } else if (proofPreviewUrl) {
          await submitPaymentProof.mutateAsync({
            id: finalBookingId,
            payload: { utrNumber: utrNumber.trim(), paymentScreenshotUrl: proofPreviewUrl },
          });
        } else {
          await submitPaymentProof.mutateAsync({
            id: finalBookingId,
            payload: { utrNumber: utrNumber.trim() },
          });
        }
      }

      const bookingRecord = {
        id: finalBookingId,
        bookingCode: finalBookingCode,
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
      const msg = err?.response?.data?.message || err.message || 'Failed to complete booking and payment verification. Please try again.';
      toast.error(msg);
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
    <div 
      className="partner-modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
              {step === 'success' && `Payment Under Verification`}
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
                       👑 {partner.mySkill}
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
                            Client Profile Photo / Selfie *
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="book-label" style={{ margin: 0 }}>
                      Client Billing / Residential Address *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFetchLocation}
                      disabled={isFetchingLocation}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: '#ff1379',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: isFetchingLocation ? 'not-allowed' : 'pointer',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                      title="Auto-fetch current location via Ola Maps"
                    >
                      {isFetchingLocation ? (
                        <>
                          <Loader2 size={11} className="animate-spin" />
                          <span>Fetching via Ola Maps...</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={11} />
                          <span>Auto-fetch via Ola Maps</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="book-input"
                    required
                    placeholder={isFetchingLocation ? 'Fetching address via Ola Maps...' : 'Enter flat / house no., street, locality'}
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
                  <div className="book-field book-field-date">
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
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      <Clock size={12} color="#ff1379" />
                      <span>Start Time *</span>
                    </label>
                    <select
                      className="book-select"
                      required
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {TIME_SLOT_OPTIONS.map((slot) => (
                        <option key={`start-${slot.value}`} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="book-field">
                    <label className="book-label">
                      <Clock size={12} color="#ff1379" />
                      <span>End Time *</span>
                    </label>
                    <select
                      className="book-select"
                      required
                      value={endTime}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {validEndTimeOptions.map((slot) => (
                        <option key={`end-${slot.value}`} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration indicator */}
                <div className="book-duration-strip">
                  <Clock size={12} color="#ff1379" />
                  <span>Event Duration: <strong>{durationHours} Hours</strong></span>
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
                      placeholder="Enter event ground / venue address"
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
                      placeholder="Enter event city"
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
              <button type="button" className="btn-partner-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-partner-primary" disabled={isCompressingAvatar}>
                <CreditCard size={15} />
                <span>Proceed to QR Payment (₹{bookingFee})</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Dynamic UPI QR Code Payment & Screenshot Upload */}
        {step === 'payment' && (
          <form onSubmit={handleConfirmPayment} className="book-modal-form">
            <div className="partner-modal-body book-modal-body text-center">
              {/* Countdown & Booking Code & Client Tag */}
              <div className="book-payment-status-strip">
                <div className="book-payment-client-tag">
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="book-payment-client-avatar"
                  />
                  <span>Booking ID: <strong style={{ color: '#0f172a' }}>{bookingCode || 'Pending'}</strong></span>
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
                  Enter Digit Bank UTR / Transaction Reference ID *
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
              <button
                type="button"
                className="btn-partner-outline"
                onClick={() => setStep('form')}
                disabled={initiateBooking.isPending || submitPaymentProof.isPending || isCompressingProof}
              >
                Back to Details
              </button>
              <button
                type="submit"
                className="btn-partner-primary"
                disabled={
                  initiateBooking.isPending ||
                  submitPaymentProof.isPending ||
                  isCompressingProof ||
                  (!proofFile && !proofPreviewUrl)
                }
                style={{
                  opacity:
                    initiateBooking.isPending ||
                    submitPaymentProof.isPending ||
                    isCompressingProof ||
                    (!proofFile && !proofPreviewUrl)
                      ? 0.6
                      : 1,
                  cursor:
                    initiateBooking.isPending ||
                    submitPaymentProof.isPending ||
                    isCompressingProof ||
                    (!proofFile && !proofPreviewUrl)
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {initiateBooking.isPending || submitPaymentProof.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Confirming Booking & Verifying Proof...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Payment Under Verification Confirmation */}
        {step === 'success' && (
          <div className="book-success-card">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fffbeb',
              border: '2px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
            }}>
              <Clock size={34} color="#d97706" />
            </div>
            <h2 className="book-success-heading" style={{ color: '#0f172a', fontSize: '22px', fontWeight: 800 }}>
              Payment Under Verification
            </h2>
            <p className="book-success-sub" style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto 16px auto' }}>
              Once payment gets verified you will receive email and partner will contact you.
            </p>

            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 14px',
              maxWidth: '380px',
              margin: '0 auto 16px auto',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.4 }}>
                <strong>Verification in progress:</strong> Your payment proof has been submitted. Once payment gets verified you will receive email and partner {partner.name} will contact you.
              </div>
            </div>

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

              <div className="book-success-meta-row">Performer: <strong>{partner.name}</strong></div>
              <div className="book-success-meta-row">Event Slot: <strong>{bookingDate} ({startTime} - {endTime})</strong></div>
              <div className="book-success-meta-row">Booking Code: <strong style={{ color: '#ff1379' }}>{bookingCode}</strong></div>
              {createdBookingId && (
                <div className="book-success-meta-row">Booking Ref: <code style={{ color: '#64748b' }}>{createdBookingId}</code></div>
              )}
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
                  <div className="book-success-proof-status" style={{ color: '#d97706', fontWeight: 600 }}>
                    Payment screenshot submitted for verification
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



