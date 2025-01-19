import { API_URL } from "../api";

export const startProjectApi = {
  sendEmail: async (businessName: string, firstName: string, lastName: string, telephoneNumber: string, email: string, description: string): Promise<void> => {
    const response = await fetch(`${API_URL}/start-project/send-email`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        firstName,
        lastName,
        telephoneNumber,
        email,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return data;
  },

  storeStartProjectData: async (businessName: string, firstName: string, lastName: string, telephoneNumber: string, email: string, description: string): Promise<void> => {
    const response = await fetch(`${API_URL}/start-project/store-start-project-data`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        firstName,
        lastName,
        telephoneNumber,
        email,
        description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to store data');
    }

    return data;
  },
};