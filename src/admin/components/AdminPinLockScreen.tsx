import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import './admin-pin-lock.css';

interface AdminPinLockScreenProps {
  onAuthenticated: () => void;
}

export const AdminPinLockScreen: React.FC<AdminPinLockScreenProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only accept numbers
    const lastChar = value.slice(-1);
    if (value && !/^\d+$/.test(lastChar)) return;

    const newPin = [...pin];
    newPin[index] = lastChar;
    setPin(newPin);
    setError('');

    // If digit entered, jump to next input
    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If 6th digit entered, auto submit
    if (lastChar && index === 5) {
      const fullPin = newPin.join('');
      if (fullPin.length === 6) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, 6).split('');
    const newPin = ['', '', '', '', '', ''];
    digits.forEach((d, i) => {
      newPin[i] = d;
    });
    setPin(newPin);
    setError('');

    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (digits.length === 6) {
      verifyPin(digits.join(''));
    }
  };

  const verifyPin = async (pinString: string) => {
    if (pinString.length !== 6) {
      setError('Please enter all 6 digits of your admin password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.verifyAdminPin(pinString);
      if (response.success && response.data?.token) {
        sessionStorage.setItem('garba_admin_auth_token', response.data.token);
        onAuthenticated();
      } else {
        triggerError('Invalid admin password. Access denied.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid admin password. Access denied.';
      triggerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setPin(['', '', '', '', '', '']);
    setTimeout(() => {
      setIsShaking(false);
      inputRefs.current[0]?.focus();
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin.join(''));
  };

  return (
    <div className="admin-lock-screen">
      <div className="admin-lock-backdrop" />

      <div className="admin-lock-card">
        {/* Brand & Logo matching exact image */}
        <div className="admin-lock-logo-box">
          <div className="admin-lock-logo-icon">
            <svg width="54" height="46" viewBox="0 0 64 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Female Dandiya Dancer */}
              <circle cx="20" cy="10" r="4.5" fill="#e11d48" />
              <path d="M14 19L20 15L26 21L20 28Z" fill="#be123c" />
              <path d="M12 28C12 28 8 46 22 46C30 46 26 28 26 28L12 28Z" fill="#e11d48" />
              <line x1="8" y1="12" x2="16" y2="20" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="26" y1="15" x2="33" y2="9" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Male Dandiya Dancer */}
              <circle cx="44" cy="9" r="4.5" fill="#f59e0b" />
              <path d="M38 18L44 14L50 20L44 27Z" fill="#d97706" />
              <path d="M38 27C38 27 34 46 45 46C53 46 51 27 51 27L38 27Z" fill="#f59e0b" />
              <line x1="33" y1="10" x2="41" y2="18" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="50" y1="14" x2="57" y2="8" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="admin-lock-brand-name">
            <span className="brand-garba">Garba</span>
            <span className="brand-hub">Hub</span>
          </h1>
          <span className="admin-lock-access-tag">ADMIN ACCESS</span>

          {/* Lotus ornament divider */}
          <div className="admin-lock-lotus-divider">
            <div className="admin-lock-lotus-line" />
            <div className="admin-lock-lotus-icon">
              <svg width="22" height="16" viewBox="0 0 24 16" fill="currentColor">
                <path d="M12 0C12 0 8 7 8 11C8 13.2 9.8 15 12 15C14.2 15 16 13.2 16 11C16 7 12 0 12 0ZM5.5 4C5.5 4 3 9 4 12C4.5 13.5 6 14.5 7.5 14C5.5 12 5.5 7.5 5.5 4ZM18.5 4C18.5 4 21 9 20 12C19.5 13.5 18 14.5 16.5 14C18.5 12 18.5 7.5 18.5 4Z" />
              </svg>
            </div>
            <div className="admin-lock-lotus-line" />
          </div>
        </div>

        {/* Headings */}
        <h2 className="admin-lock-title">Enter Admin Password</h2>
        <p className="admin-lock-subtitle">
          Please enter your 6-digit admin password to continue
        </p>

        {/* Error Notification */}
        {error && (
          <div className="admin-lock-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 6-Digit PIN Form */}
        <form onSubmit={handleSubmit}>
          <div className={`admin-lock-pin-grid ${isShaking ? 'shake' : ''}`} onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`admin-lock-pin-input ${digit ? 'filled' : ''}`}
                disabled={loading}
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            className="admin-lock-submit-btn"
            disabled={loading || pin.join('').length !== 6}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="admin-lock-spinner" />
                <span>Verifying PIN...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Panel</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPinLockScreen;
