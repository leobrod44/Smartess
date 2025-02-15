interface APITicket {
    ticket_id: string;
    proj_id: string;
    unit_id: string;
    name: string;
    description: string;
    type: string;
    unit: string;
    status: string;
    created_at: string;
    submitted_by_firstName: string;
    submitted_by_lastName: string;
    submitted_by_email: string;
    project_address: string;
   }
   
   const getIndividualTicket = async (token: string, ticketId: string): Promise<{ticket: APITicket}> => {
    const response = await fetch(`http://localhost:3000/api/tickets/ticket/${ticketId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
   
    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }
   
    return response.json();
   };
   
   const deleteTicket = async (token: string, ticketId: string): Promise<void> => {
    const response = await fetch(`http://localhost:3000/api/tickets/delete-ticket/${ticketId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
   
    if (!response.ok) {
      throw new Error('Failed to delete ticket');
    }
   };

   const closeTicket = async (token: string, ticketId: string): Promise<void> => {
    const response = await fetch(`http://localhost:3000/api/tickets/close-ticket/${ticketId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to close ticket');
    }
  };
  
  
  export const ticketsApi = {
    getIndividualTicket,
    deleteTicket,
    closeTicket,
  };