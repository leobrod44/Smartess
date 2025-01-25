import { Individual } from "@/app/mockData";

interface AssignedUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  resolved: boolean;
}

const getAssignedUsers = async (ticketId: string): Promise<AssignedUser[]> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/tickets/assigned-users/${ticketId}`, {
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
  const response = await fetch(`http://localhost:3000/api/tickets/assignable-employees/${ticketId}`, {
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

export const ticketAssignApis = {
  getAssignedUsers,
  getAssignableEmployees
};