const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Tickets Controller Tests', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    describe('GET /api/tickets/get-tickets', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app).get('/api/tickets/get-tickets');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle projects fetch error', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                not: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle tickets fetch error', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            mockUserAndProjectQueries(fromSpy);

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle hub data fetch error', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            mockUserAndProjectQueries(fromSpy);
            mockTicketsQuery(fromSpy);

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub data' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should successfully return formatted tickets', async () => {
            const mockData = {
                ticket: {
                    ticket_id: '123',
                    proj_id: '456',
                    hub_id: '789',
                    description: 'Test Ticket',
                    description_detailed: 'Detailed description',
                    type: 'maintenance',
                    status: 'open',
                    created_at: '2024-01-26T12:00:00Z'
                },
                hub: {
                    hub_id: '789',
                    unit_number: '101'
                }
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            mockUserAndProjectQueries(fromSpy);

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [mockData.ticket],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.tickets).toEqual([{
                ticket_id: mockData.ticket.ticket_id,
                proj_id: mockData.ticket.proj_id,
                unit_id: mockData.ticket.hub_id,
                name: mockData.ticket.description,
                description: mockData.ticket.description_detailed,
                type: mockData.ticket.type,
                unit: mockData.hub.unit_number,
                status: mockData.ticket.status,
                created_at: '2024-01-26'
            }]);
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/tickets/get-tickets')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/tickets/delete-ticket/:ticket_id', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 400 if no ticket_id is provided', async () => {
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404); // Assuming Express returns 404 for undefined route
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 500 if ticket fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch ticket data' }
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch ticket data');
        });

        it('should return 404 if ticket does not exist', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });

        it('should return 500 if project access verification fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to verify project access' }
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to verify project access');
        });

        it('should return 403 if user does not have project access', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });

        it('should return 403 if user does not have admin or master role', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with non-admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'member' },
                    error: null
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have permission to delete tickets');
        });

        it('should return 500 if ticket deletion fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket deletion with error
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to delete ticket' }
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to delete ticket');
        });

        it('should successfully delete ticket for admin user', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket deletion
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ticket successfully deleted');
        });

        it('should successfully delete ticket for master user', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with master role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'master' },
                    error: null
                })
            }));

            // Mock ticket deletion
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            const response = await request(app)
                .delete('/api/tickets/delete-ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Ticket successfully deleted');
        });
    });

    describe('GET /api/tickets/ticket/:ticket_id', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 400 if no ticket_id is provided', async () => {
            const response = await request(app)
                .get('/api/tickets/ticket/')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404); // Assuming Express returns 404 for undefined route
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/tickets/ticket/123');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 404 if ticket does not exist', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });

        it('should return 403 if user does not have project access', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        ticket_id: '123', 
                        proj_id: '456', 
                        hub_id: '789',
                        description: 'Test Ticket',
                        description_detailed: 'Detailed description',
                        type: 'maintenance',
                        status: 'open',
                        created_at: '2024-01-26T12:00:00Z',
                        submitted_by_user_id: '789'
                    },
                    error: null
                })
            }));

            // Mock project access query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });

        it('should return 500 if hub information fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        ticket_id: '123', 
                        proj_id: '456', 
                        hub_id: '789',
                        description: 'Test Ticket',
                        description_detailed: 'Detailed description',
                        type: 'maintenance',
                        status: 'open',
                        created_at: '2024-01-26T12:00:00Z',
                        submitted_by_user_id: '789'
                    },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock hub fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch unit information' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch unit information');
        });

        it('should successfully fetch individual ticket', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        ticket_id: '123', 
                        proj_id: '456', 
                        hub_id: '789',
                        description: 'Test Ticket',
                        description_detailed: 'Detailed description',
                        type: 'maintenance',
                        status: 'open',
                        created_at: '2024-01-26T12:00:00Z',
                        submitted_by_user_id: '789'
                    },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock hub fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { unit_number: '101' },
                    error: null
                })
            }));

            // Mock submitter info fetch
            fromSpy.mockImplementationOnce(() => ({
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
            }));

            // Mock project info fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { address: '123 Test St' },
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.ticket).toEqual({
                ticket_id: '123',
                proj_id: '456',
                unit_id: '789',
                name: 'Test Ticket',
                description: 'Detailed description',
                type: 'maintenance',
                unit: '101',
                status: 'open',
                created_at: '2024-01-26',
                submitted_by_firstName: 'John',
                submitted_by_lastName: 'Doe',
                submitted_by_email: 'john.doe@example.com',
                project_address: '123 Test St'
            });
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/tickets/ticket/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });

    describe('GET /api/tickets/assignable-employees/:ticket_id', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/tickets/assignable-employees/123');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 404 if ticket does not exist', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });

        it('should return 403 if user does not have project access', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });

        it('should return 403 if user does not have admin/master role', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with non-admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'basic' },
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have permission to assign tickets');
        });

        it('should return 500 if ticket assignments fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket assignments with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch ticket assignments' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch ticket assignments');
        });

        it('should return 500 if org users fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock org users fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch employees' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch employees');
        });

        it('should return 500 if employee details fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock org users fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '789', org_user_type: 'basic' },
                        { user_id: '101', org_user_type: 'admin' }
                    ],
                    error: null
                })
            }));

            // Mock employee details fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch employee details' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch employee details');
        });

        it('should successfully return assignable employees', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456' },
                    error: null
                })
            }));

            // Mock project access query with admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock ticket assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ assigned_to_user_id: '222' }],
                    error: null
                })
            }));

            // Mock org users fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '789', org_user_type: 'basic' },
                        { user_id: '101', org_user_type: 'admin' }
                    ],
                    error: null
                })
            }));

            // Mock employee details fetch
            fromSpy.mockImplementationOnce(() => ({
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
            }));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.employees).toEqual([
                {
                    employeeId: '789',
                    firstName: 'Jane',
                    lastName: 'Doe',
                    email: 'jane.doe@example.com',
                    role: 'basic'
                },
                {
                    employeeId: '101',
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john.smith@example.com',
                    role: 'admin'
                }
            ]);
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/tickets/assignable-employees/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });

    describe('GET /api/tickets/assigned-users/:ticket_id', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/tickets/assigned-users/123');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return empty array if no assignments found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock ticket assignments with empty array
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ assignedUsers: [] });
        });

        it('should return 500 if ticket assignments fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock ticket assignments with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch assignments' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch assignments');
        });

        it('should return 500 if user details fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock ticket assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { assigned_to_user_id: '456', resolved_status: false },
                        { assigned_to_user_id: '789', resolved_status: true }
                    ],
                    error: null
                })
            }));

            // Mock user details fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user details' }
                })
            }));

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user details');
        });

        it('should successfully return assigned users', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock ticket assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { assigned_to_user_id: '456', resolved_status: false },
                        { assigned_to_user_id: '789', resolved_status: true }
                    ],
                    error: null
                })
            }));

            // Mock user details fetch
            fromSpy.mockImplementationOnce(() => ({
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
            }));

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.assignedUsers).toEqual([
                {
                    userId: '456',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    resolved: false
                },
                {
                    userId: '789',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    email: 'jane.smith@example.com',
                    resolved: true
                }
            ]);
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/tickets/assigned-users/123')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });

    describe('POST /api/tickets/assign-users', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 400 if ticket_id is missing', async () => {
            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_ids: ['456'] });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 400 if user_ids is missing', async () => {
            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 400 if user_ids is not an array', async () => {
            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: 'not an array' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .post('/api/tickets/assign-users')
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', 'Bearer invalid_token')
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 404 if ticket does not exist', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });

        it('should return 400 if ticket is closed', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with closed status
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'closed' },
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Cannot assign users to a closed ticket');
        });

        it('should return 403 if user does not have project access', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });

        it('should return 403 if user does not have admin/master role', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query with non-admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'basic' },
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have permission to assign tickets');
        });

        it('should return 500 if current assignments check fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock current assignments fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to check current assignments' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to check current assignments');
        });

        it('should return 400 if assignment would exceed max users', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock current assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { assigned_to_user_id: '789' },
                        { assigned_to_user_id: '101' }
                    ],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456', '222'] });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Maximum 3 users can be assigned to a ticket');
        });

        it('should successfully assign users to ticket', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock current assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock insert assignments
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            // Mock ticket status update
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Users successfully assigned to ticket');
        });

        it('should return 500 if assignment insert fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock current assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock insert assignments with error
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to assign users' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to assign users');
        });

        it('should return 500 if ticket status update fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock current assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock insert assignments
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            // Mock ticket status update with error
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to update ticket status' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update ticket status');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .post('/api/tickets/assign-users')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_ids: ['456'] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });

    describe('POST /api/tickets/unassign-user', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 400 if ticket_id is missing', async () => {
            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_id: '456' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 400 if user_id is missing', async () => {
            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Invalid request data');
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', 'Bearer invalid_token')
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data');
        });

        it('should return 404 if ticket does not exist', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ticket not found');
        });

        it('should return 400 if ticket is closed', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch with closed status
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'closed' },
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Cannot unassign users from a closed ticket');
        });

        it('should return 403 if user does not have project access', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have access to this ticket');
        });

        it('should return 403 if user does not have admin/master role', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query with non-admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'basic' },
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('error', 'User does not have permission to unassign users');
        });

        it('should return 500 if unassignment fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock unassignment with error
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to unassign user' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to unassign user');
        });

        it('should successfully unassign user and keep ticket status', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock unassignment
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            // Mock remaining assignments
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ assigned_to_user_id: '789' }],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User successfully unassigned from ticket');
        });

        it('should unassign user and update ticket to open if no assignments remain', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock unassignment
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            // Mock remaining assignments (empty)
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock ticket status update
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User successfully unassigned from ticket');
        });

        it('should return 500 if ticket status update fails after last unassignment', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock ticket fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '456', status: 'open' },
                    error: null
                })
            }));

            // Mock project access query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123', proj_id: '456', org_user_type: 'admin' },
                    error: null
                })
            }));

            // Mock unassignment
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: null
                })
            }));

            // Mock remaining assignments (empty)
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            // Mock ticket status update with error
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    error: { message: 'Failed to update ticket status' }
                })
            }));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update ticket status');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .post('/api/tickets/unassign-user')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ ticket_id: '123', user_id: '456' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });
});

function mockUserAndProjectQueries(fromSpy) {
    fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
        })
    }));

    fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        not: jest.fn().mockResolvedValue({
            data: [{ proj_id: '456' }],
            error: null
        })
    }));

    return fromSpy;
}

function mockTicketsQuery(fromSpy) {
    fromSpy.mockImplementationOnce(() => ({
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
    }));
    return fromSpy;
}

