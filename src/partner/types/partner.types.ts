export interface PartnerPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface GarbaPartner {
  id: string;
  name: string;
  age: number;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  avatarUrl: string;
  isVerified: boolean;
  isOnline: boolean;
  matchScore: number; // e.g. 92
  tag: 'Partner' | 'Group' | 'New Friends';
  city: string;
  state: string;
  mySkill: string;
  theirSkill: string;
  preferredDate: string;
  danceStyles: string[];
  photosCount: number;
  photos: string[];
  bio: string;
  heightCm: number;
  instagram?: string;
  attendingEventIds: string[];
  hourlyRate?: number;
  upiId?: string;
  isFavorite?: boolean;
  requestStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface GarbaEvent {
  id: string;
  title: string;
  isFeatured: boolean;
  isJoined: boolean;
  imageUrl: string;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  city: string;
  state: string;
  attendeesCount: number;
  lookingForPartnerCount: number;
  attendeeAvatars: string[];
  description: string;
  pricePerPass?: number;
  isFavorite?: boolean;
  slug?: string;
  address?: string;
  pincode?: string;
  dressCode?: string;
  rules?: string[];
  totalCapacity?: number;
  organizerName?: string;
  organizerContact?: string;
  status?: string;
  galleryImages?: string[];
  endDate?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  country?: string;
  rawDate?: string;
}

export interface PartnerRequest {
  id: string;
  sender: GarbaPartner;
  eventId: string;
  eventName: string;
  message: string;
  sentAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface PartnerStats {
  partnerRequests: number;
  matches: number;
  newMessages: number;
  upcomingEvents: number;
}
