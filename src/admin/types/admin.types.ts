export type Role = 'CUSTOMER' | 'PERFORMER' | 'ORGANIZER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO' | 'CHOREOGRAPHER';

export type BookingStatus = 
  | 'PENDING' 
  | 'PAYMENT_VERIFIED' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'REJECTED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'SUBMITTED' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'EXPIRED' 
  | 'REFUNDED';

export type PaymentMethod = 
  | 'UPI_QR_DYNAMIC' 
  | 'UPI_QR_STATIC' 
  | 'GATEWAY_RAZORPAY';

export interface UserPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  caption?: string;
  order: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  gender: Gender;
  role: Role;
  
  // Physical & Personal Details
  height?: number; // cm
  dateOfBirth?: string;
  languages: string[];
  
  // Location
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  // Performer attributes
  bio?: string;
  skillLevel: SkillLevel;
  danceStyles: string[];
  experienceYears: number;
  instagramHandle?: string;
  
  // Booking & Rates
  hourlyRate?: number;
  upiId?: string;
  isAvailable: boolean;
  
  // Stats
  rating: number;
  reviewCount: number;
  totalBookingsDone: number;
  
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  photos: UserPhoto[];
}

export interface AdminPayment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  qrCodeUrl?: string;
  upiPayload?: string;
  transactionRef: string;
  utrNumber?: string;
  paymentScreenshotUrl?: string;
  paidAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface AdminBooking {
  id: string;
  bookingCode: string;
  
  // Booker details
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  image?: any;
  avatarUrl?: string;
  
  customerId?: string;
  customer?: Partial<AdminUser>;
  
  performerId: string;
  performer?: Partial<AdminUser>;
  
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  
  eventAddress?: string;
  city?: string;
  notes?: string;
  
  hourlyRate: number;
  totalAmount: number;
  advanceAmount: number;
  
  status: BookingStatus;
  expiresAt?: string;
  createdAt: string;
  
  payment?: AdminPayment;
  payments?: AdminPayment[];
}

export type ActiveTab = 'users' | 'events' | 'bookings' | 'payments';
