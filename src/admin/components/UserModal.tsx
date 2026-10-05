import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  UserCheck, 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { State, City } from 'country-state-city';
import type { AdminUser, Role, Gender, SkillLevel, UserPhoto } from '../types/admin.types';
import { useCreateUser, useUpdateUser, useUploadUserPhotos, useDeleteUserPhoto } from '../../hooks/useUsers';
import { compressImage } from '../../utils/imageCompression';

interface UserModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PHOTO_SLOT_LABELS = [
  'Photo 1 (Main / Stage)',
  'Photo 2 (Traditional Costume)',
  'Photo 3 (Garba Performance)',
  'Photo 4 (Action / Step Pose)',
  'Photo 5 (Portrait / Close-up)'
];

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const multiGalleryInputRef = useRef<HTMLInputElement>(null);
  const singleSlotInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const uploadPhotosMutation = useUploadUserPhotos();
  const deletePhotoMutation = useDeleteUserPhoto();

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    role: 'PERFORMER',
    gender: 'FEMALE',
    dateOfBirth: '2000-01-15',
    height: 165,
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '',
    pincode: '380009',
    skillLevel: 'ADVANCED',
    danceStyles: ['Traditional Garba', 'Dodhiya'],
    experienceYears: 4,
    instagramHandle: '',
    hourlyRate: 1000,
    upiId: '',
    bio: '',
    isAvailable: true,
    isActive: true,
    isVerified: true,
    photos: []
  });

  // Keep track of new file uploads
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<{ [slotIndex: number]: File }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [styleInput, setStyleInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showAvatarUrlMode, setShowAvatarUrlMode] = useState(false);

  // country-state-city Indian states and cities integration
  const indianStates = useMemo(() => State.getStatesOfCountry('IN'), []);
  
  const selectedStateObj = useMemo(() => {
    return (
      indianStates.find((s) => s.name.toLowerCase() === (formData.state || '').toLowerCase()) ||
      indianStates.find((s) => s.isoCode === 'GJ') ||
      indianStates[0]
    );
  }, [indianStates, formData.state]);

  const citiesOfSelectedState = useMemo(() => {
    if (!selectedStateObj) return [];
    return City.getCitiesOfState('IN', selectedStateObj.isoCode);
  }, [selectedStateObj]);

  useEffect(() => {
    setErrorMessage(null);
    setAvatarFile(null);
    setGalleryFiles({});

    if (user) {
      setFormData({
        ...user,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '2000-01-15'
      });
      setAvatarUrlInput(user.avatarUrl || '');
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        role: 'PERFORMER',
        gender: 'FEMALE',
        dateOfBirth: '2000-01-15',
        height: 165,
        city: 'Ahmedabad',
        state: 'Gujarat',
        address: '',
        pincode: '380009',
        skillLevel: 'ADVANCED',
        danceStyles: ['Traditional Garba', 'Dodhiya'],
        experienceYears: 4,
        instagramHandle: '',
        hourlyRate: 1000,
        upiId: '',
        bio: '',
        isAvailable: true,
        isActive: true,
        isVerified: true,
        photos: []
      });
      setAvatarUrlInput('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending || uploadPhotosMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMessage('Please fill all required fields (Name, Email, Phone)');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name || '');
      payload.append('email', formData.email || '');
      payload.append('phone', formData.phone || '');
      payload.append('role', formData.role || 'PERFORMER');
      payload.append('gender', formData.gender || 'FEMALE');
      if (formData.dateOfBirth) payload.append('dateOfBirth', formData.dateOfBirth);
      if (formData.height) payload.append('height', String(formData.height));
      if (formData.city) payload.append('city', formData.city);
      if (formData.state) payload.append('state', formData.state);
      if (formData.address) payload.append('address', formData.address);
      if (formData.pincode) payload.append('pincode', formData.pincode);
      if (formData.skillLevel) payload.append('skillLevel', formData.skillLevel);
      if (formData.experienceYears !== undefined) payload.append('experienceYears', String(formData.experienceYears));
      if (formData.hourlyRate !== undefined) payload.append('hourlyRate', String(formData.hourlyRate));
      if (formData.upiId) payload.append('upiId', formData.upiId);
      if (formData.instagramHandle) payload.append('instagramHandle', formData.instagramHandle);
      if (formData.bio) payload.append('bio', formData.bio);
      payload.append('isAvailable', String(formData.isAvailable ?? true));
      payload.append('isActive', String(formData.isActive ?? true));
      payload.append('isVerified', String(formData.isVerified ?? false));
      payload.append('danceStyles', JSON.stringify(formData.danceStyles || []));

      // Append avatar file or URL
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      } else if (formData.avatarUrl) {
        payload.append('avatarUrl', formData.avatarUrl);
      }

      // Append all gallery files
      const newFiles = Object.values(galleryFiles);
      newFiles.forEach((file) => {
        payload.append('photos', file);
      });

      if (user && user.id) {
        await updateUserMutation.mutateAsync({
          id: user.id,
          data: payload
        });
      } else {
        await createUserMutation.mutateAsync(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save user model. Please check the form.');
    }
  };

  // Avatar Image Upload with <= 100 KB compression
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
        setAvatarFile(compressed.file);
        setFormData((prev) => ({ ...prev, avatarUrl: compressed.dataUrl }));
        setAvatarUrlInput(compressed.dataUrl);
      } catch (err) {
        console.error('Avatar compression failed, falling back:', err);
        setAvatarFile(file);
      }
    }
  };

  // Upload Multiple Photos simultaneously with <= 100 KB compression
  const handleMultiGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      const currentPhotosCount = formData.photos?.length || 0;

      try {
        const compressedResults = await Promise.all(
          fileList.map((file) => compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 }))
        );

        const newFilesMap: { [key: number]: File } = { ...galleryFiles };
        const newPhotos: UserPhoto[] = [];

        compressedResults.forEach((comp, index) => {
          const slotIdx = currentPhotosCount + index;
          newFilesMap[slotIdx] = comp.file;
          newPhotos.push({
            id: `p-${Date.now()}-${index}`,
            userId: user?.id || 'temp',
            imageUrl: comp.dataUrl,
            caption: comp.file.name.replace(/\.[^/.]+$/, ''),
            order: slotIdx
          });
        });

        setGalleryFiles(newFilesMap);
        setFormData((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), ...newPhotos]
        }));
      } catch (err) {
        console.error('Multi photo compression failed:', err);
      }
    }
  };

  // Upload or replace image for a specific slot (0 to 4) with <= 100 KB compression
  const handleSlotFileChange = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
        setGalleryFiles((prev) => ({ ...prev, [slotIndex]: compressed.file }));
        setFormData((prev) => {
          const currentPhotos = [...(prev.photos || [])];
          const newPhoto: UserPhoto = {
            id: currentPhotos[slotIndex]?.id || `p-${Date.now()}-${slotIndex}`,
            userId: user?.id || 'temp',
            imageUrl: compressed.dataUrl,
            caption: PHOTO_SLOT_LABELS[slotIndex] || `Photo ${slotIndex + 1}`,
            order: slotIndex
          };

          if (slotIndex < currentPhotos.length) {
            currentPhotos[slotIndex] = newPhoto;
          } else {
            currentPhotos.push(newPhoto);
          }

          const avatarUrl = slotIndex === 0 && !prev.avatarUrl ? compressed.dataUrl : prev.avatarUrl;

          return {
            ...prev,
            avatarUrl,
            photos: currentPhotos
          };
        });
      } catch (err) {
        console.error('Slot photo compression failed:', err);
      }
    }
  };


  const removePhoto = async (index: number) => {
    const photo = formData.photos?.[index];
    if (photo && user?.id && !photo.id.startsWith('p-')) {
      // It's a persisted photo in database
      try {
        await deletePhotoMutation.mutateAsync({ userId: user.id, photoId: photo.id });
      } catch (err) {
        console.error("Failed to delete photo from server", err);
      }
    }

    setGalleryFiles((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });

    setFormData((prev) => {
      const current = [...(prev.photos || [])];
      current.splice(index, 1);
      return { ...prev, photos: current };
    });
  };

  const addDanceStyle = () => {
    if (!styleInput.trim()) return;
    const currentStyles = formData.danceStyles || [];
    if (!currentStyles.includes(styleInput.trim())) {
      setFormData({ ...formData, danceStyles: [...currentStyles, styleInput.trim()] });
    }
    setStyleInput('');
  };

  const removeDanceStyle = (style: string) => {
    setFormData({
      ...formData,
      danceStyles: (formData.danceStyles || []).filter(s => s !== style)
    });
  };

  const uploadedPhotosCount = formData.photos?.length || 0;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#f59e0b" />
            <h3>{user ? `Edit User Model: ${user.name}` : 'Add New User / Performer Model'}</h3>
          </div>
          <button className="btn-admin-secondary" style={{ padding: '6px 8px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Display Avatar */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              padding: '16px', 
              borderRadius: '10px', 
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt="Avatar Preview"
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #f59e0b',
                    background: '#1e293b'
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '6px' }}>
                  Main Profile / Display Photo *
                </label>
                
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-admin-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => avatarFileInputRef.current?.click()}
                  >
                    <Upload size={14} />
                    <span>Upload Profile Photo</span>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => setShowAvatarUrlMode(!showAvatarUrlMode)}
                  >
                    <ImageIcon size={14} />
                    <span>{showAvatarUrlMode ? 'Hide URL' : 'Image URL'}</span>
                  </button>

                  {formData.avatarUrl && (
                    <button
                      type="button"
                      className="btn-admin-secondary"
                      style={{ padding: '6px 8px', color: '#ef4444' }}
                      title="Remove image"
                      onClick={() => {
                        setAvatarFile(null);
                        setFormData((prev) => ({ ...prev, avatarUrl: '' }));
                        setAvatarUrlInput('');
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {showAvatarUrlMode && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="Paste Image URL (https://...)"
                      value={avatarUrlInput}
                      onChange={(e) => {
                        setAvatarUrlInput(e.target.value);
                        setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5-Photo Gallery Upload Section */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Performer 5-Photo Gallery</span>
                    <span style={{
                      fontSize: '11px',
                      background: uploadedPhotosCount >= 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: uploadedPhotosCount >= 5 ? '#34d399' : '#fbbf24',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 700
                    }}>
                      {uploadedPhotosCount} / 5 Uploaded
                    </span>
                  </label>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>
                    Upload at least 5 high-quality photos (Costumes, stage performance, Dandiya pose).
                  </p>
                </div>

                <input
                  type="file"
                  ref={multiGalleryInputRef}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleMultiGalleryChange}
                />

                <button
                  type="button"
                  className="btn-admin-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => multiGalleryInputRef.current?.click()}
                >
                  <Upload size={13} />
                  <span>Upload All 5 Photos</span>
                </button>
              </div>

              {/* 5 Dedicated Upload Slots Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
                gap: '12px'
              }}>
                {Array.from({ length: Math.max(5, (formData.photos?.length || 0)) }).map((_, index) => {
                  const photo = formData.photos?.[index];
                  const label = PHOTO_SLOT_LABELS[index] || `Photo ${index + 1}`;

                  return (
                    <div
                      key={index}
                      style={{
                        background: '#131c2e',
                        border: photo ? '2px solid #f59e0b' : '2px dashed #475569',
                        borderRadius: '10px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        minHeight: '120px',
                        transition: '0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => singleSlotInputRefs.current[index]?.click()}
                    >
                      <input
                        type="file"
                        ref={(el) => { singleSlotInputRefs.current[index] = el; }}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleSlotFileChange(index, e)}
                      />

                      {photo ? (
                        <>
                          <img
                            src={photo.imageUrl}
                            alt={`Slot ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '84px',
                              objectFit: 'cover',
                              borderRadius: '6px'
                            }}
                          />
                          <span style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                            {photo.caption || `Slot ${index + 1}`}
                          </span>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePhoto(index);
                            }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Remove this photo"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px 4px' }}>
                          <Plus size={20} color="#f59e0b" style={{ margin: '0 auto 4px auto', display: 'block' }} />
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                            {label}
                          </span>
                          <span style={{ fontSize: '9.5px', color: '#64748b' }}>Click to Upload</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Identity Details */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="e.g. Pooja Patel"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Role</label>
                <select
                  className="admin-form-control"
                  value={formData.role || 'PERFORMER'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                >
                  <option value="PERFORMER">Performer / Dancer</option>
                  <option value="CUSTOMER">Customer / Booker</option>
                  <option value="ORGANIZER">Event Organizer</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="admin-form-control"
                  required
                  placeholder="name@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  className="admin-form-control"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Physical & Personal Details */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Gender</label>
                <select
                  className="admin-form-control"
                  value={formData.gender || 'FEMALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="admin-form-control"
                  style={{ colorScheme: 'dark' }}
                  value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  className="admin-form-control"
                  placeholder="e.g. 165"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>State</label>
                <select
                  className="admin-form-control"
                  value={formData.state || 'Gujarat'}
                  onChange={(e) => {
                    const nextStateName = e.target.value;
                    const stObj = indianStates.find((s) => s.name === nextStateName);
                    const stateCities = stObj ? City.getCitiesOfState('IN', stObj.isoCode) : [];
                    setFormData({
                      ...formData,
                      state: nextStateName,
                      city: stateCities.length > 0 ? stateCities[0].name : ''
                    });
                  }}
                >
                  {indianStates.map((st) => (
                    <option key={st.isoCode} value={st.name}>
                      {st.name} ({st.isoCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>City</label>
                <select
                  className="admin-form-control"
                  value={formData.city || (citiesOfSelectedState[0]?.name || '')}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  {citiesOfSelectedState.length === 0 ? (
                    <option value={formData.city || ''}>{formData.city || 'No city available'}</option>
                  ) : (
                    citiesOfSelectedState.map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Full Address & Pincode</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  style={{ flex: 3 }}
                  className="admin-form-control"
                  placeholder="Street address..."
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <input
                  type="text"
                  style={{ flex: 1 }}
                  className="admin-form-control"
                  placeholder="Pincode"
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Performer Specifics */}
            {formData.role === 'PERFORMER' && (
              <>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Hourly Booking Rate (₹ / Hour)</label>
                    <input
                      type="number"
                      className="admin-form-control"
                      placeholder="e.g. 1200"
                      value={formData.hourlyRate || ''}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Skill Level</label>
                    <select
                      className="admin-form-control"
                      value={formData.skillLevel || 'ADVANCED'}
                      onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as SkillLevel })}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="PRO">Pro</option>
                      <option value="CHOREOGRAPHER">Choreographer</option>
                    </select>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>UPI ID (For Payout Settlement)</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. performer@upi"
                      value={formData.upiId || ''}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Instagram Handle</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. garba_dancer"
                      value={formData.instagramHandle || ''}
                      onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Dance Styles</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="Add style (e.g. Dodhiya, Sanedo)..."
                      value={styleInput}
                      onChange={(e) => setStyleInput(e.target.value)}
                    />
                    <button type="button" className="btn-admin-secondary" onClick={addDanceStyle}>
                      Add
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(formData.danceStyles || []).map((style) => (
                      <span
                        key={style}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {style}
                        <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeDanceStyle(style)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Bio / About</label>
                  <textarea
                    className="admin-form-control"
                    rows={2}
                    placeholder="Short description of performance experience & specialty..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '6px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.isAvailable ?? true}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                />
                Available for Booking
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.isVerified ?? true}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                />
                Verified Badge
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active Account
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn-admin-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-admin-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  <span>Save User Model</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
