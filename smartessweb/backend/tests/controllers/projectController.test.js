const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Project Controller Tests', () => {
    let authToken;
    
    // login before tests
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
    

    describe('GET /api/projects/get_user_projects', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/projects/get_user_projects');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
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
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return empty projects array when user has no organizations', async () => {
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
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should handle database errors', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle user not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
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
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should handle organization fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch organization data' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should handle project fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            // Mock projects query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle project hub fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: '1', 
                        address: '123 Test St',
                        admin_users_count: 1,
                        hub_users_count: 1,
                        pending_tickets_count: 0
                    }],
                    error: null
                })
            }));

            // Mock hub query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hubs' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should fetch and transform hub user data correctly', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: '1', 
                        address: '123 Test St',
                        admin_users_count: 1,
                        hub_users_count: 1,
                        pending_tickets_count: 0
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '1', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '456', hub_user_type: 'owner' },
                        { user_id: '789', hub_user_type: 'admin' },
                        { user_id: '012', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock user data fetch error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
        
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });
});