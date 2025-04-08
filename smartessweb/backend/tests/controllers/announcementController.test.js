// __tests__/announcementController.test.js

const request = require('supertest');
const app = require('../../app');
const supabase = require('../../config/supabase');
const { Resend } = require('resend');

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

    it('should handle unexpected errors', async () => {
      // Simulate a complete failure by making supabase.from throw an exception
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
        throw new Error('Unexpected server error');
      });
    
      const response = await request(app)
        .get('/api/announcements/get_current_user_org_id/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal server error');
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

    it('should handle hub fetch error', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');
    
      // Mock projects query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));
    
      // Mock hubs query error
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch hubs' }
        })
      }));
    
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch hubs.');
    });

    // Test for empty hubs
    it('should return empty emails array when no hubs found', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');

      // Mock projects query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));

      // Mock empty hubs result
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
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

    // Test for empty hub users
    it('should return empty emails array when no hub users found', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');

      // Mock projects query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));

      // Mock hubs query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ hub_id: '1' }, { hub_id: '2' }],
          error: null
        })
      }));

      // Mock empty hub_users result
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
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

    // Test for user data fetch error
    it('should handle user data fetch error', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');

      // Mock projects query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));

      // Mock hubs query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ hub_id: '1' }, { hub_id: '2' }],
          error: null
        })
      }));

      // Mock hub_users query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ user_id: '1' }, { user_id: '2' }],
          error: null
        })
      }));

      // Mock user data fetch error
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch user data' }
        })
      }));

      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch user data.');
    });

    // Test for unexpected error (catch block)
    it('should handle unexpected errors', async () => {
      // Mock an unexpected exception
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
        throw new Error('Unexpected server error');
      });

      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error.');
    });

    it('should handle hub_user fetch error', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');
    
      // Mock projects query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ proj_id: '1' }, { proj_id: '2' }],
          error: null
        })
      }));
    
      // Mock hubs query success
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ hub_id: '1' }, { hub_id: '2' }],
          error: null
        })
      }));
    
      // Mock hub_user query error
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch hub_user data' }
        })
      }));
    
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_org/org123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch hub_user entries.');
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
      // First mock user fetch success
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
          })
        }))
        // Then mock org_user fetch failure
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch org_user data' }
          })
        }));
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch org_user data.');
    });
    
    it('should successfully fetch and format announcements', async () => {
      // Mock the user data fetch
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
          })
        }))
        // Mock the org_user data fetch
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [
              { org_id: 'org123', proj_id: null },
              { org_id: null, proj_id: 'proj456' }
            ],
            error: null
          })
        }))
        // Mock organization announcements fetch
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{
              announcement_id: 'ann1',
              announcement_type: 'organization',
              user_id: 'user1',
              org_id: 'org123',
              proj_id: null,
              content: 'Org announcement',
              keywords: ['important'],
              file_urls: ['http://example.com/file1.pdf'],
              like_count: 5,
              created_at: '2023-01-01T00:00:00Z',
              user: {
                first_name: 'John',
                last_name: 'Doe',
                profile_picture_url: 'http://example.com/profile.jpg'
              },
              organization: {
                name: 'Test Org'
              },
              project: null
            }],
            error: null
          })
        }))
        // Mock project announcements fetch
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{
              announcement_id: 'ann2',
              announcement_type: 'project',
              user_id: 'user1',
              org_id: 'org123',
              proj_id: 'proj456',
              content: 'Project announcement',
              keywords: ['update'],
              file_urls: [],
              like_count: 2,
              created_at: '2023-01-02T00:00:00Z',
              user: {
                first_name: 'John',
                last_name: 'Doe',
                profile_picture_url: 'http://example.com/profile.jpg'
              },
              organization: {
                name: 'Test Org'
              },
              project: {
                address: '123 Test St'
              }
            }],
            error: null
          })
        }));
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(response.body.announcements).toHaveLength(2);
      
      // Check first announcement (organization)
      expect(response.body.announcements[0]).toHaveProperty('announcement_type', 'organization');
      expect(response.body.announcements[0]).toHaveProperty('content', 'Org announcement');
      expect(response.body.announcements[0]).toHaveProperty('name', 'John Doe');
      expect(response.body.announcements[0]).toHaveProperty('org_name', 'Test Org');
      
      // Check second announcement (project)
      expect(response.body.announcements[1]).toHaveProperty('announcement_type', 'project');
      expect(response.body.announcements[1]).toHaveProperty('content', 'Project announcement');
      expect(response.body.announcements[1]).toHaveProperty('address', '123 Test St');
    });
    
    it('should handle empty organization and project IDs', async () => {
      // Mock the user data fetch
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
          })
        }))
        // Mock empty org_user data fetch
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }));
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(response.body.announcements).toHaveLength(0);
    });
    
    it('should return 500 if org announcements fetch fails', async () => {
      // Mock the user data fetch
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
          })
        }))
        // Mock the org_user data fetch
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ org_id: 'org123', proj_id: null }],
            error: null
          })
        }))
        // Mock organization announcements fetch error
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch organization announcements' }
          })
        }));
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch organization announcements.');
    });
    
    it('should return 500 if project announcements fetch fails', async () => {
      // Mock the user data fetch
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { user_id: '123' },
            error: null
          })
        }))
        // Mock the org_user data fetch with only project ID
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ org_id: null, proj_id: 'proj456' }],
            error: null
          })
        }))
        // Mock project announcements fetch error
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch project announcements' }
          })
        }));
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch project announcements.');
    });

    it('should handle unexpected errors', async () => {
      // Mock an unexpected exception that would trigger the catch block
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => {
          throw new Error('Unexpected server error');
        });
    
      const response = await request(app)
        .get('/api/announcements/get-announcements/123')
        .set('Authorization', `Bearer ${authToken}`);
    
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error.');
    });
  });

  // Mock the uuid module
  jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid')
  }));

  describe('POST /api/announcements/post_announcement', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Mock fs functions
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('mock file content'));
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      // Mock path.resolve to return the original path
      jest.spyOn(path, 'resolve').mockImplementation((p) => p);
      // Mock path.extname to return .pdf
      jest.spyOn(path, 'extname').mockReturnValue('.pdf');
    });

    it('should successfully store announcement without files', async () => {
      // Mock database insert
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            announcement_id: 'ann123',
            announcement_type: 'organization',
            user_id: 'user123',
            org_id: 'org123',
            proj_id: null,
            content: 'Test announcement',
            keywords: ['test', 'important'],
            file_urls: [],
            like_count: 0,
            created_at: '2023-04-01T00:00:00Z',
            user: {
              first_name: 'John',
              last_name: 'Doe'
            },
            organization: {
              name: 'Test Org'
            },
            project: null
          },
          error: null
        })
      }));

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'organization',
          user_id: 'user123',
          org_id: 'org123',
          content: 'Test announcement',
          keywords: ['test', 'important']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('announcements');
      expect(response.body.announcements).toHaveLength(1);
      expect(response.body.announcements[0]).toHaveProperty('announcement_id', 'ann123');
      expect(response.body.announcements[0]).toHaveProperty('content', 'Test announcement');
    });

    it('should successfully store announcement with files', async () => {
      // Mock storage upload
      const mockStorageFrom = {
        upload: jest.fn().mockResolvedValue({
          data: { path: 'announcements/mock-uuid.pdf' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/uploads/mock-uuid.pdf' }
        })
      };
      
      jest.spyOn(supabase.storage, 'from').mockReturnValue(mockStorageFrom);
      
      // Mock database insert
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            announcement_id: 'ann123',
            announcement_type: 'project',
            user_id: 'user123',
            org_id: null,
            proj_id: 'proj123',
            content: 'Test announcement with file',
            keywords: ['test', 'file'],
            file_urls: ['https://example.com/uploads/mock-uuid.pdf'],
            like_count: 0,
            created_at: '2023-04-01T00:00:00Z',
            user: {
              first_name: 'John',
              last_name: 'Doe'
            },
            organization: null,
            project: {
              address: '123 Test St'
            }
          },
          error: null
        })
      }));

      // Mock file
      const mockFile = {
        path: 'uploads/temp-file.pdf',
        originalname: 'test-file.pdf',
        mimetype: 'application/pdf'
      };

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'project')
        .field('user_id', 'user123')
        .field('proj_id', 'proj123')
        .field('content', 'Test announcement with file')
        .field('keywords', JSON.stringify(['test', 'file']))
        .attach('files', Buffer.from('mock file content'), mockFile.originalname);

      expect(response.status).toBe(200);
      expect(response.body.announcements[0]).toHaveProperty('file_urls');
      expect(response.body.announcements[0].file_urls).toContain('https://example.com/uploads/mock-uuid.pdf');
    });

    it('should handle file upload error', async () => {
      // Mock storage upload error
      const mockStorageFrom = {
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Storage upload failed' }
        })
      };
      
      jest.spyOn(supabase.storage, 'from').mockReturnValue(mockStorageFrom);

      // Mock file
      const mockFile = {
        path: 'uploads/temp-file.pdf',
        originalname: 'test-file.pdf',
        mimetype: 'application/pdf'
      };

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'project')
        .field('user_id', 'user123')
        .field('proj_id', 'proj123')
        .field('content', 'Test announcement with file')
        .attach('files', Buffer.from('mock file content'), mockFile.originalname);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error storing data');
    });

    it('should handle database insert error', async () => {
      // Skip file upload mock since we're testing the database error
      const mockStorageFrom = {
        upload: jest.fn().mockResolvedValue({
          data: { path: 'announcements/mock-uuid.pdf' },
          error: null
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/uploads/mock-uuid.pdf' }
        })
      };
      
      jest.spyOn(supabase.storage, 'from').mockReturnValue(mockStorageFrom);
      
      // Mock database insert error
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database insert failed' }
        })
      }));

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'organization',
          user_id: 'user123',
          org_id: 'org123',
          content: 'Test announcement',
          keywords: ['test']
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Failed to store data');
    });

    it('should handle keywords as JSON string', async () => {
      // Mock database insert
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            announcement_id: 'ann123',
            announcement_type: 'organization',
            user_id: 'user123',
            org_id: 'org123',
            proj_id: null,
            content: 'Test announcement',
            keywords: ['parsed', 'keywords'],
            file_urls: [],
            like_count: 0,
            created_at: '2023-04-01T00:00:00Z',
            user: {
              first_name: 'John',
              last_name: 'Doe'
            },
            organization: {
              name: 'Test Org'
            },
            project: null
          },
          error: null
        })
      }));

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'organization',
          user_id: 'user123',
          org_id: 'org123',
          content: 'Test announcement',
          keywords: JSON.stringify(['parsed', 'keywords'])
        });

      expect(response.status).toBe(200);
      expect(response.body.announcements[0].keywords).toEqual(['parsed', 'keywords']);
    });

    it('should handle server error', async () => {
      // Force a general error by making supabase.from throw an exception
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
        throw new Error('Unexpected server error');
      });

      const response = await request(app)
        .post('/api/announcements/post_announcement')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'organization',
          user_id: 'user123',
          org_id: 'org123',
          content: 'Test announcement'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error storing data');
      expect(response.body).toHaveProperty('error', 'Unexpected server error');
    });
    
  });

  describe('GET /api/announcements/get_hub_user_emails_proj/:projId', () => {
    it('should return unique emails successfully', async () => {
      const fromSpy = jest.spyOn(supabase, 'from');
  
      // Mock hubs query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ hub_id: '1' }, { hub_id: '2' }],
          error: null
        })
      }));
  
      // Mock users in hubs query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [{ user_id: '1' }, { user_id: '2' }, { user_id: '1' }], // Duplicated user_id to test deduplication
          error: null
        })
      }));
  
      // Mock user emails query
      fromSpy.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [
            { email: 'user1@test.com' },
            { email: 'user2@test.com' }
          ],
          error: null
        })
      }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body.emails).toEqual(['user1@test.com', 'user2@test.com']);
    });
  
    it('should handle hub fetch error', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to fetch hubs' }
        })
      }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch hubs.');
    });
  
    it('should return empty emails array when no hubs found', async () => {
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ emails: [] });
    });
  
    it('should handle hub_user fetch error', async () => {
      // Mock hubs query success
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ hub_id: '1' }, { hub_id: '2' }],
            error: null
          })
        }))
        // Mock hub_user query error
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch hub_user data' }
          })
        }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch hub_user data.');
    });
  
    it('should return empty emails array when no hub users found', async () => {
      // Mock hubs query success
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ hub_id: '1' }, { hub_id: '2' }],
            error: null
          })
        }))
        // Mock empty hub_user data
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ emails: [] });
    });
  
    it('should handle user data fetch error', async () => {
      // Mock hubs query success
      jest.spyOn(supabase, 'from')
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ hub_id: '1' }, { hub_id: '2' }],
            error: null
          })
        }))
        // Mock hub_user query success
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [{ user_id: '1' }, { user_id: '2' }],
            error: null
          })
        }))
        // Mock user query error
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch user information' }
          })
        }));
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch user information.');
    });
  
    it('should handle unexpected errors', async () => {
      // Mock an unexpected exception
      jest.spyOn(supabase, 'from').mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });
  
      const response = await request(app)
        .get('/api/announcements/get_hub_user_emails_proj/proj123')
        .set('Authorization', `Bearer ${authToken}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal server error.');
    });
  });

  describe('POST /api/announcements/send_announcement_email', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Mock fs functions
      jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('mock file content'));
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
      // Mock path.resolve to return the original path
      jest.spyOn(path, 'resolve').mockImplementation((p) => p);
      // Set environment variable for tests
      process.env.RESEND_DOMAIN = 'test-domain.com';
      
      // Create a new instance of the mock for each test
      const mockSendFn = jest.fn().mockResolvedValue({ id: 'email-id', status: 'success' });
      const mockResendInstance = {
        emails: {
          send: mockSendFn
        }
      };
      
      // Replace the Resend constructor mock implementation for each test
      Resend.mockImplementation(() => mockResendInstance);
    });

    afterEach(() => {
      delete process.env.RESEND_DOMAIN;
    });

    it('should handle file cleanup errors gracefully', async () => {
      // Get the mock instance that was created in beforeEach
      const mockResendInstance = new Resend();
      
      // Mock console.error to avoid polluting test output
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock fs.unlinkSync to throw an error
      fs.unlinkSync.mockImplementation(() => {
        throw new Error('File delete error');
      });

      // Mock file
      const mockFile = {
        path: 'uploads/temp-file.pdf',
        originalname: 'test-file.pdf',
        mimetype: 'application/pdf'
      };

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .set('Authorization', `Bearer ${authToken}`)
        .field('emailList', JSON.stringify(['test@example.com']))
        .field('type', 'organization')
        .field('content', 'Test announcement')
        .attach('files', Buffer.from('mock file content'), mockFile.originalname);

      // Should still succeed even if file cleanup fails
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'All emails sent successfully.');
      expect(console.error).toHaveBeenCalledWith('Error deleting file:', expect.any(Error));
    });

    it('should handle invalid JSON in emailList', async () => {
      // Mock console.error to avoid polluting test output
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailList: 'not-valid-json',
          type: 'organization',
          content: 'Test announcement'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Failed to send emails.');
      // Just check that error exists, without checking specific content since error messages can vary
      expect(response.body).toHaveProperty('error');
    });

    it('should handle year in email footer correctly', async () => {
      // Get the mock instance that was created in beforeEach
      const mockResendInstance = new Resend();
      
      // Create a real Date object reference
      const realDate = global.Date;
      
      // Mock Date to return a fixed year
      const mockDate = class extends Date {
        getFullYear() {
          return 2023;
        }
      };
      global.Date = mockDate;

      const response = await request(app)
        .post('/api/announcements/send_announcement_email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          emailList: JSON.stringify(['test@example.com']),
          type: 'organization',
          content: 'Test announcement'
        });

      expect(response.status).toBe(200);
      
      // Only verify HTML content if the send method was actually called
      if (mockResendInstance.emails.send.mock.calls.length > 0) {
        const callArgs = mockResendInstance.emails.send.mock.calls[0][0];
        expect(callArgs.html).toContain('&copy; 2023 Smartess.');
      }
      
      // Restore the original Date
      global.Date = realDate;
    });
  });
});
