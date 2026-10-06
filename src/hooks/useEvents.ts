import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi, type QueryEventsParams, type CreateEventPayload } from "../api/events.api";

export const EVENT_KEYS = {
  all: ["events"] as const,
  lists: () => [...EVENT_KEYS.all, "list"] as const,
  list: (params?: QueryEventsParams) => [...EVENT_KEYS.lists(), params] as const,
  details: () => [...EVENT_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EVENT_KEYS.details(), id] as const,
};

/**
 * Hook to fetch events with filters and pagination
 */
export function useEvents(params?: QueryEventsParams) {
  return useQuery({
    queryKey: EVENT_KEYS.list(params),
    queryFn: () => eventsApi.getEvents(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch single event by ID or slug
 */
export function useEvent(id?: string) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(id || ""),
    queryFn: () => eventsApi.getEventById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventPayload | FormData) => eventsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventPayload> | FormData }) =>
      eventsApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(variables.id) });
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.all });
    },
  });
}
