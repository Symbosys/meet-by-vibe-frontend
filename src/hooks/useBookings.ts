import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingsApi, type QueryBookingsParams, type CreateBookingPayload } from "../api/bookings.api";
import type { BookingStatus } from "../admin/types/admin.types";

export const BOOKING_KEYS = {
  all: ["bookings"] as const,
  lists: () => [...BOOKING_KEYS.all, "list"] as const,
  list: (params?: QueryBookingsParams) => [...BOOKING_KEYS.lists(), params] as const,
  details: () => [...BOOKING_KEYS.all, "detail"] as const,
  detail: (id: string) => [...BOOKING_KEYS.details(), id] as const,
};

export function useBookings(params?: QueryBookingsParams) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(params),
    queryFn: () => bookingsApi.getAll(params),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 15000, // poll bookings status every 15s
  });
}

export function useBooking(id?: string) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id || ""),
    queryFn: () => bookingsApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingPayload) => bookingsApi.initiate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}

export function useInitiateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingPayload) => bookingsApi.initiate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
    },
  });
}

export function useSubmitPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FormData | { utrNumber?: string; paymentScreenshotUrl?: string } }) =>
      bookingsApi.submitPaymentProof(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.detail(variables.id) });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.detail(variables.id) });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      bookingsApi.cancel(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.detail(variables.id) });
    },
  });
}
