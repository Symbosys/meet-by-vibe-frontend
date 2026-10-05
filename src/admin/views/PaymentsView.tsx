import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { AdminBooking } from '../types/admin.types';

interface PaymentsViewProps {
  bookings: AdminBooking[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ bookings }) => {
  const [search, setSearch] = useState('');

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

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2>QR Code Payments & Bank UTR Audit ({payments.length})</h2>
          <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
            All incoming UPI dynamic QR transactions, 12-digit UTR numbers, and payment proofs.
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
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                      <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                        {p.utrNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11px' }}>Auto Webhook / Awaiting</span>
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
  );
};
