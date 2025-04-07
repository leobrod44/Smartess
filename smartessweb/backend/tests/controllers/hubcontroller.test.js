const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Hub Controller Tests', () => {
    let authToken;
    
    // login before tests
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dwight@gmail.com',
                password: 'dwight123'   
            });
        
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });
    
    describe('GET /api/hubs/:proj_id/units/:unit_number', () => {
        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/hubs/1/units/101');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });
        
        it('should return error if hub not found', async () => {
            const response = await request(app)
                .get('/api/hubs/999999/units/999999')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });

        it('should successfully retrieve hub details', async () => {
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('owner');
            expect(response.body).toHaveProperty('users');
            expect(response.body).toHaveProperty('tickets');
            expect(response.body).toHaveProperty('alerts');
        });

        it('should handle invalid project ID format', async () => {
            const response = await request(app)
                .get('/api/hubs/invalid/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });

        it('should handle malformed authorization token', async () => {
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', 'Bearer malformed_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });
    
    describe('Hub Controller with mocked Supabase', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        it('should handle database errors ', async () => {
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });
            
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle hub query error', async () => {
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });

        it('should handle successful request with empty data', async () => {
            jest.spyOn(supabase, 'from').mockImplementation((table) => {
                if (table === 'hub') {
                    return {
                        select: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        single: jest.fn().mockResolvedValue({
                            data: { hub_id: '1' },
                            error: null
                        })
                    };
                }
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    filter: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                };
            });

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                owner: null,
                users: [],
                tickets: expect.any(Object),
                alerts: expect.any(Array)
            });
        });

        it('should return 404 when hub is not found', async () => {
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
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Hub not found.');
        });

        it('should handle hub users fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));


            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub users' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub users.');
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
                    data: { hub_id: '1' },
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

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
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
                    data: { hub_id: '1' },
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

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch alerts' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });
});