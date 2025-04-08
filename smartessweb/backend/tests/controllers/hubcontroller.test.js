const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');

describe('Hub Controller Tests', () => {
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
    
    describe('GET /api/hubs/:proj_id/units/:unit_number', () => {
        it('should return 401 if no token provided', async () => {
            const response = await request(app)
                .get('/api/hubs/1/units/101');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'No token provided');
        });
        
        it('should return error if hub not found', async () => {
            const response = await request(app)
                .get('/api/hubs/999999/units/999999')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });

        it('should handle invalid project ID format', async () => {
            const response = await request(app)
                .get('/api/hubs/invalid/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });

        it('should handle malformed authorization token', async () => {
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', 'Bearer malformed_token');
                
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid token');
        });
    });
    
    describe('Hub Controller with mocked Supabase', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });
        
        it('should handle database errors ', async () => {
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });
            
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should handle hub query error', async () => {
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub.');
        });


        it('should return 404 when hub is not found', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
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
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Hub not found.');
        });

        it('should handle hub users fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));


            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch hub users' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch hub users.');
        });

        it('should handle tickets fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
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

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch tickets' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch tickets.');
        });

        it('should handle alerts fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });

            const fromSpy = jest.spyOn(supabase, 'from');

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
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

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch alerts' }
                })
            }));

            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error.');
        });

        it('should properly format and return hub data on successful fetch', async () => {
            // Mock authentication
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock hub fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));
        
            // Mock hub users fetch with different types
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        {
                            user_id: '101',
                            hub_user_type: 'owner',
                            user: {
                                first_name: 'John',
                                last_name: 'Doe',
                                email: 'john@example.com'
                            }
                        },
                        {
                            user_id: '102',
                            hub_user_type: 'admin',
                            user: {
                                first_name: 'Jane',
                                last_name: 'Smith',
                                email: 'jane@example.com'
                            }
                        },
                        {
                            user_id: '103',
                            hub_user_type: 'basic',
                            user: {
                                first_name: 'Bob',
                                last_name: 'Brown',
                                email: 'bob@example.com'
                            }
                        }
                    ],
                    error: null
                })
            }));
        
            // Mock tickets fetch with different statuses
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { status: 'open' },
                        { status: 'open' },
                        { status: 'pending' },
                        { status: 'closed' }
                    ],
                    error: null
                })
            }));
        
            // Mock alerts fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        {
                            id: 1,
                            message: 'Test alert',
                            created_at: '2025-04-08T12:00:00Z',
                            active: true,
                            icon: 'warning'
                        }
                    ],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('owner');
            expect(response.body).toHaveProperty('hubUsers');
            expect(response.body).toHaveProperty('tickets');
            expect(response.body).toHaveProperty('alerts');
            
            // Check owner format
            expect(response.body.owner).toEqual({
                tokenId: '101',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com'
            });
            
            // Check hub users format
            expect(response.body.hubUsers).toHaveLength(2);
            expect(response.body.hubUsers[0]).toEqual({
                tokenId: '102',
                firstName: 'Jane',
                lastName: 'Smith',
                role: 'admin'
            });
            
            // Check ticket stats
            expect(response.body.tickets).toEqual({
                total: 4,
                open: 2,
                pending: 1,
                closed: 1
            });
            
            // Check alerts format
            expect(response.body.alerts).toHaveLength(1);
            expect(response.body.alerts[0]).toEqual({
                id: 1,
                projectId: '1',
                unitNumber: '101',
                message: 'Test alert',
                timestamp: '2025-04-08T12:00:00Z',
                resolved: false,
                icon: 'warning'
            });
        });
        
        it('should handle missing owner data gracefully', async () => {
            // Mock authentication
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock hub fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));
        
            // Mock hub users fetch with no owner
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        {
                            user_id: '102',
                            hub_user_type: 'admin',
                            user: {
                                first_name: 'Jane',
                                last_name: 'Smith',
                                email: 'jane@example.com'
                            }
                        }
                    ],
                    error: null
                })
            }));
        
            // Mock tickets fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock alerts fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            expect(response.body.owner).toBe(null);
            expect(response.body.hubUsers).toHaveLength(1);
            expect(response.body.tickets).toEqual({
                total: 0,
                open: 0,
                pending: 0,
                closed: 0
            });
            expect(response.body.alerts).toEqual([]);
        });
        
        it('should handle alerts fetch error', async () => {
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'random@email.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
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
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Failed to fetch alerts' }
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch alerts.');
        });

        it('should correctly process and format different user roles', async () => {
            // Mock authentication
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            // Mock hub fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));
        
            // Mock hub users fetch with multiple admin and basic users
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        {
                            user_id: '101',
                            hub_user_type: 'owner',
                            user: {
                                first_name: 'John',
                                last_name: 'Doe',
                                email: 'john@example.com'
                            }
                        },
                        {
                            user_id: '102',
                            hub_user_type: 'admin',
                            user: {
                                first_name: 'Jane',
                                last_name: 'Smith',
                                email: 'jane@example.com'
                            }
                        },
                        {
                            user_id: '103',
                            hub_user_type: 'admin',
                            user: {
                                first_name: 'Alice',
                                last_name: 'Johnson',
                                email: 'alice@example.com'
                            }
                        },
                        {
                            user_id: '104',
                            hub_user_type: 'basic',
                            user: {
                                first_name: 'Bob',
                                last_name: 'Brown',
                                email: 'bob@example.com'
                            }
                        },
                        {
                            user_id: '105',
                            hub_user_type: 'basic',
                            user: {
                                first_name: 'Charlie',
                                last_name: 'Wilson',
                                email: 'charlie@example.com'
                            }
                        },
                        {
                            user_id: '106',
                            hub_user_type: 'other', // Should be filtered out
                            user: {
                                first_name: 'David',
                                last_name: 'Black',
                                email: 'david@example.com'
                            }
                        }
                    ],
                    error: null
                })
            }));
        
            // Mock tickets and alerts fetch
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // Should have 4 users (2 admin, 2 basic, 1 filtered out)
            expect(response.body.hubUsers).toHaveLength(4);
            
            // Check that all have the correct format
            response.body.hubUsers.forEach(user => {
                expect(user).toHaveProperty('tokenId');
                expect(user).toHaveProperty('firstName');
                expect(user).toHaveProperty('lastName');
                expect(user).toHaveProperty('role');
                expect(['admin', 'basic']).toContain(user.role);
            });
            
            // Check specific entries
            const adminUsers = response.body.hubUsers.filter(user => user.role === 'admin');
            expect(adminUsers).toHaveLength(2);
            
            const basicUsers = response.body.hubUsers.filter(user => user.role === 'basic');
            expect(basicUsers).toHaveLength(2);
            
            // Verify 'other' type was filtered out
            const otherUsers = response.body.hubUsers.some(user => user.firstName === 'David');
            expect(otherUsers).toBe(false);
        });
        
        it('should correctly calculate ticket statistics for different status values', async () => {
            // Mock authentication and hub fetch
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
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
        
            // Mock tickets with various statuses
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        { status: 'open' },
                        { status: 'open' },
                        { status: 'open' },
                        { status: 'pending' },
                        { status: 'pending' },
                        { status: 'closed' },
                        { status: 'closed' },
                        { status: 'closed' },
                        { status: 'closed' },
                        { status: 'unknown' }, // Should still count toward total
                    ],
                    error: null
                })
            }));
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // Check ticket statistics
            expect(response.body.tickets).toEqual({
                total: 10,
                open: 3,
                pending: 2,
                closed: 4
            });
        });
        
        it('should properly format alerts with default icons when not provided', async () => {
            // Mock authentication and hub fetch
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
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
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));
        
            // Mock alerts with various properties
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: [
                        {
                            id: 1,
                            message: 'Alert with icon',
                            created_at: '2025-04-08T12:00:00Z',
                            active: true,
                            icon: 'warning'
                        },
                        {
                            id: 2,
                            message: 'Alert without icon',
                            created_at: '2025-04-08T12:30:00Z',
                            active: true
                            // No icon provided
                        },
                        {
                            id: 3,
                            message: 'Resolved alert',
                            created_at: '2025-04-08T13:00:00Z',
                            active: false,
                            icon: 'info'
                        }
                    ],
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // Check alerts formatting
            expect(response.body.alerts).toHaveLength(3);
            
            // First alert should have specified icon
            expect(response.body.alerts[0]).toMatchObject({
                id: 1,
                message: 'Alert with icon',
                projectId: '1',
                unitNumber: '101',
                icon: 'warning',
                resolved: false
            });
            
            // Second alert should have default icon
            expect(response.body.alerts[1]).toMatchObject({
                id: 2,
                message: 'Alert without icon',
                icon: 'default-icon',
                resolved: false
            });
            
            // Third alert should be marked as resolved
            expect(response.body.alerts[2]).toMatchObject({
                id: 3,
                message: 'Resolved alert',
                icon: 'info',
                resolved: true
            });
        });
        
        it('should handle empty hubUsers, tickets, and alerts gracefully', async () => {
            // Mock authentication and hub fetch
            jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: { email: 'test@example.com' } },
                error: null
            });
        
            const fromSpy = jest.spyOn(supabase, 'from');
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { hub_id: '1' },
                    error: null
                })
            }));
        
            // Return null for all data
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
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
        
            fromSpy.mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));
        
            const response = await request(app)
                .get('/api/hubs/1/units/101')
                .set('Authorization', `Bearer ${authToken}`);
                
            expect(response.status).toBe(200);
            
            // All should be empty arrays or default values
            expect(response.body.owner).toBe(null);
            expect(response.body.hubUsers).toEqual([]);
            expect(response.body.tickets).toEqual({
                total: 0,
                open: 0,
                pending: 0,
                closed: 0
            });
            expect(response.body.alerts).toEqual([]);
        });
    });
});