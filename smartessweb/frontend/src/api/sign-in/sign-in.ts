import { API_URL } from "../api";

interface SignInData {
  email: string;
  password: string;
}

interface SignInResponse {
  token: string;
  user?: {
    email: string;
  };
}

export const signInApi = {
  signIn: async (credentials: SignInData): Promise<SignInResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign in failed');
    }

    return data;
  }
};