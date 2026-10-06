import { apiClient } from "./client";

export interface VerifyAdminPinResponse {
  success: boolean;
  message: string;
  data: {
    authenticated: boolean;
    token: string;
    message: string;
  };
}

export const authApi = {
  /**
   * Verify 6-digit admin security PIN
   */
  verifyAdminPin: async (pin: string): Promise<VerifyAdminPinResponse> => {
    const response = await apiClient.post<VerifyAdminPinResponse>("/auth/admin/verify-pin", { pin });
    return response.data;
  },
};
