const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Current User Controller Tests', () => {
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

    describe('GET /api/individual-unit/get-current-user', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/individual-unit/get-current-user');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
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
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should handle org_user fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
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
                    error: { message: 'Failed to fetch current user data' }
                })
            }));

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch current user data.');
        });

        it('should handle project addresses fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
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
                    data: [{ 
                        user_id: '123',
                        proj_id: '456',
                        org_id: '789',
                        org_user_type: 'admin'
                    }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch project addresses' }
                })
            }));

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project addresses.');
        });

        it('should successfully return current user data', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
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
                    data: [{ 
                        user_id: '123',
                        proj_id: '456',
                        org_id: '789',
                        org_user_type: 'admin'
                    }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ address: '123 Test St' }],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                currentUser: {
                    userId: '123',
                    role: 'admin',
                    address: ['123 Test St']
                }
            });
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should default to basic role for unknown role types', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
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
                    data: [{ 
                        user_id: '123',
                        proj_id: '456',
                        org_id: '789',
                        org_user_type: 'unknown_role'
                    }],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [{ address: '123 Test St' }],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body.currentUser.role).toBe('basic');
        });

        it('should handle user data fetch error', async () => {
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
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });
        
        it('should handle current user data not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
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
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/individual-unit/get-current-user')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Current user not found.');
        });
    });

    describe('POST /api/individual-unit/get-individual-unit', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        const validPayload = {
            projAddress: '123 Test St',
            unit_id: '101'
        };

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .send(validPayload);
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', 'Bearer invalid_token')
                .send(validPayload);
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle project not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Project not found' }
                })
            }));

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Cannot find project');
        });

        it('should handle unit not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Hub not found' }
                })
            }));

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Unit not found.');
        });

        it('should handle hub users fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));

            // Mock hub query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '456', unit_number: '101' },
                    error: null
                })
            }));

            // Mock hub users query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub users' }
                })
            }));

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub users.');
        });

        it('should handle tickets fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock successful queries up to tickets
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '456', unit_number: '101' },
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ user_id: '789', hub_user_type: 'basic' }],
                    error: null
                })
            }));

            // Mock tickets query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets.');
        });

        it('should handle internal server error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockImplementationOnce(() => {
                throw new Error('Unexpected error');
            });

            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle owner fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));
        
            // Mock hub query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '456', unit_number: '101' },
                    error: null
                })
            }));
        
            // Mock hub users with owner
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ 
                        user_id: '789', 
                        hub_user_type: 'owner' 
                    }],
                    error: null
                })
            }));
        
            // Mock owner user data fetch error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch owner data' }
                })
            }));
        
            // Mock tickets data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock alerts data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(200);
            // Owner should have default empty values
            expect(response.body.unit.owner).toEqual({
                tokenId: "",
                firstName: "",
                lastName: "",
                email: ""
            });
        });
        
        it('should handle hub user fetch errors', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));
        
            // Mock hub query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '456', unit_number: '101' },
                    error: null
                })
            }));
        
            // Mock hub users with non-owner
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ 
                        user_id: '789', 
                        hub_user_type: 'basic' 
                    }],
                    error: null
                })
            }));
        
            // Mock tickets data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock hub user data fetch error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));
        
            // Mock alerts data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(200);
            // Hub users array should be empty as all users with errors are filtered
            expect(response.body.unit.hubUsers).toEqual([]);
        });
        
        it('should handle alerts fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));
        
            // Mock hub query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '456', unit_number: '101' },
                    error: null
                })
            }));
        
            // Mock hub users query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock tickets query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock alerts query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch alerts' }
                })
            }));
        
            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch alerts.');
        });
        
        it('should successfully return unit data with formatted tickets', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock project query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: '123' },
                    error: null
                })
            }));
        
            // Mock hub query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        hub_id: '456', 
                        unit_number: '101',
                        status: 'active' 
                    },
                    error: null
                })
            }));
        
            // Mock hub users query with owner
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '789', hub_user_type: 'owner' },
                        { user_id: '790', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock owner user data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        user_id: '789',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com',
                        phone_number: '123-456-7890'
                    },
                    error: null
                })
            }));
        
            // Mock tickets query with sample data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { 
                            ticket_id: 't1',
                            hub_id: '456',
                            type: 'maintenance',
                            status: 'open',
                            created_at: '2025-01-01',
                            description: 'Fix issue'
                        }
                    ],
                    error: null
                })
            }));
        
            // Mock hub user data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { 
                        user_id: '790',
                        first_name: 'Jane',
                        last_name: 'Smith',
                        email: 'jane@example.com',
                        phone_number: '987-654-3210'
                    },
                    error: null
                })
            }));
        
            // Mock alerts query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        {
                            alert_id: 'a1',
                            hub_id: '456',
                            description: 'Alert description',
                            message: 'Alert message',
                            active: true,
                            type: 'warning',
                            created_at: '2025-01-02',
                            device_id: 'd1',
                            hub_ip: '192.168.1.1'
                        }
                    ],
                    error: null
                })
            }));
        
            const response = await request(app)
                .post('/api/individual-unit/get-individual-unit')
                .set('Authorization', `Bearer ${authToken}`)
                .send(validPayload);
                
            expect(response.status).toBe(200);
            
            // Check proper formatting of owner data
            expect(response.body.unit.owner).toEqual({
                tokenId: '789',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                telephone: '123-456-7890'
            });
            
            // Check proper formatting of tickets
            expect(response.body.unit.ticket).toEqual([{
                ticket_id: 't1',
                unit_id: '456',
                type: 'maintenance',
                status: 'open',
                created_at: '2025-01-01',
                description: 'Fix issue'
            }]);
            
            // Check hub users (should exclude owner)
            expect(response.body.unit.hubUsers).toEqual([{
                tokenId: '790',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                telephone: '987-654-3210'
            }]);
            
            // Check alerts formatting
            expect(response.body.unit.alerts).toEqual([{
                id: 'a1',
                hubId: '456',
                unitNumber: '101',
                description: 'Alert description',
                message: 'Alert message',
                active: true,
                type: 'warning',
                timestamp: '2025-01-02',
                deviceId: 'd1',
                hubIp: '192.168.1.1'
            }]);
            
            // Check unit object structure
            expect(response.body.unit).toMatchObject({
                unit_id: '456',
                unitNumber: '101',
                status: 'active'
            });
        });
    });


    describe('Individual Unit Controller Tests', () => {
        describe('POST /api/individual-unit/remove-user-from-hub', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });

            const validPayload = {
                user_id: '123'
            };

            it('should return 401 if no token provided', async () => {
                const response = await request(app)
                    .post('/api/individual-unit/remove-user-from-hub')
                    .send(validPayload);
                    
                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty('error', 'No token provided');
            });

            it('should handle invalid token', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                    data: { user: null },
                    error: { message: 'Invalid token' }
                });

                const response = await request(app)
                    .post('/api/individual-unit/remove-user-from-hub')
                    .set('Authorization', 'Bearer invalid_token')
                    .send(validPayload);
                    
                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty('error', 'Invalid token');
            });

            it('should handle deletion error', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                    data: { user: { email: 'test@example.com' } },
                    error: null
                });

                jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: { message: 'Failed to remove user' }
                    })
                }));

                const response = await request(app)
                    .post('/api/individual-unit/remove-user-from-hub')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                    
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Failed to remove user from hub.');
            });

            it('should successfully remove user from hub', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                    data: { user: { email: 'test@example.com' } },
                    error: null
                });

                jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                    delete: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        error: null
                    })
                }));

                const response = await request(app)
                    .post('/api/individual-unit/remove-user-from-hub')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                    
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ message: 'User successfully removed from the hub.' });
            });

            it('should handle internal server error', async () => {
                jest.spyOn(supabase.auth, 'getUser').mockImplementationOnce(() => {
                    throw new Error('Unexpected error');
                });

                const response = await request(app)
                    .post('/api/individual-unit/remove-user-from-hub')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(validPayload);
                    
                expect(response.status).toBe(500);
                expect(response.body).toHaveProperty('error', 'Internal server error.');
            });
        });
    });
})