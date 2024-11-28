import { API_URL } from "../api";

interface UserInfoResponse {
  first_name: string;
  last_name: string;
}

interface UserTypeResponse {
  type: "string";
}

export const userApi = {
  getUserInfo: async (token: string): Promise<UserInfoResponse> => {
    const response = await fetch(`${API_URL}/users/get_user_name`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user info");
    }

    return data;
  },
  getUserType: async (token: string): Promise<UserTypeResponse> => {
    const response = await fetch(`${API_URL}/users/get_user_type`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch user type");
    }

    return data;
  },
};

interface LogoutResponse {
  message: string;
}

export const authApi = {
  logout: async (): Promise<LogoutResponse> => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Logout failed");
    }

    return data;
  },
};
