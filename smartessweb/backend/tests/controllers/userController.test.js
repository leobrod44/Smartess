const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('User Controller Tests', () => {
    let authToken;
    
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

    describe('GET /api/users/get_user', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/users/get_user');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/users/get_user')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle database query error', async () => {
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
                .get('/api/users/get_user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Database query failed');
        });

        it('should handle user not found', async () => {
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
                .get('/api/users/get_user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should successfully return user data', async () => {
            const mockUserData = {
                user_id: '123',
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
                type: 'admin'
            };

            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: mockUserData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/users/get_user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUserData);
        });

        it('should handle internal server error and log it', async () => {
            const testError = new Error('Unexpected error');
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(testError);

            const response = await request(app)
                .get('/api/users/get_user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalledWith('Error:', testError);
        });
    });
});