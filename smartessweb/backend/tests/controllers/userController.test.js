const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('User Controller Tests', () => {
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
    
    describe('GET /api/users/get_user_name', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/users/get_user_name');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/users/get_user_name')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user not found in database', async () => {
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
                .get('/api/users/get_user_name')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should handle database error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database query failed' }
                })
            }));

            const response = await request(app)
                .get('/api/users/get_user_name')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Database query failed');
        });

        it('should successfully return user name', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: {
                        first_name: 'John',
                        last_name: 'Doe'
                    },
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/users/get_user_name')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                first_name: 'John',
                last_name: 'Doe'
            });
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });

            const response = await request(app)
                .get('/api/users/get_user_name')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });
    });
});