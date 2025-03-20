import { API_URL } from "../api";

interface VerifyTokenResponse {
  email: string;
  message?: string;
}

interface UpdatePasswordData {
  token: string;
  email: string;
  password: string;
}

interface UpdatePasswordResponse {
  message: string;
}

export const resetPasswordApi = {
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    const response = await fetch(`${API_URL}/reset-password/verify-token/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Invalid or expired reset link");
    }

    return responseData;
  },

  updatePassword: async (data: UpdatePasswordData): Promise<UpdatePasswordResponse> => {
    const response = await fetch(`${API_URL}/reset-password/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "Failed to reset password");
    }

    return responseData;
  }
};