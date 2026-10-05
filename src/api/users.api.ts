import { apiClient } from "./client";
import type { AdminUser, Gender, Role, SkillLevel, UserPhoto } from "../admin/types/admin.types";

export interface QueryUsersParams {
  search?: string;
  role?: Role;
  city?: string;
  state?: string;
  gender?: Gender;
  skillLevel?: SkillLevel;
  minRate?: number;
  maxRate?: number;
  isAvailable?: boolean | string;
  isActive?: boolean | string;
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SingleUserResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

export const usersApi = {
  // Get all users/performers with filter & search
  getAll: async (params?: QueryUsersParams): Promise<GetUsersResponse["data"]> => {
    const res = await apiClient.get<GetUsersResponse>("/users", { params });
    return res.data.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<AdminUser> => {
    const res = await apiClient.get<SingleUserResponse>(`/users/${id}`);
    return res.data.data;
  },

  // Create new model/user
  create: async (formData: FormData): Promise<AdminUser> => {
    const res = await apiClient.post<SingleUserResponse>("/users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Update model/user
  update: async (id: string, formData: FormData | Partial<AdminUser>): Promise<AdminUser> => {
    const isFormData = formData instanceof FormData;
    const res = await apiClient.patch<SingleUserResponse>(`/users/${id}`, formData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return res.data.data;
  },

  // Delete model/user
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return res.data;
  },

  // Upload multiple gallery photos (at least 5 photos)
  uploadPhotos: async (id: string, formData: FormData): Promise<UserPhoto[]> => {
    const res = await apiClient.post<{ success: boolean; message: string; data: UserPhoto[] }>(
      `/users/${id}/photos`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data.data;
  },

  // Delete single gallery photo
  deletePhoto: async (id: string, photoId: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/users/${id}/photos/${photoId}`
    );
    return res.data;
  },

  // Toggle model status (isAvailable / isActive / isVerified)
  toggleStatus: async (
    id: string,
    field: "isActive" | "isAvailable" | "isVerified"
  ): Promise<{ id: string; name: string; [key: string]: any }> => {
    const res = await apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/users/${id}/toggle-status`,
      { field }
    );
    return res.data.data;
  },
};
