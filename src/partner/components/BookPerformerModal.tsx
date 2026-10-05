import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Copy, 
  Check, 
  CreditCard, 
  Calendar, 
  Loader2,
  Camera,
  Upload,
  Trash2,
  Link as LinkIcon,
  ShieldCheck,
  Image as ImageIcon,
  FileCheck2
} from 'lucide-react';
import type { GarbaPartner, GarbaEvent } from '../types/partner.types';
import type { Gender } from '../../admin/types/admin.types';
import { useInitiateBooking, useSubmitPaymentProof } from '../../hooks/useBookings';
import { useActiveQRCode } from '../../hooks/useQR';
import { compressImage } from '../../utils/imageCompression';

interface BookPerformerModalProps {
  partner: GarbaPartner | null;
  events: GarbaEvent[];
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete?: (bookingData: any) => void;
}

// Preset Festive Garba Client Avatars
const CLIENT_AVATAR_PRESETS = [
  { id: 'f1', label: 'Festive Female 1', gender: 'FEMALE', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'f2', label: 'Festive Female 2', gender: 'FEMALE', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 'f3', label: 'Festive Female 3', gender: 'FEMALE', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 'm1', label: 'Festive Male 1', gender: 'MALE', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'm2', label: 'Festive Male 2', gender: 'MALE', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'm3', label: 'Festive Male 3', gender: 'MALE', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' }
];

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
  const { data: activeQR } = useActiveQRCode();

  // Step 1: Booking Details, Step 2: QR Payment & UTR, Step 3: Success
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  // Booker / Client Details matching Prisma schema
  const [name, setName] = useState('Aarohi Sen');
  const [email, setEmail] = useState('aarohi.sen@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Flat 402, Royal Residency, Kanke Road');
  const [gender, setGender] = useState<Gender>('FEMALE');

  // Client Profile Picture Dynamic State with <= 100 KB compression
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState<boolean>(false);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
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
  const [eventAddress, setEventAddress] = useState(events[0]?.venue || 'GMDC Ground, Helmet Cross Roads');
  const [city, setCity] = useState(partner?.city || 'Ahmedabad');
  const [notes, setNotes] = useState('Looking for synchronized couple round and Dodhiya steps choreography.');

  // Financials
  const hourlyRate = partner?.hourlyRate || 1200;
  const totalAmount = hourlyRate * durationHours;
  const advanceAmount = Math.round(totalAmount * 0.5); // 50% advance

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
      setShowUrlInput(false);
      if (partner) {
        setCity(partner.city);
      }
    }
  }, [isOpen, partner]);

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
    setShowUrlInput(false);
    setCustomUrl('');
    setCompressedSizeKB(null);
    setAvatarUrl(
      gender === 'MALE'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Switch gender and auto-select matching default festive avatar if user hasn't uploaded a custom photo
  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    if (!avatarFile && !customUrl) {
      if (newGender === 'MALE') {
        setAvatarUrl('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
      } else if (newGender === 'FEMALE') {
        setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
      }
    }
  };

  const handleApplyCustomUrl = async () => {
    if (customUrl.trim()) {
      try {
        setIsCompressingAvatar(true);
        // Compress external URL image as well if applicable
        const compressed = await compressImage(customUrl.trim(), 'client-photo.jpg', {
          maxSizeKB: 95,
          maxWidthOrHeight: 800
        });
        setAvatarUrl(compressed.dataUrl);
        setAvatarFile(compressed.file);
        setCompressedSizeKB(compressed.sizeKB);
      } catch {
        setAvatarUrl(customUrl.trim());
        setAvatarFile(null);
        setCompressedSizeKB(null);
      } finally {
        setIsCompressingAvatar(false);
      }
    }
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
  const upiId = activeQR?.upiId || partner.upiId || 'garbamitra.pay@okaxis';
  const payeeName = activeQR?.accountHolderName || partner.name || 'GarbaMitra Platform';
  const fallbackUpiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${advanceAmount}&tn=${encodeURIComponent(`Booking ${bookingCode || 'GARBA'}`)}&cu=INR`;
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
        hourlyRate,
        totalAmount,
        advanceAmount,
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
        className="partner-modal-card" 
        style={{ maxWidth: '640px', background: '#ffffff', color: '#0f172a' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="partner-modal-header" style={{ background: '#fdf2f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#ff1379" />
            <h3 className="partner-modal-title" style={{ color: '#0f172a', fontWeight: 800 }}>
              {step === 'form' && `Book Performer: ${partner.name}`}
              {step === 'payment' && `UPI Payment & Slot Confirmation`}
              {step === 'success' && `Booking Successfully Confirmed!`}
            </h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* STEP 1: Full Booking Form matching Prisma Model */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPayment}>
            <div className="partner-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#ef4444', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Performer Summary Strip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={partner.avatarUrl}
                    alt={partner.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff1379' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                      {partner.name}, {partner.age}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      📍 {partner.city} • ⚡ {partner.matchScore}% Match • 👑 {partner.mySkill}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Hourly Rate</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#ff1379' }}>
                    ₹{hourlyRate}/hr
                  </div>
                </div>
              </div>

              {/* 1. Booker / Client Details */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} color="#ff1379" />
                  <span>1. Client Contact & Personal Details</span>
                </div>

                {/* DYNAMIC CLIENT PROFILE PICTURE UPLOADER (Strictly <= 100 KB) */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff5f9 0%, #ffffff 100%)',
                  borderRadius: '12px',
                  border: '1.5px solid #ffd6e7',
                  padding: '14px',
                  marginBottom: '14px',
                  boxShadow: '0 2px 8px rgba(255, 19, 121, 0.05)'
                }}>
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {/* Avatar Preview Box with Camera Badge & Compression Indicator */}
                    <div 
                      style={{ position: 'relative', cursor: 'pointer' }}
                      onClick={() => !isCompressingAvatar && fileInputRef.current?.click()}
                      title="Click to change profile picture"
                    >
                      <img
                        src={avatarUrl}
                        alt="Client Profile"
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2.5px solid #ff1379',
                          boxShadow: '0 4px 12px rgba(255, 19, 121, 0.2)',
                          display: 'block',
                          opacity: isCompressingAvatar ? 0.5 : 1
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        background: '#ff1379',
                        color: '#ffffff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}>
                        {isCompressingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                      </div>
                    </div>

                    {/* Actions and Info */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                            Client Profile Photo / Selfie
                          </span>
                          {compressedSizeKB !== null && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: '#ecfdf5',
                              color: '#059669',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '10px',
                              border: '1px solid #a7f3d0'
                            }}>
                              <ShieldCheck size={11} />
                              <span>{compressedSizeKB} KB (Optimized)</span>
                            </span>
                          )}
                        </div>
                        {(avatarFile || customUrl) && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <button
                          type="button"
                          disabled={isCompressingAvatar}
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            padding: '5px 12px',
                            background: '#ff1379',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: isCompressingAvatar ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 2px 6px rgba(255, 19, 121, 0.25)'
                          }}
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

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          style={{
                            padding: '5px 10px',
                            background: '#ffffff',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <LinkIcon size={12} />
                          <span>{showUrlInput ? 'Hide URL' : 'Image URL'}</span>
                        </button>

                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                          ⚡ Auto-compressed to &lt;100 KB
                        </span>
                      </div>

                      {/* Quick Festive Presets */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
                          {CLIENT_AVATAR_PRESETS.map((preset) => {
                            const isSelected = avatarUrl === preset.url;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setAvatarUrl(preset.url);
                                  setAvatarFile(null);
                                  setCustomUrl('');
                                  setCompressedSizeKB(null);
                                }}
                                title={preset.label}
                                style={{
                                  border: isSelected ? '2px solid #ff1379' : '1px solid #cbd5e1',
                                  borderRadius: '50%',
                                  padding: '1px',
                                  background: isSelected ? '#ff1379' : '#ffffff',
                                  cursor: 'pointer',
                                  lineHeight: 0,
                                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.label}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom URL Input Box (collapsible) */}
                  {showUrlInput && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                      <input
                        type="url"
                        placeholder="https://example.com/my-festive-photo.jpg"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        style={{
                          flex: 1,
                          height: '34px',
                          borderRadius: '6px',
                          border: '1.5px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '12px',
                          background: '#ffffff',
                          color: '#0f172a'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        style={{
                          padding: '0 12px',
                          background: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => handleGenderChange(e.target.value as Gender)}
                      style={{ width: '100%', height: '40px', padding: '0 10px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Client Billing / Residential Address *
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* 2. Slot Timings */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#ff1379" />
                  <span>2. Slot Timings & Duration</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <Calendar size={12} color="#ff1379" />
                      <span>Booking Date *</span>
                    </label>
                    <input
                      type="date"
                      style={{ 
                        width: '100%', 
                        height: '40px', 
                        padding: '0 10px', 
                        background: '#ffffff', 
                        color: '#0f172a', 
                        border: '1.5px solid #cbd5e1', 
                        borderRadius: '8px', 
                        fontSize: '13.5px', 
                        fontWeight: 700,
                        colorScheme: 'light',
                        outline: 'none'
                      }}
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <Clock size={12} color="#ff1379" />
                      <span>Start Time *</span>
                    </label>
                    <input
                      type="time"
                      style={{ 
                        width: '100%', 
                        height: '40px', 
                        padding: '0 10px', 
                        background: '#ffffff', 
                        color: '#0f172a', 
                        border: '1.5px solid #cbd5e1', 
                        borderRadius: '8px', 
                        fontSize: '13.5px', 
                        fontWeight: 700,
                        colorScheme: 'light',
                        outline: 'none'
                      }}
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      <Clock size={12} color="#ff1379" />
                      <span>End Time *</span>
                    </label>
                    <input
                      type="time"
                      style={{ 
                        width: '100%', 
                        height: '40px', 
                        padding: '0 10px', 
                        background: '#ffffff', 
                        color: '#0f172a', 
                        border: '1.5px solid #cbd5e1', 
                        borderRadius: '8px', 
                        fontSize: '13.5px', 
                        fontWeight: 700,
                        colorScheme: 'light',
                        outline: 'none'
                      }}
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Event Venue Location & Notes */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#ff1379" />
                  <span>3. Event Location & Custom Notes</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Event Ground / Venue Address
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      value={eventAddress}
                      onChange={(e) => setEventAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      style={{ width: '100%', height: '40px', padding: '0 12px', background: '#ffffff', color: '#0f172a', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter dance style preferences, choreography requests, costume synchronization details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px', 
                      border: '1.5px solid #cbd5e1', 
                      padding: '10px 12px', 
                      fontSize: '13px', 
                      fontWeight: 600,
                      background: '#ffffff', 
                      color: '#0f172a', 
                      resize: 'none',
                      fontFamily: 'inherit',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* 4. Financial Breakdown Strip */}
              <div style={{ background: '#fff0f6', padding: '14px 16px', borderRadius: '12px', border: '1px solid #ffd6e7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '4px' }}>
                  <span>Duration ({durationHours} hours @ ₹{hourlyRate}/hr):</span>
                  <strong style={{ color: '#0f172a' }}>₹{totalAmount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b', marginBottom: '8px' }}>
                  <span>50% Advance Lock Amount:</span>
                  <strong style={{ color: '#ff1379', fontSize: '14px' }}>₹{advanceAmount}</strong>
                </div>
                <div style={{ borderTop: '1px dashed #ffd6e7', paddingTop: '6px', fontSize: '11px', color: '#be185d' }}>
                  🔒 Anti-collision lock ensures your performer is reserved exclusively for this time slot.
                </div>
              </div>
            </div>

            <div className="partner-modal-footer">
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
                    <span>Proceed to QR Payment (₹{advanceAmount})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Dynamic UPI QR Code Payment & Screenshot Upload */}
        {step === 'payment' && (
          <form onSubmit={handleConfirmPayment}>
            <div className="partner-modal-body" style={{ textAlign: 'center', maxHeight: '72vh', overflowY: 'auto' }}>
              {errorMsg && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '8px', color: '#ef4444', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Countdown & Booking Code & Client Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', background: '#f8fafc', padding: '8px 14px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <img
                    src={avatarUrl}
                    alt={name}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ff1379' }}
                  />
                  <span>Booking ID: <strong style={{ color: '#0f172a' }}>{bookingCode}</strong></span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  <span>Slot Lock Expires in: {formatTimer(timeLeftSeconds)}</span>
                </div>
              </div>

              {/* Dynamic QR Image */}
              <div style={{
                width: '190px',
                height: '190px',
                margin: '0 auto 12px auto',
                padding: '8px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #ff1379',
                boxShadow: '0 8px 24px rgba(255, 19, 121, 0.15)'
              }}>
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'contain' }}
                />
              </div>

              {/* Payee Info & Copy UPI */}
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                Scan to Pay ₹{advanceAmount} via GPay / PhonePe / Paytm
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', color: '#334155', marginBottom: '14px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff1379', display: 'flex', alignItems: 'center' }}
                  title="Copy UPI ID"
                >
                  {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* UTR Number Input */}
              <div style={{ textAlign: 'left', background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  Enter 12-Digit Bank UTR / Transaction Reference ID *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 427819283921"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    padding: '0 12px',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                <span style={{ fontSize: '10.5px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                  Found on your payment app receipt after completing payment.
                </span>
              </div>

              {/* PAYMENT SCREENSHOT UPLOAD FIELD (Strictly Compressed to <= 100 KB) */}
              <div style={{
                textAlign: 'left',
                background: 'linear-gradient(135deg, #fdf4ff 0%, #ffffff 100%)',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid #f0abfc',
                boxShadow: '0 2px 8px rgba(217, 70, 239, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={15} color="#c026d3" />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                      Payment Proof Screenshot (Optional but Recommended)
                    </span>
                  </div>

                  {proofCompressedSizeKB !== null && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#ecfdf5',
                      color: '#059669',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #a7f3d0'
                    }}>
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
                    style={{
                      border: '1.5px dashed #d8b4fe',
                      borderRadius: '8px',
                      padding: '14px',
                      textAlign: 'center',
                      cursor: isCompressingProof ? 'not-allowed' : 'pointer',
                      background: '#ffffff',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isCompressingProof ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9333ea', fontSize: '12px', fontWeight: 700 }}>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Compressing screenshot to &lt; 100 KB...</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c026d3' }}>
                          <Upload size={16} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#3b0764' }}>
                            Click or Drop Screenshot Here
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#7e22ce' }}>
                            Any size file (MB/KB) will be auto-compressed to &lt; 100 KB instantly
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={proofPreviewUrl}
                        alt="Payment Proof"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1.5px solid #d946ef'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCheck2 size={14} color="#10b981" />
                          <span>Screenshot Compressed</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {proofOriginalSizeKB ? `${proofOriginalSizeKB} KB ➔ ` : ''}
                          <strong style={{ color: '#059669' }}>{proofCompressedSizeKB} KB</strong> (Ready to Upload)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => proofFileInputRef.current?.click()}
                        style={{
                          background: '#f3e8ff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#7e22ce',
                          cursor: 'pointer'
                        }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveProof}
                        style={{
                          background: '#fef2f2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="partner-modal-footer">
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
                    <span>Verify Payment & Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Confirmation */}
        {step === 'success' && (
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <CheckCircle2 size={58} color="#10b981" style={{ margin: '0 auto 14px auto' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Booking Confirmed! 🎉
            </h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', margin: '0 0 16px 0' }}>
              Performer <strong>{partner.name}</strong> is reserved for <strong>{bookingDate} ({startTime} - {endTime})</strong>.
            </p>

            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'inline-block',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#334155',
              marginBottom: '20px',
              minWidth: '320px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              {/* Client Snapshot with Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff1379' }}
                />
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>{name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{phone} • {email}</div>
                </div>
              </div>

              <div style={{ marginBottom: '4px' }}>Booking Code: <strong style={{ color: '#ff1379' }}>{bookingCode}</strong></div>
              <div style={{ marginBottom: '4px' }}>Total Amount: <strong>₹{totalAmount}</strong> (Advance Paid: ₹{advanceAmount})</div>
              <div style={{ marginBottom: '4px' }}>UTR Reference: <code style={{ color: '#0284c7' }}>{utrNumber}</code></div>

              {/* Payment Proof Preview if uploaded */}
              {proofPreviewUrl && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={proofPreviewUrl}
                    alt="Receipt"
                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>
                    Payment screenshot verified (&lt;100 KB)
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                className="btn-partner-primary"
                style={{ padding: '10px 24px' }}
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
