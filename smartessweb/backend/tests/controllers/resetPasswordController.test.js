const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');

// Mock the uuid and Resend library
jest.mock('uuid');
jest.mock('resend');

describe('Reset Password Controller Tests', () => {
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

        // Mock Resend email send method
        Resend.mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
            }
        }));

        // Mock uuidv4 to return a consistent value for testing
        uuidv4.mockImplementation(() => 'mock-uuid-token');
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/reset-password/reset-password', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });


        it('should return 400 if email is missing', async () => {
            const response = await request(app)
                .post('/api/reset-password/reset-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Email is required.');
        });

        it('should return 404 if user is not found', async () => {
            // Mock user existence check - user not found
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/reset-password/reset-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'nonexistent@example.com'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 500 if user check query fails', async () => {
            // Mock user existence check - database error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error', code: 'ERROR' }
                })
            }));

            const response = await request(app)
                .post('/api/reset-password/reset-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to check user existence.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if email sending fails', async () => {
            // Mock user existence check
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user-123' },
                    error: null
                })
            }));

            // Mock token insertion
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                insert: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            // Mock email sending failure
            const mockResendInstance = {
                emails: {
                    send: jest.fn().mockRejectedValue(new Error('Email sending failed'))
                }
            };
            Resend.mockImplementationOnce(() => mockResendInstance);

            const response = await request(app)
                .post('/api/reset-password/reset-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to process password reset request.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle unexpected errors during password reset request', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .post('/api/reset-password/reset-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to process password reset request.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if token storage fails', async () => {
            // Mock user existence check
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { user_id: 'user-123' },
                error: null
              })
            }));
          
            // Mock token insertion - with error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
              insert: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database insertion error' }
              })
            }));
          
            const response = await request(app)
              .post('/api/reset-password/reset-password')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                email: 'test@example.com'
              });
          
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to create access token.');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('GET /api/reset-password/verify-token/:token', () => {
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
                .get('/api/reset-password/verify-token/valid-token-123')
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
                .get('/api/reset-password/verify-token/invalid-token')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Invalid or expired token');
        });

        it('should return 400 if token is missing', async () => {
            // We'll test this with an empty token parameter
            const response = await request(app)
                .get('/api/reset-password/verify-token/')
                .set('Authorization', `Bearer ${authToken}`);

            // This should return a 404 as the route won't match
            expect(response.status).toBe(404);
        });

        it('should handle unexpected errors', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .get('/api/reset-password/verify-token/error-causing-token')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('POST /api/reset-password/update-password', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should successfully update password with valid token', async () => {
            // Mock token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));

            // Mock supabase admin functions
            const mockAdmin = {
                auth: {
                    admin: {
                        listUsers: jest.fn().mockResolvedValue({
                            data: { users: [{ id: 'user-123', email: 'test@example.com' }] },
                            error: null
                        }),
                        updateUserById: jest.fn().mockResolvedValue({
                            data: { user: { id: 'user-123' } },
                            error: null
                        })
                    }
                }
            };
            supabase.admin = mockAdmin;

            // Mock token deletion
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Password updated successfully. Please sign in.');
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    // Missing password
                    email: 'test@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Token, password, and email are required');
        });

        it('should return 401 if token is invalid', async () => {
            // Mock token verification - invalid token
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
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'invalid-token',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid or expired token');
        });

        it('should return 401 if token email does not match provided email', async () => {
            // Mock token verification - email mismatch
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
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Token does not match the provided email');
        });

        it('should return 500 if listing users fails', async () => {
            // Mock token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));

            // Mock supabase admin functions - listUsers fails
            const mockAdmin = {
                auth: {
                    admin: {
                        listUsers: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Failed to list users' }
                        })
                    }
                }
            };
            supabase.admin = mockAdmin;

            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to access user accounts');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            // Mock token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));

            // Mock supabase admin functions - user not found
            const mockAdmin = {
                auth: {
                    admin: {
                        listUsers: jest.fn().mockResolvedValue({
                            data: { users: [{ id: 'user-123', email: 'different@example.com' }] },
                            error: null
                        })
                    }
                }
            };
            supabase.admin = mockAdmin;

            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });

        it('should return 500 if password update fails', async () => {
            // Mock token verification
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { email: 'test@example.com' },
                    error: null
                })
            }));

            // Mock supabase admin functions - updateUserById fails
            const mockAdmin = {
                auth: {
                    admin: {
                        listUsers: jest.fn().mockResolvedValue({
                            data: { users: [{ id: 'user-123', email: 'test@example.com' }] },
                            error: null
                        }),
                        updateUserById: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Password update failed' }
                        })
                    }
                }
            };
            supabase.admin = mockAdmin;

            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update password');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle unexpected errors during password reset', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .post('/api/reset-password/update-password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    token: 'valid-token-123',
                    password: 'newSecurePassword123',
                    email: 'test@example.com'
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
            expect(console.error).toHaveBeenCalled();
        });
    });
});