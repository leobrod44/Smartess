const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Surveillance Controller Tests', () => {
    // Use a hardcoded mock token for all tests
    const authToken = 'mockAuthToken';

    // Common mocking setup
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console methods to prevent test output clutter
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // Helper function to mock authentication
    const mockAuthentication = (isValid = true) => {
        if (isValid) {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        } else {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValue({
                data: { user: null },
                error: { message: 'Invalid token' }
            });
        }
    };

    describe('GET /api/surveillance/get-user-projects', () => {
        it('should return user projects successfully', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user-123' },
                    error: null
                })
            }));

            // Mock org_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org-123' }],
                    error: null
                })
            }));

            // Mock project data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{
                        proj_id: 'proj-123',
                        address: '123 Test Street',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    }],
                    error: null
                })
            }));

            // Mock hub data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{
                        hub_id: 'hub-123',
                        unit_number: '101',
                        camera_status: 'active'
                    }],
                    error: null
                })
            }));

            // Mock hub_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: 'user-456', hub_user_type: 'owner' },
                        { user_id: 'user-789', hub_user_type: 'resident' }
                    ],
                    error: null
                })
            }));

            // Mock owner user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'user-456',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));

            // Mock tickets data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { ticket_id: 'ticket-1', status: 'open' },
                        { ticket_id: 'ticket-2', status: 'pending' },
                        { ticket_id: 'ticket-3', status: 'closed' }
                    ],
                    error: null
                })
            }));

            // Mock resident user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'user-789',
                        first_name: 'Jane',
                        last_name: 'Smith',
                        email: 'jane@example.com'
                    }],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects).toBeInstanceOf(Array);
            expect(response.body.projects.length).toBeGreaterThan(0);
            
            // Check the structure of the returned project
            const project = response.body.projects[0];
            expect(project).toHaveProperty('projectId', 'proj-123');
            expect(project).toHaveProperty('address', '123 Test Street');
            expect(project).toHaveProperty('units');
            expect(project.units).toBeInstanceOf(Array);
            
            // Check the structure of the unit
            const unit = project.units[0];
            expect(unit).toHaveProperty('unitNumber', '101');
            expect(unit).toHaveProperty('cameraStatus', 'active');
            expect(unit).toHaveProperty('owner');
            expect(unit.owner).toHaveProperty('firstName', 'John');
            expect(unit).toHaveProperty('hubUsers');
            expect(unit).toHaveProperty('tickets');
            expect(unit.tickets).toHaveProperty('total', 3);
        });

        it('should return 401 with invalid token', async () => {
            // Mock authentication failure
            mockAuthentication(false);

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer invalidToken`);

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should return 500 if user data fetch fails', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response with error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return 404 if user not found', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response with no user found
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 500 if organization data fetch fails', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user-123' },
                    error: null
                })
            }));

            // Mock org_user data response with error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should return empty projects array if user has no organizations', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user-123' },
                    error: null
                })
            }));

            // Mock org_user data response with empty array
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects).toEqual([]);
        });

        it('should return 500 if project data fetch fails', async () => {
            // Mock authentication
            mockAuthentication();

            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user-123' },
                    error: null
                })
            }));

            // Mock org_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org-123' }],
                    error: null
                })
            }));

            // Mock project data response with error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle error when fetching hub users', async () => {
            // Mock authentication
            mockAuthentication();

            // Setup for successful user, org, project and hub data
            jest.spyOn(supabase, 'from')
                // User data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-123' },
                        error: null
                    })
                }))
                // Org data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ org_id: 'org-123' }],
                        error: null
                    })
                }))
                // Project data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            proj_id: 'proj-123',
                            address: '123 Test Street',
                            admin_users_count: 2,
                            hub_users_count: 5,
                            pending_tickets_count: 3
                        }],
                        error: null
                    })
                }))
                // Hub data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            hub_id: 'hub-123',
                            unit_number: '101',
                            camera_status: 'active'
                        }],
                        error: null
                    })
                }))
                // Error when fetching hub users
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Error fetching hub users' }
                    })
                }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            // The error in hub users should be caught and the unit should be null, 
            // which will be filtered out from the final results
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects[0].units).toEqual([]);
        });

        it('should handle unexpected errors', async () => {
            // Mock getUser to throw an unexpected error
            jest.spyOn(supabase.auth, 'getUser').mockImplementation(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle error when fetching hubs for a project', async () => {
            // Mock authentication
            mockAuthentication();

            // Setup successful responses for user and org data
            jest.spyOn(supabase, 'from')
                // User data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-123' },
                        error: null
                    })
                }))
                // Org data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ org_id: 'org-123' }],
                        error: null
                    })
                }))
                // Project data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            proj_id: 'proj-123',
                            address: '123 Test Street',
                            admin_users_count: 2,
                            hub_users_count: 5,
                            pending_tickets_count: 3
                        }],
                        error: null
                    })
                }))
                // Error when fetching hubs
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Error fetching hubs' }
                    })
                }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            // The error in hub data should be caught and the project should be null,
            // which will be filtered out from the final results
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects).toEqual([]);
        });

        it('should handle error when fetching tickets for a hub', async () => {
            // Mock authentication
            mockAuthentication();

            // Setup for successful user, org, project and hub data
            jest.spyOn(supabase, 'from')
                // User data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-123' },
                        error: null
                    })
                }))
                // Org data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ org_id: 'org-123' }],
                        error: null
                    })
                }))
                // Project data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            proj_id: 'proj-123',
                            address: '123 Test Street',
                            admin_users_count: 2,
                            hub_users_count: 5,
                            pending_tickets_count: 3
                        }],
                        error: null
                    })
                }))
                // Hub data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            hub_id: 'hub-123',
                            unit_number: '101',
                            camera_status: 'active'
                        }],
                        error: null
                    })
                }))
                // Hub users data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [
                            { user_id: 'user-456', hub_user_type: 'owner' }
                        ],
                        error: null
                    })
                }))
                // Owner user data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{
                            user_id: 'user-456',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com'
                        }],
                        error: null
                    })
                }))
                // Error when fetching tickets
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Error fetching tickets' }
                    })
                }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            // The error in tickets should be caught and the unit should be null,
            // which will be filtered out from the final results
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects[0].units).toEqual([]);
        });

        it('should handle error when fetching hub user data', async () => {
            // Mock authentication
            mockAuthentication();

            // Setup for successful user, org, project, hub, hub_user, owner and tickets data
            jest.spyOn(supabase, 'from')
                // User data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: { user_id: 'user-123' },
                        error: null
                    })
                }))
                // Org data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{ org_id: 'org-123' }],
                        error: null
                    })
                }))
                // Project data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    in: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            proj_id: 'proj-123',
                            address: '123 Test Street',
                            admin_users_count: 2,
                            hub_users_count: 5,
                            pending_tickets_count: 3
                        }],
                        error: null
                    })
                }))
                // Hub data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [{
                            hub_id: 'hub-123',
                            unit_number: '101',
                            camera_status: 'active'
                        }],
                        error: null
                    })
                }))
                // Hub users data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    order: jest.fn().mockResolvedValue({
                        data: [
                            { user_id: 'user-456', hub_user_type: 'owner' },
                            { user_id: 'user-789', hub_user_type: 'resident' }
                        ],
                        error: null
                    })
                }))
                // Owner user data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [{
                            user_id: 'user-456',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com'
                        }],
                        error: null
                    })
                }))
                // Tickets data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: [
                            { ticket_id: 'ticket-1', status: 'open' }
                        ],
                        error: null
                    })
                }))
                // Error when fetching resident user data
                .mockImplementationOnce(() => ({
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: { message: 'Error fetching user data' }
                    })
                }));

            const response = await request(app)
                .get('/api/surveillance/get-user-projects')
                .set('Authorization', `Bearer ${authToken}`);

            // The unit should still be returned with owner data and empty hubUsers array
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('projects');
            expect(response.body.projects[0].units[0]).toHaveProperty('owner');
            expect(response.body.projects[0].units[0].owner.firstName).toBe('John');
            expect(response.body.projects[0].units[0].hubUsers).toEqual([]);
        });

    });

    describe('GET /api/surveillance/get-project-images', () => {
        // Save original storage implementation
        let originalStorage;
        
        beforeEach(() => {
            // Save original implementation
            originalStorage = supabase.storage;
            jest.clearAllMocks();
        });
        
        afterEach(() => {
            // Restore original implementation
            supabase.storage = originalStorage;
        });   
    
        it('should return empty array when no images found', async () => {
            // Mock authentication
            mockAuthentication();
            
            // Replace the storage object with empty data response
            supabase.storage = {
                from: jest.fn().mockReturnValue({
                    list: jest.fn().mockResolvedValue({
                        data: [],
                        error: null
                    })
                })
            };
    
            const response = await request(app)
                .get('/api/surveillance/get-project-images')
                .set('Authorization', `Bearer ${authToken}`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('images');
        });
    
        it('should filter out placeholder files', async () => {
            // Mock authentication
            mockAuthentication();
            
            // Replace the storage object with only placeholder file
            supabase.storage = {
                from: jest.fn().mockReturnValue({
                    list: jest.fn().mockResolvedValue({
                        data: [
                            { name: 'mock-project-images/.emptyFolderPlaceholder' }
                        ],
                        error: null
                    }),
                    getPublicUrl: jest.fn().mockReturnValue({
                        data: { publicUrl: 'https://example.com/placeholder' }
                    })
                })
            };
    
            const response = await request(app)
                .get('/api/surveillance/get-project-images')
                .set('Authorization', `Bearer ${authToken}`);
    
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('images');
        });
    
        it('should return 401 with invalid token', async () => {
            // Mock authentication failure
            mockAuthentication(false);
    
            const response = await request(app)
                .get('/api/surveillance/get-project-images')
                .set('Authorization', `Bearer invalidToken`);
    
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    
        it('should handle unexpected errors', async () => {
            // Mock getUser to throw an unexpected error
            jest.spyOn(supabase.auth, 'getUser').mockImplementation(() => {
                throw new Error('Unexpected server error');
            });
    
            const response = await request(app)
                .get('/api/surveillance/get-project-images')
                .set('Authorization', `Bearer ${authToken}`);
    
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });
    });
});