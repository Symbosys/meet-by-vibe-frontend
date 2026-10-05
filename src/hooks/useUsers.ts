import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type QueryUsersParams } from "../api/users.api";
import type { AdminUser } from "../admin/types/admin.types";

export const USER_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_KEYS.all, "list"] as const,
  list: (params?: QueryUsersParams) => [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

/**
 * Hook to fetch users with query params
 */
export function useUsers(params?: QueryUsersParams) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => usersApi.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch single user by ID
 */
export function useUser(id?: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id || ""),
    queryFn: () => usersApi.getById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new user / performer model
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => usersApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing user / performer model
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData | Partial<AdminUser> }) =>
      usersApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });
}

/**
 * Hook to delete a user / performer model
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
    },
  });
}

/**
 * Hook to upload multiple gallery photos (at least 5 photos)
 */
export function useUploadUserPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, formData }: { userId: string; formData: FormData }) =>
      usersApi.uploadPhotos(userId, formData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.userId) });
    },
  });
}

/**
 * Hook to delete a single gallery photo
 */
export function useDeleteUserPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, photoId }: { userId: string; photoId: string }) =>
      usersApi.deletePhoto(userId, photoId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.userId) });
    },
  });
}

/**
 * Hook to toggle user status (isAvailable, isActive, isVerified)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      field,
    }: {
      id: string;
      field: "isActive" | "isAvailable" | "isVerified";
    }) => usersApi.toggleStatus(id, field),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
    },
  });
}
