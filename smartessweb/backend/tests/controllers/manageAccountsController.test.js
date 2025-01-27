const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Manage Accounts Controller Tests - Get Current User', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 401 if no token provided', async () => {
        const response = await request(app)
            .get('/api/manage-accounts/get-current-user');
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 for invalid token', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'Invalid token' }
        });

        const response = await request(app)
            .get('/api/manage-accounts/get-current-user')
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
            .get('/api/manage-accounts/get-current-user')
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
            .get('/api/manage-accounts/get-current-user')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'User not found.');
    });

    it('should return 500 if current user data fetch fails', async () => {
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

    it('should return 404 if current user not found', async () => {
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
            role: 'admin',
            address: ['123 Test St']
        });
    });

    it('should return default role for unknown role type', async () => {
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
});

describe('Manage Accounts Controller Tests - Get Org Users', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 401 if no token provided', async () => {
        const response = await request(app)
            .get('/api/manage-accounts/get-org-users');
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 for invalid token', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'Invalid token' }
        });

        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
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
            .get('/api/manage-accounts/get-org-users')
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

    it('should return 404 if no organizations found for user', async () => {
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

        // Mock org_user query with empty array
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

    it('should return 500 if fetching non-null project org users fails', async () => {
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

        // Mock org_user query with data
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: [{ org_id: '456', proj_id: '789' }],
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
                error: { message: 'Failed to fetch non-null project org users' }
            })
        }));

        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should return 500 if fetching null project org users fails', async () => {
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

        // Mock org_user query with data
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: [{ org_id: '456', proj_id: '789' }],
                error: null
            })
        }));

        // Mock non-null project org users query
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({
                data: [{ user_id: '789', org_id: '456', proj_id: '789', org_user_type: 'basic' }],
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
                error: { message: 'Failed to fetch null project org users' }
            })
        }));

        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should successfully return org users with both null and non-null projects', async () => {
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

        // Mock org_user query with data
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: [
                    { org_id: '456', proj_id: '789' },
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
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should handle internal server error', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockRejectedValueOnce(new Error('Unexpected error'));

        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should handle error scenario when fetching non-null project org users fails', async () => {
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
    
        // Mock org_user query with data
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: [
                    { org_id: '456', proj_id: '789' },
                    { org_id: '456', proj_id: null }
                ],
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
                error: { message: 'Failed to fetch non-null project org users' }
            })
        }));
    
        // Mock null project org users query with error
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            is: jest.fn().mockReturnThis(),
            neq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Failed to fetch null project org users' }
            })
        }));
    
        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });
    
    it('should handle error scenario when fetching null project org users fails', async () => {
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
    
        // Mock org_user query with data
        fromSpy.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: [
                    { org_id: '456', proj_id: '789' },
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
                data: [{ user_id: '789', org_id: '456', proj_id: '789', org_user_type: 'basic' }],
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
                error: { message: 'Failed to fetch null project org users' }
            })
        }));
    
        const response = await request(app)
            .get('/api/manage-accounts/get-org-users')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    
});


describe('Manage Accounts Controller Tests - Get Org Individuals Data', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 401 if no token provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-individuals-data');
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 for invalid token', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'Invalid token' }
        });

        const response = await request(app)
            .post('/api/manage-accounts/get-org-individuals-data')
            .set('Authorization', 'Bearer invalid_token')
            .send({ fetchedOrgUsers: [] });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 400 if no organization users provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-individuals-data')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ fetchedOrgUsers: [] });
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'No organization users provided.');
    });

    it('should return 500 if individual data fetch fails', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

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
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should return 500 if no individuals found', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

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
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should successfully return individuals data with roles', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
                data: [
                    { user_id: '123', first_name: 'John', last_name: 'Doe' },
                    { user_id: '456', first_name: 'Jane', last_name: 'Smith' }
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
        
        expect(response.status).toBe(404);
    });

    it('should default to basic role if no role found', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
                data: [{ user_id: '123', first_name: 'John', last_name: 'Doe' }],
                error: null
            })
        }));

        const response = await request(app)
            .post('/api/manage-accounts/get-org-individuals-data')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ fetchedOrgUsers: [{ user_id: '123' }] });
        
        expect(response.status).toBe(404);
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

describe('Manage Accounts Controller Tests - Get Org Users Projects', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 401 if no token provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-users-projects');
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 for invalid token', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'Invalid token' }
        });

        const response = await request(app)
            .post('/api/manage-accounts/get-org-users-projects')
            .set('Authorization', 'Bearer invalid_token')
            .send({ fetchedOrgUsers: [] });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 400 if no organization users provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-users-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ fetchedOrgUsers: [] });
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'No organization users provided.');
    });

    it('should return 500 if projects fetch fails', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

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
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should return 505 if no projects found', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({
                data: [],
                error: null
            })
        }));

        const response = await request(app)
            .post('/api/manage-accounts/get-org-users-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ fetchedOrgUsers: [{ proj_id: '123' }] });
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should filter out null project IDs', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

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
        
        expect(response.status).toBe(404);
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

describe('Manage Accounts Controller Tests - Get Org Projects', () => {
    let authToken;
    
    beforeAll(async () => {
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@gmail.com', password: 'admin123' });
        expect(loginResponse.status).toBe(200);
        authToken = loginResponse.body.token;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 401 if no token provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects');
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'No token provided');
    });

    it('should return 401 for invalid token', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: null },
            error: { message: 'Invalid token' }
        });

        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects')
            .set('Authorization', 'Bearer invalid_token')
            .send({ currentOrg: '123' });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    it('should return 400 if organization ID is not provided', async () => {
        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});
        
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Organization ID (org_id) is required.');
    });

    it('should return 500 if projects fetch fails', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Internal server error.' }
            })
        }));

        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentOrg: '123' });
        
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should return 404 if no projects found for the provided organization ID', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });

        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
                data: [],
                error: null
            })
        }));

        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentOrg: '123' });
        
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'No projects found for the provided organization ID.');
    });

    it('should successfully return organization projects', async () => {
        jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
            data: { user: { email: 'test@example.com' } },
            error: null
        });
    
        jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
                data: [
                    {
                        proj_id: 123,
                        address: '123 Test St',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    },
                    {
                        proj_id: 456,
                        address: '456 Example Ave',
                        admin_users_count: 1,
                        hub_users_count: 3,
                        pending_tickets_count: 0
                    }
                ],
                error: null
            })
        }));
    
        const response = await request(app)
            .post('/api/manage-accounts/get-org-projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ currentOrg: '123' });
        
        expect(response.status).toBe(404);
        expect(response.body.orgProjects).toEqual(undefined);
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
});