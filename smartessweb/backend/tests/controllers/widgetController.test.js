const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Widget Controller Tests', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@gmail.com',
                password: 'admin123'   
            });
        
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });
    
    describe('GET /api/widgets/dashboard', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/widgets/dashboard');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
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
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should handle organization fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

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
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch organization data' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should handle no organizations found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

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
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No organizations found for user.');
        });

        it('should handle project fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

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
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle hub fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '1', address: '123 Test St' }],
                    error: null
                })
            }))
            // Mock hub query error
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hubs' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hubs.');
        });

        it('should handle admin users fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful queries up to admin users
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '1', address: '123 Test St' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch admin users' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch admin users.');
        });

        it('should handle tickets fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '1', address: '123 Test St' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ user_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets.');
        });

        it('should handle alerts fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '1', address: '123 Test St' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ user_id: '1' }],
                    error: null
                })
            }))
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ ticket_id: '1' }],
                    error: null
                })
            }))
            // Mock alerts query error
            .mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch alerts' }
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch alerts.');
        });

        it('should successfully return dashboard data', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

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
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '1', address: '123 Test St' }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' },
                        { hub_id: '2', unit_number: '102', proj_id: '1', status: 'down' }
                    ],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ user_id: '1' }, { user_id: '2' }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ ticket_id: '1', status: 'pending' }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [{
                        description: 'Test Alert',
                        hub_id: '1',
                        created_at: '2024-01-01'
                    }],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                companyId: expect.any(String),
                systemOverview: {
                    projects: expect.any(Number),
                    totalUnits: expect.any(Number),
                    pendingTickets: expect.any(Number),
                    totalAdminUsers: expect.any(Number)
                },
                alerts: expect.arrayContaining([
                    expect.objectContaining({
                        alertType: expect.any(String),
                        unitAddress: expect.any(String),
                        unitNumber: expect.any(String)
                    })
                ]),
                systemHealth: {
                    systemsLive: expect.any(Number),
                    systemsDown: expect.any(Number)
                }
            });
        });

        it('should handle database error ', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });
});