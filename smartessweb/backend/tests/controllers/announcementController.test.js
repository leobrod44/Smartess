// __tests__/announcementController.test.js

const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');
const { Resend } = require('resend');

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

describe('Announcement Controller Tests', () => {
  let authToken;

  beforeAll(async () => {
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

  describe('GET /api/announcements/get_current_user_org_id/:userId', () => {
    it('should return org_id successfully', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ org_id: 'org123' }],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_current_user_org_id/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orgId', 'org123');
    });

    it('should return 500 when database query fails', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_current_user_org_id/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error fetching organization ID');
    });

    it('should return 404 when user not found', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_current_user_org_id/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found in any organization');
    });
  });

  describe('GET /api/announcements/get_hub_user_emails_org/:orgId', () => {
    it('should return unique emails successfully', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');

      // Mock projects query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));

      // Mock hubs query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ hub_id: '1' }, { hub_id: '2' }],
          error: null
        })
      }));

      // Mock users in hubs query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ user_id: '1' }, { user_id: '2' }],
          error: null
        })
      }));

      // Mock user emails query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            { user_id: '1', email: 'user1@test.com' },
            { user_id: '2', email: 'user2@test.com' }
          ],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.emails).toEqual(['user1@test.com', 'user2@test.com']);
    });

    it('should handle project fetch error', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch projects' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch projects.');
    });

    it('should return empty emails array when no projects found', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ emails: [] });
    });
  });

  describe('GET /api/announcements/get_announcements/:userId', () => {
    it('should return formatted announcements successfully', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');

      // Mock user fetch
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123', org_id: 'org123' },
          error: null
        })
      }));

      // Mock org_user fetch
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [
            { org_id: 'org123', proj_id: 'proj1' },
            { org_id: 'org123', proj_id: 'proj2' }
          ],
          error: null
        })
      }));

      // Mock organization announcements
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            {
              announcement_id: 'ann1',
              announcement_type: 'organization',
              user_id: '123',
              org_id: 'org123',
              content: 'Org Announcement',
              created_at: '2024-01-26T12:00:00Z',
              user: { first_name: 'John', last_name: 'Doe' },
              organization: { name: 'Test Org' }
            }
          ],
          error: null
        })
      }));

      // Mock project announcements
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            {
              announcement_id: 'ann2',
              announcement_type: 'project',
              user_id: '123',
              proj_id: 'proj1',
              content: 'Project Announcement',
              created_at: '2024-01-26T12:00:00Z',
              user: { first_name: 'John', last_name: 'Doe' },
              project: { address: '123 Project St' }
            }
          ],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(Array.isArray(response.body.announcements)).toBe(true);
      expect(response.body.announcements.length).toBe(2);

      const [orgAnnouncement, projAnnouncement] = response.body.announcements;

      expect(orgAnnouncement).toMatchObject({
        announcement_id: 'ann1',
        announcement_type: 'organization',
        user_id: '123',
        name: 'John Doe',
        content: 'Org Announcement',
        created_at: '2024-01-26T12:00:00Z',
        organization: { name: 'Test Org' }
      });

      expect(projAnnouncement).toMatchObject({
        announcement_id: 'ann2',
        announcement_type: 'project',
        user_id: '123',
        name: 'John Doe',
        content: 'Project Announcement',
        created_at: '2024-01-26T12:00:00Z',
        project: { address: '123 Project St' }
      });
    });

    it('should return 404 when user not found', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found.');
    });

    it('should handle user fetch error', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
    });
  });

  describe('POST /api/announcements/send_announcement_email', () => {
    it('should send announcement email successfully', async () => {
      const mockEmails = ['test1@example.com', 'test2@example.com'];
      const mockReqBody = {
        emailList: JSON.stringify(mockEmails),
        type: 'organization',
        content: 'Test announcement content',
        keywords: '[]'
      };

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .send(mockReqBody)
        .set('Authorization', `Bearer ${authToken}`);

      // Ensure Resend is called correctly
      expect(Resend).toHaveBeenCalledTimes(1);
      const resendInstance = Resend.mock.instances[0];
      expect(resendInstance.emails.send).toHaveBeenCalledTimes(mockEmails.length);

      mockEmails.forEach((email, index) => {
        expect(resendInstance.emails.send).toHaveBeenNthCalledWith(
          index + 1,
          expect.objectContaining({
            to: email,
            from: expect.any(String), // Assuming 'from' is set in controller
            subject: expect.any(String),
            text: expect.any(String)
          })
        );
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'All emails sent successfully.');
    });

    it('should handle email sending failure', async () => {
      const mockEmails = ['test@example.com'];
      const mockReqBody = {
        emailList: JSON.stringify(mockEmails),
        type: 'organization',
        content: 'Test announcement content',
        keywords: '[]'
      };

      // Mock Resend to throw an error
      const resendInstance = Resend.mock.instances[0];
      resendInstance.emails.send.mockRejectedValue(new Error('Failed to send email'));

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .send(mockReqBody)
        .set('Authorization', `Bearer ${authToken}`);

      expect(resendInstance.emails.send).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Failed to send emails.');
    });

    it('should handle invalid email list', async () => {
      const mockReqBody = {
        emailList: 'invalid-json',
        type: 'organization',
        content: 'Test announcement content',
        keywords: '[]'
      };

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .send(mockReqBody)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid email list format.');
    });

    it('should handle missing required fields', async () => {
      const mockReqBody = {
        emailList: JSON.stringify(['test@example.com']),
      };

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .send(mockReqBody)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields.');
    });
  });

  describe('GET /get-announcements/:userId', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should return 500 if user data fetch fails', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
    });

    it('should return 404 if user does not exist', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found.');
    });

    it('should return 500 if org_user data fetch fails', async () => {
      // Mock user exists
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123' },
          error: null
        })
      }));

      // Mock org_user fetch fails
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockReturnValue: {
          data: null,
          error: { message: 'Database error' }
        }
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch org_user data.');
    });

    it('should return 500 if organization announcements fetch fails', async () => {
      // Mock user exists
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123' },
          error: null
        })
      }));

      // Mock org_user data
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockReturnValue: {
          data: [{ org_id: '456', proj_id: null }],
          error: null
        }
      }));

      // Mock organization announcements fetch fails
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch organization announcements.');
    });

    it('should return 500 if project announcements fetch fails', async () => {
      // Mock user exists
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123' },
          error: null
        })
      }));

      // Mock org_user data with project
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockReturnValue: {
          data: [{ org_id: null, proj_id: '789' }],
          error: null
        }
      }));

      // Mock organization announcements (empty)
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));

      // Mock project announcements fetch fails
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch project announcements.');
    });

    it('should successfully return formatted announcements', async () => {
      // Mock user exists
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123' },
          error: null
        })
      }));

      // Mock org_user data
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockReturnValue: {
          data: [{ org_id: '456', proj_id: '789' }],
          error: null
        }
      }));

      // Mock organization announcements
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{
            announcement_id: 'org1',
            announcement_type: 'organization',
            user_id: '234',
            org_id: '456',
            proj_id: null,
            content: 'Org Announcement',
            keywords: ['important'],
            file_urls: ['url1'],
            like_count: 5,
            created_at: '2024-01-26T12:00:00Z',
            user: { first_name: 'John', last_name: 'Doe' },
            organization: { name: 'Test Org' },
            project: null
          }],
          error: null
        })
      }));

      // Mock project announcements
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{
            announcement_id: 'proj1',
            announcement_type: 'project',
            user_id: '345',
            org_id: null,
            proj_id: '789',
            content: 'Project Announcement',
            keywords: ['update'],
            file_urls: ['url2'],
            like_count: 3,
            created_at: '2024-01-27T12:00:00Z',
            user: { first_name: 'Jane', last_name: 'Smith' },
            organization: null,
            project: { address: '123 Test St' }
          }],
          error: null
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.announcements).toHaveLength(2);
      expect(response.body.announcements[0]).toEqual({
        announcement_id: 'org1',
        announcement_type: 'organization',
        user_id: '234',
        name: 'John Doe',
        org_id: '456',
        org_name: 'Test Org',
        proj_id: null,
        address: null,
        content: 'Org Announcement',
        keywords: ['important'],
        file_urls: ['url1'],
        like_count: 5,
        created_at: '2024-01-26'
      });
      expect(response.body.announcements[1]).toEqual({
        announcement_id: 'proj1',
        announcement_type: 'project',
        user_id: '345',
        name: 'Jane Smith',
        org_id: null,
        org_name: null,
        proj_id: '789',
        address: '123 Test St',
        content: 'Project Announcement',
        keywords: ['update'],
        file_urls: ['url2'],
        like_count: 3,
        created_at: '2024-01-27'
      });
    });

    it('should handle scenario with no announcements', async () => {
      // Mock user exists
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { user_id: '123' },
          error: null
        })
      }));

      // Mock org_user data with no org or project
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        mockReturnValue: {
          data: [],
          error: null
        }
      }));

      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.announcements).toHaveLength(0);
    });
  });
});
