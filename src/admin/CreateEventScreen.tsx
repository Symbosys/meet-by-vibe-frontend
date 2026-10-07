import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Crosshair,
  ArrowLeft,
  CheckCircle2,
  Heart,
  X,
  Upload,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Shirt,
  ShieldCheck,
  UserCheck,
  DollarSign,
  Globe,
  CreditCard,
  Copy,
  Check,
  FileCheck2
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import './create-event.css';
import { useCreateEvent } from '../hooks/useEvents';
import { useActiveQRCode } from '../hooks/useQR';
import { compressImage } from '../utils/imageCompression';

interface CreateEventScreenProps {
  onBack?: () => void;
}

export const CreateEventScreen: React.FC<CreateEventScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const proofFileInputRef = useRef<HTMLInputElement>(null);
  const createEventMutation = useCreateEvent();
  const { data: activeQR, refetch: refetchActiveQR } = useActiveQRCode();

  // Multi-step flow: 'form' -> 'payment' -> 'success'
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  // Event Registration Fee
  const REGISTRATION_FEE = 999;
  const [registrationCode, setRegistrationCode] = useState<string>('');

  // Payment Verification State
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(900); // 15 mins
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [isCompressingProof, setIsCompressingProof] = useState<boolean>(false);
  const [proofCompressedSizeKB, setProofCompressedSizeKB] = useState<number | null>(null);

  // Location selector state using country-state-city
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('GJ');

  // Form State strictly mapping 1-to-1 with Prisma `Event` schema
  const [formData, setFormData] = useState({
    title: 'Grand Navratri Mahotsav 2026',
    slug: 'grand-navratri-mahotsav-2026',
    description: 'Experience 9 nights of divine devotion, traditional Dodhiya, Raas Garba with top artists, authentic Gujarati food courts, and exciting prizes.',
    
    // Schedule & Timings
    eventDate: new Date().toISOString().split('T')[0],
    endDate: '',
    startTime: '07:30 PM',
    endTime: '01:00 AM',

    // Location & Venue
    venue: 'GMDC Ground',
    address: 'Drive In Road, Memnagar',
    country: 'India',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380052',
    latitude: 23.0489,
    longitude: 72.5312,

    // Ticketing & Capacity
    pricePerPass: 499,
    totalCapacity: 5000,

    // Status & Visibility
    status: 'UPCOMING' as 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'DRAFT' | 'CANCELLED',
    isFeatured: true,
    isActive: true,

    // Organizer Details
    organizerName: 'GarbaMitra Official & Cultural Club',
    organizerContact: '+91 98765 43210',

    // Guidelines & Dress Code
    dressCode: 'Traditional Chaniya Choli / Kurta Kediya',

    // Fallback Image URL
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80',
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>(
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80'
  );

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Prisma `rules` String Array
  const [rules, setRules] = useState<string[]>([
    'Traditional Garba attire mandatory for ground entry',
    'Valid Digital Pass QR Code & Photo ID required at gate',
    'Dandiya sticks permitted inside arena',
    'Outside food and alcohol strictly prohibited'
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');

  const [isFavoritePreview, setIsFavoritePreview] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Available Countries list
  const countries = useMemo(() => {
    return Country.getAllCountries();
  }, []);

  // Available States for selected country
  const states = useMemo(() => {
    return State.getStatesOfCountry(selectedCountryCode);
  }, [selectedCountryCode]);

  // Available Cities for selected state
  const cities = useMemo(() => {
    if (!selectedStateCode) return [];
    return City.getCitiesOfState(selectedCountryCode, selectedStateCode);
  }, [selectedCountryCode, selectedStateCode]);

  // Handle State Dropdown Change
  const handleStateChange = (stateIsoCode: string) => {
    setSelectedStateCode(stateIsoCode);
    const foundState = states.find((s) => s.isoCode === stateIsoCode);
    const stateName = foundState ? foundState.name : stateIsoCode;

    const newCities = City.getCitiesOfState(selectedCountryCode, stateIsoCode);
    const defaultCity = newCities.length > 0 ? newCities[0].name : '';
    const defaultLat = newCities.length > 0 && newCities[0].latitude
      ? Number(newCities[0].latitude)
      : (foundState?.latitude ? Number(foundState.latitude) : formData.latitude);
    const defaultLng = newCities.length > 0 && newCities[0].longitude
      ? Number(newCities[0].longitude)
      : (foundState?.longitude ? Number(foundState.longitude) : formData.longitude);

    setFormData((prev) => ({
      ...prev,
      state: stateName,
      city: defaultCity,
      latitude: defaultLat || prev.latitude,
      longitude: defaultLng || prev.longitude,
    }));
  };

  // Handle City Dropdown Change
  const handleCityChange = (cityName: string) => {
    const foundCity = cities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      city: cityName,
      latitude: foundCity?.latitude ? Number(foundCity.latitude) : prev.latitude,
      longitude: foundCity?.longitude ? Number(foundCity.longitude) : prev.longitude,
    }));
  };

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    if (!formData.title) return;
    const generated = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, slug: generated }));
  };

  // Add rule
  const handleAddRule = () => {
    if (newRuleInput.trim()) {
      setRules([...rules, newRuleInput.trim()]);
      setNewRuleInput('');
    }
  };

  // Remove rule
  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Banner file selection & auto compression
  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, 'event-banner.jpg', {
        maxSizeKB: 95,
        maxWidthOrHeight: 1200,
      });
      setBannerFile(compressed.file);
      setBannerPreview(compressed.dataUrl);
    } catch (err) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  // Gallery files selection
  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsCompressing(true);
      const results = await Promise.all(
        files.map((file, i) =>
          compressImage(file, `gallery-${Date.now()}-${i}.jpg`, {
            maxSizeKB: 90,
            maxWidthOrHeight: 1000,
          })
        )
      );
      setGalleryFiles((prev) => [...prev, ...results.map((r) => r.file)]);
      setGalleryPreviews((prev) => [...prev, ...results.map((r) => r.dataUrl)]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Formatted date string for preview
  const formattedPreviewDate = useMemo(() => {
    if (!formData.eventDate) return '10 Oct 2026';
    try {
      const d = new Date(formData.eventDate);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return formData.eventDate;
    }
  }, [formData.eventDate]);

  // 15-Minute Countdown Timer for QR Payment
  useEffect(() => {
    if (step === 'payment' && timeLeftSeconds > 0) {
      const timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, timeLeftSeconds]);

  // Format Timer string MM:SS
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Copy UPI ID
  const handleCopyUpi = () => {
    const upi = activeQR?.upiId || 'meetbyvibe@ybl';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Screenshot compression <= 95 KB
  const handleProofFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP) for payment receipt.');
      return;
    }

    try {
      setErrorMessage('');
      setIsCompressingProof(true);

      const compressed = await compressImage(file, `evt-utr-proof-${Date.now()}.jpg`, {
        maxSizeKB: 95,
        maxWidthOrHeight: 1024,
        initialQuality: 0.82
      });

      setProofFile(compressed.file);
      setProofPreviewUrl(compressed.dataUrl);
      setProofCompressedSizeKB(compressed.sizeKB);
    } catch (err: any) {
      console.error('Screenshot compression error:', err);
      setErrorMessage('Failed to process screenshot. Please try another image.');
    } finally {
      setIsCompressingProof(false);
    }
  };

  const handleRemoveProof = () => {
    setProofFile(null);
    setProofPreviewUrl('');
    setProofCompressedSizeKB(null);
    if (proofFileInputRef.current) {
      proofFileInputRef.current.value = '';
    }
  };

  // Step 1 -> Step 2: Validate Event Form & Proceed to QR Payment
  const handleProceedToPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Event Title is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Event Description is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.eventDate) {
      setErrorMessage('Event Date is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.startTime.trim()) {
      setErrorMessage('Event Start Time is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.venue.trim()) {
      setErrorMessage('Venue name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('City is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    refetchActiveQR();
    setRegistrationCode(`EVT-${Math.floor(100000 + Math.random() * 900000)}`);
    setTimeLeftSeconds(900);
    setUtrNumber('');
    setProofFile(null);
    setProofPreviewUrl('');
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3: Verify Payment Proof & Save Event to Database
  const handleConfirmEventPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Bank Transaction Reference number.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      if (formData.slug?.trim()) payload.append('slug', formData.slug.trim());
      payload.append('description', formData.description.trim());
      payload.append('eventDate', formData.eventDate);
      if (formData.endDate) payload.append('endDate', formData.endDate);
      payload.append('startTime', formData.startTime.trim());
      if (formData.endTime?.trim()) payload.append('endTime', formData.endTime.trim());
      payload.append('venue', formData.venue.trim());
      if (formData.address?.trim()) payload.append('address', formData.address.trim());
      payload.append('city', formData.city.trim());
      payload.append('state', formData.state.trim());
      if (formData.pincode?.trim()) payload.append('pincode', formData.pincode.trim());
      
      if (formData.latitude !== undefined && formData.latitude !== null && !isNaN(Number(formData.latitude))) {
        payload.append('latitude', String(formData.latitude));
      }
      if (formData.longitude !== undefined && formData.longitude !== null && !isNaN(Number(formData.longitude))) {
        payload.append('longitude', String(formData.longitude));
      }

      payload.append('pricePerPass', String(Number(formData.pricePerPass) || 0));
      if (formData.totalCapacity) payload.append('totalCapacity', String(formData.totalCapacity));
      payload.append('isFeatured', String(formData.isFeatured));
      payload.append('isActive', String(formData.isActive));
      payload.append('status', formData.status);
      
      if (formData.organizerName?.trim()) payload.append('organizerName', formData.organizerName.trim());
      if (formData.organizerContact?.trim()) payload.append('organizerContact', formData.organizerContact.trim());
      if (formData.dressCode?.trim()) payload.append('dressCode', formData.dressCode.trim());

      const enrichedRules = [
        ...rules,
        `Official Reg ID: ${registrationCode || 'EVT-REG'} (Fee Paid: ₹${REGISTRATION_FEE} | UTR: ${utrNumber.trim()})`
      ];
      payload.append('rules', JSON.stringify(enrichedRules));

      if (bannerFile) {
        payload.append('image', bannerFile);
      } else if (formData.imageUrl?.trim()) {
        payload.append('imageUrl', formData.imageUrl.trim());
      }

      galleryFiles.forEach((file) => {
        payload.append('gallery', file);
      });

      if (proofFile) {
        payload.append('gallery', proofFile);
      }

      await createEventMutation.mutateAsync(payload);
      setSuccessMessage('🎉 Event Registration & Payment Verified Successfully!');
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error creating event:', err);
      setErrorMessage(err.message || 'Failed to register event. Please verify all details.');
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('form');
      return;
    }
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const isSubmitting = createEventMutation.isPending || isCompressing;

  // Active Merchant QR Info
  const upiId = activeQR?.upiId || 'meetbyvibe@ybl';
  const payeeName = activeQR?.accountHolderName || activeQR?.title || 'GarbaMitra Official UPI';
  const dynamicUpiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${REGISTRATION_FEE}&tn=${encodeURIComponent(`Event Reg ${formData.title.slice(0, 15)}`)}&cu=INR`;
  const qrCodeUrl = activeQR?.imageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dynamicUpiPayload)}`;

  return (
    <div className="create-event-page">
      {/* Top Breadcrumb & Action Bar */}
      <div className="ce-screen-header">
        <div className="ce-header-left">
          <button type="button" className="ce-back-btn" onClick={handleBack} title="Back">
            <ArrowLeft size={18} />
            <span>{step === 'payment' ? 'Edit Details' : 'Back'}</span>
          </button>
          <div className="ce-header-title-wrap">
            <div className="ce-breadcrumbs">
              <span>Festival Portal</span>
              <span>/</span>
              <span>Garba Events</span>
              <span>/</span>
              <span className="current">
                {step === 'form' && '1. Event Details'}
                {step === 'payment' && '2. Registration & UPI Payment'}
                {step === 'success' && '3. Verified'}
              </span>
            </div>
            <h1 className="ce-screen-title">
              {step === 'form' && 'Create New Garba Event'}
              {step === 'payment' && 'Confirm Event Registration Fee'}
              {step === 'success' && 'Event Successfully Registered!'}
            </h1>
          </div>
        </div>

        <div className="ce-header-actions">
          {step === 'form' && (
            <>
              <button
                type="button"
                className="ce-btn-secondary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ce-btn-primary"
                onClick={() => handleProceedToPayment()}
                disabled={isSubmitting}
              >
                <CreditCard size={16} />
                <span>Proceed to Payment (₹{REGISTRATION_FEE})</span>
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              <button
                type="button"
                className="ce-btn-secondary"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Back to Edit
              </button>
              <button
                type="button"
                className="ce-btn-primary"
                onClick={(e) => handleConfirmEventPayment(e)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="ce-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Confirm & Register</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'success' && (
            <button
              type="button"
              className="ce-btn-primary"
              onClick={() => navigate('/')}
            >
              <Sparkles size={16} />
              <span>Back to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="ce-main-container">
        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="ce-alert ce-alert-error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="ce-alert ce-alert-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: EVENT FORM */}
        {step === 'form' && (
          <form onSubmit={handleProceedToPayment} className="ce-form-layout">
          {/* LEFT 2 COLUMNS: Form Cards mapped to Prisma Event Model */}
          <div className="ce-form-left">
            {/* Card 1: Basic Event Details */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-pink">
                  <Sparkles size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Basic Information</h3>
                  <p>Event title, unique slug, and detailed description</p>
                </div>
              </div>

              {/* Title */}
              <div className="ce-form-group">
                <label className="ce-label">
                  Event Title <span className="ce-required">*</span>
                </label>
                <input
                  type="text"
                  className="ce-input"
                  placeholder="e.g. Grand Navratri Mahotsav 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Slug */}
              <div className="ce-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="ce-label" style={{ margin: 0 }}>URL Slug (Optional)</label>
                  <button
                    type="button"
                    className="ce-link-btn"
                    onClick={handleGenerateSlug}
                  >
                    Auto-Generate
                  </button>
                </div>
                <div className="ce-input-with-icon">
                  <Globe size={16} className="ce-icon-left" />
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="grand-navratri-mahotsav-2026"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="ce-form-group" style={{ marginBottom: 0 }}>
                <label className="ce-label">
                  Event Description <span className="ce-required">*</span>
                </label>
                <textarea
                  className="ce-textarea"
                  rows={4}
                  placeholder="Provide comprehensive details about the artists, sound setup, passes, food stalls, and festival vibes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <span className="ce-char-count">{formData.description.length} chars</span>
              </div>
            </div>

            {/* Card 2: Schedule & Timings */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-pink">
                  <Calendar size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Schedule & Timings</h3>
                  <p>Date range and daily hours</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {/* Event Date */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">
                    Event Date <span className="ce-required">*</span>
                  </label>
                  <div className="ce-input-with-icon">
                    <Calendar size={16} className="ce-icon-left" />
                    <input
                      type="date"
                      className="ce-input"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">End Date (Optional)</label>
                  <div className="ce-input-with-icon">
                    <Calendar size={16} className="ce-icon-left" />
                    <input
                      type="date"
                      className="ce-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Start Time */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">
                    Start Time <span className="ce-required">*</span>
                  </label>
                  <div className="ce-input-with-icon">
                    <Clock size={16} className="ce-icon-left" />
                    <input
                      type="text"
                      className="ce-input"
                      placeholder="07:30 PM"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">End Time (Optional)</label>
                  <div className="ce-input-with-icon">
                    <Clock size={16} className="ce-icon-left" />
                    <input
                      type="text"
                      className="ce-input"
                      placeholder="01:00 AM"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Venue & Location with country-state-city */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-gold">
                  <MapPin size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Venue & Location</h3>
                  <p>Ground address, state, city & coordinates</p>
                </div>
              </div>

              {/* Venue Name */}
              <div className="ce-form-group">
                <label className="ce-label">
                  Venue / Ground Name <span className="ce-required">*</span>
                </label>
                <input
                  type="text"
                  className="ce-input"
                  placeholder="e.g. GMDC Ground / YMCA International Club"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>

              {/* Address with GPS detector */}
              <div className="ce-form-group">
                <label className="ce-label">Street Address (Optional)</label>
                <div className="ce-input-with-icon">
                  <MapPin size={16} className="ce-icon-left" style={{ color: 'var(--ce-primary)' }} />
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="Drive In Road, Memnagar"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    className="ce-icon-right"
                    title="Detect Current GPS Location"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setFormData((prev) => ({
                            ...prev,
                            latitude: Number(pos.coords.latitude.toFixed(4)),
                            longitude: Number(pos.coords.longitude.toFixed(4)),
                          }));
                        });
                      }
                    }}
                  >
                    <Crosshair size={16} />
                  </button>
                </div>
              </div>

              {/* Country, State, City, Pincode 4-Column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                {/* Country */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Country *</label>
                  <select
                    className="ce-select"
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      const foundCountry = countries.find((c) => c.isoCode === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        country: foundCountry?.name || e.target.value
                      }));
                    }}
                  >
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">State *</label>
                  <select
                    className="ce-select"
                    value={selectedStateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">
                    City <span className="ce-required">*</span>
                  </label>
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="Ahmedabad"
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    list="ce-cities-list"
                    required
                  />
                  <datalist id="ce-cities-list">
                    {cities.map((city, idx) => (
                      <option key={`${city.name}-${idx}`} value={city.name} />
                    ))}
                  </datalist>
                </div>

                {/* Pincode */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Pincode</label>
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="380052"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
              </div>

              {/* Latitude & Longitude */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label" style={{ fontSize: '12px' }}>Latitude (Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="ce-input"
                    placeholder="23.0489"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label" style={{ fontSize: '12px' }}>Longitude (Decimal)</label>
                  <input
                    type="number"
                    step="0.0001"
                    className="ce-input"
                    placeholder="72.5312"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Ticketing, Capacity & Status */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-green">
                  <DollarSign size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Pass Pricing & Capacity</h3>
                  <p>Entry fees and attendee limit</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                {/* Price Per Pass */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Pass Price (₹)</label>
                  <div className="ce-input-with-icon">
                    <span className="ce-currency-symbol">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      className="ce-input"
                      placeholder="0 (Free)"
                      value={formData.pricePerPass}
                      onChange={(e) => setFormData({ ...formData, pricePerPass: parseFloat(e.target.value) || 0 })}
                      style={{ paddingLeft: '30px' }}
                    />
                  </div>
                </div>

                {/* Total Capacity */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Total Capacity</label>
                  <div className="ce-input-with-icon">
                    <Users size={16} className="ce-icon-left" />
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="ce-input"
                      placeholder="5000"
                      value={formData.totalCapacity}
                      onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Event Status</label>
                  <select
                    className="ce-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Toggles: isFeatured & isActive */}
              <div className="ce-toggles-row">
                <label className={`ce-toggle-card ${formData.isFeatured ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <div>
                    <div className="ce-toggle-title">⭐ Featured Event</div>
                    <div className="ce-toggle-sub">Highlight in Hero Carousel & Top Lists</div>
                  </div>
                </label>

                <label className={`ce-toggle-card ${formData.isActive ? 'active' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <div>
                    <div className="ce-toggle-title">🟢 Active & Published</div>
                    <div className="ce-toggle-sub">Visible to users and bookable</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Card 5: Organizer Details & Guidelines */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-blue">
                  <UserCheck size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Organizer & Guidelines</h3>
                  <p>Contact person, dress code, and venue rules</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Organizer Name (Optional)</label>
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="e.g. GarbaMitra Official"
                    value={formData.organizerName}
                    onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  />
                </div>

                <div className="ce-form-group" style={{ margin: 0 }}>
                  <label className="ce-label">Organizer Contact (Phone / Email)</label>
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="+91 98765 43210"
                    value={formData.organizerContact}
                    onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                  />
                </div>
              </div>

              {/* Dress Code */}
              <div className="ce-form-group">
                <label className="ce-label">Dress Code (Optional)</label>
                <div className="ce-input-with-icon">
                  <Shirt size={16} className="ce-icon-left" />
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="Traditional Chaniya Choli / Kurta Kediya"
                    value={formData.dressCode}
                    onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Rules String Array */}
              <div className="ce-form-group" style={{ marginBottom: 0 }}>
                <label className="ce-label">Event Rules & Guidelines</label>
                <div className="ce-rules-list">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="ce-rule-item">
                      <ShieldCheck size={14} color="var(--ce-primary)" style={{ flexShrink: 0 }} />
                      <span className="ce-rule-text">{rule}</span>
                      <button
                        type="button"
                        className="ce-rule-delete"
                        onClick={() => handleRemoveRule(idx)}
                        title="Remove rule"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="ce-add-rule-row">
                  <input
                    type="text"
                    className="ce-input"
                    placeholder="Add a new rule or guideline..."
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRule();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="ce-btn-add"
                    onClick={handleAddRule}
                  >
                    <Plus size={15} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card 6: Gallery Media Images (Optional) */}
            <div className="ce-card">
              <div className="ce-card-header">
                <div className="ce-card-icon icon-purple">
                  <ImageIcon size={18} />
                </div>
                <div className="ce-card-title-box">
                  <h3>Event Gallery Images (Optional)</h3>
                  <p>Upload past festival photos and stage banners</p>
                </div>
              </div>

              <div
                className="ce-dropzone"
                onClick={() => galleryInputRef.current?.click()}
              >
                <Upload size={22} color="var(--ce-primary)" style={{ margin: '0 auto 6px' }} />
                <span className="ce-dropzone-title">
                  {isCompressing ? 'Compressing images...' : 'Click to Upload Multiple Gallery Photos'}
                </span>
                <span className="ce-dropzone-sub">PNG, JPG, WebP (Auto-compressed)</span>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleGallerySelect}
              />

              {galleryPreviews.length > 0 && (
                <div className="ce-gallery-grid">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="ce-gallery-item">
                      <img src={src} alt={`Gallery ${idx + 1}`} />
                      <button
                        type="button"
                        className="ce-gallery-remove"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        title="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Event Poster Preview */}
          <div className="ce-form-right">
            <div className="ce-preview-sticky">
              <div className="ce-card">
                <div className="ce-card-header" style={{ marginBottom: '14px' }}>
                  <div className="ce-card-icon icon-pink">
                    <Sparkles size={16} />
                  </div>
                  <div className="ce-card-title-box">
                    <h3>Live Event Preview</h3>
                    <p>Real-time visual Garba card</p>
                  </div>
                </div>

                {/* Banner Upload Trigger */}
                <div style={{ marginBottom: '14px' }}>
                  <div
                    className="ce-banner-upload-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} color="var(--ce-primary)" />
                    <span>{bannerFile ? 'Change Main Banner Image' : 'Upload Custom Banner Image'}</span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBannerSelect}
                  />
                </div>

                {/* Poster Card */}
                <div className="ce-preview-poster">
                  <img
                    src={bannerPreview || formData.imageUrl}
                    alt={formData.title}
                    className="ce-poster-img"
                  />

                  {/* Top Badges */}
                  <div className="ce-poster-top-row">
                    {formData.isFeatured ? (
                      <span className="ce-badge-featured">
                        <Sparkles size={11} />
                        <span>Featured</span>
                      </span>
                    ) : (
                      <span className="ce-badge-status">{formData.status}</span>
                    )}

                    <button
                      type="button"
                      className="ce-poster-heart"
                      onClick={() => setIsFavoritePreview(!isFavoritePreview)}
                      aria-label="Bookmark preview"
                    >
                      <Heart
                        size={16}
                        fill={isFavoritePreview ? 'var(--ce-primary)' : 'none'}
                        color="var(--ce-primary)"
                      />
                    </button>
                  </div>

                  {/* Gradient Overlay & Info */}
                  <div className="ce-poster-gradient">
                    <div className="ce-poster-flourish">~ Navratri ~</div>
                    <h3 className="ce-poster-title">
                      {formData.title || 'Event Title'}
                    </h3>

                    <div className="ce-poster-meta">
                      <div className="ce-poster-meta-item">
                        <Calendar size={13} color="var(--ce-accent-gold)" />
                        <span>{formattedPreviewDate}</span>
                      </div>
                      <span>•</span>
                      <div className="ce-poster-meta-item">
                        <Clock size={13} color="var(--ce-accent-gold)" />
                        <span>{formData.startTime}</span>
                      </div>
                    </div>

                    <div className="ce-poster-venue">
                      <MapPin size={13} color="var(--ce-primary)" />
                      <span>
                        <strong>{formData.venue || 'Venue'}</strong>, {formData.city || 'City'}
                      </span>
                    </div>

                    <div className="ce-poster-footer">
                      <span className="ce-poster-price">
                        {formData.pricePerPass > 0 ? `₹${formData.pricePerPass} / Pass` : 'Free Entry'}
                      </span>
                      <span className="ce-poster-capacity">
                        {formData.totalCapacity ? `Capacity: ${formData.totalCapacity}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Details Box */}
                <div className="ce-preview-details">
                  <div className="ce-detail-row">
                    <span className="ce-detail-lbl">Status:</span>
                    <span className="ce-detail-val">{formData.status}</span>
                  </div>
                  <div className="ce-detail-row">
                    <span className="ce-detail-lbl">Dress Code:</span>
                    <span className="ce-detail-val">{formData.dressCode || 'Traditional'}</span>
                  </div>
                  <div className="ce-detail-row">
                    <span className="ce-detail-lbl">Organizer:</span>
                    <span className="ce-detail-val">{formData.organizerName || 'GarbaClub'}</span>
                  </div>
                  <div className="ce-detail-row">
                    <span className="ce-detail-lbl">Rules Added:</span>
                    <span className="ce-detail-val">{rules.length} points</span>
                  </div>
                </div>

                {/* Registration Fee Summary Card */}
                <div style={{ background: 'rgba(255, 19, 121, 0.08)', border: '1px solid rgba(255, 19, 121, 0.25)', borderRadius: '12px', padding: '12px 14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12.5px', color: '#cbd5e1', fontWeight: 600 }}>Event Registration & Verification Fee:</span>
                    <strong style={{ fontSize: '15px', color: 'var(--ce-primary)', fontWeight: 800 }}>₹{REGISTRATION_FEE}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    🔒 Includes live portal listing, verified organizer badge, and anti-collision slot reservation.
                  </div>
                </div>

                {/* Big Submit Button */}
                <button
                  type="submit"
                  className="ce-btn-submit-big"
                  disabled={isSubmitting}
                >
                  <CreditCard size={18} />
                  <span>Proceed to Payment & Register (₹{REGISTRATION_FEE})</span>
                </button>
              </div>
            </div>
          </div>
        </form>
        )}

        {/* STEP 2: UPI QR CODE PAYMENT & VERIFICATION */}
        {step === 'payment' && (
          <div className="ce-payment-view-wrap">
            <form onSubmit={handleConfirmEventPayment} className="ce-payment-card">
              <div className="ce-payment-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="ce-card-icon icon-pink">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="ce-payment-title">Event Registration UPI Payment</h2>
                    <p className="ce-payment-subtitle">Scan QR code, pay the registration fee, and submit your 12-digit Bank UTR</p>
                  </div>
                </div>

                <div className="ce-timer-pill">
                  <Clock size={15} color="#ef4444" />
                  <span>Expires in: <strong>{formatTimer(timeLeftSeconds)}</strong></span>
                </div>
              </div>

              <div className="ce-payment-grid">
                {/* Left: QR Code & UPI Information */}
                <div className="ce-payment-left">
                  {/* Active QR Branding Badge */}
                  <div className="ce-qr-branding-badge">
                    <Sparkles size={14} color="var(--ce-primary)" />
                    <span>{activeQR?.title || payeeName}</span>
                    {activeQR?.bankName && (
                      <span className="ce-bank-tag">{activeQR.bankName}</span>
                    )}
                  </div>

                  {/* QR Image Box */}
                  <div className="ce-qr-frame">
                    <img
                      src={qrCodeUrl}
                      alt="Garba Event Registration UPI QR"
                      className="ce-qr-image"
                    />
                  </div>

                  <div className="ce-payee-amount-tag">
                    Scan to Pay <strong style={{ color: 'var(--ce-primary)' }}>₹{REGISTRATION_FEE}</strong>
                  </div>

                  {/* Copyable UPI ID Box */}
                  <div className="ce-upi-copy-box">
                    <span className="ce-upi-text">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="ce-copy-btn"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <>
                          <Check size={14} color="#10b981" />
                          <span style={{ color: '#10b981' }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="ce-payment-notice">
                    ⚡ Instant verification via GPay, PhonePe, Paytm or any UPI App.
                  </div>
                </div>

                {/* Right: Event Summary, UTR Input & Screenshot Upload */}
                <div className="ce-payment-right">
                  {/* Event Mini Summary Strip */}
                  <div className="ce-summary-strip">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img
                        src={bannerPreview || formData.imageUrl}
                        alt="Event Banner"
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid rgba(255,19,121,0.5)' }}
                      />
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>
                          {formData.title}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '10px' }}>
                          <span>📅 {formattedPreviewDate}</span>
                          <span>📍 {formData.venue}, {formData.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ce-fee-breakdown">
                      <div className="ce-fee-row">
                        <span>Registration Code:</span>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--ce-accent-gold)' }}>{registrationCode}</strong>
                      </div>
                      <div className="ce-fee-row highlight">
                        <span>Registration & Listing Fee:</span>
                        <span className="ce-fee-highlight">₹{REGISTRATION_FEE}</span>
                      </div>
                    </div>
                  </div>

                  {/* UTR Input Form Group */}
                  <div className="ce-form-group" style={{ marginTop: '16px' }}>
                    <label className="ce-label">
                      12-Digit Bank UTR / Transaction Reference Number <span className="ce-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="ce-input ce-utr-input"
                      placeholder="e.g. 427819283921"
                      required
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                    />
                    <span className="ce-help-text">Check your UPI payment receipt (GPay / PhonePe / Paytm / Bank)</span>
                  </div>

                  {/* Payment Proof Screenshot Upload */}
                  <div className="ce-form-group">
                    <label className="ce-label">
                      Upload Payment Receipt Screenshot (Auto-compressed &lt;100 KB)
                    </label>

                    <input
                      ref={proofFileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleProofFileChange}
                    />

                    {proofPreviewUrl ? (
                      <div className="ce-proof-preview-box">
                        <img src={proofPreviewUrl} alt="Payment Receipt" className="ce-proof-img" />
                        <div className="ce-proof-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileCheck2 size={16} color="#10b981" />
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#f8fafc' }}>Receipt Attached</span>
                          </div>
                          {proofCompressedSizeKB && (
                            <span className="ce-size-tag">
                              <ShieldCheck size={11} />
                              <span>{proofCompressedSizeKB} KB (Optimized)</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={handleRemoveProof}
                            className="ce-remove-proof-btn"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="ce-dropzone ce-proof-dropzone"
                        onClick={() => proofFileInputRef.current?.click()}
                      >
                        {isCompressingProof ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ce-primary)' }}>
                            <Loader2 size={18} className="ce-spin" />
                            <span>Compressing Receipt Image &lt;100 KB...</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} color="var(--ce-primary)" style={{ margin: '0 auto 6px' }} />
                            <span className="ce-dropzone-title">Click to Upload Payment Screenshot</span>
                            <span className="ce-dropzone-subtitle">PNG, JPG, WEBP • Auto-compressed strictly &lt;100 KB</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Actions */}
                  <div className="ce-payment-actions">
                    <button
                      type="button"
                      className="ce-btn-secondary"
                      onClick={() => setStep('form')}
                      disabled={isSubmitting}
                    >
                      Back to Edit Form
                    </button>
                    <button
                      type="submit"
                      className="ce-btn-primary ce-btn-pay-submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="ce-spin" />
                          <span>Verifying Payment & Saving Event...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Confirm Payment & Register Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="ce-success-view-wrap">
            <div className="ce-success-card">
              <div className="ce-success-icon-wrap">
                <CheckCircle2 size={52} color="#10b981" />
              </div>
              <h2 className="ce-success-title">Event Successfully Registered!</h2>
              <p className="ce-success-subtitle">
                Your payment of <strong>₹{REGISTRATION_FEE}</strong> has been verified. The event is now live and published in the database!
              </p>

              <div className="ce-success-details-box">
                <div className="ce-success-row">
                  <span>Event Title:</span>
                  <strong>{formData.title}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Date & Time:</span>
                  <strong>{formattedPreviewDate} @ {formData.startTime}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Venue:</span>
                  <strong>{formData.venue}, {formData.city}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Organizer:</span>
                  <strong>{formData.organizerName || 'Official Organizer'}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Registration Code:</span>
                  <strong style={{ color: 'var(--ce-primary)', fontFamily: 'monospace' }}>{registrationCode}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Payment UTR:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--ce-accent-gold)' }}>{utrNumber}</strong>
                </div>
                <div className="ce-success-row">
                  <span>Status:</span>
                  <span className="ce-badge-featured">✅ Verified & Published</span>
                </div>
              </div>

              <div className="ce-success-actions">
                <button
                  type="button"
                  className="ce-btn-primary"
                  onClick={() => navigate('/')}
                >
                  <Sparkles size={16} />
                  <span>View in Events Portal</span>
                </button>
                <button
                  type="button"
                  className="ce-btn-secondary"
                  onClick={() => {
                    setStep('form');
                    setFormData((prev) => ({
                      ...prev,
                      title: '',
                      slug: '',
                      description: '',
                      venue: '',
                      address: '',
                    }));
                  }}
                >
                  <Plus size={16} />
                  <span>Register Another Event</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateEventScreen;
