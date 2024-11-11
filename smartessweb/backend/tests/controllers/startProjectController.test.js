const request = require('supertest');
const express = require('express');
const { sendEmail, storeData } = require('../../services/startProjectService');
const startProjectRoutes = require('../../routes/startProjectRoutes');

const app = express();
app.use(express.json());
app.use('/project', startProjectRoutes);

jest.mock('../../services/startProjectService', () => ({
  sendEmail: jest.fn(),
  storeData: jest.fn(),
}));

describe('Start Project Controller', () => {
  describe('POST /project/send-email', () => {
    it('should return 400 if any required field is missing', async () => {
      const testCases = [
        { field: 'businessName', data: { firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'firstName', data: { businessName: 'Business', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'lastName', data: { businessName: 'Business', firstName: 'John', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'telephoneNumber', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', email: 'random@email.com', description: 'Test' } },
        { field: 'email', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', description: 'Test' } },
        { field: 'description', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com' } }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/project/send-email')
          .send(testCase.data);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'All fields are required' });
      }
    });

    it('should send email with correct content and format', async () => {
      sendEmail.mockResolvedValue({ success: true, data: 'Email data' });

      const testData = {
        businessName: 'Test Business',
        firstName: 'John',
        lastName: 'Doe',
        telephoneNumber: '1234567890',
        email: 'john@example.com',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/project/send-email')
        .send(testData);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.stringContaining('Smartess <support@'),
        expect.any(String),
        'Inquiry from John Doe',
        expect.stringContaining('<h2>New Inquiry from Test Business</h2>')
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Email sent successfully',
        data: 'Email data'
      });
    });

    it('should handle email sending failure', async () => {
      sendEmail.mockResolvedValue({ success: false, error: 'Failed to send' });

      const response = await request(app)
        .post('/project/send-email')
        .send({
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Failed to send email',
        error: 'Failed to send'
      });
    });

    it('should handle server errors', async () => {
      sendEmail.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/project/send-email')
        .send({
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Server error',
        error: 'Server error'
      });
    });
  });

  describe('POST /project/store-start-project-data', () => {
    it('should return 400 if any required field is missing', async () => {
      const testCases = [
        { field: 'businessName', data: { firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'firstName', data: { businessName: 'Business', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'lastName', data: { businessName: 'Business', firstName: 'John', telephoneNumber: '1234567890', email: 'random@email.com', description: 'Test' } },
        { field: 'telephoneNumber', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', email: 'random@email.com', description: 'Test' } },
        { field: 'email', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', description: 'Test' } },
        { field: 'description', data: { businessName: 'Business', firstName: 'John', lastName: 'Doe', telephoneNumber: '1234567890', email: 'random@email.com' } }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/project/store-start-project-data')
          .send(testCase.data);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'All fields are required' });
      }
    });

    it('should store data successfully', async () => {
      storeData.mockResolvedValue({ success: true });

      const testData = {
        businessName: 'Test Business',
        firstName: 'John',
        lastName: 'Doe',
        telephoneNumber: '1234567890',
        email: 'john@example.com',
        description: 'Test description'
      };

      const response = await request(app)
        .post('/project/store-start-project-data')
        .send(testData);

      expect(storeData).toHaveBeenCalledWith(
        testData.businessName,
        testData.firstName,
        testData.lastName,
        testData.telephoneNumber,
        testData.email,
        testData.description
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Data stored successfully' });
    });

    it('should handle data storage failure', async () => {
      storeData.mockResolvedValue({ success: false, error: 'Storage failed' });

      const response = await request(app)
        .post('/project/store-start-project-data')
        .send({
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Failed to store data',
        error: 'Storage failed'
      });
    });

    it('should handle server errors during storage', async () => {
      storeData.mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/project/store-start-project-data')
        .send({
          businessName: 'Test Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Server error',
        error: 'Server error'
      });
    });
  });
});