const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Units Controller Tests', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    describe('GET /api/units/get-user-projects', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app).get('/api/units/get-user-projects');
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/units/get-user-projects')
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
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 404 if user not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 500 if organization data fetch fails', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

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

            // Mock org user query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch organization data' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should return empty projects array if user has no organizations', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

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

            // Mock org user query with empty array
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should return 500 if projects fetch fails', async () => {
            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle hub fetch error', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                }
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));

            // Mock hubs query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hubs' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should handle hub users fetch error', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                },
                hub: {
                    hub_id: '456',
                    unit_number: '101'
                }
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));

            // Mock hubs query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));

            // Mock hub users query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub users' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.projects).toEqual([
                expect.objectContaining({
                    projectId: mockData.project.proj_id,
                    units: []
                })
            ]);
        });

        it('should handle owner user fetch error', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                },
                hub: {
                    hub_id: '456',
                    unit_number: '101'
                },
                hubUsers: [
                    { user_id: '789', hub_user_type: 'owner' }
                ]
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));

            // Mock hubs query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));

            // Mock hub users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockData.hubUsers,
                    error: null
                })
            }));

            // Mock owner user query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch owner data' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.projects[0].units[0].owner).toEqual({
                tokenId: '',
                firstName: '',
                lastName: '',
                email: ''
            });
        });

        it('should handle tickets fetch error', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                },
                hub: {
                    hub_id: '456',
                    unit_number: '101'
                },
                hubUsers: []
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));

            // Mock hubs query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));

            // Mock hub users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockData.hubUsers,
                    error: null
                })
            }));

            // Mock tickets query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                projects: [{
                    address: "123 Test St",
                    adminUsersCount: 2,
                    hubUsersCount: 5,
                    pendingTicketsCount: 3,
                    projectId: "123",
                    projectUsers: [],
                    units: [],
                }]
            });
        });

        it('should handle hub user data fetch error', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                },
                hub: {
                    hub_id: '456',
                    unit_number: '101'
                },
                hubUsers: [
                    { user_id: '789', hub_user_type: 'tenant' }
                ],
                tickets: [
                    { status: 'open' }
                ]
            };

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful auth and initial queries
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));

            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));

            // Mock hubs query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));

            // Mock hub users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockData.hubUsers,
                    error: null
                })
            }));

            // Mock hub user data fetch with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            // Mock tickets query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: mockData.tickets,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                projects: [{
                    address: "123 Test St",
                    adminUsersCount: 2,
                    hubUsersCount: 5,
                    pendingTicketsCount: 3,
                    projectId: "123",
                    projectUsers: [],
                    units: []
                }]
            });
        });

        it('should successfully return formatted projects with units', async () => {
            const mockData = {
                project: {
                    proj_id: '123',
                    address: '123 Test St',
                    admin_users_count: 2,
                    hub_users_count: 5,
                    pending_tickets_count: 3
                },
                hub: {
                    hub_id: '456',
                    unit_number: '101'
                },
                hubUsers: [
                    { 
                        user_id: '789',
                        hub_user_type: 'owner',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    },
                    {
                        user_id: '101',
                        hub_user_type: 'tenant',
                        first_name: 'Jane',
                        last_name: 'Smith',
                        email: 'jane@example.com'
                    }
                ],
                tickets: [
                    { status: 'open' },
                    { status: 'pending' },
                    { status: 'closed' }
                ]
            };
         
            const fromSpy = jest.spyOn(supabase, 'from');
         
            // Mock successful auth
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
         
            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
         
            // Mock org user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '456' }],
                    error: null
                })
            }));
         
            // Mock projects query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.project],
                    error: null
                })
            }));
         
            // Mock hubs query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [mockData.hub],
                    error: null
                })
            }));
         
            // Mock hub users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockData.hubUsers.map(user => ({
                        user_id: user.user_id,
                        hub_user_type: user.hub_user_type
                    })),
                    error: null
                })
            }));
         
            // Mock owner user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [mockData.hubUsers[0]],
                    error: null
                })
            }));
         
            // Mock tickets query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: mockData.tickets,
                    error: null
                })
            }));
         
            // Mock tenant user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [mockData.hubUsers[1]],
                    error: null
                })
            }));
         
            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toEqual({"error": "Internal server error."});
         });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/units/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });
});