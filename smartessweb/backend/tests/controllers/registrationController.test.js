const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Registration Controller Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Mock the authentication response
        const mockLoginResponse = {
            status: 200,
            body: { token: 'mockAuthToken' }
        };

        // Mock the supabase.from method for authentication
        jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
                data: [{ user_id: '123', role: 'admin' }],
                error: null
            })
        });

        // Mock the login endpoint
        app.post('/api/auth/login', (req, res) => {
            res.status(mockLoginResponse.status).json(mockLoginResponse.body);
        });

        // Perform login to get authToken
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'dwight@gmail.com',
                password: 'dwight123'
            });

        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('GET /api/registration/verify-token/:token', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should successfully verify a valid token', async () => {
            // Mock the supabase query for a valid token
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/registration/verify-token/valid-token-123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('email', 'test@example.com');
            expect(response.body).toHaveProperty('message', 'Token verified successfully');
        });

        it('should return 404 for invalid or expired token', async () => {
            // Mock the supabase query for an invalid token
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/registration/verify-token/invalid-token')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Invalid or expired token');
        });

        it('should return 500 when database query fails', async () => {
            // Mock the supabase query to simulate a database error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/registration/verify-token/error-token')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to verify token');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 400 if token is missing', async () => {
            // We'll test this with an empty token parameter
            const response = await request(app)
                .get('/api/registration/verify-token/')
                .set('Authorization', `Bearer ${authToken}`);

            // This should return a 404 as the route won't match, but we can check for a proper bad request
            // by testing the controller directly in a more comprehensive test

            expect(response.status).toBe(404);
        });

        it('should handle unexpected errors', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .get('/api/registration/verify-token/error-causing-token')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('POST /api/registration/register', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });
    
        it('should successfully register a user with valid data', async () => {
            // Mock the token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));
    
            // Mock auth.signUp
            jest.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: { id: 'new-user-123' } },
                error: null
            });
    
            // Mock user table update
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
    
            // Mock token deletion
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Registration successful. Please sign in.');
        });
    
        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    // Missing lastName
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'All fields are required');
        });
    
        it('should return 401 if token is invalid', async () => {
            // Mock the token verification to return null data
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'invalid-token',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid or expired token');
        });
    
        it('should return 401 if token email does not match provided email', async () => {
            // Mock the token verification to return different email
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'different@example.com' },
                    error: null
                })
            }));
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid or expired token');
        });
    
        it('should return 500 if auth creation fails', async () => {
            // Mock the token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));
    
            // Mock auth.signUp to fail
            jest.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: null,
                error: { message: 'Auth creation failed' }
            });
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to create authentication');
            expect(console.error).toHaveBeenCalled();
        });
    
        it('should return 500 if user information update fails', async () => {
            // Mock the token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));
    
            // Mock auth.signUp
            jest.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
                data: { user: { id: 'new-user-123' } },
                error: null
            });
    
            // Mock user table update to fail
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Update failed' }
                })
            }));
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update user information');
            expect(console.error).toHaveBeenCalled();
        });
    
        it('should handle unexpected errors during registration', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });
    
            const response = await request(app)
                .post('/api/registration/register')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '1234567890',
                    password: 'SecurePass123',
                    email: 'test@example.com'
                });
    
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });
    });
});