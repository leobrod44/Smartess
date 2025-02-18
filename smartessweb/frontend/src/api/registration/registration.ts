import { API_URL } from "../api";

interface VerifyTokenResponse {
  email: string;
  message: string;
}

interface RegistrationData {
  token: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  email: string;
}

interface RegistrationResponse {
  message: string;
}

export const registrationApi = {
  verifyToken: async (token: string): Promise<VerifyTokenResponse> => {
    const response = await fetch(`${API_URL}/registration/verify-token/${token}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token verification failed');
    }

    return data;
  },

  register: async (registrationData: RegistrationData): Promise<RegistrationResponse> => {
    const response = await fetch(`${API_URL}/registration/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  }
};