const { verifyToken } = require('../../middleware/middleware');

describe('Auth Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('should handle errors and return 401', async () => {
        mockReq.headers = undefined;

        await verifyToken(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors during token processing', async () => {
        mockReq = {
            get headers() {
                throw new Error('Unexpected error');
            }
        };

        await verifyToken(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});