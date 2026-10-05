import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qrApi, type CreateQRCodePayload, type UpdateQRCodePayload } from "../api/qr.api";

export const QR_KEYS = {
  all: ["qr-codes"] as const,
  active: () => [...QR_KEYS.all, "active"] as const,
  list: () => [...QR_KEYS.all, "list"] as const,
  detail: (id: string) => [...QR_KEYS.all, "detail", id] as const,
};

export function useActiveQRCode() {
  return useQuery({
    queryKey: QR_KEYS.active(),
    queryFn: () => qrApi.getActive(),
    staleTime: 1000 * 10, // 10s for instant sync
    refetchOnWindowFocus: true,
  });
}

export function useAllQRCodes() {
  return useQuery({
    queryKey: QR_KEYS.list(),
    queryFn: () => qrApi.getAll(),
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQRCodePayload | FormData) => qrApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_KEYS.all });
    },
  });
}

export function useUpdateQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQRCodePayload | FormData }) =>
      qrApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_KEYS.all });
    },
  });
}

export function useSetPrimaryQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => qrApi.setPrimary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_KEYS.all });
    },
  });
}

export function useDeleteQRCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => qrApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QR_KEYS.all });
    },
  });
}
