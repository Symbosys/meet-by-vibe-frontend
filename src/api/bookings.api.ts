import { apiClient } from "./client";
import type { AdminBooking, BookingStatus, Gender, PaymentStatus } from "../admin/types/admin.types";

export interface QueryBookingsParams {
  search?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  date?: string;
  performerId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export interface GetBookingsResponse {
  success: boolean;
  message: string;
  data: {
    bookings: AdminBooking[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SingleBookingResponse {
  success: boolean;
  message: string;
  data: AdminBooking;
}

export interface CreateBookingPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: Gender;
  avatarUrl?: string;
  customerId?: string;
  performerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  eventAddress?: string;
  city?: string;
  notes?: string;
}

export interface InitiateBookingResponse {
  booking: {
    id: string;
    bookingCode: string;
    name: string;
    bookingDate: string;
    durationHours: number;
    totalAmount: number;
    status: BookingStatus;
    expiresAt: string;
  };
  performer: {
    id: string;
    name: string;
    hourlyRate?: number;
    upiId?: string;
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    transactionRef: string;
    upiPayload: string;
    qrCodeUrl: string;
    expiresAt: string;
  };
}

export const bookingsApi = {
  // Get all bookings with filtering & pagination
  getAll: async (params?: QueryBookingsParams): Promise<GetBookingsResponse["data"]> => {
    const res = await apiClient.get<GetBookingsResponse>("/bookings", { params });
    return res.data.data;
  },

  // Get booking details by ID
  getById: async (id: string): Promise<AdminBooking> => {
    const res = await apiClient.get<SingleBookingResponse>(`/bookings/${id}`);
    return res.data.data;
  },

  // Initiate new booking with dynamic QR code generation
  initiate: async (data: CreateBookingPayload): Promise<InitiateBookingResponse> => {
    const res = await apiClient.post<{ success: boolean; message: string; data: InitiateBookingResponse }>("/bookings", data);
    return res.data.data;
  },

  // Create new booking (alias for initiate)
  create: async (data: CreateBookingPayload): Promise<InitiateBookingResponse> => {
    const res = await apiClient.post<{ success: boolean; message: string; data: InitiateBookingResponse }>("/bookings", data);
    return res.data.data;
  },

  // Update booking status
  updateStatus: async (id: string, status: BookingStatus): Promise<AdminBooking> => {
    const res = await apiClient.patch<SingleBookingResponse>(`/bookings/${id}/status`, { status });
    return res.data.data;
  },

  // Submit payment proof (UTR / Screenshot)
  submitPaymentProof: async (
    id: string,
    formData: FormData | { utrNumber?: string; paymentScreenshotUrl?: string }
  ): Promise<any> => {
    const isFormData = formData instanceof FormData;
    const res = await apiClient.post(`/bookings/${id}/payment-proof`, formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  // Cancel booking
  cancel: async (id: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, {
      reason,
    });
    return res.data;
  },
};
