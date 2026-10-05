import React, { useState, useRef } from 'react';
import { 
  Search, 
  QrCode, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Star, 
  Loader2, 
  Image as ImageIcon, 
  ExternalLink, 
  X,
  FileCheck2,
  Building2,
  Check,
  Copy,
  FolderOpen
} from 'lucide-react';
import type { AdminBooking } from '../types/admin.types';
import { 
  useActiveQRCode, 
  useAllQRCodes, 
  useCreateQRCode, 
  useSetPrimaryQRCode, 
  useDeleteQRCode 
} from '../../hooks/useQR';
import { compressImage } from '../../utils/imageCompression';

interface PaymentsViewProps {
  bookings: AdminBooking[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ bookings }) => {
  const [search, setSearch] = useState('');
  
  // TanStack Query QR Hooks
  const { data: activeQR, isLoading: isLoadingActive } = useActiveQRCode();
  const { data: qrCodes = [], isLoading: isLoadingQRs } = useAllQRCodes();
  const createQRMutation = useCreateQRCode();
  const setPrimaryMutation = useSetPrimaryQRCode();
  const deleteQRMutation = useDeleteQRCode();

  // QR Upload & Selection Modal State
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'upload' | 'select'>('upload');
  
  // Form State for New QR
  const [qrTitle, setQrTitle] = useState('Primary Client Payment QR');
  const [qrUpiId, setQrUpiId] = useState(activeQR?.upiId || 'garbamitra.pay@okhdfcbank');
  const [accountHolder, setAccountHolder] = useState(activeQR?.accountHolderName || 'GarbaMitra Platform');
  const [bankName, setBankName] = useState(activeQR?.bankName || 'HDFC Bank');
  const [isPrimary, setIsPrimary] = useState(true);
  const [qrDescription, setQrDescription] = useState('Official QR scanned by clients in booking modal');

  // Image & Compression State (< 100 KB)
  const [qrImageFile, setQrImageFile] = useState<File | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string>('');
  const [isCompressingQR, setIsCompressingQR] = useState(false);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null);
  const [originalSizeKB, setOriginalSizeKB] = useState<number | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hidden File Inputs
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox for Payment Proof Screenshot
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const payments = bookings
    .map((b) => ({
      bookingCode: b.bookingCode,
      bookerName: b.name,
      performerName: b.performer?.name,
      ...b.payment
    }))
    .filter((p) => p.amount !== undefined)
    .filter((p) => {
      return (
        p.bookingCode?.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionRef?.toLowerCase().includes(search.toLowerCase()) ||
        (p.utrNumber && p.utrNumber.includes(search)) ||
        p.bookerName?.toLowerCase().includes(search.toLowerCase())
      );
    });

  const totalCollected = payments.reduce((acc, p) => p.paymentStatus === 'SUCCESS' ? acc + (p.amount || 0) : acc, 0);

  // Directly handle File Selection & Auto-Compress to <= 100 KB
  const processAndOpenModal = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    try {
      setQrError(null);
      setIsCompressingQR(true);
      setIsQRModalOpen(true);
      setModalTab('upload');

      // Auto compress strictly <= 95 KB
      const compressed = await compressImage(file, `payment-qr-${Date.now()}.jpg`, {
        maxSizeKB: 95,
        maxWidthOrHeight: 800,
        initialQuality: 0.85
      });

      setQrImageFile(compressed.file);
      setQrImagePreview(compressed.dataUrl);
      setCompressedSizeKB(compressed.sizeKB);
      setOriginalSizeKB(compressed.originalSizeKB);
      if (!qrTitle) {
        setQrTitle('Primary Client Payment QR');
      }
    } catch (err: any) {
      console.error('QR compression error:', err);
      setQrError('Failed to compress QR image. Please try another image.');
    } finally {
      setIsCompressingQR(false);
    }
  };

  const handleDirectFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndOpenModal(file);
    }
    // reset input value so user can pick same file again if needed
    e.target.value = '';
  };

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTitle.trim()) {
      setQrError('Please enter a title for this QR code.');
      return;
    }
    if (!qrImagePreview && !qrImageFile) {
      setQrError('Please select a QR code image to upload.');
      return;
    }

    try {
      setQrError(null);
      await createQRMutation.mutateAsync({
        title: qrTitle.trim(),
        imageUrl: qrImagePreview,
        upiId: qrUpiId.trim() || undefined,
        accountHolderName: accountHolder.trim() || undefined,
        bankName: bankName.trim() || undefined,
        isPrimary: isPrimary,
        isActive: true,
        description: qrDescription.trim() || undefined,
      });

      setSuccessMsg(`QR Code "${qrTitle}" is now live! All clients will scan this QR to pay.`);
      setTimeout(() => setSuccessMsg(null), 5000);

      // Close modal
      setIsQRModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to save QR code.';
      setQrError(msg);
    }
  };

  const handleCopyUPI = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden File Input for Direct 1-Click File Dialog */}
      <input
        type="file"
        ref={directFileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleDirectFileSelect}
        style={{ display: 'none' }}
      />

      {/* Success Notification Alert */}
      {successMsg && (
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
          gap: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Active Primary Payment QR Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        borderRadius: '14px',
        border: '1.5px solid #6366f1',
        padding: '18px 22px',
        boxShadow: '0 6px 24px rgba(99, 102, 241, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '76px',
            height: '76px',
            background: '#ffffff',
            borderRadius: '12px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2.5px solid #818cf8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            flexShrink: 0
          }}>
            {isLoadingActive ? (
              <Loader2 size={24} className="animate-spin" color="#6366f1" />
            ) : activeQR?.imageUrl ? (
              <img
                src={activeQR.imageUrl}
                alt={activeQR.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
              />
            ) : (
              <QrCode size={40} color="#6366f1" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                {activeQR?.title || 'Default Platform QR Code'}
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle2 size={12} /> LIVE PAYMENT QR FOR CLIENTS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#cbd5e1', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>
                UPI ID: {activeQR?.upiId || 'garbamitra.pay@okhdfcbank'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyUPI(activeQR?.upiId || 'garbamitra.pay@okhdfcbank')}
                style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                title="Copy UPI ID"
              >
                {copiedUpi ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>

            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              Payee: <strong style={{ color: '#e2e8f0' }}>{activeQR?.accountHolderName || 'GarbaMitra Platform'}</strong> • Bank: <strong style={{ color: '#e2e8f0' }}>{activeQR?.bankName || 'HDFC Bank'}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons: 1-Click File Dialog & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Main Direct File Upload Button */}
          <button
            type="button"
            className="btn-admin-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #ff1379 0%, #7928ca 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(255, 19, 121, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => directFileInputRef.current?.click()}
          >
            <FolderOpen size={17} />
            <span>Select & Upload QR Code Image</span>
          </button>

          {/* Manage / Switch from existing QRs */}
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            onClick={() => {
              setModalTab('select');
              setIsQRModalOpen(true);
            }}
          >
            <QrCode size={15} />
            <span>Saved QRs ({qrCodes.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Payments & Audit Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>QR Code Payments & Bank UTR Audit ({payments.length})</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              All incoming UPI dynamic QR transactions, 12-digit UTR numbers, and uploaded client receipts.
            </p>
          </div>

          <div className="admin-card-actions">
            <div className="admin-search-wrapper">
              <Search size={14} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search UTR, Ref ID, Code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}>
              Settled: ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Txn Reference & Booking</th>
                <th>Booker & Performer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Bank UTR Number</th>
                <th>Proof Screenshot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc', fontFamily: 'monospace', fontSize: '12px' }}>
                        {p.transactionRef || 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#f59e0b' }}>
                        {p.bookingCode}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 500 }}>{p.bookerName}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        For: {p.performerName || 'Performer'}
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: '#10b981', fontSize: '14px' }}>₹{p.amount}</strong>
                    </td>

                    <td>
                      <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px' }}>
                        {p.paymentMethod || 'UPI_QR_DYNAMIC'}
                      </span>
                    </td>

                    <td>
                      {p.utrNumber ? (
                        <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 700, fontSize: '12.5px' }}>
                          {p.utrNumber}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '11px' }}>Auto Webhook / Awaiting</span>
                      )}
                    </td>

                    <td>
                      {p.paymentScreenshotUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProofUrl(p.paymentScreenshotUrl!)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#38bdf8',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <img
                            src={p.paymentScreenshotUrl}
                            alt="Receipt"
                            style={{ width: '20px', height: '20px', borderRadius: '3px', objectFit: 'cover' }}
                          />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '11px' }}>No Screenshot</span>
                      )}
                    </td>

                    <td>
                      <span className={`status-pill ${p.paymentStatus || 'PENDING'}`}>
                        {p.paymentStatus || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Modal for Uploading / Reviewing QR Code (<100KB Auto Compression) */}
      {isQRModalOpen && (
        <div className="partner-modal-overlay" onClick={() => setIsQRModalOpen(false)}>
          <div 
            className="partner-modal-card" 
            style={{ maxWidth: '580px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="partner-modal-header" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#6366f1" />
                <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {modalTab === 'upload' ? 'Upload & Activate Merchant QR' : 'Select Active Payment QR'}
                </h3>
              </div>
              <button className="partner-round-arrow-btn" onClick={() => setIsQRModalOpen(false)}>
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', background: '#1e293b' }}>
              <button
                type="button"
                onClick={() => setModalTab('upload')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'upload' ? '2.5px solid #ff1379' : 'none',
                  color: modalTab === 'upload' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                + Upload New QR Image
              </button>
              <button
                type="button"
                onClick={() => setModalTab('select')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'select' ? '2.5px solid #ff1379' : 'none',
                  color: modalTab === 'select' ? '#ffffff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Choose from Saved QRs ({qrCodes.length})
              </button>
            </div>

            {modalTab === 'upload' ? (
              <form onSubmit={handleCreateQR}>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '68vh', overflowY: 'auto' }}>
                  {qrError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', color: '#ef4444', fontSize: '12px' }}>
                      {qrError}
                    </div>
                  )}

                  {/* QR Image Dropzone & Auto Compression (<100KB) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                      QR Image File * (Auto-compressed to &lt; 100 KB)
                    </label>

                    <input
                      type="file"
                      ref={modalFileInputRef}
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) processAndOpenModal(f);
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                    />

                    {!qrImagePreview ? (
                      <div
                        onClick={() => !isCompressingQR && modalFileInputRef.current?.click()}
                        style={{
                          border: '1.5px dashed #475569',
                          borderRadius: '8px',
                          padding: '24px',
                          textAlign: 'center',
                          cursor: isCompressingQR ? 'not-allowed' : 'pointer',
                          background: '#1e293b',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isCompressingQR ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#a5b4fc', fontSize: '12.5px' }}>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Compressing QR code image to &lt; 100 KB...</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                              <Upload size={20} />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                              Click to Select QR Code Image File
                            </div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              PNG, JPG, WEBP • Auto-compressed to &lt; 100 KB for fast client scanning
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#1e293b',
                        border: '1.5px solid #10b981',
                        borderRadius: '8px',
                        padding: '12px 14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={qrImagePreview}
                            alt="QR Preview"
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '6px',
                              objectFit: 'contain',
                              background: '#ffffff',
                              padding: '2px',
                              border: '1.5px solid #ff1379'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={15} />
                              <span>QR Image Selected & Compressed</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                              {originalSizeKB ? `${originalSizeKB} KB ➔ ` : ''}
                              <strong style={{ color: '#10b981' }}>{compressedSizeKB} KB</strong> (&lt; 100 KB Verified)
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => modalFileInputRef.current?.click()}
                            style={{
                              background: '#312e81',
                              color: '#a5b4fc',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Change File
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQrImageFile(null);
                              setQrImagePreview('');
                              setCompressedSizeKB(null);
                            }}
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                      QR Title / Label *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Primary Booking Payment QR"
                      className="admin-form-control"
                      required
                      value={qrTitle}
                      onChange={(e) => setQrTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                      Merchant UPI ID / VPA *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. garbamitra.pay@okhdfcbank"
                      className="admin-form-control"
                      value={qrUpiId}
                      onChange={(e) => setQrUpiId(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        Account Holder / Payee Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GarbaMitra Platform"
                        className="admin-form-control"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        className="admin-form-control"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
                    <input
                      type="checkbox"
                      id="isPrimaryCheckInModal"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#ff1379' }}
                    />
                    <label htmlFor="isPrimaryCheckInModal" style={{ fontSize: '12px', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                      Set as Primary Live Payment QR (Clients will immediately scan this QR)
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #334155', background: '#1e293b' }}>
                  <button
                    type="button"
                    className="btn-partner-outline"
                    onClick={() => setIsQRModalOpen(false)}
                    disabled={createQRMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-admin-primary"
                    disabled={createQRMutation.isPending || isCompressingQR || !qrImagePreview}
                    style={{ background: 'linear-gradient(135deg, #ff1379 0%, #7928ca 100%)', opacity: !qrImagePreview ? 0.6 : 1 }}
                  >
                    {createQRMutation.isPending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Saving & Activating QR...</span>
                      </>
                    ) : (
                      <span>Save & Activate for Clients</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Tab 2: Choose from Saved QRs */
              <div style={{ padding: '20px', maxHeight: '68vh', overflowY: 'auto' }}>
                <div style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '14px' }}>
                  Click "Set as Active QR" on any saved QR code to switch the live payment receiver for all client bookings.
                </div>

                {isLoadingQRs ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                    <span>Loading saved QR codes...</span>
                  </div>
                ) : qrCodes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', border: '1px dashed #334155', borderRadius: '8px' }}>
                    No saved QR codes found. Switch to the Upload tab to add one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {qrCodes.map((qr) => (
                      <div
                        key={qr.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#1e293b',
                          border: qr.isPrimary ? '2px solid #10b981' : '1px solid #334155',
                          borderRadius: '8px',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={qr.imageUrl}
                            alt={qr.title}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '6px',
                              objectFit: 'contain',
                              background: '#ffffff',
                              padding: '2px'
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{qr.title}</span>
                              {qr.isPrimary && (
                                <span style={{ background: '#10b981', color: '#ffffff', fontSize: '9.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '8px' }}>
                                  LIVE PRIMARY
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: '#a5b4fc', fontFamily: 'monospace' }}>
                              {qr.upiId || 'No UPI ID'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {!qr.isPrimary && (
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryMutation.mutate(qr.id);
                                setIsQRModalOpen(false);
                                setSuccessMsg(`Active payment QR changed to "${qr.title}"`);
                                setTimeout(() => setSuccessMsg(null), 4000);
                              }}
                              disabled={setPrimaryMutation.isPending}
                              style={{
                                background: '#312e81',
                                color: '#e0e7ff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Set as Active QR
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete QR code "${qr.title}"?`)) {
                                deleteQRMutation.mutate(qr.id);
                              }
                            }}
                            disabled={deleteQRMutation.isPending}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete QR"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Lightbox Modal for Payment Screenshot Proof */}
      {selectedProofUrl && (
        <div className="partner-modal-overlay" onClick={() => setSelectedProofUrl(null)}>
          <div
            className="partner-modal-card"
            style={{ maxWidth: '520px', background: '#0f172a', color: '#f8fafc', padding: '16px', border: '1px solid #334155' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={16} color="#38bdf8" />
                <span>Customer Uploaded Payment Proof Screenshot</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProofUrl(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#020617', borderRadius: '8px', padding: '8px', textAlign: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
              <img
                src={selectedProofUrl}
                alt="Payment Proof Full"
                style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '6px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-admin-primary"
                onClick={() => setSelectedProofUrl(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
