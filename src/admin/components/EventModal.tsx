import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  IndianRupee,
  Crosshair,
  Globe,
  Shirt,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Country, State, City } from 'country-state-city';
import type { GarbaEvent } from '../../partner/types/partner.types';
import { useCreateEvent, useUpdateEvent } from '../../hooks/useEvents';
import { compressImage } from '../../utils/imageCompression';

interface EventModalProps {
  event: GarbaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  // Location selector state using country-state-city
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('GJ');

  // Form State strictly mapping 1-to-1 with Prisma Event Model
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    eventDate: '',
    endDate: '',
    startTime: '07:30 PM',
    endTime: '01:00 AM',
    venue: '',
    address: '',
    country: 'India',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380052',
    latitude: 23.0489,
    longitude: 72.5312,
    pricePerPass: 499,
    totalCapacity: 5000,
    isFeatured: true,
    isActive: true,
    status: 'UPCOMING' as 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'DRAFT' | 'CANCELLED',
    organizerName: '',
    organizerContact: '',
    dressCode: 'Traditional Garba Attire (Chaniya Choli / Kurta Kedia)',
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([
    'Traditional Garba attire mandatory for ground entry',
    'Valid Digital Pass QR Code & Photo ID required at gate',
    'Dandiya sticks permitted inside arena',
    'Outside food and alcohol strictly prohibited'
  ]);
  const [newRule, setNewRule] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

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

  // Initialize or reset form when modal opens or event changes
  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      // Format date into YYYY-MM-DD for input[type="date"]
      let formattedDate = '';
      if (event.rawDate) {
        formattedDate = new Date(event.rawDate).toISOString().split('T')[0];
      } else if (event.date) {
        const parsed = new Date(event.date);
        if (!isNaN(parsed.getTime())) {
          formattedDate = parsed.toISOString().split('T')[0];
        }
      }

      let formattedEndDate = '';
      if (event.endDate) {
        const parsedEnd = new Date(event.endDate);
        if (!isNaN(parsedEnd.getTime())) {
          formattedEndDate = parsedEnd.toISOString().split('T')[0];
        } else {
          formattedEndDate = event.endDate;
        }
      }

      // Match state in country-state-city
      const allStates = State.getStatesOfCountry('IN');
      const foundState = allStates.find(
        (s) =>
          s.name.toLowerCase() === (event.state || '').toLowerCase() ||
          s.isoCode.toLowerCase() === (event.state || '').toLowerCase()
      );

      const stateIso = foundState ? foundState.isoCode : 'GJ';
      setSelectedCountryCode('IN');
      setSelectedStateCode(stateIso);

      setFormData({
        title: event.title || '',
        slug: event.slug || '',
        description: event.description || '',
        imageUrl: event.imageUrl || '',
        eventDate: formattedDate || new Date().toISOString().split('T')[0],
        endDate: formattedEndDate || '',
        startTime: event.time || '07:30 PM',
        endTime: event.endTime || '01:00 AM',
        venue: event.venue || '',
        address: event.address || '',
        country: 'India',
        city: event.city || 'Ahmedabad',
        state: foundState ? foundState.name : (event.state || 'Gujarat'),
        pincode: event.pincode || '',
        latitude: event.latitude !== undefined && event.latitude !== null ? Number(event.latitude) : 23.0489,
        longitude: event.longitude !== undefined && event.longitude !== null ? Number(event.longitude) : 72.5312,
        pricePerPass: event.pricePerPass !== undefined ? Number(event.pricePerPass) : 0,
        totalCapacity: event.totalCapacity !== undefined ? Number(event.totalCapacity) : 5000,
        isFeatured: Boolean(event.isFeatured),
        isActive: event.isActive !== undefined ? Boolean(event.isActive) : true,
        status: (event.status as any) || 'UPCOMING',
        organizerName: event.organizerName || '',
        organizerContact: event.organizerContact || '',
        dressCode: event.dressCode || 'Traditional Garba Attire (Chaniya Choli / Kurta Kedia)',
      });

      setBannerPreview(event.imageUrl || '');
      setBannerFile(null);
      setGalleryFiles([]);
      setGalleryPreviews(event.galleryImages || []);
      setRules(
        event.rules && event.rules.length > 0
          ? event.rules
          : [
              'Traditional Garba attire mandatory for ground entry',
              'Valid Digital Pass QR Code & Photo ID required at gate',
              'Dandiya sticks permitted inside arena',
              'Outside food and alcohol strictly prohibited'
            ]
      );
    } else {
      // Default initial values for new event
      const today = new Date().toISOString().split('T')[0];
      setSelectedCountryCode('IN');
      setSelectedStateCode('GJ');

      setFormData({
        title: '',
        slug: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80',
        eventDate: today,
        endDate: '',
        startTime: '07:30 PM',
        endTime: '01:00 AM',
        venue: '',
        address: '',
        country: 'India',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380052',
        latitude: 23.0489,
        longitude: 72.5312,
        pricePerPass: 499,
        totalCapacity: 5000,
        isFeatured: true,
        isActive: true,
        status: 'UPCOMING',
        organizerName: '',
        organizerContact: '',
        dressCode: 'Traditional Garba Attire (Chaniya Choli / Kurta Kedia)',
      });
      setBannerPreview('https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80');
      setBannerFile(null);
      setGalleryFiles([]);
      setGalleryPreviews([]);
      setRules([
        'Traditional Garba attire mandatory for ground entry',
        'Valid Digital Pass QR Code & Photo ID required at gate',
        'Dandiya sticks permitted inside arena',
        'Outside food and alcohol strictly prohibited'
      ]);
    }
    setErrorMsg('');
  }, [event, isOpen]);

  if (!isOpen) return null;

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
      console.error('Error compressing banner image:', err);
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsCompressing(true);
      const compressedResults = await Promise.all(
        files.map((file, idx) =>
          compressImage(file, `gallery-${Date.now()}-${idx}.jpg`, {
            maxSizeKB: 90,
            maxWidthOrHeight: 1000,
          })
        )
      );

      const newFiles = compressedResults.map((r) => r.file);
      const newPreviews = compressedResults.map((r) => r.dataUrl);

      setGalleryFiles((prev) => [...prev, ...newFiles]);
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error('Error compressing gallery images:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setRules((prev) => [...prev, newRule.trim()]);
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Event Title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Event Description is required.');
      return;
    }
    if (!formData.eventDate) {
      setErrorMsg('Event Date is required.');
      return;
    }
    if (!formData.startTime.trim()) {
      setErrorMsg('Event Start Time is required.');
      return;
    }
    if (!formData.venue.trim()) {
      setErrorMsg('Venue name is required.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('City is required.');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title.trim());
      if (formData.slug?.trim()) formPayload.append('slug', formData.slug.trim());
      formPayload.append('description', formData.description.trim());
      formPayload.append('eventDate', formData.eventDate);
      if (formData.endDate) formPayload.append('endDate', formData.endDate);
      formPayload.append('startTime', formData.startTime.trim());
      if (formData.endTime?.trim()) formPayload.append('endTime', formData.endTime.trim());
      formPayload.append('venue', formData.venue.trim());
      if (formData.address?.trim()) formPayload.append('address', formData.address.trim());
      formPayload.append('city', formData.city.trim());
      formPayload.append('state', formData.state.trim());
      if (formData.pincode?.trim()) formPayload.append('pincode', formData.pincode.trim());

      if (formData.latitude !== undefined && formData.latitude !== null && !isNaN(Number(formData.latitude))) {
        formPayload.append('latitude', String(formData.latitude));
      }
      if (formData.longitude !== undefined && formData.longitude !== null && !isNaN(Number(formData.longitude))) {
        formPayload.append('longitude', String(formData.longitude));
      }

      formPayload.append('pricePerPass', String(Number(formData.pricePerPass) || 0));
      if (formData.totalCapacity) formPayload.append('totalCapacity', String(formData.totalCapacity));
      formPayload.append('isFeatured', String(formData.isFeatured));
      formPayload.append('isActive', String(formData.isActive));
      formPayload.append('status', formData.status);
      
      if (formData.organizerName?.trim()) formPayload.append('organizerName', formData.organizerName.trim());
      if (formData.organizerContact?.trim()) formPayload.append('organizerContact', formData.organizerContact.trim());
      if (formData.dressCode?.trim()) formPayload.append('dressCode', formData.dressCode.trim());
      if (rules.length > 0) formPayload.append('rules', JSON.stringify(rules));

      if (bannerFile) {
        formPayload.append('image', bannerFile);
      } else if (formData.imageUrl?.trim()) {
        formPayload.append('imageUrl', formData.imageUrl.trim());
      }

      galleryFiles.forEach((file) => {
        formPayload.append('gallery', file);
      });

      if (event && event.id) {
        await updateEventMutation.mutateAsync({ id: event.id, data: formPayload });
      } else {
        await createEventMutation.mutateAsync(formPayload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving event:', err);
      setErrorMsg(err.message || 'Failed to save event. Please check required fields.');
    }
  };

  const isSubmitting = createEventMutation.isPending || updateEventMutation.isPending || isCompressing;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal event-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', width: '100%', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff1379, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255, 19, 121, 0.35)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f8fafc' }}>
                {event ? 'Edit Garba Event' : 'Create New Garba Event'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                {event ? 'Update event schedule, venue, passes & media' : 'Publish a new Navratri Dandiya Night / Mega Event'}
              </p>
            </div>
          </div>
          <button className="btn-admin-secondary" style={{ padding: '6px 8px' }} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="admin-modal-body" style={{ maxHeight: 'calc(88vh - 130px)', overflowY: 'auto' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Details */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#ff1379' }}>
              <Sparkles size={16} />
              <span>1. Basic Information</span>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label>Event Title *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Grand Navratri Mahotsav 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Slug */}
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ margin: 0 }}>URL Slug (Optional)</label>
                <button
                  type="button"
                  onClick={handleGenerateSlug}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff1379',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Auto-Generate
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Globe size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="grand-navratri-mahotsav-2026"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="admin-form-group">
              <label>Event Description *</label>
              <textarea
                className="admin-textarea"
                rows={3}
                placeholder="Provide comprehensive details about the artists, sound setup, passes, food stalls, and festival vibes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 2: Schedule & Timings */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#ff1379' }}>
              <Calendar size={16} />
              <span>2. Schedule & Timings</span>
            </div>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
              <div className="admin-form-group">
                <label>Event Date *</label>
                <input
                  type="date"
                  className="admin-input"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  className="admin-input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group">
                <label>Start Time *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Clock size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="07:30 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>End Time (Optional)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Clock size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="01:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Venue & Location with country-state-city */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#f59e0b' }}>
              <MapPin size={16} />
              <span>3. Venue & Location</span>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label>Venue / Ground Name *</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. GMDC Ground / YMCA International Club"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label>Street Address (Optional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <MapPin size={15} style={{ position: 'absolute', left: '12px', color: '#ff1379' }} />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Drive In Road, Memnagar"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  title="Detect GPS Coordinates"
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
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#ff1379',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Crosshair size={16} />
                </button>
              </div>
            </div>

            {/* Country, State, City, Pincode 4-Column Grid */}
            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1.2fr 1.2fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {/* Country */}
              <div className="admin-form-group">
                <label>Country *</label>
                <select
                  className="admin-select"
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

              {/* State (Powered by country-state-city) */}
              <div className="admin-form-group">
                <label>State *</label>
                <select
                  className="admin-select"
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

              {/* City (Dynamic from country-state-city with custom typing support) */}
              <div className="admin-form-group">
                <label>City *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Select or Type City"
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  list="country-state-cities-list"
                  required
                />
                <datalist id="country-state-cities-list">
                  {cities.map((city, idx) => (
                    <option key={`${city.name}-${idx}`} value={city.name} />
                  ))}
                </datalist>
              </div>

              {/* Pincode */}
              <div className="admin-form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="380052"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Latitude & Longitude Coordinates */}
            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="admin-form-group">
                <label style={{ fontSize: '11.5px' }}>Latitude (Decimal)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="admin-input"
                  placeholder="23.0489"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="admin-form-group">
                <label style={{ fontSize: '11.5px' }}>Longitude (Decimal)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="admin-input"
                  placeholder="72.5312"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Pass Pricing, Capacity & Status */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#10b981' }}>
              <IndianRupee size={16} />
              <span>4. Pass Pricing, Capacity & Status</span>
            </div>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {/* Pass Price */}
              <div className="admin-form-group">
                <label>Pass Price (₹) *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontWeight: 700, color: '#f59e0b' }}>₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="admin-input"
                    placeholder="0 (Free)"
                    value={formData.pricePerPass}
                    onChange={(e) => setFormData({ ...formData, pricePerPass: parseFloat(e.target.value) || 0 })}
                    style={{ paddingLeft: '30px' }}
                    required
                  />
                </div>
              </div>

              {/* Total Capacity */}
              <div className="admin-form-group">
                <label>Total Capacity</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Users size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="admin-input"
                    placeholder="5000"
                    value={formData.totalCapacity}
                    onChange={(e) => setFormData({ ...formData, totalCapacity: parseInt(e.target.value, 10) || 0 })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="admin-form-group">
                <label>Event Status</label>
                <select
                  className="admin-select"
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: formData.isFeatured ? 'rgba(255, 19, 121, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                  border: formData.isFeatured ? '1.5px solid rgba(255, 19, 121, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  style={{ accentColor: '#ff1379', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>⭐ Featured Event</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Highlight in Hero Carousel & Top Lists</div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: formData.isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(15, 23, 42, 0.6)',
                  border: formData.isActive ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ accentColor: '#10b981', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>🟢 Active & Published</div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>Visible to users and bookable</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: Organizer & Guidelines */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#3b82f6' }}>
              <User size={16} />
              <span>5. Organizer & Guidelines</span>
            </div>

            <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="admin-form-group">
                <label>Organizer Name (Optional)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="e.g. GarbaMitra Official"
                    value={formData.organizerName}
                    onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Organizer Contact (Phone / Email)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="+91 98765 43210"
                    value={formData.organizerContact}
                    onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </div>

            {/* Dress Code */}
            <div className="admin-form-group" style={{ marginBottom: '12px' }}>
              <label>Dress Code (Optional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Shirt size={15} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Traditional Chaniya Choli / Kurta Kediya"
                  value={formData.dressCode}
                  onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            {/* Rules String Array */}
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label>Event Rules & Guidelines</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      color: '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={14} color="#ff1379" style={{ flexShrink: 0 }} />
                      <span>{rule}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRule(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Add a new rule or guideline..."
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  style={{
                    background: '#ff1379',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 6: Event Media & Banner */}
          <div className="event-form-section">
            <div className="event-section-title" style={{ color: '#a78bfa' }}>
              <ImageIcon size={16} />
              <span>6. Event Media & Banner</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '18px', alignItems: 'start' }}>
              {/* Banner Upload Box */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
                  Main Banner Image *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'relative',
                    height: '170px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(255, 19, 121, 0.4)',
                    background: bannerPreview
                      ? `url(${bannerPreview}) center/cover no-repeat`
                      : 'rgba(255, 19, 121, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: bannerPreview ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    {isCompressing ? (
                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <Loader2 size={18} className="spin" />
                        <span>Optimizing image...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={22} color="#ff1379" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                          {bannerPreview ? 'Change Banner Image' : 'Upload Banner Image'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                          PNG, JPG, WebP (Auto-compressed)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleBannerSelect}
                />
              </div>

              {/* Online Image URL + Gallery Photos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="admin-form-group">
                  <label>Or Paste Online Banner Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      if (e.target.value) {
                        setBannerPreview(e.target.value);
                        setBannerFile(null);
                      }
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Paste a direct image link or upload directly from your device above.
                  </span>
                </div>

                {/* Gallery Photos */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
                      Gallery / Venue Photos ({galleryPreviews.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      style={{
                        background: 'rgba(255, 19, 121, 0.15)',
                        border: '1px solid rgba(255, 19, 121, 0.3)',
                        color: '#ff1379',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={13} /> Add Photos
                    </button>
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleGallerySelect}
                    />
                  </div>

                  {galleryPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {galleryPreviews.map((previewUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '56px',
                            height: '56px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            background: '#0f172a'
                          }}
                        >
                          <img src={previewUrl} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(15, 23, 42, 0.85)',
                              color: '#ff4d4d',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-admin-primary"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #ff1379, #ff5e62)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                boxShadow: '0 4px 16px rgba(255, 19, 121, 0.4)'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>{event ? 'Updating Event...' : 'Publishing Event...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{event ? 'Save Event Changes' : 'Create & Publish Event'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
