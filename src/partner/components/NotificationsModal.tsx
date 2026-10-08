import React from 'react';
import { X, Bell, Check, Trash2 } from 'lucide-react';
import type { PartnerRequest } from '../types/partner.types';
import { getPartnerAge } from '../utils/age.util';

interface NotificationsModalProps {
  requests: PartnerRequest[];
  isOpen: boolean;
  onClose: () => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  requests,
  isOpen,
  onClose,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '480px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="partner-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="#ff1379" />
            <h3 className="partner-modal-title">Partner Requests & Alerts ({requests.length})</h3>
          </div>
          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="partner-modal-body" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {requests.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              No pending partner requests right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <img
                      src={req.sender.avatarUrl}
                      alt={req.sender.name}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff1379' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                        {req.sender.name}, {req.sender.age || getPartnerAge(req.sender.id, req.sender.name)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        For: <strong style={{ color: '#ff1379' }}>{req.eventName}</strong> • {req.sentAt}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: '#334155', margin: '0 0 10px 0', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
                    "{req.message}"
                  </p>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-partner-outline"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => onDeclineRequest(req.id)}
                    >
                      <Trash2 size={12} style={{ marginRight: '4px' }} />
                      Decline
                    </button>
                    <button
                      className="btn-partner-primary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                      onClick={() => onAcceptRequest(req.id)}
                    >
                      <Check size={13} style={{ marginRight: '4px' }} />
                      Accept Partner
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
