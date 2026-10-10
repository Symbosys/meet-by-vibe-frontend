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
    dateOfBirth: '2003-05-12',
    height: 165,
    city: 'Ahmedabad',
    state: 'Gujarat',
    address: '',
    pincode: '380009',
    skillLevel: 'ADVANCED',
    danceStyles: ['Traditional Garba', 'Dodhiya'],
    experienceYears: 4,
    instagramHandle: '',
    hourlyRate: 399,
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

  // const [styleInput, setStyleInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [showAvatarUrlMode, setShowAvatarUrlMode] = useState(false);

  // Drag & drop state trackers
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

  // Helper to parse dance styles safely
  const parseDanceStyles = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return ['Traditional Garba', 'Dodhiya'];
  };

  const safeDateOfBirth = (dob: any): string => {
    if (!dob) return '2000-01-15';
    if (typeof dob === 'string') return dob.includes('T') ? dob.split('T')[0] : dob;
    try {
      return new Date(dob).toISOString().split('T')[0];
    } catch {
      return '2000-01-15';
    }
  };

  // country-state-city Indian states and cities integration
  const indianStates = useMemo(() => {
    try {
      const states = State.getStatesOfCountry('IN');
      return Array.isArray(states) ? states : [];
    } catch {
      return [];
    }
  }, []);
  
  const selectedStateObj = useMemo(() => {
    if (!indianStates || indianStates.length === 0) return null;
    const currentState = String(formData.state || '').toLowerCase().trim();
    return (
      indianStates.find((s) => String(s?.name || '').toLowerCase().trim() === currentState) ||
      indianStates.find((s) => s?.isoCode === 'GJ') ||
      indianStates[0] ||
      null
    );
  }, [indianStates, formData.state]);

  const citiesOfSelectedState = useMemo(() => {
    if (!selectedStateObj?.isoCode) return [];
    try {
      const cities = City.getCitiesOfState('IN', selectedStateObj.isoCode);
      return Array.isArray(cities) ? cities : [];
    } catch {
      return [];
    }
  }, [selectedStateObj]);

  useEffect(() => {
    setErrorMessage(null);
    setAvatarFile(null);
    setGalleryFiles({});

    if (user) {
      setFormData({
        ...user,
        dateOfBirth: safeDateOfBirth(user.dateOfBirth),
        danceStyles: parseDanceStyles(user.danceStyles),
        photos: Array.isArray(user.photos) ? user.photos : []
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
        dateOfBirth: '2003-05-12',
        height: 165,
        city: 'Ahmedabad',
        state: 'Gujarat',
        address: '',
        pincode: '380009',
        skillLevel: 'ADVANCED',
        danceStyles: ['Traditional Garba', 'Dodhiya'],
        experienceYears: 4,
        instagramHandle: '',
        hourlyRate: 399,
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

  const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending || uploadPhotosMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name) {
      setErrorMessage('Please fill in the performer/user name');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('name', formData.name || '');
      payload.append(
        'email',
        formData.email || `performer_${formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'user'}_${Date.now()}@meetbyvibe.internal`
      );
      payload.append('phone', formData.phone || `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`);
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

      // Helper to convert base64 dataUrl to File
      const dataUrlToFile = (dataUrl: string, filename: string): File | null => {
        try {
          const arr = dataUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        } catch {
          return null;
        }
      };

      // Append avatar file or URL
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      } else if (formData.avatarUrl) {
        if (formData.avatarUrl.startsWith('data:image/')) {
          const file = dataUrlToFile(formData.avatarUrl, 'avatar.jpg');
          if (file) {
            payload.append('avatar', file);
          } else {
            payload.append('avatarUrl', formData.avatarUrl);
          }
        } else {
          payload.append('avatarUrl', formData.avatarUrl);
        }
      }

      // Collect all 5 gallery photos (both File objects and remote web URLs)
      const photoUrlsToSend: string[] = [];
      const photosList = (formData.photos || []).filter((p) => p && p.imageUrl && p.imageUrl.trim().length > 0);

      // 1. Process valid items in formData.photos
      photosList.forEach((p, idx) => {
        const slotIdx = p.order !== undefined ? p.order : idx;
        const file = galleryFiles[slotIdx] || galleryFiles[idx];
        if (file) {
          payload.append('photos', file);
        } else if (p.imageUrl) {
          if (p.imageUrl.startsWith('data:image/')) {
            const convertedFile = dataUrlToFile(p.imageUrl, `photo-${idx + 1}.jpg`);
            if (convertedFile) {
              payload.append('photos', convertedFile);
            } else {
              photoUrlsToSend.push(p.imageUrl);
            }
          } else if (!p.imageUrl.startsWith('blob:')) {
            photoUrlsToSend.push(p.imageUrl);
          }
        }
      });

      // 2. Also append any remaining galleryFiles that weren't captured
      const usedSlots = new Set(photosList.map((p, idx) => (p.order !== undefined ? p.order : idx)));
      Object.keys(galleryFiles).forEach((key) => {
        const slotIdx = Number(key);
        if (!usedSlots.has(slotIdx) && galleryFiles[slotIdx]) {
          payload.append('photos', galleryFiles[slotIdx]);
        }
      });

      // 3. Send photoUrls array if any remote / web URLs exist
      if (photoUrlsToSend.length > 0) {
        payload.append('photoUrls', JSON.stringify(photoUrlsToSend));
      }

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

  // Drag counter refs to prevent child-element dragleave flickering in Chrome/Safari/Firefox
  const avatarDragCounter = useRef(0);
  const galleryDragCounter = useRef(0);
  const slotDragCounters = useRef<{ [key: number]: number }>({});

  // Helper to validate image file cross-browser
  const isImageFile = (file: File): boolean => {
    if (!file) return false;
    if (file.type && file.type.startsWith('image/')) return true;
    const ext = file.name?.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'jfif', 'bmp', 'heic', 'avif'].includes(ext);
  };

  // Helper to convert a Web Image URL (e.g. from Pinterest / Unsplash) into a local compressed File
  const urlToFile = async (url: string, filename = 'web-image.jpg'): Promise<File | null> => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        return new File([blob], filename, { type: blob.type || 'image/jpeg' });
      }
    } catch {
      // CORS or network error, fallback to canvas or direct URL
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load web image'));
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 600;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new File([new Blob([ab], { type: 'image/jpeg' })], filename, { type: 'image/jpeg' });
      }
    } catch {
      // Canvas tainted or blocked
    }

    return null;
  };

  // Helper to extract local Files and web image URLs from DragEvent (Pinterest, Google Images, desktop files)
  const extractFilesAndUrlsFromDragEvent = (e: React.DragEvent): { files: File[]; imageUrls: string[] } => {
    const files: File[] = [];
    const imageUrls: string[] = [];
    const dt = e.dataTransfer;
    if (!dt) return { files, imageUrls };

    // 1. Check dt.items for local File objects
    if (dt.items && dt.items.length > 0) {
      for (let i = 0; i < dt.items.length; i++) {
        const item = dt.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && isImageFile(file)) {
            files.push(file);
          }
        }
      }
    }

    // 2. Fallback to dt.files if items produced no files
    if (files.length === 0 && dt.files && dt.files.length > 0) {
      for (let i = 0; i < dt.files.length; i++) {
        const file = dt.files[i];
        if (file && isImageFile(file)) {
          files.push(file);
        }
      }
    }

    // 3. If no local files were dragged, extract Web Image URLs (e.g. Pinterest, Google Images, Web pages)
    if (files.length === 0) {
      // A. Check HTML content for <img src="..."> tags
      const html = dt.getData('text/html');
      if (html) {
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const imgs = doc.querySelectorAll('img');
          imgs.forEach((img) => {
            const src = img.getAttribute('src') || img.getAttribute('data-src') || img.src;
            if (src && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:image/'))) {
              // Convert Pinterest thumbnail URLs to high-resolution (736x)
              const highRes = src.replace(/\/(?:236x|474x|564x)\//, '/736x/');
              if (!imageUrls.includes(highRes)) {
                imageUrls.push(highRes);
              }
            }
          });
        } catch (err) {
          console.warn('Could not parse drag HTML:', err);
        }
      }

      // B. Check text/uri-list
      const uriList = dt.getData('text/uri-list');
      if (uriList) {
        const lines = uriList.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
        for (const line of lines) {
          if (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('data:image/')) {
            const highRes = line.replace(/\/(?:236x|474x|564x)\//, '/736x/');
            if (!imageUrls.includes(highRes)) {
              imageUrls.push(highRes);
            }
          }
        }
      }

      // C. Check text/plain or URL
      const plainText = dt.getData('text/plain') || dt.getData('URL');
      if (plainText) {
        const match =
          plainText.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif|svg|jfif|bmp|avif)(?:\?[^\s"'<>]*)?/i) ||
          plainText.match(/https?:\/\/[^\s"'<>]+/i);
        if (match) {
          const url = match[0].replace(/\/(?:236x|474x|564x)\//, '/736x/');
          if (!imageUrls.includes(url)) {
            imageUrls.push(url);
          }
        }
      }
    }

    return { files, imageUrls };
  };

  // Core image processors
  const processAvatarFile = async (file: File) => {
    if (!file || !isImageFile(file)) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    try {
      const compressed = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
      setAvatarFile(compressed.file);
      setFormData((prev) => ({ ...prev, avatarUrl: compressed.dataUrl }));
      setAvatarUrlInput(compressed.dataUrl);
    } catch (err) {
      console.error('Avatar compression failed, falling back:', err);
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }));
        setAvatarUrlInput(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAvatarUrl = async (url: string) => {
    try {
      const file = await urlToFile(url, 'pinterest-avatar.jpg');
      if (file) {
        await processAvatarFile(file);
        return;
      }
    } catch (err) {
      console.warn('URL to file conversion error:', err);
    }

    // Direct URL Fallback (works with any Pinterest / web image)
    setAvatarFile(null);
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setAvatarUrlInput(url);
  };

  const processGalleryFiles = async (fileList: File[]) => {
    const imageFiles = fileList.filter(isImageFile);
    if (imageFiles.length === 0) {
      setErrorMessage('Please select valid image files.');
      return;
    }

    const currentPhotosCount = formData.photos?.length || 0;
    try {
      const compressedResults = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            return await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
          } catch {
            return new Promise<{ file: File; dataUrl: string }>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve({ file, dataUrl: e.target?.result as string });
              reader.onerror = () => resolve({ file, dataUrl: URL.createObjectURL(file) });
              reader.readAsDataURL(file);
            });
          }
        })
      );

      const newFilesMap: { [key: number]: File } = { ...galleryFiles };
      const newPhotos: UserPhoto[] = [];

      compressedResults.forEach((comp, index) => {
        const slotIdx = currentPhotosCount + index;
        newFilesMap[slotIdx] = comp.file;
        newPhotos.push({
          id: `p-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
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
  };

  const processGalleryUrls = async (urls: string[]) => {
    const currentPhotosCount = formData.photos?.length || 0;
    const newPhotos: UserPhoto[] = [];
    const newFilesMap: { [key: number]: File } = { ...galleryFiles };

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const slotIdx = currentPhotosCount + i;
      let file: File | null = null;
      try {
        file = await urlToFile(url, `pinterest-photo-${slotIdx + 1}.jpg`);
      } catch {
        file = null;
      }

      if (file) {
        try {
          const comp = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
          newFilesMap[slotIdx] = comp.file;
          newPhotos.push({
            id: `p-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            userId: user?.id || 'temp',
            imageUrl: comp.dataUrl,
            caption: `Photo ${slotIdx + 1}`,
            order: slotIdx
          });
          continue;
        } catch {
          // fallback
        }
      }

      // If file conversion blocked by CORS, use Web URL directly
      newPhotos.push({
        id: `p-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user?.id || 'temp',
        imageUrl: url,
        caption: `Photo ${slotIdx + 1}`,
        order: slotIdx
      });
    }

    setGalleryFiles(newFilesMap);
    setFormData((prev) => ({
      ...prev,
      photos: [...(prev.photos || []), ...newPhotos]
    }));
  };

  const processSlotFile = async (slotIndex: number, file: File) => {
    if (!file || !isImageFile(file)) {
      setErrorMessage('Please select a valid image file for this slot.');
      return;
    }
    try {
      let compressedDataUrl = '';
      let fileToSave = file;
      try {
        const compressed = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
        fileToSave = compressed.file;
        compressedDataUrl = compressed.dataUrl;
      } catch {
        compressedDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      }

      setGalleryFiles((prev) => ({ ...prev, [slotIndex]: fileToSave }));
      setFormData((prev) => {
        const currentPhotos = [...(prev.photos || [])];
        while (currentPhotos.length <= slotIndex) {
          const nextIdx = currentPhotos.length;
          currentPhotos.push({
            id: `p-${Date.now()}-${nextIdx}`,
            userId: user?.id || 'temp',
            imageUrl: '',
            caption: PHOTO_SLOT_LABELS[nextIdx] || `Photo ${nextIdx + 1}`,
            order: nextIdx
          });
        }
        currentPhotos[slotIndex] = {
          id: currentPhotos[slotIndex]?.id || `p-${Date.now()}-${slotIndex}`,
          userId: user?.id || 'temp',
          imageUrl: compressedDataUrl,
          caption: PHOTO_SLOT_LABELS[slotIndex] || `Photo ${slotIndex + 1}`,
          order: slotIndex
        };

        const avatarUrl = slotIndex === 0 && !prev.avatarUrl ? compressedDataUrl : prev.avatarUrl;

        return {
          ...prev,
          avatarUrl,
          photos: currentPhotos
        };
      });
    } catch (err) {
      console.error('Slot photo compression failed:', err);
    }
  };

  const processSlotUrl = async (slotIndex: number, url: string) => {
    let finalImageUrl = url;
    let fileToSave: File | null = null;

    try {
      const file = await urlToFile(url, `pinterest-slot-${slotIndex + 1}.jpg`);
      if (file) {
        try {
          const comp = await compressImage(file, file.name, { maxSizeKB: 95, maxWidthOrHeight: 900 });
          fileToSave = comp.file;
          finalImageUrl = comp.dataUrl;
        } catch {
          fileToSave = file;
        }
      }
    } catch {
      // Fallback
    }

    if (fileToSave) {
      setGalleryFiles((prev) => ({ ...prev, [slotIndex]: fileToSave! }));
    }

    setFormData((prev) => {
      const currentPhotos = [...(prev.photos || [])];
      while (currentPhotos.length <= slotIndex) {
        const nextIdx = currentPhotos.length;
        currentPhotos.push({
          id: `p-${Date.now()}-${nextIdx}`,
          userId: user?.id || 'temp',
          imageUrl: '',
          caption: PHOTO_SLOT_LABELS[nextIdx] || `Photo ${nextIdx + 1}`,
          order: nextIdx
        });
      }
      currentPhotos[slotIndex] = {
        id: currentPhotos[slotIndex]?.id || `p-${Date.now()}-${slotIndex}`,
        userId: user?.id || 'temp',
        imageUrl: finalImageUrl,
        caption: PHOTO_SLOT_LABELS[slotIndex] || `Photo ${slotIndex + 1}`,
        order: slotIndex
      };

      const avatarUrl = slotIndex === 0 && !prev.avatarUrl ? finalImageUrl : prev.avatarUrl;

      return {
        ...prev,
        avatarUrl,
        photos: currentPhotos
      };
    });
  };

  // Avatar Image Upload via File Picker
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAvatarFile(file);
    }
    e.target.value = '';
  };

  // Upload Multiple Photos via File Picker
  const handleMultiGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processGalleryFiles(Array.from(files));
    }
    e.target.value = '';
  };

  // Upload or replace image for a specific slot via File Picker
  const handleSlotFileChange = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSlotFile(slotIndex, file);
    }
    e.target.value = '';
  };

  // Reorder existing photo items via Drag & Drop
  const handleReorderPhotos = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setFormData((prev) => {
      const photos = [...(prev.photos || [])];
      if (fromIndex >= photos.length || toIndex >= photos.length) return prev;
      const [movedItem] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, movedItem);
      return {
        ...prev,
        photos
      };
    });
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

  /*
  const addDanceStyle = () => {
    if (!styleInput.trim()) return;
    const currentStyles = Array.isArray(formData.danceStyles) ? formData.danceStyles : [];
    if (!currentStyles.includes(styleInput.trim())) {
      setFormData({ ...formData, danceStyles: [...currentStyles, styleInput.trim()] });
    }
    setStyleInput('');
  };

  const removeDanceStyle = (style: string) => {
    const currentStyles = Array.isArray(formData.danceStyles) ? formData.danceStyles : [];
    setFormData({
      ...formData,
      danceStyles: currentStyles.filter((s) => s !== style)
    });
  };
  */

  const photosList = Array.isArray(formData.photos) ? formData.photos : [];
  const uploadedPhotosCount = photosList.length;

  if (!isOpen) return null;

  return (
    <div 
      className="admin-modal-overlay" 
      onClick={onClose}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <div 
        className="admin-modal" 
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
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

            {/* Primary Display Avatar with Cross-Browser Drag & Drop */}
            <div 
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                avatarDragCounter.current++;
                if (avatarDragCounter.current === 1) {
                  setIsDraggingAvatar(true);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                if (!isDraggingAvatar) {
                  setIsDraggingAvatar(true);
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                avatarDragCounter.current--;
                if (avatarDragCounter.current <= 0) {
                  avatarDragCounter.current = 0;
                  setIsDraggingAvatar(false);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                avatarDragCounter.current = 0;
                setIsDraggingAvatar(false);
                const { files, imageUrls } = extractFilesAndUrlsFromDragEvent(e);
                if (files.length > 0) {
                  await processAvatarFile(files[0]);
                } else if (imageUrls.length > 0) {
                  await processAvatarUrl(imageUrls[0]);
                }
              }}
              style={{ 
                background: isDraggingAvatar ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15, 23, 42, 0.7)', 
                padding: '16px', 
                borderRadius: '10px', 
                border: isDraggingAvatar ? '2px dashed #f59e0b' : '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div 
                style={{ 
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => avatarFileInputRef.current?.click()}
                title="Click or Drag & Drop to change profile photo"
              >
                <img
                  src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt="Avatar Preview"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: isDraggingAvatar ? '3px solid #fbbf24' : '3px solid #f59e0b',
                    background: '#1e293b',
                    display: 'block',
                    pointerEvents: 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: '#f59e0b',
                  color: '#0f172a',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  pointerEvents: 'none'
                }}>
                  <Upload size={12} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                    Main Profile / Display Photo *
                  </label>
                  <span style={{ fontSize: '10.5px', color: isDraggingAvatar ? '#fbbf24' : '#94a3b8', fontWeight: 500 }}>
                    {isDraggingAvatar ? '✨ Drop photo here!' : '(Drag & drop photo or click upload)'}
                  </span>
                </div>
                
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
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

            {/* 5-Photo Gallery Upload Section with Cross-Browser Drag & Drop */}
            <div 
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                galleryDragCounter.current++;
                if (galleryDragCounter.current === 1) {
                  setIsDraggingGallery(true);
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'copy';
                if (!isDraggingGallery) {
                  setIsDraggingGallery(true);
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                galleryDragCounter.current--;
                if (galleryDragCounter.current <= 0) {
                  galleryDragCounter.current = 0;
                  setIsDraggingGallery(false);
                }
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                galleryDragCounter.current = 0;
                setIsDraggingGallery(false);
                const { files, imageUrls } = extractFilesAndUrlsFromDragEvent(e);
                if (files.length > 0) {
                  await processGalleryFiles(files);
                } else if (imageUrls.length > 0) {
                  await processGalleryUrls(imageUrls);
                }
              }}
              style={{
                background: isDraggingGallery ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.7)',
                padding: '16px',
                borderRadius: '10px',
                border: isDraggingGallery ? '2px dashed #f59e0b' : '1px solid #334155',
                transition: 'all 0.2s ease'
              }}
            >
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
                    Drag and drop multiple photos here or click upload (Costumes, stage performance, Dandiya pose).
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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-admin-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#f59e0b', color: '#fbbf24' }}
                    onClick={() => multiGalleryInputRef.current?.click()}
                  >
                    <Upload size={13} />
                    <span>Upload All 5 Photos</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Upload Zone Bar */}
              <div
                onClick={() => multiGalleryInputRef.current?.click()}
                style={{
                  border: isDraggingGallery ? '2px dashed #f59e0b' : '1.5px dashed rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  background: isDraggingGallery ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                  padding: '12px 16px',
                  textAlign: 'center',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isDraggingGallery ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                  color: isDraggingGallery ? '#0f172a' : '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Upload size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                    {isDraggingGallery ? 'Release files to add to gallery!' : 'Drag & Drop photos here or click to browse'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    Supports single or multiple images (PNG, JPG, WEBP • auto compressed to &lt;100KB)
                  </div>
                </div>
              </div>

              {/* 5 Dedicated Upload Slots Grid with Individual Drop & Reordering */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
                gap: '12px'
              }}>
                {Array.from({ length: Math.max(5, photosList.length) }).map((_, index) => {
                  const photo = photosList[index];
                  const label = PHOTO_SLOT_LABELS[index] || `Photo ${index + 1}`;
                  const isSlotActiveDrag = dragOverSlotIndex === index;

                  return (
                    <div
                      key={index}
                      draggable={!!photo}
                      onDragStart={(e) => {
                        if (photo) {
                          setDraggedPhotoIndex(index);
                          e.dataTransfer.setData('text/plain', String(index));
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      }}
                      onDragEnd={() => {
                        setDraggedPhotoIndex(null);
                        setDragOverSlotIndex(null);
                        slotDragCounters.current[index] = 0;
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        slotDragCounters.current[index] = (slotDragCounters.current[index] || 0) + 1;
                        setDragOverSlotIndex(index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = draggedPhotoIndex !== null ? 'move' : 'copy';
                        if (dragOverSlotIndex !== index) {
                          setDragOverSlotIndex(index);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        slotDragCounters.current[index] = (slotDragCounters.current[index] || 0) - 1;
                        if ((slotDragCounters.current[index] || 0) <= 0) {
                          slotDragCounters.current[index] = 0;
                          if (dragOverSlotIndex === index) {
                            setDragOverSlotIndex(null);
                          }
                        }
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        slotDragCounters.current[index] = 0;
                        setDragOverSlotIndex(null);

                        // Case 1: Reordering existing photo cards
                        if (draggedPhotoIndex !== null) {
                          handleReorderPhotos(draggedPhotoIndex, index);
                          setDraggedPhotoIndex(null);
                          return;
                        }

                        // Case 2: Dropping file or web image (Pinterest / Google) onto this specific slot
                        const { files, imageUrls } = extractFilesAndUrlsFromDragEvent(e);
                        if (files.length === 1) {
                          await processSlotFile(index, files[0]);
                        } else if (files.length > 1) {
                          await processGalleryFiles(files);
                        } else if (imageUrls.length === 1) {
                          await processSlotUrl(index, imageUrls[0]);
                        } else if (imageUrls.length > 1) {
                          await processGalleryUrls(imageUrls);
                        }
                      }}
                      style={{
                        background: isSlotActiveDrag ? '#1e293b' : '#131c2e',
                        border: isSlotActiveDrag
                          ? '2px solid #38bdf8'
                          : photo
                            ? '2px solid #f59e0b'
                            : '2px dashed #475569',
                        boxShadow: isSlotActiveDrag ? '0 0 12px rgba(56, 189, 248, 0.4)' : undefined,
                        borderRadius: '10px',
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        minHeight: '120px',
                        transition: 'all 0.2s ease',
                        cursor: photo ? 'grab' : 'pointer',
                        transform: isSlotActiveDrag ? 'scale(1.03)' : undefined
                      }}
                      onClick={() => singleSlotInputRefs.current[index]?.click()}
                      title={photo ? 'Drag to reorder or click to replace photo' : 'Drag & drop or click to upload photo'}
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
                              borderRadius: '6px',
                              pointerEvents: 'none'
                            }}
                          />
                          <span style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', pointerEvents: 'none' }}>
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
                              cursor: 'pointer',
                              zIndex: 2
                            }}
                            title="Remove this photo"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '10px 4px', pointerEvents: 'none' }}>
                          <Plus size={20} color={isSlotActiveDrag ? '#38bdf8' : '#f59e0b'} style={{ margin: '0 auto 4px auto', display: 'block' }} />
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                            {label}
                          </span>
                          <span style={{ fontSize: '9.5px', color: isSlotActiveDrag ? '#38bdf8' : '#64748b' }}>
                            {isSlotActiveDrag ? 'Drop Here' : 'Drop or Click'}
                          </span>
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

            {/* Email Address & Phone Number fields commented out as requested */}
            {/*
            <div className="admin-form-row">
              <div className="admin-form-group" style={{ flex: 1 }}>
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
            */}

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

              {/* Date of Birth field commented out as requested */}
              {/*
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
              */}

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
                    citiesOfSelectedState.map((ct, idx) => (
                      <option key={`${ct.name}-${idx}`} value={ct.name}>
                        {ct.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Full Address & Pincode field commented out as requested */}
            {/*
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
            */}

            {/* Rates, UPI & Performer Specifics */}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Booking Rate (₹ per hour / event) *</label>
                <input
                  type="number"
                  className="admin-form-control"
                  placeholder="e.g. 399"
                  value={formData.hourlyRate ?? 399}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                />
              </div>

              <div className="admin-form-group">
                <label>UPI ID (For Payout Settlement / Direct UPI) *</label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="e.g. username@okhdfcbank or 9876543210@paytm"
                  value={formData.upiId || ''}
                  onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-row">
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

              <div className="admin-form-group">
                <label>Instagram Handle (Optional)</label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="e.g. garba_dancer"
                  value={formData.instagramHandle || ''}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                />
              </div>
            </div>

                {/* Dance Styles field commented out as requested */}
                {/*
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
                    {danceStylesList.map((style) => (
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
                */}

                {/* Bio / About field commented out as requested */}
                {/*
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
                */}

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
