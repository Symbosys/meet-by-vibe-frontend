import React, { useState } from 'react';
import { Save, ShieldCheck, QrCode, Clock, Percent } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [merchantUpi, setMerchantUpi] = useState('garbamitra.pay@okaxis');
  const [expiryMinutes, setExpiryMinutes] = useState('15');
  const [platformFee, setPlatformFee] = useState('10');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="admin-card" style={{ maxWidth: '640px' }}>
      <div className="admin-card-header">
        <div>
          <h2>Platform & QR Booking Configuration</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            Configure merchant UPI payment address, QR lock timeout, and performer commissions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={14} color="#f59e0b" />
            <span>Platform Merchant UPI VPA (For Dynamic QR)</span>
          </label>
          <input
            type="text"
            className="admin-form-control"
            value={merchantUpi}
            onChange={(e) => setMerchantUpi(e.target.value)}
            placeholder="e.g. garbamitra@bank"
            required
          />
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            All booking QR codes will generate payment requests to this merchant UPI address.
          </span>
        </div>

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
            Slots will be held for this duration while the customer scans and pays.
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
          {saved ? (
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
  );
};
