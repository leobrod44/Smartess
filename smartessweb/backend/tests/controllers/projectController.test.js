const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Project Controller Tests', () => {
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
    

    describe('GET /api/projects/get_user_projects', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/projects/get_user_projects');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });

        it('should handle invalid token', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null },
                error: { message: 'Invalid token' }
            });

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', 'Bearer invalid_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });

        it('should handle user fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
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
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
        });

        it('should return empty projects array when user has no organizations', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
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
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should handle database errors', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
                error: null
            });

            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle user not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
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
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should handle organization fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@emails.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch organization data' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization data.');
        });

        it('should handle project fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            // Mock projects query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch projects' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
        });

        it('should handle project hub fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));

            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: '1', 
                        address: '123 Test St',
                        admin_users_count: 1,
                        hub_users_count: 1,
                        pending_tickets_count: 0
                    }],
                    error: null
                })
            }));

            // Mock hub query error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hubs' }
                })
            }));

            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ projects: [] });
        });

        it('should fetch and transform hub user data correctly', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: '1' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: '1', 
                        address: '123 Test St',
                        admin_users_count: 1,
                        hub_users_count: 1,
                        pending_tickets_count: 0
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: '1', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: '456', hub_user_type: 'owner' },
                        { user_id: '789', hub_user_type: 'admin' },
                        { user_id: '012', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock user data fetch error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
        
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should successfully fetch and transform project data', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org123' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: 'proj123', 
                        address: '123 Main St',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: 'hub123', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub_user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: 'owner123', hub_user_type: 'owner' },
                        { user_id: 'user456', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock owner user data query
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'owner123',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));
        
            // Mock hub users data queries (owner)
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'owner123',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));
        
            // Mock hub users data queries (basic user)
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'user456',
                        first_name: 'Jane',
                        last_name: 'Smith',
                        email: 'jane@example.com'
                    }],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // Check the overall structure
            expect(response.body).toHaveProperty('projects');
            expect(Array.isArray(response.body.projects)).toBe(true);
            expect(response.body.projects.length).toBe(1);
            
            const project = response.body.projects[0];
            
            // Check project properties
            expect(project).toHaveProperty('projectId', 'proj123');
            expect(project).toHaveProperty('address', '123 Main St');
            expect(project).toHaveProperty('adminUsersCount', 2);
            expect(project).toHaveProperty('hubUsersCount', 5);
            expect(project).toHaveProperty('pendingTicketsCount', 3);
            expect(project).toHaveProperty('projectUsers');
            expect(Array.isArray(project.projectUsers)).toBe(true);
            expect(project.projectUsers.length).toBe(0);
            
            // Check units
            expect(project).toHaveProperty('units');
            expect(Array.isArray(project.units)).toBe(true);
            expect(project.units.length).toBe(1);
            
            const unit = project.units[0];
            
            // Check unit properties
            expect(unit).toHaveProperty('unitNumber', '101');
            expect(unit).toHaveProperty('hubUsers');
            expect(Array.isArray(unit.hubUsers)).toBe(true);
            expect(unit.hubUsers.length).toBe(2);
            
            // Check owner
            expect(unit).toHaveProperty('owner');
            expect(unit.owner).toEqual({
                tokenId: 'owner123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            });
            
            // Check tickets
            expect(unit).toHaveProperty('tickets');
            expect(unit.tickets).toEqual({
                total: 0,
                open: 0,
                pending: 0,
                closed: 0
            });
            
            // Check alerts
            expect(unit).toHaveProperty('alerts');
            expect(Array.isArray(unit.alerts)).toBe(true);
            expect(unit.alerts.length).toBe(0);
            
            // Check hub users
            const hubUsers = unit.hubUsers;
            expect(hubUsers[0]).toEqual({
                tokenId: 'owner123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            });
            expect(hubUsers[1]).toEqual({
                tokenId: 'user456',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com'
            });
        });

        it('should handle owner data fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org123' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: 'proj123', 
                        address: '123 Main St',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: 'hub123', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub_user query success with owner
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: 'owner123', hub_user_type: 'owner' },
                        { user_id: 'user456', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock owner user data query - error
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch owner data' }
                })
            }));
        
            // Mock hub users data queries
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'owner123',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'user456',
                        first_name: 'Jane',
                        last_name: 'Smith',
                        email: 'jane@example.com'
                    }],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            const project = response.body.projects[0];
            const unit = project.units[0];
            
            // Check that owner has default empty values
            expect(unit.owner).toEqual({
                tokenId: "",
                firstName: "",
                lastName: "",
                email: ""
            });
            
            // Other users should still be loaded
            expect(unit.hubUsers.length).toBe(2);
        });

        it('should handle hub user fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org123' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: 'proj123', 
                        address: '123 Main St',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: 'hub123', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub_user query error - THIS IS THE FIRST SCENARIO WE'RE TESTING
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub users' }
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // Check the project structure with no units due to hub_user error
            expect(response.body).toHaveProperty('projects');
            expect(Array.isArray(response.body.projects)).toBe(true);
            expect(response.body.projects.length).toBe(1);
            
            const project = response.body.projects[0];
            
            // The project should exist but have an empty units array
            expect(project).toHaveProperty('projectId', 'proj123');
            expect(project).toHaveProperty('units');
            expect(Array.isArray(project.units)).toBe(true);
            expect(project.units.length).toBe(0); // Units array is empty due to the hub_user fetch error
        });
        
        it('should handle individual user data fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: 'user123' },
                    error: null
                })
            }));
        
            // Mock org query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ org_id: 'org123' }],
                    error: null
                })
            }));
        
            // Mock projects query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ 
                        proj_id: 'proj123', 
                        address: '123 Main St',
                        admin_users_count: 2,
                        hub_users_count: 5,
                        pending_tickets_count: 3
                    }],
                    error: null
                })
            }));
        
            // Mock hub query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [{ hub_id: 'hub123', unit_number: '101' }],
                    error: null
                })
            }));
        
            // Mock hub_user query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        { user_id: 'owner123', hub_user_type: 'owner' },
                        { user_id: 'user456', hub_user_type: 'basic' },
                        { user_id: 'user789', hub_user_type: 'basic' }
                    ],
                    error: null
                })
            }));
        
            // Mock owner user data query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'owner123',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));
        
            // Mock first hub user data query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'owner123',
                        first_name: 'John',
                        last_name: 'Doe',
                        email: 'john@example.com'
                    }],
                    error: null
                })
            }));
        
            // Mock second hub user data query - ERROR (THIS IS THE SECOND SCENARIO WE'RE TESTING)
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch user data' }
                })
            }));
        
            // Mock third hub user data query success
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{
                        user_id: 'user789',
                        first_name: 'Bob',
                        last_name: 'Johnson',
                        email: 'bob@example.com'
                    }],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/projects/get_user_projects')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            const project = response.body.projects[0];
            const unit = project.units[0];
            
            // Unit should exist
            expect(unit).toHaveProperty('unitNumber', '101');
            
            // Should have 2 users (owner and third user), with the second user filtered out due to error
            expect(unit.hubUsers.length).toBe(2);
            
            // Verify that the failed user is not in the hubUsers array
            const userIdsInResponse = unit.hubUsers.map(u => u.tokenId);
            expect(userIdsInResponse).toContain('owner123');
            expect(userIdsInResponse).toContain('user789');
            expect(userIdsInResponse).not.toContain('user456');
        });
    });
});