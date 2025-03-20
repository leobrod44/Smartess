import { API_URL } from "../../api";

interface ForgotPasswordData {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

export const passwordResetApi = {
  requestReset: async (data: ForgotPasswordData): Promise<ForgotPasswordResponse> => {
    // Create FormData for the request
    const formData = new FormData();
    formData.append('email', data.email);
    
    const response = await fetch(`${API_URL}/reset-password/reset-password`, {
      method: 'POST',
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Password reset request failed');
    }

    return responseData;
  }
};