import { Individual } from "@/app/mockData";
import { API_URL } from "@/api/api";

interface AssignedUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  resolved: boolean;
}

const getAssignedUsers = async (ticketId: string): Promise<AssignedUser[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/tickets/assigned-users/${ticketId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch assigned users');
  const data = await response.json();
  return data.assignedUsers;
};

interface AssignableEmployee {
  employeeId: number;
  firstName: string;
  lastName: string;
  role: string;
}

const getAssignableEmployees = async (ticketId: string): Promise<Individual[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/tickets/assignable-employees/${ticketId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) throw new Error('Failed to fetch assignable employees');
  
  const data = await response.json();
  return data.employees.map((emp: AssignableEmployee) => ({
    individualId: emp.employeeId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    role: emp.role
  }));
};

const assignUsersToTicket = async (ticketId: string, userIds: number[]): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch(`${API_URL}/tickets/assign-users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticket_id: parseInt(ticketId),
      user_ids: userIds
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign users');
  }

  return response.json();
};

const unassignUserFromTicket = async (ticketId: string, userId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
 
  const response = await fetch(`${API_URL}/tickets/unassign-user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ticket_id: parseInt(ticketId),
      user_id: userId
    })
  });
 
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unassign user');
  }
 
  return response.json();
 };

export const ticketAssignApis = {
  getAssignedUsers,
  getAssignableEmployees,
  assignUsersToTicket,
  unassignUserFromTicket
};