const request = require('supertest');
const express = require('express');
const app = express();
const supabase = require('../../config/supabase');
const consumptionController = require('../../controllers/consumptionController');

describe('Consumption Controller Tests', () => {
    let authToken;

    beforeAll(async () => {
        // Setup middleware
        app.use(express.json());
        
        // Setup test routes
        app.get('/api/consumption/get_consumptions/:userId', consumptionController.getConsumptions);
        app.get('/api/consumption/get_consumption/:hubId', consumptionController.getConsumption);
        
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

    describe('GET /api/consumption/get_consumptions/:userId', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should successfully return energy consumption data', async () => {
            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ proj_id: 'project1' }, { proj_id: 'project2' }],
                    error: null
                })
            }));

            // Mock project data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { proj_id: 'project1', address: '123 Main St' },
                        { proj_id: 'project2', address: '456 Oak Ave' }
                    ],
                    error: null
                })
            }));

            // Mock energy consumption data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        {
                            proj_id: 'project1',
                            hub_id: 'hub1',
                            monthly_energy_consumption: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210],
                            monthly_temperature: [10, 12, 15, 18, 22, 25, 28, 26, 22, 18, 14, 11]
                        },
                        {
                            proj_id: 'project2',
                            hub_id: 'hub2',
                            monthly_energy_consumption: [200, 220, 240, 230, 210, 200, 190, 200, 210, 230, 250, 270],
                            monthly_temperature: [11, 13, 16, 19, 23, 26, 29, 27, 23, 19, 15, 12]
                        }
                    ],
                    error: null
                })
            }));

            // Mock Date.getMonth() to return a predictable value
            const originalDateNow = Date.now;
            const mockDate = new Date('2023-06-15T12:00:00Z'); // June = 5 in 0-based index
            global.Date = class extends Date {
                constructor() {
                    return mockDate;
                }
                static now() {
                    return mockDate.getTime();
                }
            };

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            // Restore Date
            global.Date = Date;
            Date.now = originalDateNow;

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('energyConsumptionData');
            expect(response.body.energyConsumptionData).toHaveLength(2);
            
            // Verify data processing
            expect(response.body.energyConsumptionData[0].projectAddress).toBe('123 Main St');
            expect(response.body.energyConsumptionData[0].currentMonthConsumption).toBe(150);
            expect(response.body.energyConsumptionData[0].currentMonthTemperature).toBe(25);
            expect(response.body.energyConsumptionData[0].variation).toBe(7.14); // (150-140)/140*100 = 7.14
            
            expect(response.body.energyConsumptionData[1].projectAddress).toBe('456 Oak Ave');
            expect(response.body.energyConsumptionData[1].currentMonthConsumption).toBe(200);
            expect(response.body.energyConsumptionData[1].currentMonthTemperature).toBe(26);
            expect(response.body.energyConsumptionData[1].variation).toBe(-4.76); // (200-210)/210*100 = -4.76
        });

        it('should return 404 if user is not found', async () => {
            // Mock user data response to return null
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'User not found.');
        });

        it('should return 404 if no projects are associated with the user', async () => {
            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user data response to return empty array
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'No projects associated with this user.');
        });

        it('should return 500 if there is a database error when fetching user data', async () => {
            // Mock user data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if there is a database error when fetching org_user data', async () => {
            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch organization or project data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if there is a database error when fetching project data', async () => {
            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ proj_id: 'project1' }, { proj_id: 'project2' }],
                    error: null
                })
            }));

            // Mock project data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if there is a database error when fetching energy consumption data', async () => {
            // Mock user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { user_id: '123' },
                    error: null
                })
            }));

            // Mock org_user data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [{ proj_id: 'project1' }, { proj_id: 'project2' }],
                    error: null
                })
            }));

            // Mock project data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: [
                        { proj_id: 'project1', address: '123 Main St' },
                        { proj_id: 'project2', address: '456 Oak Ave' }
                    ],
                    error: null
                })
            }));

            // Mock energy consumption data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                in: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch energy consumption data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle unexpected errors', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .get('/api/consumption/get_consumptions/123')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'An unexpected error occurred.');
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('GET /api/consumption/get_consumption/:hubId', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        it('should successfully return energy consumption data for a specific hub', async () => {
            // Mock hub data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: 'project1' },
                    error: null
                })
            }));

            // Mock project data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { address: '123 Main St' },
                    error: null
                })
            }));

            // Mock energy consumption data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: [
                        {
                            hub_id: 'hub1',
                            monthly_energy_consumption: [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210],
                            monthly_temperature: [10, 12, 15, 18, 22, 25, 28, 26, 22, 18, 14, 11]
                        }
                    ],
                    error: null
                })
            }));

            // Mock Date.getMonth() to return a predictable value
            const originalDateNow = Date.now;
            const mockDate = new Date('2023-06-15T12:00:00Z'); // June = 5 in 0-based index
            global.Date = class extends Date {
                constructor() {
                    return mockDate;
                }
                static now() {
                    return mockDate.getTime();
                }
            };

            const response = await request(app)
                .get('/api/consumption/get_consumption/hub1')
                .set('Authorization', `Bearer ${authToken}`);

            // Restore Date
            global.Date = Date;
            Date.now = originalDateNow;

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('energyConsumptionData');
            expect(response.body.energyConsumptionData).toHaveLength(1);
            
            // Verify data processing
            expect(response.body.energyConsumptionData[0].projectAddress).toBe('123 Main St');
            expect(response.body.energyConsumptionData[0].currentMonthConsumption).toBe(150);
            expect(response.body.energyConsumptionData[0].currentMonthTemperature).toBe(25);
            expect(response.body.energyConsumptionData[0].variation).toBe(7.14); // (150-140)/140*100 = 7.14
        });

        it('should return 500 if hub data cannot be fetched', async () => {
            // Mock hub data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumption/hub1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project id from hub.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if project address cannot be fetched', async () => {
            // Mock hub data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: 'project1' },
                    error: null
                })
            }));

            // Mock project data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumption/hub1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch project address.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should return 500 if energy consumption data cannot be fetched', async () => {
            // Mock hub data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { proj_id: 'project1' },
                    error: null
                })
            }));

            // Mock project data response
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: { address: '123 Main St' },
                    error: null
                })
            }));

            // Mock energy consumption data response to return an error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' }
                })
            }));

            const response = await request(app)
                .get('/api/consumption/get_consumption/hub1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Failed to fetch energy consumption data.');
            expect(console.error).toHaveBeenCalled();
        });

        it('should handle unexpected errors', async () => {
            // Mock supabase.from to throw an unexpected error
            jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
                throw new Error('Unexpected server error');
            });

            const response = await request(app)
                .get('/api/consumption/get_consumption/hub1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'An unexpected error occurred.');
            expect(console.error).toHaveBeenCalled();
        });
    });
});