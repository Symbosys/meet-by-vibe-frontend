import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import type { GarbaPartner, ChatMessage } from '../types/partner.types';

interface PartnerChatModalProps {
  partner: GarbaPartner | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerChatModal: React.FC<PartnerChatModalProps> = ({
  partner,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (partner) {
      setMessages([
        {
          id: 'm-1',
          senderId: partner.id,
          text: `Hey! I saw you are looking for a partner for Navratri! Which day are you planning?`,
          timestamp: '10:30 AM',
          isMe: false,
        },
      ]);
    }
  }, [partner, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !partner) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate partner reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: partner.id,
        text: `Awesome! Let's coordinate the timing. I will be wearing traditional yellow Chaniya Choli! ✨`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <div className="partner-modal-overlay" onClick={onClose}>
      <div 
        className="partner-modal-card" 
        style={{ maxWidth: '460px', height: '560px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="partner-modal-header" style={{ background: '#fdf2f8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={partner.avatarUrl}
              alt={partner.name}
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ff1379' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{partner.name}</span>
                {partner.isVerified && <CheckCircle size={14} fill="#0284c7" color="#ffffff" />}
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                ● Active Now • ⚡ {partner.matchScore}% Match
              </div>
            </div>
          </div>

          <button className="partner-round-arrow-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Chat History */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                alignSelf: m.isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  background: m.isMe ? '#ff1379' : '#ffffff',
                  color: m.isMe ? '#ffffff' : '#0f172a',
                  padding: '10px 14px',
                  borderRadius: m.isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  border: m.isMe ? 'none' : '1px solid #e2e8f0'
                }}
              >
                {m.text}
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
                {m.timestamp}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ padding: '6px 12px', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {['Are you joining 18 Oct?', 'Do you know Dodhiya steps?', 'Where do we meet?'].map((quickText) => (
            <button
              key={quickText}
              onClick={() => setInputText(quickText)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#475569',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {quickText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              padding: '0 14px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-partner-primary"
            style={{ padding: '0', width: '40px', height: '40px', borderRadius: '50%', justifyContent: 'center' }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
