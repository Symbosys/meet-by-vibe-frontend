import { apiClient } from "./client";
import type { GarbaEvent } from "../partner/types/partner.types";

export interface QueryEventsParams {
  city?: string;
  state?: string;
  isFeatured?: boolean;
  status?: string;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface GetEventsResponse {
  success: boolean;
  message: string;
  data: {
    events: GarbaEvent[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface SingleEventResponse {
  success: boolean;
  message: string;
  data: GarbaEvent & {
    galleryImages?: string[];
    dressCode?: string;
    rules?: string[];
    attendees?: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        avatarUrl?: string;
        gender?: string;
        skillLevel?: string;
      };
      lookingForPartner: boolean;
      joinedAt: string;
    }>;
  };
}

export interface RsvpEventPayload {
  userId: string;
  status?: "GOING" | "INTERESTED" | "CANCELLED";
  lookingForPartner?: boolean;
  passCount?: number;
  notes?: string;
}

export interface CreateEventPayload {
  title: string;
  slug?: string;
  description: string;
  imageUrl?: string;
  image?: File;
  galleryImages?: string[];
  gallery?: File[];
  eventDate: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  venue: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  pricePerPass?: number;
  totalCapacity?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  status?: "DRAFT" | "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  organizerName?: string;
  organizerContact?: string;
  dressCode?: string;
  rules?: string[];
}

export const eventsApi = {
  /**
   * Fetch list of events with filters and user context
   */
  getEvents: async (params?: QueryEventsParams): Promise<GetEventsResponse> => {
    const query = new URLSearchParams();
    if (params) {
      if (params.city) query.set("city", params.city);
      if (params.state) query.set("state", params.state);
      if (params.isFeatured !== undefined) query.set("isFeatured", String(params.isFeatured));
      if (params.status) query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.userId) query.set("userId", params.userId);
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await apiClient.get<GetEventsResponse>(`/events${queryString}`);
    return res.data;
  },

  /**
   * Get single event details by ID or Slug
   */
  getEventById: async (id: string, userId?: string): Promise<SingleEventResponse> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const res = await apiClient.get<SingleEventResponse>(`/events/${id}${query}`);
    return res.data;
  },

  /**
   * Create a new event (Supports JSON or FormData with image banner / gallery)
   */
  create: async (data: CreateEventPayload | FormData): Promise<GarbaEvent> => {
    const isFormData = data instanceof FormData;
    const res = await apiClient.post<{ success: boolean; message: string; data: GarbaEvent }>(
      "/events",
      data,
      {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      }
    );
    return res.data.data;
  },

  /**
   * Update an existing event
   */
  update: async (id: string, data: Partial<CreateEventPayload> | FormData): Promise<GarbaEvent> => {
    const isFormData = data instanceof FormData;
    const res = await apiClient.patch<{ success: boolean; message: string; data: GarbaEvent }>(
      `/events/${id}`,
      data,
      {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      }
    );
    return res.data.data;
  },

  /**
   * Delete an event by ID
   */
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/events/${id}`);
    return res.data;
  },

  /**
   * RSVP to event / toggle looking for partner
   */
  rsvpEvent: async (eventId: string, payload: RsvpEventPayload) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/events/${eventId}/rsvp`,
      payload
    );
    return res.data;
  },

  /**
   * Toggle event favorite/bookmark
   */
  toggleFavorite: async (eventId: string, userId: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { isFavorite: boolean } }>(
      `/events/${eventId}/favorite`,
      { userId }
    );
    return res.data;
  },
};
