exports.verifyToken = async (req, res, next) => {
  try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
          return res.status(401).json({ error: 'No token provided' });
      }

      req.token = token;
      next();
  } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ error: 'Authentication failed' });
  }
};