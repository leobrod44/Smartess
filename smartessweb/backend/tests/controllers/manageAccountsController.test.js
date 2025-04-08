const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

const { Resend } = require('resend');
const resend = new Resend('fake-api-key');

jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => {
        return {
            emails: {
            send: jest.fn().mockResolvedValue({ id: 'mock-email-id' })
            }
        };
        })
    };
});
  

describe('Manage Accounts Controller Tests', () => {
    let authToken;
    
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
    });

    const mockAuthUser = (valid = true) => {
        return jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
            data: { user: valid ? { email: 'test@example.com' } : null },
            error: valid ? null : { message: 'Invalid token' }
        });
    };

    const commonAuthTests = (endpoint, method = 'get') => {
        it('should return 401 if no token provided', async () => {
            const response = await request(app)[method](endpoint);
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should return 401 for invalid token', async () => {
            mockAuthUser(false);

            const response = await request(app)[method](endpoint)
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    };

    describe('Get Current User', () => {
        commonAuthTests('/api/manage-accounts/get-current-user');

        it('should return 500 if user data fetch fails', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 404 if user not found', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 404 if current user not found', async () => {
            mockAuthUser();

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

            // Mock org_user query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Current user not found.');
        });

        it('should return 500 if project addresses fetch fails', async () => {
            mockAuthUser();

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

            // Mock org_user query with single project
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ 
                        user_id: '123', 
                        proj_id: '456', 
                        org_id: '789', 
                        org_user_type: 'admin' 
                    }],
                    error: null
                })
            }));

            // Mock project query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch project addresses' }
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project addresses.');
        });

        it('should successfully return current user with single project', async () => {
            mockAuthUser();

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        user_id: '123',
                        email: 'test@example.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone_number: '555-1234',
                        profile_picture_url: 'http://example.com/photo.jpg'
                    },
                    error: null
                })
            }));

            // Mock org_user query with single project
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '123', proj_id: '456', org_id: '789', org_user_type: 'admin' }
                    ],
                    error: null
                })
            }));

            // Mock project query 
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { proj_id: '456', address: '123 Test St' }
                    ],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.currentUser).toEqual({
                userId: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                phoneNumber: '555-1234',
                profilePictureUrl: 'http://example.com/photo.jpg',
                role: 'admin',
                address: ['123 Test St']
            });
        });

        it('should return default role for unknown role type', async () => {
            mockAuthUser();

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        user_id: '123',
                        email: 'test@example.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone_number: '555-1234',
                        profile_picture_url: 'http://example.com/photo.jpg'
                    },
                    error: null
                })
            }));

            // Mock org_user query with unknown role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '123', proj_id: '456', org_id: '789', org_user_type: 'unknown' }
                    ],
                    error: null
                })
            }));

            // Mock project query 
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { proj_id: '456', address: '123 Test St' }
                    ],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body.currentUser).toEqual({
                userId: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@example.com',
                phoneNumber: '555-1234',
                profilePictureUrl: 'http://example.com/photo.jpg',
                role: 'basic',
                address: ['123 Test St']
            });
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/manage-accounts/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should return 500 if current user data fetch fails', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch current user data' }
              })
            }));
          
            const response = await request(app)
              .get('/api/manage-accounts/get-current-user')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch current user data.');
          });
    });
    

    describe('Update User Info', () => {
        // Common auth tests
        it('should return 401 if no token provided', async () => {
            const response = await request(app).post('/api/manage-accounts/update-user-info');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });
    
        it('should return 401 for invalid token', async () => {
            mockAuthUser(false);
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', 'Bearer invalid_token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token or user not found');
        });
    
        it('should return 500 if updating auth user email fails', async () => {
            mockAuthUser();
            
            // Direct mock for this specific operation
            const mockSupabaseAdmin = {
                auth: {
                    admin: {
                        updateUserById: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Failed to update Auth user email' }
                        })
                    }
                }
            };
            
            // Temporarily replace the module
            const originalAdmin = require('../../config/supabase').admin;
            require('../../config/supabase').admin = mockSupabaseAdmin;
            
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: 'newemail@example.com' });
            
            // Restore original module
            require('../../config/supabase').admin = originalAdmin;
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update Auth user email');
        });
        
        
        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));
            
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ firstName: 'John' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error');
        });

        it('should return 500 if updating auth user password fails', async () => {
            mockAuthUser();
            
            // Mock for password update failure
            const mockSupabaseAdmin = {
                auth: {
                    admin: {
                        updateUserById: jest.fn().mockImplementation((id, data) => {
                            if (data.password) {
                                return {
                                    data: null,
                                    error: { message: 'Failed to update Auth user password' }
                                };
                            }
                            return {
                                data: { user: { id: '123' } },
                                error: null
                            };
                        })
                    }
                }
            };
            
            // Temporarily replace the module
            const originalAdmin = require('../../config/supabase').admin;
            require('../../config/supabase').admin = mockSupabaseAdmin;
            
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ password: 'newpassword123' });
            
            // Restore original module
            require('../../config/supabase').admin = originalAdmin;
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update Auth user password');
        });
        
        it('should successfully update user info and return formatted user data', async () => {
            // Mock authentication first
            const authSpy = mockAuthUser();
            expect(authSpy).toHaveBeenCalled;
            
            // Create a spy on console.error to capture any errors
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            // Mock supabaseAdmin with Jest spyOn instead of direct replacement
            const adminAuthUpdateSpy = jest.spyOn(supabase.auth.admin, 'updateUserById')
                .mockImplementation(() => {
                    return Promise.resolve({
                        data: { user: { id: '123' } },
                        error: null
                    });
                });
            
            const adminFromSpy = jest.spyOn(supabase.admin, 'from')
                .mockImplementation(() => {
                    return {
                        update: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        single: jest.fn().mockResolvedValue({
                            data: { 
                                user_id: '123',
                                email: 'updated@example.com',
                                first_name: 'Updated',
                                last_name: 'User',
                                phone_number: '555-9876',
                                profile_picture_url: 'http://example.com/updated.jpg'
                            },
                            error: null
                        })
                    };
                });
            
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    firstName: 'Updated', 
                    lastName: 'User',
                    phoneNumber: '555-9876'
                });         
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            
            // Clean up spies
            adminAuthUpdateSpy.mockRestore();
            adminFromSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it('should return 500 if updating user info in DB fails', async () => {
            mockAuthUser();
            
            // Mock auth update success
            const adminAuthUpdateSpy = jest.spyOn(supabase.auth.admin, 'updateUserById')
                .mockImplementation(() => {
                    return Promise.resolve({
                        data: { user: { id: '123' } },
                        error: null
                    });
                });
            
            // Mock DB update failure
            const adminFromSpy = jest.spyOn(supabase.admin, 'from')
                .mockImplementation(() => {
                    return {
                        update: jest.fn().mockReturnThis(),
                        eq: jest.fn().mockReturnThis(),
                        select: jest.fn().mockReturnThis(),
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: { message: 'Database update error' }
                        })
                    };
                });
            
            const response = await request(app)
                .post('/api/manage-accounts/update-user-info')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    firstName: 'Updated', 
                    lastName: 'User',
                    phoneNumber: '555-9876'
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update user info');
            
            // Clean up spies
            adminAuthUpdateSpy.mockRestore();
            adminFromSpy.mockRestore();
        });
    });

    describe('Store Profile Picture', () => {
        // Mock fs and path modules
        jest.mock('fs', () => ({
            readFileSync: jest.fn().mockReturnValue(Buffer.from('test-image-data')),
            unlinkSync: jest.fn()
        }));
        
        jest.mock('path', () => ({
            resolve: jest.fn().mockReturnValue('/resolved/path'),
            extname: jest.fn().mockReturnValue('.jpg')
        }));
        
        jest.mock('uuid', () => ({
            v4: jest.fn().mockReturnValue('mock-uuid')
        }));
        
        commonAuthTests('/api/manage-accounts/change-profile-picture', 'post');
    
        it('should return 500 if user database query fails', async () => {
            mockAuthUser();
    
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database query failed' }
                })
            }));
    
            const response = await request(app)
                .post('/api/manage-accounts/change-profile-picture')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('test image'), 'test.jpg');
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Database query failed');
        });
    
        it('should return 404 if user not found', async () => {
            mockAuthUser();
    
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
    
            const response = await request(app)
                .post('/api/manage-accounts/change-profile-picture')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('test image'), 'test.jpg');
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found');
        });
    
        it('should return 400 if no file uploaded', async () => {
            mockAuthUser();
    
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
    
            const response = await request(app)
                .post('/api/manage-accounts/change-profile-picture')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'No file uploaded.');
        });
    
        it('should return 500 if updating user with new profile picture URL fails', async () => {
            mockAuthUser();
    
            // Mock user query
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
    
            // Setup storage mocks
            const uploadSpy = jest.fn().mockResolvedValue({
                data: { path: 'users/mock-uuid.jpg' },
                error: null
            });
            
            const getPublicUrlSpy = jest.fn().mockReturnValue({
                data: { publicUrl: 'https://example.com/avatars/users/mock-uuid.jpg' }
            });
            
            const fromStorageSpy = jest.fn().mockReturnValue({
                upload: uploadSpy,
                getPublicUrl: getPublicUrlSpy
            });
            
            // Mock the storage property on supabaseAdmin
            jest.spyOn(supabase.admin.storage, 'from').mockImplementation(fromStorageSpy);
            
            // Mock the user update call
            jest.spyOn(supabase.admin, 'from').mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Update error' }
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/change-profile-picture')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('test image'), 'test.jpg');
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to update user');
        });
    
        it('should handle unexpected errors', async () => {
            mockAuthUser();
            
            // Force an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });
            
            const response = await request(app)
                .post('/api/manage-accounts/change-profile-picture')
                .set('Authorization', `Bearer ${authToken}`)
                .attach('file', Buffer.from('test image'), 'test.jpg');
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Server error storing profile picture');
            expect(response.body).toHaveProperty('error', 'Unexpected error');
        });
    });
    

    describe('Get Org Users', () => {
        commonAuthTests('/api/manage-accounts/get-org-users');

        it('should return 500 if user data fetch fails', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data.' }
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-org-users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 404 if user not found', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-org-users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });


        it('should return 500 if fetching organization data fails', async () => {
            mockAuthUser();

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

            // Mock org_user query with error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch organization data' }
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-org-users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });


        it('should successfully return org users with both null and non-null projects for admin', async () => {
            mockAuthUser();

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

            // Mock org_user query with data including admin role
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { org_id: '456', proj_id: '789', org_user_type: 'admin' },
                        { org_id: '456', proj_id: null }
                    ],
                    error: null
                })
            }));

            // Mock non-null project org users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                neq: jest.fn().mockResolvedValue({
                    data: [{ 
                        user_id: '789', 
                        org_id: '456', 
                        proj_id: '789', 
                        org_user_type: 'basic' 
                    }],
                    error: null
                })
            }));

            // Mock null project org users query 
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                is: jest.fn().mockReturnThis(),
                neq: jest.fn().mockResolvedValue({
                    data: [{ 
                        user_id: '101', 
                        org_id: '456', 
                        proj_id: null, 
                        org_user_type: 'admin' 
                    }],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/manage-accounts/get-org-users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('orgUsers');
            expect(response.body.orgUsers).toBeInstanceOf(Array);
            expect(response.body.orgUsers).toHaveLength(2);
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .get('/api/manage-accounts/get-org-users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should return 500 if fetching organization data fails', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch organization data' }
              })
            }));
          
            const response = await request(app)
              .get('/api/manage-accounts/get-org-users')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
          });
          
          it('should return 404 if no organizations found for user', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with empty data
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }));
          
            const response = await request(app)
              .get('/api/manage-accounts/get-org-users')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No organizations found for this user.');
          });
          
          it('should return 500 if fetching non-null project organization users fails', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with data
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [{ org_id: '456', proj_id: '789', org_user_type: 'admin' }],
                error: null
              })
            }));
          
            // Mock non-null project org users query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              neq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch organization users' }
              })
            }));
          
            const response = await request(app)
              .get('/api/manage-accounts/get-org-users')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization users.');
          });
          
          it('should return 500 if fetching null project organization users fails', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with admin role (not basic)
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [{ org_id: '456', proj_id: '789', org_user_type: 'admin' }],
                error: null
              })
            }));
          
            // Mock non-null project org users query
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              neq: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            }));
          
            // Mock null project org users query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockReturnThis(),
              is: jest.fn().mockReturnThis(),
              neq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch organization users' }
              })
            }));
          
            const response = await request(app)
              .get('/api/manage-accounts/get-org-users')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization users.');
        });
    });

    describe('Get Org Individuals Data', () => {
        commonAuthTests('/api/manage-accounts/get-org-individuals-data', 'post');

        it('should return 400 if no organization users provided', async () => {
            mockAuthUser();

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [] });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'No organization users provided.');
        });

        it('should return 500 if individual data fetch fails', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch individual data' }
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ user_id: '123' }] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch individual data.');
        });

        it('should return 404 if no individuals found', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ user_id: '123' }] });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No individuals found for the provided user IDs.');
        });

        it('should successfully return individuals data with roles', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '123', first_name: 'John', last_name: 'Doe', profile_picture_url: 'http://example.com/john.jpg' },
                        { user_id: '456', first_name: 'Jane', last_name: 'Smith', profile_picture_url: 'http://example.com/jane.jpg' }
                    ],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    fetchedOrgUsers: [
                        { user_id: '123', org_user_type: 'admin' },
                        { user_id: '456', org_user_type: 'basic' }
                    ] 
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('individuals');
            expect(response.body.individuals).toBeInstanceOf(Array);
            expect(response.body.individuals).toHaveLength(2);
            expect(response.body.individuals[0]).toEqual({
                individualId: '123',
                firstName: 'John',
                lastName: 'Doe',
                role: 'admin',
                profilePictureUrl: 'http://example.com/john.jpg'
            });
            expect(response.body.individuals[1]).toEqual({
                individualId: '456',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'basic',
                profilePictureUrl: 'http://example.com/jane.jpg'
            });
        });

        it('should default to basic role if no role found', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ user_id: '123', first_name: 'John', last_name: 'Doe', profile_picture_url: null }],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ user_id: '123' }] });
            
            expect(response.status).toBe(200);
            expect(response.body.individuals[0].role).toBe('basic');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-individuals-data')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ user_id: '123' }] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });

    describe('Get Org Users Projects', () => {
        commonAuthTests('/api/manage-accounts/get-org-users-projects', 'post');

        it('should return 400 if no organization users provided', async () => {
            mockAuthUser();

            const response = await request(app)
                .post('/api/manage-accounts/get-org-users-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [] });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'No organization users provided.');
        });

        it('should return 500 if projects fetch fails', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Internal server error.' }
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-users-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ proj_id: '123' }] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should successfully return projects when available', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { 
                            proj_id: 123,
                            address: '123 Test St',
                            admin_users_count: 2,
                            hub_users_count: 5,
                            pending_tickets_count: 3
                        }
                    ],
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-users-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    fetchedOrgUsers: [
                        { proj_id: 123 },
                        { proj_id: null }
                    ] 
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects).toBeInstanceOf(Array);
            expect(response.body.projects).toHaveLength(1);
            expect(response.body.projects[0]).toEqual({
                projectId: '123',
                address: '123 Test St',
                adminUsersCount: 2,
                hubUsersCount: 5,
                pendingTicketsCount: 3
            });
        });

        it('should return empty projects array when no project IDs available', async () => {
            mockAuthUser();

            const response = await request(app)
                .post('/api/manage-accounts/get-org-users-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    fetchedOrgUsers: [
                        { proj_id: null }
                    ] 
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects).toBeInstanceOf(Array);
            expect(response.body.projects).toHaveLength(0);
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-users-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ fetchedOrgUsers: [{ proj_id: '123' }] });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });

    describe('Get Org Projects', () => {
        commonAuthTests('/api/manage-accounts/get-org-projects', 'post');


        it('should return 500 if user data fetch fails', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ currentOrg: '123' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 404 if user not found', async () => {
            mockAuthUser();

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ currentOrg: '123' });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 404 if current user not found', async () => {
            mockAuthUser();

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

            // Mock org_user query with no data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ currentOrg: '123' });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Current user not found.');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

            const response = await request(app)
                .post('/api/manage-accounts/get-org-projects')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ currentOrg: '123' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should successfully return projects associated with user', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with projects
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [
                  { user_id: '123', proj_id: '456', org_id: '789' },
                  { user_id: '123', proj_id: '789', org_id: '789' }
                ],
                error: null
              })
            }));
          
            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({
                data: [
                  { 
                    proj_id: 456, 
                    address: '123 Main St',
                    admin_users_count: 3,
                    hub_users_count: 5,
                    pending_tickets_count: 2
                  },
                  { 
                    proj_id: 789, 
                    address: '456 Elm St',
                    admin_users_count: 2,
                    hub_users_count: 4,
                    pending_tickets_count: 1
                  }
                ],
                error: null
              })
            }));
          
            const response = await request(app)
              .post('/api/manage-accounts/get-org-projects')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('orgProjects');
            expect(response.body.orgProjects).toBeInstanceOf(Array);
            expect(response.body.orgProjects).toHaveLength(2);
            expect(response.body.orgProjects[0]).toEqual({
              projectId: '456',
              address: '123 Main St',
              adminUsersCount: 3,
              hubUsersCount: 5,
              pendingTicketsCount: 2
            });
            expect(response.body.orgProjects[1]).toEqual({
              projectId: '789',
              address: '456 Elm St',
              adminUsersCount: 2,
              hubUsersCount: 4,
              pendingTicketsCount: 1
            });
          });
          
          it('should return 500 if projects query fails', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with projects
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [
                  { user_id: '123', proj_id: '456', org_id: '789' }
                ],
                error: null
              })
            }));
          
            // Mock project query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              in: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database query failed' }
              })
            }));
          
            const response = await request(app)
              .post('/api/manage-accounts/get-org-projects')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
          });
          
          it('should return empty projects array when user has no associated projects', async () => {
            mockAuthUser();
          
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
          
            // Mock org_user query with no projects (all null proj_id)
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: [
                  { user_id: '123', proj_id: null, org_id: '789' }
                ],
                error: null
              })
            }));
          
            const response = await request(app)
              .post('/api/manage-accounts/get-org-projects')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('orgProjects');
            expect(response.body.orgProjects).toBeInstanceOf(Array);
            expect(response.body.orgProjects).toHaveLength(0);
          });
          
          it('should return 500 if user data fetch fails with specific error', async () => {
            mockAuthUser();
          
            const fromSpy = jest.spyOn(supabase, 'from');
          
            // Mock org_user query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch current user data.' }
              })
            }));
          
            const response = await request(app)
              .post('/api/manage-accounts/get-org-projects')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 500 if fetching current user data fails', async () => {
            mockAuthUser();
          
            const fromSpy = jest.spyOn(supabase, 'from');
          
            // Mock user query - success
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { 
                  user_id: '123',
                  email: 'test@example.com',
                  first_name: 'John',
                  last_name: 'Doe',
                  phone_number: '555-1234',
                  profile_picture_url: 'http://example.com/photo.jpg'
                },
                error: null
              })
            }));
          
            // Mock org_user query with error
            fromSpy.mockImplementationOnce(() => ({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch current user data' }
              })
            }));
          
            const response = await request(app)
              .post('/api/manage-accounts/get-org-projects')
              .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch current user data.');
        });

        
    });

    describe('Assign Org User To Project', () => {
        commonAuthTests('/api/manage-accounts/assign-org-user-to-project', 'post');
    
        it('should return 400 if required parameters are missing', async () => {
            mockAuthUser();
    
            const response = await request(app)
                .post('/api/manage-accounts/assign-org-user-to-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_id: '123', org_id: '456' }); // Missing proj_ids and org_user_type
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'user_id, org_id, proj_ids (array), and org_user_type are required.');
        });
    
        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));
    
            const response = await request(app)
                .post('/api/manage-accounts/assign-org-user-to-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    user_id: '123', 
                    org_id: '456', 
                    proj_ids: ['789'], 
                    org_user_type: 'admin' 
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should return 400 if required parameters are missing', async () => {
            mockAuthUser();
    
            const response = await request(app)
                .post('/api/manage-accounts/assign-org-user-to-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_id: '123', org_id: '456' }); // Missing proj_ids and org_user_type
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'user_id, org_id, proj_ids (array), and org_user_type are required.');
        });
    
        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));
    
            const response = await request(app)
                .post('/api/manage-accounts/assign-org-user-to-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    user_id: '123', 
                    org_id: '456', 
                    proj_ids: ['789'], 
                    org_user_type: 'admin' 
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should return 500 if fetching org_user data fails', async () => {
            mockAuthUser();
          
            // Create a more complex mock that handles the chained methods correctly
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
              const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockImplementation(function(field, value) {
                  return this; // Return the chain for the first eq
                })
              };
              
              // Override the second eq to return the error result
              const originalEq = mockChain.eq;
              let eqCallCount = 0;
              
              mockChain.eq = jest.fn().mockImplementation(function(field, value) {
                eqCallCount++;
                if (eqCallCount === 2) {
                  return Promise.resolve({
                    data: null,
                    error: { message: 'Database query failed' }
                  });
                }
                return originalEq.call(this, field, value);
              });
              
              return mockChain;
            });
          
            const response = await request(app)
              .post('/api/manage-accounts/assign-org-user-to-project')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ 
                user_id: '123', 
                org_id: '456', 
                proj_ids: ['789'], 
                org_user_type: 'admin' 
              });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch org_user data.');
        });
    });

    describe('Remove Org User From Project', () => {
        commonAuthTests('/api/manage-accounts/remove-org-user-from-project', 'post');
    
        it('should return 400 if required parameters are missing', async () => {
            mockAuthUser();
    
            const response = await request(app)
                .post('/api/manage-accounts/remove-org-user-from-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ user_id: '123', org_id: '456' }); // Missing proj_ids
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'user_id, org_id, and proj_ids (array) are required.');
        });
    
        it('should return 500 if fetching user type fails', async () => {
            mockAuthUser();
    
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user type' }
                })
            }));
    
            const response = await request(app)
                .post('/api/manage-accounts/remove-org-user-from-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    user_id: '123', 
                    org_id: '456', 
                    proj_ids: ['789'] 
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user type.');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));
    
            const response = await request(app)
                .post('/api/manage-accounts/remove-org-user-from-project')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ 
                    user_id: '123', 
                    org_id: '456', 
                    proj_ids: ['789'] 
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });

    describe('Send Invite', () => {
        // Mock Resend for email sending
        const mockSendEmail = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
        
        beforeEach(() => {
          // Setup resend mock before each test
          jest.spyOn(resend.emails, 'send').mockImplementation(mockSendEmail);
        });
        
        // Common auth tests
        it('should return 401 if no token provided', async () => {
            const response = await request(app).post('/api/manage-accounts/invite-user-email');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });
      
        it('should correctly handle different project format types', async () => {
            mockAuthUser();
        
            // Setup mocks for a successful path
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // Mock user check 
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: { user_id: '123' },
                error: null
                })
            }));
            
            // Mock project fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                data: [
                    { proj_id: '456', org_id: '789' }
                ],
                error: null
                })
            }));
            
            // Mock org_user insertion
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            // Mock project admin count query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: { admin_users_count: 2 },
                error: null
                })
            }));
            
            // Mock project admin count update
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            // Mock token deletion
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                match: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            // Mock token insertion
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            // Test with projects as string
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                email: 'test@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                projects: '123 Main St, 456 Broadway'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User created and email sent successfully to test@example.com');
        });
      
        it('should handle projects in dynamic keys format', async () => {
            mockAuthUser();
        
            // Setup similar mocks as previous test
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // Mock all the necessary DB operations (user check, project fetch, etc.)
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
                in: jest.fn().mockResolvedValue({
                data: [
                    { proj_id: '456', org_id: '789' }
                ],
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: { admin_users_count: 2 },
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                match: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            // Test with projects in dynamic keys
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                email: 'test@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                'projects[0]': '123 Main St',
                'projects[1]': '456 Broadway'
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User created and email sent successfully to test@example.com');
        });
      
        it('should successfully process invitation for new user', async () => {
            mockAuthUser();
        
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // Mock user check - user doesn't exist
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // Not found error code
                })
            }));
            
            // Mock new user creation
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue({
                data: [{ user_id: 'new-123' }],
                error: null
                })
            }));
            
            // Continue with the rest of the necessary mocks
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                data: [
                    { proj_id: '456', org_id: '789' }
                ],
                error: null
                })
            }));
        
            // Rest of DB operation mocks...
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: { admin_users_count: 2 },
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                match: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                data: null,
                error: null
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                email: 'newuser@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                projects: ['123 Main St']
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User created and email sent successfully to newuser@example.com');
            });
      
            it('should handle project address not found in projects table', async () => {
            mockAuthUser();
        
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // Mock user check
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                data: { user_id: '123' },
                error: null
                })
            }));
            
            // Mock project fetch - no matching projects
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                data: [],
                error: null
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                email: 'test@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                projects: ['Non-existent Project']
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No matching projects found.');
        });

        it('should return 500 if checking existing user fails', async () => {
            mockAuthUser();
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'OTHER_ERROR', message: 'Database error' }
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com',
                    role: 'admin',
                    sender_name: 'Test Sender',
                    projects: ['123 Main St']
                });
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to check existing usgit aer.');
        });
          
        it('should return 500 if creating new user fails', async () => {
            mockAuthUser();
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }
                })
            }));
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Error creating user' }
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'newuser@example.com',
                    role: 'admin',
                    sender_name: 'Test Sender',
                    projects: ['123 Main St']
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to create user.');
        });
          
        it('should return 500 if user creation returns no user', async () => {
            mockAuthUser();
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { code: 'PGRST116' }
                })
            }));
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                insert: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'newuser@example.com',
                    role: 'admin',
                    sender_name: 'Test Sender',
                    projects: ['123 Main St']
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'User creation failed - no user returned.');
        });
          
        it('should return 500 if fetching projects fails', async () => {
            mockAuthUser();
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
            
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Error fetching projects' }
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com',
                    role: 'admin',
                    sender_name: 'Test Sender',
                    projects: ['123 Main St']
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project data.');
        });
          
        it('should return 500 if associating user with projects fails', async () => {
            mockAuthUser();
            
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
                in: jest.fn().mockResolvedValue({
                    data: [
                    { proj_id: '456', org_id: '789' }
                    ],
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to insert org_user entries' }
                })
            }));
            
            const response = await request(app)
                .post('/api/manage-accounts/invite-user-email')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    email: 'test@example.com',
                    role: 'admin',
                    sender_name: 'Test Sender',
                    projects: ['123 Main St']
                });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to associate user with projects.');
        });
          
        it('should return 500 if deleting existing token fails', async () => {
            mockAuthUser();
            
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
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '456', org_id: '789' }],
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { admin_users_count: 2 },
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                match: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to delete token' }
                })
            }));
            
            const response = await request(app)
            .post('/api/manage-accounts/invite-user-email')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                email: 'test@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                projects: ['123 Main St']
            });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to update access token.');
        });
          
        it('should return 500 if creating new token fails', async () => {
            mockAuthUser();
            
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
                in: jest.fn().mockResolvedValue({
                    data: [{ proj_id: '456', org_id: '789' }],
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { admin_users_count: 2 },
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                delete: jest.fn().mockReturnThis(),
                match: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
            
            fromSpy.mockImplementationOnce(() => ({
                insert: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to insert token' }
                })
            }));
            
            const response = await request(app)
            .post('/api/manage-accounts/invite-user-email')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                email: 'test@example.com',
                role: 'admin',
                sender_name: 'Test Sender',
                projects: ['123 Main St']
            });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to create access token.');
        });


    });
});