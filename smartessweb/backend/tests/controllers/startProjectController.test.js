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
      const response = await request(app)
        .post('/project/send-email')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'All fields are required' });
    });

    it('should return 200 and a success message if email is sent successfully', async () => {
      sendEmail.mockResolvedValue({ success: true, data: 'Email data' });

      const response = await request(app).post('/project/send-email').send({
        businessName: 'Business',
        firstName: 'John',
        lastName: 'Doe',
        telephoneNumber: '1234567890',
        email: 'john@example.com',
        description: 'Test description',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Email sent successfully',
        data: 'Email data',
      });
    });

    it('should return 500 if email fails to send', async () => {
      sendEmail.mockResolvedValue({ success: false, error: 'Email error' });

      const response = await request(app).post('/project/send-email').send({
        businessName: 'Business',
        firstName: 'John',
        lastName: 'Doe',
        telephoneNumber: '1234567890',
        email: 'john@example.com',
        description: 'Test description',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Failed to send email',
        error: 'Email error',
      });
    });
  });

  describe('POST /project/store-start-project-data', () => {
    it('should return 400 if any required field is missing', async () => {
      const response = await request(app)
        .post('/project/store-start-project-data')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'All fields are required' });
    });

    it('should return 200 and a success message if data is stored successfully', async () => {
      storeData.mockResolvedValue({ success: true });

      const response = await request(app)
        .post('/project/store-start-project-data')
        .send({
          businessName: 'Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Data stored successfully' });
    });

    it('should return 500 if data fails to store', async () => {
      storeData.mockResolvedValue({ success: false, error: 'Storage error' });

      const response = await request(app)
        .post('/project/store-start-project-data')
        .send({
          businessName: 'Business',
          firstName: 'John',
          lastName: 'Doe',
          telephoneNumber: '1234567890',
          email: 'john@example.com',
          description: 'Test description',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Failed to store data',
        error: 'Storage error',
      });
    });
  });
});
