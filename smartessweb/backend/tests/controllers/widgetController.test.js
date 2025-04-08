const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Widget Controller Tests', () => {
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
    
    describe('GET /api/widgets/dashboard', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        // Helper function to mock auth user
        const mockAuthUser = (userData = null, error = null) => {
            return jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: userData },
                error
            });
        };

        // Helper function to create mock query chain
        const createMockChain = (finalValue) => {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
                ...finalValue
            };
        };

        // Create standard mock data
        const defaultData = {
            userData: { user_id: '123' },
            orgData: [{ org_id: '1' }],
            projectsData: [{ proj_id: '1', address: '123 Test St' }],
            hubsData: [
                { hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' },
                { hub_id: '2', unit_number: '102', proj_id: '1', status: 'disconnected' }
            ],
            adminData: [{ user_id: '1' }, { user_id: '2' }],
            ticketsData: [{ ticket_id: '1', status: 'pending' }],
            alertsData: [{
                message: 'Test Alert',
                hub_id: '1',
                created_at: '2024-01-01'
            }]
        };

        // Set up mock responses for a specific step with error
        const mockStepWithError = (step, errorMessage) => {
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // Define the steps and their mock implementations
            const steps = [
                // User data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    single: jest.fn().mockResolvedValue({
                        data: step === 'user' ? null : defaultData.userData,
                        error: step === 'user' ? { message: errorMessage } : null
                    })
                })),
                
                // Org data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    eq: jest.fn().mockResolvedValue({
                        data: step === 'org' ? (errorMessage ? null : []) : defaultData.orgData,
                        error: step === 'org' && errorMessage ? { message: errorMessage } : null
                    })
                })),
                
                // Projects data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    in: jest.fn().mockResolvedValue({
                        data: step === 'project' ? null : defaultData.projectsData,
                        error: step === 'project' ? { message: errorMessage } : null
                    })
                })),
                
                // Hubs data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    in: jest.fn().mockResolvedValue({
                        data: step === 'hub' ? null : defaultData.hubsData,
                        error: step === 'hub' ? { message: errorMessage } : null
                    })
                })),
                
                // Admin users data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    in: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: step === 'admin' ? null : defaultData.adminData,
                        error: step === 'admin' ? { message: errorMessage } : null
                    })
                })),
                
                // Tickets data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    in: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: step === 'ticket' ? null : defaultData.ticketsData,
                        error: step === 'ticket' ? { message: errorMessage } : null
                    })
                })),
                
                // Alerts data
                () => fromSpy.mockImplementationOnce(() => createMockChain({
                    eq: jest.fn().mockReturnThis(),
                    in: jest.fn().mockReturnThis(),
                    order: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockResolvedValue({
                        data: step === 'alert' ? null : defaultData.alertsData,
                        error: step === 'alert' ? { message: errorMessage } : null
                    })
                }))
            ];
            
            // Apply mocks up to and including the error step
            const stepsMap = {
                'user': 0, 'org': 1, 'project': 2, 'hub': 3, 'admin': 4, 'ticket': 5, 'alert': 6
            };
            
            const stepIndex = stepsMap[step];
            for (let i = 0; i <= stepIndex; i++) {
                steps[i]();
            }
            
            return fromSpy;
        };

        // Setup successful path for all steps
        const setupSuccessPath = () => {
            mockAuthUser({ email: 'random@email.com' });
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Project data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hub data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));
            
            return fromSpy;
        };

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/widgets/dashboard');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            mockAuthUser(null, { message: 'Invalid token' });

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user not found', async () => {
            mockStepWithError('user');

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should handle organization fetch error', async () => {
            mockStepWithError('org', 'Failed to fetch organization data');

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should handle no organizations found', async () => {
            mockStepWithError('org');

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No organizations found for user.');
        });

        it('should handle project fetch error', async () => {
            mockStepWithError('project', 'Failed to fetch projects');

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle hub fetch error', async () => {
            mockStepWithError('hub', 'Failed to fetch hubs');

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hubs.');
        });

        it('should handle database error', async () => {
            mockAuthUser({ email: 'random@email.com' });
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle admin users fetch error', async () => {
            // Mock user and org data successfully, then fail on admin users
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - error
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
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
            // Mock user, org, projects, hubs, and admin data successfully, then fail on tickets
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - error
            fromSpy.mockImplementationOnce(() => createMockChain({
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
            // Mock all previous steps successfully, then fail on alerts
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - error
            fromSpy.mockImplementationOnce(() => createMockChain({
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
        
        it('should return properly formatted dashboard data on success', async () => {
            // Fix the success path implementation
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Project data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hub data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('companyId', '1');
            expect(response.body).toHaveProperty('systemOverview');
            expect(response.body.systemOverview).toHaveProperty('projects', 1);
            expect(response.body.systemOverview).toHaveProperty('totalUnits', 2);
            expect(response.body.systemOverview).toHaveProperty('pendingTickets', 1);
            expect(response.body.systemOverview).toHaveProperty('totalAdminUsers', 2);
            expect(response.body).toHaveProperty('alerts');
            expect(response.body.alerts.length).toBe(1);
            expect(response.body.alerts[0]).toHaveProperty('alertType', 'Test Alert');
            expect(response.body.alerts[0]).toHaveProperty('unitAddress', '123 Test St');
            expect(response.body.alerts[0]).toHaveProperty('unitNumber', 'Unit 101');
            expect(response.body).toHaveProperty('systemHealth');
            expect(response.body.systemHealth).toHaveProperty('systemsLive', 1);
            expect(response.body.systemHealth).toHaveProperty('systemsDown', 1);
        });

        it('should handle empty projects returned from database', async () => {
            // Mock user and org data successfully, but return empty projects array
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - empty array
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('systemOverview');
            expect(response.body.systemOverview).toHaveProperty('projects', 0);
            expect(response.body.systemOverview).toHaveProperty('totalUnits', 0);
        });

        it('should handle empty hubs returned from database', async () => {
            // Mock successful responses but with empty hubs array
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - empty array
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('systemOverview');
            expect(response.body.systemOverview).toHaveProperty('totalUnits', 0);
            expect(response.body.systemHealth).toHaveProperty('systemsLive', 0);
            expect(response.body.systemHealth).toHaveProperty('systemsDown', 0);
        });

        it('should handle empty tickets returned from database', async () => {
            // Mock successful responses but with empty tickets array
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - empty array
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
            
            // Alerts data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('systemOverview');
            expect(response.body.systemOverview).toHaveProperty('pendingTickets', 0);
        });

        it('should handle empty alerts returned from database', async () => {
            // Mock successful responses but with empty alerts array
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - empty array
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('alerts');
            expect(response.body.alerts).toHaveLength(0);
        });

        it('should handle multiple organizations correctly', async () => {
            // Test with multiple organizations
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const multiOrgData = [
                { org_id: '1' },
                { org_id: '2' },
                { org_id: '3' }
            ];
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - multiple orgs
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: multiOrgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            // Verify it uses the first org_id as company ID
            expect(response.body).toHaveProperty('companyId', '1');
        });

        it('should handle mixed hub statuses correctly', async () => {
            // Test with hubs having different statuses
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const mixedStatusHubs = [
                { hub_id: '1', unit_number: '101', proj_id: '1', status: 'live' },
                { hub_id: '2', unit_number: '102', proj_id: '1', status: 'disconnected' },
                { hub_id: '3', unit_number: '103', proj_id: '1', status: 'live' },
                { hub_id: '4', unit_number: '104', proj_id: '1', status: 'maintenance' },
                { hub_id: '5', unit_number: '105', proj_id: '1', status: 'live' }
            ];
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - mixed statuses
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: mixedStatusHubs,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('systemHealth');
            expect(response.body.systemHealth).toHaveProperty('systemsLive', 3);
            expect(response.body.systemHealth).toHaveProperty('systemsDown', 1);
        });

        it('should handle missing user data correctly', async () => {
            // Test case when user data is not found in the database
            mockAuthUser({ email: 'nonexistent@email.com' });
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - not found
            fromSpy.mockImplementationOnce(() => createMockChain({
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

        it('should handle multiple alerts correctly', async () => {
            // Test with multiple alerts
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const multipleAlerts = [
                { message: 'Test Alert 1', hub_id: '1', created_at: '2024-01-01' },
                { message: 'Test Alert 2', hub_id: '2', created_at: '2024-01-02' },
                { message: 'Test Alert 3', hub_id: '1', created_at: '2024-01-03' }
            ];
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.projectsData,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - multiple alerts
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: multipleAlerts,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('alerts');
            expect(response.body.alerts).toHaveLength(3);
            expect(response.body.alerts[0]).toHaveProperty('alertType', 'Test Alert 1');
            expect(response.body.alerts[1]).toHaveProperty('alertType', 'Test Alert 2');
            expect(response.body.alerts[2]).toHaveProperty('alertType', 'Test Alert 3');
        });

        it('should handle multiple projects correctly', async () => {
            // Test with multiple projects
            const mockUser = { email: 'random@email.com' };
            mockAuthUser(mockUser);
            
            const multipleProjects = [
                { proj_id: '1', address: '123 Test St' },
                { proj_id: '2', address: '456 Sample Ave' },
                { proj_id: '3', address: '789 Demo Blvd' }
            ];
            
            const fromSpy = jest.spyOn(supabase, 'from');
            
            // User data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                single: jest.fn().mockResolvedValue({
                    data: defaultData.userData,
                    error: null
                })
            }));
            
            // Org data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.orgData,
                    error: null
                })
            }));
            
            // Projects data - multiple projects
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: multipleProjects,
                    error: null
                })
            }));
            
            // Hubs data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.hubsData,
                    error: null
                })
            }));
            
            // Admin users data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockResolvedValue({
                    data: defaultData.adminData,
                    error: null
                })
            }));
            
            // Tickets data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                in: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: defaultData.ticketsData,
                    error: null
                })
            }));
            
            // Alerts data - success
            fromSpy.mockImplementationOnce(() => createMockChain({
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue({
                    data: defaultData.alertsData,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/widgets/dashboard')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('systemOverview');
            expect(response.body.systemOverview).toHaveProperty('projects', 3);
        });
    });
});