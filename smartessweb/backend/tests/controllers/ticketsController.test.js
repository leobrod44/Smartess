const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Tickets Controller Tests', () => {
    let authToken;
    
    // Test utilities for mocking responses
    const mockUtils = {
        // Mock authentication with valid user
        mockValidAuth: () => {
            return jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        },
        
        // Mock authentication with invalid token
        mockInvalidAuth: () => {
            return jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
                data: { user: null },
                error: { message: 'Invalid token' }
            });
        },
        
        // Mock user query
        mockUserQuery: (userId = '123', error = null) => {
            return jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: error ? null : { user_id: userId },
                    error: error
                })
            }));
        },
        
        // Mock ticket query
        mockTicketQuery: (data = null, error = null) => {
            const defaultTicket = {
                ticket_id: '123',
                proj_id: '456',
                hub_id: '789',
                description: 'Test Ticket',
                description_detailed: 'Detailed description',
                type: 'maintenance',
                status: 'open',
                created_at: '2024-01-26T12:00:00Z',
                submitted_by_user_id: '789'
            };
            
            return jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: error ? null : (data || defaultTicket),
                    error: error
                })
            }));
        },
        
        // Mock project access query
        mockProjectAccessQuery: (userType = 'admin', error = null) => {
            return jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: error ? null : { user_id: '123', proj_id: '456', org_user_type: userType },
                    error: error
                })
            }));
        },
        
        // Generic mock for Supabase
        mockSupabaseQuery: (returnValue) => {
            // Create a spy that returns the provided mock implementation
            return jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                // If the returnValue has a mockResolvedValue property, ensure it works properly
                if (returnValue.mockResolvedValue) {
                    const originalMockResolvedValue = returnValue.mockResolvedValue;
                    returnValue.mockResolvedValue = jest.fn().mockImplementation(() => {
                        return originalMockResolvedValue();
                    });
                }
                return returnValue;
            });
        },
        
        // Test common error responses
        testAuthErrors: async (endpoint, method = 'get', payload = {}) => {
            // Test no token provided
            const noTokenResponse = await request(app)[method](endpoint);
            expect(noTokenResponse.status).toBe(401);
            expect(noTokenResponse.body).toHaveProperty('error', 'No token provided');
            
            // Test invalid token
            mockUtils.mockInvalidAuth();
            const invalidTokenResponse = await request(app)[method](endpoint)
                .set('Authorization', 'Bearer invalid_token')
                .send(method === 'get' ? undefined : payload);
            
            expect(invalidTokenResponse.status).toBe(401);
            expect(invalidTokenResponse.body).toHaveProperty('error', 'Invalid token');
        }
    };
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'dwight@gmail.com', password: 'dwight123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
        
        // Ensure all Supabase mock methods that might be chained return themselves
        // This helps with mocking the method chaining pattern used in the controller
        const mockMethods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'not', 'single'];
        const fromSpy = jest.spyOn(supabase, 'from');
        
        fromSpy.mockImplementation(() => {
            const mock = {};
            
            mockMethods.forEach(method => {
                mock[method] = jest.fn().mockReturnValue(mock);
            });
            
            return mock;
        });
    });



    describe('GET /api/tickets/get-tickets', () => {
        it('should handle authentication errors', async () => {
            await mockUtils.testAuthErrors('/api/tickets/get-tickets');
        });

        it('should handle user fetch error', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery(null, { message: 'Failed to fetch user data' });

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle projects fetch error', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            });

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle tickets fetch error', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            // Mock projects query
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '456' }],
                    error: null
                })
            });
            
            // Mock tickets query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            });

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should successfully return formatted tickets', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            // Mock projects query
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '456' }],
                    error: null
                })
            });
            
            // Mock tickets query
            const mockTicket = {
                ticket_id: '123',
                proj_id: '456',
                hub_id: '789',
                description: 'Test Ticket',
                description_detailed: 'Detailed description',
                type: 'maintenance',
                status: 'open',
                created_at: '2024-01-26T12:00:00Z'
            };
            
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [mockTicket],
                    error: null
                })
            });
            
            // Mock hub query
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '789', unit_number: '101' }],
                    error: null
                })
            });

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tickets).toEqual([{
                ticket_id: mockTicket.ticket_id,
                proj_id: mockTicket.proj_id,
                unit_id: mockTicket.hub_id,
                name: mockTicket.description,
                description: mockTicket.description_detailed,
                type: mockTicket.type,
                unit: '101',
                status: mockTicket.status,
                created_at: '2024-01-26'
            }]);
        });

        it('should return 404 if user is not found', async () => {
            mockUtils.mockValidAuth();
            
            // Mock user query with no error but null data
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            });
            
            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should handle hub fetch error', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            // Mock projects query success
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '456' }],
                    error: null
                })
            });
            
            // Mock tickets query success
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ 
                        ticket_id: '123', 
                        proj_id: '456',
                        hub_id: '789',
                        description: 'Test Ticket',
                        description_detailed: 'Detailed description',
                        type: 'maintenance',
                        status: 'open',
                        created_at: '2024-01-26T12:00:00Z'
                    }],
                    error: null
                })
            });
            
            // Mock hub query error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub data' }
                })
            });
            
            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle unexpected errors gracefully', async () => {
            mockUtils.mockValidAuth();
            
            // Force an exception by making supabase.from throw an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
            
            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/tickets/delete-ticket/:ticket_id', () => {
        const endpoint = '/api/tickets/delete-ticket/123';
        
        it('should handle authentication errors', async () => {
            await mockUtils.testAuthErrors(endpoint, 'delete');
        });
        
        it('should return 404 if ticket does not exist', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            // In the controller, if data is null but error is also null, it returns 404
            // This matches the controller's behavior for tickets not found
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            });
            
            const response = await request(app)
                .delete(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });
        
        it('should return 403 if user does not have access', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            
            // Mock projectAccess query to return null (no access) without error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            });
            
            const response = await request(app)
                .delete(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            // Update expected message to match what the controller actually returns
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });
        
        it('should return 403 if user does not have admin/master role', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery('basic'); // Basic user, not admin/master
            
            const response = await request(app)
                .delete(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have permission to delete tickets');
        });
        
        it('should return 500 if ticket deletion fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery();
            
            // Mock deletion with error
            mockUtils.mockSupabaseQuery({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to delete ticket' }
                })
            });
            
            const response = await request(app)
                .delete(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to delete ticket');
        });
        
        it('should successfully delete ticket for admin user', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery();
            
            // Mock successful deletion
            mockUtils.mockSupabaseQuery({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            });
            
            const response = await request(app)
                .delete(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ticket successfully deleted');
        });

        it('should return 400 if ticket ID is missing in controller', async () => {
            // Mock req and res objects
            const req = {
                token: 'mock-token',
                params: { ticket_id: undefined } // Explicitly undefined ticket_id
            };
            
            // Create a mock response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            
            // Call the controller function directly
            await require('../../controllers/ticketsController').deleteTicket(req, res);
            
            // Verify the expected behavior
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Ticket ID is required" });
        });

        it('should return 500 if user data fetch fails', async () => {
            mockUtils.mockValidAuth();
            
            // Mock user query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 500 if ticket data fetch fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            
            // Mock ticket query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch ticket' }
                })
            });
            
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch ticket data');
        });

        it('should return 500 if project access verification fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            
            // Mock project access query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to verify access' }
                })
            });
            
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to verify project access');
        });

        it('should handle unexpected errors gracefully', async () => {
            mockUtils.mockValidAuth();
            
            // Force an exception by making supabase.from throw an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
            
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });


    });

    describe('GET /api/tickets/get-assigned-tickets-for-user', () => {
        const endpoint = '/api/tickets/get-assigned-tickets-for-user';
        
        it('should handle authentication errors', async () => {
            await mockUtils.testAuthErrors(endpoint);
        });
        
        it('should return 500 if user data fetch fails', async () => {
            mockUtils.mockValidAuth();
            
            // Mock user query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });
        
        it('should return 500 if ticket assignments fetch fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery('123');
            
            // Mock assignments query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch ticket assignments.');
        });
        
        it('should return empty array if no assignments found', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery('123');
            
            // Mock empty assignments
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ tickets: [] });
        });
        
        it('should return 500 if tickets data fetch fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery('123');
            
            // Mock assignments with data
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { 
                            ticket_id: '123', 
                            resolved_status: 'resolved', 
                            assigned_by_user_id: '456',
                            assigned_to_user_id: '123'
                        }
                    ],
                    error: null
                })
            });
            
            // Mock tickets query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets data.');
        });
        
        it('should return 500 if hub data fetch fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery('123');
            
            // Mock assignments with data
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { 
                            ticket_id: '123', 
                            resolved_status: 'resolved', 
                            assigned_by_user_id: '456',
                            assigned_to_user_id: '123'
                        }
                    ],
                    error: null
                })
            });
            
            // Mock tickets query with success
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        {
                            ticket_id: '123',
                            proj_id: '456',
                            hub_id: '789',
                            description: 'Test Ticket',
                            description_detailed: 'Detailed description',
                            type: 'maintenance',
                            status: 'open',
                            created_at: '2024-01-26T12:00:00Z'
                        }
                    ],
                    error: null
                })
            });
            
            // Mock hub query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub data.');
        });
        
        it('should successfully return formatted assigned tickets', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery('123');
            
            // Mock assignments with data
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { 
                            ticket_id: '123', 
                            resolved_status: 'resolved', 
                            assigned_by_user_id: '456',
                            assigned_to_user_id: '123'
                        },
                        { 
                            ticket_id: '124', 
                            resolved_status: 'unresolved', 
                            assigned_by_user_id: '456',
                            assigned_to_user_id: '123'
                        }
                    ],
                    error: null
                })
            });
            
            // Mock tickets query with success
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        {
                            ticket_id: '123',
                            proj_id: '456',
                            hub_id: '789',
                            description: 'Test Ticket 1',
                            description_detailed: 'Detailed description 1',
                            type: 'maintenance',
                            status: 'open',
                            created_at: '2024-01-26T12:00:00Z'
                        },
                        {
                            ticket_id: '124',
                            proj_id: '456',
                            hub_id: '790',
                            description: 'Test Ticket 2',
                            description_detailed: 'Detailed description 2',
                            type: 'support',
                            status: 'pending',
                            created_at: '2024-01-27T12:00:00Z'
                        }
                    ],
                    error: null
                })
            });
            
            // Mock hub query with success
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { hub_id: '789', unit_number: '101' },
                        { hub_id: '790', unit_number: '102' }
                    ],
                    error: null
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tickets).toHaveLength(2);
            
            // Check first ticket
            expect(response.body.tickets[0]).toHaveProperty('ticketId', '123');
            expect(response.body.tickets[0]).toHaveProperty('name', 'Test Ticket 1');
            expect(response.body.tickets[0]).toHaveProperty('unit', '101');
            expect(response.body.tickets[0]).toHaveProperty('isResolved', true);
            
            // Check second ticket
            expect(response.body.tickets[1]).toHaveProperty('ticketId', '124');
            expect(response.body.tickets[1]).toHaveProperty('name', 'Test Ticket 2');
            expect(response.body.tickets[1]).toHaveProperty('unit', '102');
            expect(response.body.tickets[1]).toHaveProperty('isResolved', false);
        });
        
        it('should handle unexpected errors gracefully', async () => {
            mockUtils.mockValidAuth();
            
            // Force an exception by making supabase.from throw an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
            expect(console.error).toHaveBeenCalledWith(
                'Error in getAssignedTicketsForUser:',
                expect.any(Error)
            );
        });
    });

    describe('GET /api/tickets/ticket/:ticket_id', () => {
        const endpoint = '/api/tickets/ticket/123';
        
        it('should handle authentication errors', async () => {
            await mockUtils.testAuthErrors(endpoint);
        });
        
        it('should return 404 if ticket does not exist', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery(null, { message: 'Ticket not found' });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });
        
        it('should return 403 if user does not have project access', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery(null, { message: 'No access' });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });
        
        it('should successfully fetch individual ticket', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery();
            
            // Mock hub info
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { unit_number: '101' },
                    error: null
                })
            });
            
            // Mock submitter info
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        first_name: 'John', 
                        last_name: 'Doe', 
                        email: 'john.doe@example.com' 
                    },
                    error: null
                })
            });
            
            // Mock project info
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { address: '123 Test St' },
                    error: null
                })
            });
            
            const response = await request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.ticket).toHaveProperty('ticket_id', '123');
            expect(response.body.ticket).toHaveProperty('unit', '101');
            expect(response.body.ticket).toHaveProperty('submitted_by_firstName', 'John');
            expect(response.body.ticket).toHaveProperty('project_address', '123 Test St');
        });

        it('should return 400 if ticket ID is missing in controller', async () => {
            // Mock req and res objects
            const req = {
                token: 'mock-token',
                params: { ticket_id: undefined } // Explicitly undefined ticket_id
            };
            
            // Create a mock response object
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            
            // Call the controller function directly
            await require('../../controllers/ticketsController').fetchIndividualTicket(req, res);
            
            // Verify the expected behavior
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Ticket ID is required" });
        });

        it('should return 500 if user data fetch fails', async () => {
            mockUtils.mockValidAuth();
            
            // Mock user query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            });
            
            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 500 if hub data fetch fails', async () => {
            mockUtils.mockValidAuth();
            mockUtils.mockUserQuery();
            mockUtils.mockTicketQuery();
            mockUtils.mockProjectAccessQuery();
            
            // Mock hub query with error
            mockUtils.mockSupabaseQuery({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub data' }
                })
            });
            
            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch unit information');
        });

        it('should handle unexpected errors gracefully', async () => {
            mockUtils.mockValidAuth();
            
            // Force an exception by making supabase.from throw an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
            
            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Ticket Assignment Endpoints', () => {
        describe('GET /api/tickets/assignable-employees/:ticket_id', () => {
            const endpoint = '/api/tickets/assignable-employees/123';
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint);
            });
            
            it('should return 403 if user does not have admin/master role', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery('basic');
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have permission to assign tickets');
            });
            
            it('should successfully return assignable employees', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock ticket assignments
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ assigned_to_user_id: '222' }],
                        error: null
                    })
                });
                
                // Mock org users
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: [
                            { user_id: '789', org_user_type: 'basic' },
                            { user_id: '101', org_user_type: 'admin' }
                        ],
                        error: null
                    })
                });
                
                // Mock employee details
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: [
                            { 
                                user_id: '789', 
                                first_name: 'Jane', 
                                last_name: 'Doe', 
                                email: 'jane.doe@example.com' 
                            },
                            { 
                                user_id: '101', 
                                first_name: 'John', 
                                last_name: 'Smith', 
                                email: 'john.smith@example.com' 
                            }
                        ],
                        error: null
                    })
                });
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body.employees).toHaveLength(2);
                expect(response.body.employees[0]).toHaveProperty('firstName', 'Jane');
                expect(response.body.employees[1]).toHaveProperty('role', 'admin');
            });

            it('should return 500 if user data fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
            });

            it('should return 404 if ticket data fetch fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket query with error or null data
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch ticket data' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error', 'Ticket not found');
            });

            it('should return 500 if assignment fetch fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock assignment query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch assignments' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch ticket assignments');
            });

            it('should return 500 if org users fetch fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock assignment query success
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock org users query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch org users' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch employees');
            });

            it('should return 500 if employee details fetch fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock assignment query success
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock org users query success
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: [{ user_id: '123', org_user_type: 'admin' }],
                        error: null
                    })
                });
                
                // Mock employee details query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch employee details' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch employee details');
            });

            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception by making supabase.from throw an error
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error');
                expect(console.error).toHaveBeenCalled();
            });

            it('should return 403 if project access verification fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                
                // Mock project access query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to verify access' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assignable-employees/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
            });
        });
        
        describe('GET /api/tickets/assigned-users/:ticket_id', () => {
            const endpoint = '/api/tickets/assigned-users/123';
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint);
            });
            
            it('should return empty array if no assignments found', async () => {
                mockUtils.mockValidAuth();
                
                // Mock empty assignments
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ assignedUsers: [] });
            });
            
            it('should successfully return assigned users', async () => {
                mockUtils.mockValidAuth();
                
                // Mock assignments
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [
                            { assigned_to_user_id: '456', resolved_status: false },
                            { assigned_to_user_id: '789', resolved_status: true }
                        ],
                        error: null
                    })
                });
                
                // Mock user details
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: [
                            { 
                                user_id: '456', 
                                first_name: 'John', 
                                last_name: 'Doe', 
                                email: 'john.doe@example.com' 
                            },
                            { 
                                user_id: '789', 
                                first_name: 'Jane', 
                                last_name: 'Smith', 
                                email: 'jane.smith@example.com' 
                            }
                        ],
                        error: null
                    })
                });
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body.assignedUsers).toHaveLength(2);
                expect(response.body.assignedUsers[0]).toHaveProperty('firstName', 'John');
                expect(response.body.assignedUsers[0]).toHaveProperty('resolved', false);
                expect(response.body.assignedUsers[1]).toHaveProperty('firstName', 'Jane');
                expect(response.body.assignedUsers[1]).toHaveProperty('resolved', true);
            });

            it('should return 500 if assignments fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock assignments query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch assignments' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assigned-users/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch assignments');
            });

            it('should return 500 if user details fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock assignments query success
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ assigned_to_user_id: '123', resolved_status: false }],
                        error: null
                    })
                });
                
                // Mock user details query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to fetch user details' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/assigned-users/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user details');
            });

            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception by making supabase.from throw an error
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .get('/api/tickets/assigned-users/123')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error');
            });
        });
        
        describe('POST /api/tickets/assign-users', () => {
            const endpoint = '/api/tickets/assign-users';
            const validPayload = { 
                ticket_id: '123', 
                user_ids: ['456'],
                assigned_by_user_id: '123'
            };
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint, 'post', validPayload);
            });
            
            it('should return 400 if request data is invalid', async () => {
                // Test missing ticket_id
                const response1 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ user_ids: ['456'] });
                
                expect(response1.status).toBe(400);
                expect(response1.body).toHaveProperty('error', 'Invalid request data');
                
                // Test missing user_ids
                const response2 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ticket_id: '123' });
                
                expect(response2.status).toBe(400);
                expect(response2.body).toHaveProperty('error', 'Invalid request data');
                
                // Test user_ids not array
                const response3 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ticket_id: '123', user_ids: 'not-an-array' });
                
                expect(response3.status).toBe(400);
                expect(response3.body).toHaveProperty('error', 'Invalid request data');
            });
            
            it('should return 400 if ticket is closed', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock closed ticket
                mockUtils.mockTicketQuery({
                    proj_id: '456',
                    status: 'closed'
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Cannot assign users to a closed ticket');
            });
            
            it('should return 400 if maximum users would be exceeded', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments (already has 2)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [
                            { assigned_to_user_id: '111' },
                            { assigned_to_user_id: '222' }
                        ],
                        error: null
                    })
                });
                
                // Try to assign 2 more (would exceed max of 3)
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        ...validPayload,
                        user_ids: ['333', '444']
                    });
                
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Maximum 3 users can be assigned to a ticket');
            });
            
            it('should successfully assign users to ticket', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments (empty)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock successful assignment
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock successful notification
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock successful status update
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message', 'Users successfully assigned to ticket');
            });

            it('should return 500 if user data fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
            });

            it('should return 500 if user data fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
            });

            it('should return 403 if user does not have access to the project', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                
                // Mock project access query with null data (no access)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
            });

            it('should return 403 if user does not have permission to assign tickets', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                
                // Mock project access with basic role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { org_user_type: 'basic' },
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have permission to assign tickets');
            });

            it('should return 500 if checking current assignments fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments check with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Failed to check assignments' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to check current assignments');
            });

            it('should return 500 if assignment insert fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments check
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock assignment insert with error
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: { message: 'Failed to insert assignments' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to assign users');
            });

            it('should return 500 if notification insert fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments check
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock assignment insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert with error
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: { message: 'Failed to insert notifications' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to create notifications');
            });

            it('should return 500 if ticket status update fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock current assignments check
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock assignment insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock status update with error
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: { message: 'Failed to update status' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to update ticket status');
            });

            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception by making supabase.from throw an error
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error');
                expect(console.error).toHaveBeenCalled();
            });

            it('should return 403 if user does not have access to the project', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                
                // Mock project access query with null data but no error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
            });

            it('should return 404 if ticket fetch fails with error', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post('/api/tickets/assign-users')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error', 'Ticket not found');
            });
        });

        describe('POST /api/tickets/unassign-user', () => {
            const endpoint = '/api/tickets/unassign-user';
            const validPayload = {
                ticket_id: '123',
                user_id: '456',
                assigned_by_user_id: '789'
            };
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint, 'post', validPayload);
            });
            
            it('should return 400 if request data is invalid', async () => {
                mockUtils.mockValidAuth();
                
                // Missing ticket_id
                const response1 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ user_id: '456', assigned_by_user_id: '789' });
                
                expect(response1.status).toBe(400);
                expect(response1.body).toHaveProperty('error', 'Invalid request data');
                
                // Missing user_id
                const response2 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ticket_id: '123', assigned_by_user_id: '789' });
                
                expect(response2.status).toBe(400);
                expect(response2.body).toHaveProperty('error', 'Invalid request data');
                
                // Missing assigned_by_user_id
                const response3 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ticket_id: '123', user_id: '456' });
                
                expect(response3.status).toBe(400);
                expect(response3.body).toHaveProperty('error', 'Invalid request data');
            });
            
            it('should return 500 if user data fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
            });
            
            it('should return 404 if ticket does not exist', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Ticket not found' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error', 'Ticket not found');
            });
            
            it('should return 400 if ticket is closed', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock closed ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'closed',
                            description: 'Closed Ticket'
                        },
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Cannot unassign users from a closed ticket');
            });
            
            it('should return 403 if user does not have access to the project', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock no project access
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
            });
            
            it('should return 403 if user does not have admin/master role', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock project access with basic role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            org_user_type: 'basic'
                        },
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have permission to unassign users');
            });
            
            it('should return 500 if notification creation fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock project access with admin role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            org_user_type: 'admin'
                        },
                        error: null
                    })
                });
                
                // Mock delete success
                mockUtils.mockSupabaseQuery({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert with error
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: { message: 'Notification error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to create unassignment notification');
            });
            
            it('should update ticket status when no assignments remain', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock project access with admin role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            org_user_type: 'admin'
                        },
                        error: null
                    })
                });
                
                // Mock delete success
                mockUtils.mockSupabaseQuery({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock remaining assignments check (empty)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock update status success
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message', 'User successfully unassigned from ticket');
            });
            
            it('should return 500 if ticket status update fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock project access with admin role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            org_user_type: 'admin'
                        },
                        error: null
                    })
                });
                
                // Mock delete success
                mockUtils.mockSupabaseQuery({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock remaining assignments check (empty)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                });
                
                // Mock update with error
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: { message: 'Update error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to update ticket status');
            });
            
            it('should successfully unassign user without updating status when other assignments remain', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Mock ticket
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            proj_id: '456',
                            status: 'open',
                            description: 'Test Ticket'
                        },
                        error: null
                    })
                });
                
                // Mock project access with admin role
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            org_user_type: 'admin'
                        },
                        error: null
                    })
                });
                
                // Mock delete success
                mockUtils.mockSupabaseQuery({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock notification insert success
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock remaining assignments check (has some)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ assigned_to_user_id: '789' }],
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message', 'User successfully unassigned from ticket');
            });
            
            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error');
                expect(console.error).toHaveBeenCalled();
            });
            
        });
    });

    describe('Ticket Status Management', () => {
        describe('POST /api/tickets/close-ticket/:ticket_id', () => {
            const endpoint = '/api/tickets/close-ticket/123';
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint, 'post');
            });
            
            it('should return 403 if user does not have admin/master role', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery('basic');
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(403);
                expect(response.body).toHaveProperty('error', 'User does not have permission to close tickets');
            });
            
            it('should successfully close ticket', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                mockUtils.mockTicketQuery();
                mockUtils.mockProjectAccessQuery();
                
                // Mock successful update
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message', 'Ticket successfully closed');
            });
        });
        
        
    });

    describe('Notifications', () => {
        describe('GET /api/tickets/get-ticket-notifications', () => {
            const endpoint = '/api/tickets/get-ticket-notifications';

            const validPayload = {
                ticket_id: '123',
                status: 'resolved'
            };
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint);
            });
            
            it('should successfully retrieve notifications', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery();
                
                // Our controller returns the data directly, so we need to mock correctly
                const mockNotifications = [
                    {
                        notification_id: '123',
                        notification_type: 'assignment',
                        ticket_id: '456',
                        is_seen: false
                    }
                ];
                
                // Mock notifications with proper structure
                const fromMock = {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: mockNotifications,
                        error: null
                    })
                };
                
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => fromMock);
                
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(200);
                // The controller directly returns the notification array
                expect(Array.isArray(response.body)).toBe(true);
                expect(response.body[0]).toHaveProperty('notification_id', '123');
            });

            it('should return 500 if user query returns an error', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/get-ticket-notifications')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
                expect(console.error).toHaveBeenCalled();
            });
            
            it('should return 404 if user not found', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with no error but no data (user not found)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: null
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/get-ticket-notifications')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(404);
                expect(response.body).toHaveProperty('error', 'User not found.');
            });
            
            it('should return 500 if notifications query returns an error', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query success
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: '123' },
                        error: null
                    })
                });
                
                // Mock notifications query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .get('/api/tickets/get-ticket-notifications')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch notifications.');
                expect(console.error).toHaveBeenCalled();
            });

            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception by making supabase.from throw an error
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .get('/api/tickets/get-ticket-notifications')
                    .set('Authorization', `Bearer ${authToken}`);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error.');
                expect(console.error).toHaveBeenCalledWith(
                    'Error in getTicketNotifications:',
                    expect.any(Error)
                );
            });

            
        });

        describe('POST /api/tickets/update-ticket-notification', () => {
            const endpoint = '/api/tickets/update-ticket-notification';
            const validPayload = { ticket_id: 'notify123' }; // Example valid ticket ID for notification
            const testUserAuthData = { user: { email: 'test@example.com' } }; // Consistent user for mocks
            const testUserId = 'user-abc'; // Corresponding ID for the test user
    
            // Test Authentication Errors
            it('should handle authentication errors', async () => {
                // Uses the existing helper to test no token and invalid token scenarios
                await mockUtils.testAuthErrors(endpoint, 'post', validPayload);
            });
    
            // Test Invalid Input
            it('should return 400 if ticket_id is missing', async () => {
                // Mock valid authentication first
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: testUserAuthData, error: null });
    
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({}); // Send empty payload
    
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Invalid request data');
            });
    
            // Test User Fetch Failure (DB Error)
            it('should return 500 if user data fetch fails', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: testUserAuthData, error: null });
    
                // Mock user query failing with a database error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error fetching user' }
                    })
                });
    
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
    
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            });
    
            // Test User Not Found (Controller handles this as 500)
            it('should return 500 if user is not found', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: testUserAuthData, error: null });
    
                // Mock user query returning null data (user not in DB)
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null, // User data is null
                        error: null  // No database error, just not found
                    })
                });
    
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
    
                // Controller logic returns 500 in this case
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            });
    
             // Test Unexpected Error
            it('should handle unexpected errors gracefully', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({ data: testUserAuthData, error: null });
    
                // Force an unexpected error during the user fetch stage
                 jest.spyOn(supabase, 'from').mockImplementationOnce((tableName) => {
                     if (tableName === 'user') {
                        throw new Error('Unexpected controller crash');
                     }
                     // Basic fallback for other calls if needed, though should ideally not be reached
                     return {
                         select: jest.fn().mockReturnThis(),
                         eq: jest.fn().mockReturnThis(),
                         single: jest.fn().mockRejectedValue(new Error('Fallback error')) // Make it reject to be safe
                     };
                 });
    
    
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
    
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error.');
                expect(console.error).toHaveBeenCalledWith(
                    'Error in updateTicketNotification:',
                    expect.any(Error) // Check that the generic error handler logged the error
                );
            });
    
        });
        
        describe('POST /api/tickets/update-ticket-resolution', () => {
            const endpoint = '/api/tickets/update-ticket-resolution';
            const validPayload = {
                ticket_id: '123',
                status: 'resolved'
            };
            
            it('should handle authentication errors', async () => {
                await mockUtils.testAuthErrors(endpoint, 'post', validPayload);
            });
            
            it('should return 400 if request data is invalid', async () => {
                mockUtils.mockValidAuth();
                
                // Missing ticket_id
                const response1 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ status: 'resolved' });
                
                expect(response1.status).toBe(400);
                
                // Invalid status
                const response2 = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ ticket_id: '123', status: 'invalid-status' });
                
                expect(response2.status).toBe(400);
            });
            
            it('should return 500 if user data fetch fails', async () => {
                mockUtils.mockValidAuth();
                
                // Mock user query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            });
            
            it('should return 500 if assignment record fetch fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery('123');
                
                // Mock assignment query with error
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Database error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to fetch ticket assignment.');
            });
            
            it('should return 400 if ticket is already marked with the same status', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery('123');
                
                // Mock assignment record with same status
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            ticket_id: '123',
                            assigned_to_user_id: '123',
                            assigned_by_user_id: '456',
                            resolved_status: 'resolved'
                        },
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('error', 'Ticket is already marked as resolved.');
            });
            
            it('should return 500 if notification creation fails', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery('123');
                
                // Mock assignment record
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            ticket_id: '123',
                            assigned_to_user_id: '123',
                            assigned_by_user_id: '456',
                            resolved_status: 'unresolved'
                        },
                        error: null
                    })
                });
                
                // Mock update success
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock ticket data query
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { description: 'Test Ticket' },
                        error: null
                    })
                });
                
                // Mock notification insert with error
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: { message: 'Notification error' }
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to create notification.');
            });
            
            it('should handle unexpected errors gracefully', async () => {
                mockUtils.mockValidAuth();
                
                // Force an exception by making supabase.from throw an error
                jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error.');
                expect(console.error).toHaveBeenCalledWith(
                    'Error in updateTicketResolutionStatus:',
                    expect.any(Error)
                );
            });
            
            it('should successfully update resolution status', async () => {
                mockUtils.mockValidAuth();
                mockUtils.mockUserQuery('123');
                
                // Mock assignment record - exact data structure is important here
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: {
                            ticket_id: '123',
                            assigned_to_user_id: '123',
                            assigned_by_user_id: '456',
                            resolved_status: 'unresolved'
                        },
                        error: null
                    })
                });
                
                // Mock successful update
                mockUtils.mockSupabaseQuery({
                    update: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    mockResolvedValue: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                // Mock ticket data for notification
                mockUtils.mockSupabaseQuery({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { description: 'Test Ticket' },
                        error: null
                    })
                });
                
                // Mock notification creation
                mockUtils.mockSupabaseQuery({
                    insert: jest.fn().mockResolvedValue({
                        error: null
                    })
                });
                
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('message', 'Ticket marked as resolved.');
            });
        });
    });
});