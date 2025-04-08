const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');
const { Resend } = require('resend');

// Mock Resend
jest.mock('resend');

describe('Start Project Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/start-project/send-email', () => {
        // Valid test data
        const validRequestData = {
            businessName: 'Test Company',
            firstName: 'John',
            lastName: 'Doe',
            telephoneNumber: '555-123-4567',
            email: 'john.doe@example.com',
            description: 'Test project description'
        };

        it('should return 400 if required fields are missing', async () => {
            // Missing businessName
            const invalidData = { ...validRequestData };
            delete invalidData.businessName;

            const response = await request(app)
                .post('/api/start-project/send-email')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'All fields are required');
        });
        
        it('should return 200 if email is sent successfully', async () => {
          // Mock Resend's send method properly
          const mockSend = jest.fn().mockResolvedValue({
              data: { id: 'email-id-123' },
              error: null
          });
          
          // Set up the mock implementation
          Resend.prototype.emails = { send: mockSend };
      
          const response = await request(app)
              .post('/api/start-project/send-email')
              .send(validRequestData);
      
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('message', 'Email sent successfully');
          expect(response.body).toHaveProperty('data');
      });
      
      it('should return 500 if Resend returns an error', async () => {
          // Mock Resend's send method to return an error
          const mockSend = jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Failed to send email' }
          });
          
          // Set up the mock implementation
          Resend.prototype.emails = { send: mockSend };
      
          const response = await request(app)
              .post('/api/start-project/send-email')
              .send(validRequestData);
      
          expect(response.status).toBe(500);
          expect(response.body).toHaveProperty('message', 'Failed to send email');
          expect(response.body).toHaveProperty('error');
      });
      
      it('should return 500 if email sending throws an exception', async () => {
          // Mock Resend's send method to throw an exception
          const mockSend = jest.fn().mockImplementation(() => {
              throw new Error('Network error');
          });
          
          // Set up the mock implementation
          Resend.prototype.emails = { send: mockSend };
      
          const response = await request(app)
              .post('/api/start-project/send-email')
              .send(validRequestData);
      
          expect(response.status).toBe(500);
          expect(response.body).toHaveProperty('message', 'Server error sending email');
          expect(response.body).toHaveProperty('error', 'Network error');
      });
    });

    describe('POST /api/start-project/store-start-project-data', () => {
        // Valid test data
        const validRequestData = {
            businessName: 'Test Company',
            firstName: 'John',
            lastName: 'Doe',
            telephoneNumber: '555-123-4567',
            email: 'john.doe@example.com',
            description: 'Test project description'
        };

        it('should return 400 if required fields are missing', async () => {
            // Missing lastName
            const invalidData = { ...validRequestData };
            delete invalidData.lastName;

            const response = await request(app)
                .post('/api/start-project/store-start-project-data')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'All fields are required');
        });

        it('should return 500 if database insert fails', async () => {
            // Mock Supabase to return an error
            const fromSpy = jest.spyOn(supabase, 'from');
            fromSpy.mockReturnValueOnce({
                insert: jest.fn().mockResolvedValue({
                    error: { message: 'Database insert failed' }
                })
            });

            const response = await request(app)
                .post('/api/start-project/store-start-project-data')
                .send(validRequestData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Failed to store data');
            expect(fromSpy).toHaveBeenCalledWith('start_project');
        });

        it('should return 500 if database operation throws an exception', async () => {
            // Mock Supabase to throw an exception
            const fromSpy = jest.spyOn(supabase, 'from');
            fromSpy.mockImplementationOnce(() => {
                throw new Error('Database connection failed');
            });

            const response = await request(app)
                .post('/api/start-project/store-start-project-data')
                .send(validRequestData);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Server error storing data');
            expect(response.body).toHaveProperty('error', 'Database connection failed');
            expect(fromSpy).toHaveBeenCalledWith('start_project');
        });

        it('should return 200 if data is stored successfully', async () => {
            // Mock Supabase to return success
            const fromSpy = jest.spyOn(supabase, 'from');
            fromSpy.mockReturnValueOnce({
                insert: jest.fn().mockResolvedValue({
                    data: { id: 1 },
                    error: null
                })
            });

            const response = await request(app)
                .post('/api/start-project/store-start-project-data')
                .send(validRequestData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Data stored successfully');
            expect(fromSpy).toHaveBeenCalledWith('start_project');
            
            // Verify the data being inserted
            const insertCall = fromSpy.mock.results[0].value.insert.mock.calls[0][0];
            expect(insertCall).toHaveLength(1);
            expect(insertCall[0]).toHaveProperty('business_name', validRequestData.businessName);
            expect(insertCall[0]).toHaveProperty('first_name', validRequestData.firstName);
            expect(insertCall[0]).toHaveProperty('last_name', validRequestData.lastName);
            expect(insertCall[0]).toHaveProperty('email', validRequestData.email);
            expect(insertCall[0]).toHaveProperty('phone_number', validRequestData.telephoneNumber);
            expect(insertCall[0]).toHaveProperty('description', validRequestData.description);
        });

        it('should handle duplicate email submissions', async () => {
          // Mock Supabase to simulate a unique constraint violation
          const fromSpy = jest.spyOn(supabase, 'from');
          fromSpy.mockReturnValueOnce({
            insert: jest.fn().mockResolvedValue({
              error: { 
                code: '23505', // PostgreSQL unique violation code
                message: 'duplicate key value violates unique constraint' 
              }
            })
          });
        
          const response = await request(app)
            .post('/api/start-project/store-start-project-data')
            .send(validRequestData);
        
          expect(response.status).toBe(500);
          expect(response.body).toHaveProperty('message', 'Failed to store data');
          expect(response.body.error).toHaveProperty('code', '23505');
        });
        
        it('should handle empty description field correctly', async () => {
          const dataWithEmptyDescription = {
            ...validRequestData,
            description: ''
          };
        
          // Mock Supabase to return success
          const fromSpy = jest.spyOn(supabase, 'from');
          fromSpy.mockReturnValueOnce({
            insert: jest.fn().mockResolvedValue({
              data: { id: 1 },
              error: null
            })
          });
        
          const response = await request(app)
            .post('/api/start-project/store-start-project-data')
            .send(dataWithEmptyDescription);
        
          expect(response.status).toBe(200);
          
          // Verify the empty description is stored correctly
          const insertCall = fromSpy.mock.results[0].value.insert.mock.calls[0][0];
          expect(insertCall[0]).toHaveProperty('description', '');
        });
        
        it('should handle very long input values', async () => {
          const longString = 'a'.repeat(1000);
          const dataWithLongValues = {
            ...validRequestData,
            businessName: longString,
            description: longString
          };
        
          // Mock Supabase to return success
          const fromSpy = jest.spyOn(supabase, 'from');
          fromSpy.mockReturnValueOnce({
            insert: jest.fn().mockResolvedValue({
              data: { id: 1 },
              error: null
            })
          });
        
          const response = await request(app)
            .post('/api/start-project/store-start-project-data')
            .send(dataWithLongValues);
        
          expect(response.status).toBe(200);
        });
        
    });
});