import { apiClient } from "./client";

export interface QRCodeData {
  id: string;
  title: string;
  imageUrl: string;
  upiId?: string | null;
  accountHolderName?: string | null;
  bankName?: string | null;
  isActive: boolean;
  isPrimary: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQRCodePayload {
  title: string;
  imageUrl?: string;
  upiId?: string;
  accountHolderName?: string;
  bankName?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  description?: string;
  image?: File;
}

export interface UpdateQRCodePayload {
  title?: string;
  imageUrl?: string;
  upiId?: string;
  accountHolderName?: string;
  bankName?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  description?: string;
  image?: File;
}

export const qrApi = {
  // Get active / primary QR code for customer bookings
  getActive: async (): Promise<QRCodeData | null> => {
    const res = await apiClient.get<{ success: boolean; data: QRCodeData | null }>("/qr/active");
    return res.data.data;
  },

  // Get all QR codes (Admin view)
  getAll: async (): Promise<QRCodeData[]> => {
    const res = await apiClient.get<{ success: boolean; data: QRCodeData[] }>("/qr/admin/all");
    return res.data.data || [];
  },

  // Get QR by ID
  getById: async (id: string): Promise<QRCodeData> => {
    const res = await apiClient.get<{ success: boolean; data: QRCodeData }>(`/qr/admin/${id}`);
    return res.data.data;
  },

  // Create new QR Code (Supports both JSON and Multipart with compressed image)
  create: async (data: CreateQRCodePayload | FormData): Promise<QRCodeData> => {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post<{ success: boolean; data: QRCodeData }>("/qr/admin", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  // Update existing QR Code
  update: async (id: string, data: UpdateQRCodePayload | FormData): Promise<QRCodeData> => {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch<{ success: boolean; data: QRCodeData }>(`/qr/admin/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  // Set as primary/active payment QR
  setPrimary: async (id: string): Promise<QRCodeData> => {
    const res = await apiClient.patch<{ success: boolean; data: QRCodeData }>(`/qr/admin/${id}/primary`);
    return res.data.data;
  },

  // Delete QR Code
  delete: async (id: string): Promise<QRCodeData> => {
    const res = await apiClient.delete<{ success: boolean; data: QRCodeData }>(`/qr/admin/${id}`);
    return res.data.data;
  },
};
