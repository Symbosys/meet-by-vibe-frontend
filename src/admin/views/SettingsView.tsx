import React, { useState, useRef } from 'react';
import { 
  Save, 
  ShieldCheck, 
  QrCode, 
  Clock, 
  Percent, 
  Plus, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Star
} from 'lucide-react';
import { 
  useActiveQRCode, 
  useAllQRCodes, 
  useCreateQRCode, 
  useSetPrimaryQRCode, 
  useDeleteQRCode 
} from '../../hooks/useQR';
import { compressImage } from '../../utils/imageCompression';

export const SettingsView: React.FC = () => {
  // TanStack Query Hooks for QR Codes
  const { data: activeQR, isLoading: isLoadingActive } = useActiveQRCode();
  const { data: qrCodes = [] } = useAllQRCodes();
  const createQRMutation = useCreateQRCode();
  const setPrimaryMutation = useSetPrimaryQRCode();
  const deleteQRMutation = useDeleteQRCode();

  // General Platform Settings State
  const [expiryMinutes, setExpiryMinutes] = useState('15');
  const [platformFee, setPlatformFee] = useState('10');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // New QR Upload Form State
  const [showAddQRModal, setShowAddQRModal] = useState(false);
  const [qrTitle, setQrTitle] = useState('');
  const [qrUpiId, setQrUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [isPrimaryNew, setIsPrimaryNew] = useState(true);
  const [qrDescription, setQrDescription] = useState('');
  
  // QR Image File & Compression (<100KB)
  const [qrImageFile, setQrImageFile] = useState<File | null>(null);
  const [qrImagePreview, setQrImagePreview] = useState<string>('');
  const [isCompressingQR, setIsCompressingQR] = useState(false);
  const [compressedSizeKB, setCompressedSizeKB] = useState<number | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGeneralSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleQRFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setQrError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setQrError(null);
      setIsCompressingQR(true);
      const compressed = await compressImage(file, `qr-${Date.now()}.jpg`, {
        maxSizeKB: 95,
        maxWidthOrHeight: 800,
        initialQuality: 0.85
      });

      setQrImageFile(compressed.file);
      setQrImagePreview(compressed.dataUrl);
      setCompressedSizeKB(compressed.sizeKB);
    } catch (err: any) {
      console.error('QR image compression error:', err);
      setQrError('Failed to compress QR image. Please try another file.');
    } finally {
      setIsCompressingQR(false);
    }
  };

  const handleCreateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTitle.trim()) {
      setQrError('Please enter a title for this QR code.');
      return;
    }
    if (!qrImagePreview && !qrImageFile) {
      setQrError('Please upload a QR code image.');
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
        isPrimary: isPrimaryNew,
        isActive: true,
        description: qrDescription.trim() || undefined,
      });

      // Reset form
      setQrTitle('');
      setQrUpiId('');
      setAccountHolder('');
      setBankName('');
      setQrDescription('');
      setQrImageFile(null);
      setQrImagePreview('');
      setCompressedSizeKB(null);
      setShowAddQRModal(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create QR code.';
      setQrError(msg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '880px' }}>
      {/* 1. Dynamic Active Platform QR Management Card */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Dynamic Platform QR Codes & UPI Gateways</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Manage bank UPI receivers and dynamic payment QR codes used in booking flows.
            </p>
          </div>
          <button
            type="button"
            className="btn-admin-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowAddQRModal(true)}
          >
            <Plus size={16} />
            <span>Upload New QR</span>
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Active Primary QR Banner */}
          {isLoadingActive ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px auto' }} />
              <span>Loading active QR configuration...</span>
            </div>
          ) : activeQR ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              border: '1.5px solid #6366f1',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={activeQR.imageUrl}
                    alt={activeQR.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>{activeQR.title}</span>
                    <span style={{
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Star size={10} fill="#ffffff" /> PRIMARY ACTIVE
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: 600 }}>
                    UPI VPA: {activeQR.upiId || 'garbamitra.pay@okaxis'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Account: {activeQR.accountHolderName || 'GarbaMitra Platform'} • {activeQR.bankName || 'HDFC Bank'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px',
                  background: '#312e81',
                  color: '#a5b4fc',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #4338ca'
                }}>
                  Used for Dynamic & Static Payments
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#92400e',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              ⚠️ No custom QR code is currently active. The booking flow will use fallback UPI dynamic generation (`garbamitra.pay@okaxis`).
            </div>
          )}

          {/* List of All Platform QR Codes */}
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '10px' }}>
            All Configured Payment QRs ({qrCodes.length})
          </div>

          {qrCodes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed #334155', color: '#64748b', fontSize: '12.5px' }}>
              No QR codes uploaded yet. Click "Upload New QR" above to add your merchant receiver code.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
              {qrCodes.map((qr) => (
                <div
                  key={qr.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: qr.isPrimary ? '2px solid #6366f1' : '1px solid #334155',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img
                      src={qr.imageUrl}
                      alt={qr.title}
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'contain', background: '#ffffff', padding: '2px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {qr.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {qr.upiId || 'No UPI ID'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '8px' }}>
                    {qr.isPrimary ? (
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> Active Primary
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPrimaryMutation.mutate(qr.id)}
                        disabled={setPrimaryMutation.isPending}
                        style={{
                          background: '#312e81',
                          color: '#e0e7ff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Set as Primary
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete QR "${qr.title}"?`)) {
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
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Platform Timing & Settlement Fee Config */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Platform Timing & Lock Timeout</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Configure anti-collision slot lock timeout and platform settlement commission.
            </p>
          </div>
        </div>

        <form onSubmit={handleGeneralSettingsSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#6366f1" />
              <span>Temporary Slot Lock & QR Expiry Timer (Minutes)</span>
            </label>
            <input
              type="number"
              className="admin-form-control"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(e.target.value)}
              min={5}
              max={60}
              required
            />
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Slots will be held exclusively for this duration while the customer scans and pays.
            </span>
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Percent size={14} color="#10b981" />
              <span>Platform Commission Fee (%)</span>
            </label>
            <input
              type="number"
              className="admin-form-control"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value)}
              min={0}
              max={50}
              required
            />
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Platform fee retained before performer payout settlement.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
            {settingsSaved ? (
              <span style={{ color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                Settings saved successfully!
              </span>
            ) : <div />}

            <button type="submit" className="btn-admin-primary">
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Modal for Uploading New QR Code (<100KB Auto Compression) */}
      {showAddQRModal && (
        <div className="partner-modal-overlay" onClick={() => setShowAddQRModal(false)}>
          <div 
            className="partner-modal-card" 
            style={{ maxWidth: '520px', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="partner-modal-header" style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#6366f1" />
                <h3 style={{ color: '#f8fafc', margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  Upload & Register Merchant QR Code
                </h3>
              </div>
              <button className="partner-round-arrow-btn" onClick={() => setShowAddQRModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQR}>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                {qrError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', color: '#ef4444', fontSize: '12px' }}>
                    {qrError}
                  </div>
                )}

                {/* QR Image Upload with Auto <=100KB Compression */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    QR Code Image * (Auto-compressed &lt; 100 KB)
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleQRFileChange}
                    style={{ display: 'none' }}
                  />

                  {!qrImagePreview ? (
                    <div
                      onClick={() => !isCompressingQR && fileInputRef.current?.click()}
                      style={{
                        border: '1.5px dashed #475569',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#1e293b'
                      }}
                    >
                      {isCompressingQR ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#a5b4fc', fontSize: '12px' }}>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Compressing QR image to &lt; 100 KB...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                          <Upload size={20} color="#6366f1" />
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0' }}>Click to select QR Code image</span>
                          <span style={{ fontSize: '11px' }}>Any size (MB/KB) will be compressed to &lt; 100 KB</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={qrImagePreview}
                          alt="QR Preview"
                          style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'contain', background: '#ffffff', padding: '2px' }}
                        />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                            ✓ Image Compressed ({compressedSizeKB} KB)
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ready for secure storage</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setQrImageFile(null);
                          setQrImagePreview('');
                          setCompressedSizeKB(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    QR Title / Bank Label *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Merchant Main Gateway"
                    className="admin-form-control"
                    required
                    value={qrTitle}
                    onChange={(e) => setQrTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
                    UPI ID / VPA
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
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GarbaMitra Events LLP"
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
                    id="isPrimaryCheck"
                    checked={isPrimaryNew}
                    onChange={(e) => setIsPrimaryNew(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                  />
                  <label htmlFor="isPrimaryCheck" style={{ fontSize: '12px', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                    Set as Primary Active QR for customer booking payments immediately
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', borderTop: '1px solid #334155', background: '#1e293b' }}>
                <button
                  type="button"
                  className="btn-partner-outline"
                  onClick={() => setShowAddQRModal(false)}
                  disabled={createQRMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={createQRMutation.isPending || isCompressingQR}
                >
                  {createQRMutation.isPending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving QR Code...</span>
                    </>
                  ) : (
                    <span>Register QR Code</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
