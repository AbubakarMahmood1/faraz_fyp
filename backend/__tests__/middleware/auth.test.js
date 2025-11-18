const jwt = require('jsonwebtoken');
const { protect, restrictTo } = require('../../middleware/auth.middleware');
const User = require('../../models/user.model');
require('../setup');

describe('Auth Middleware', () => {
  describe('protect', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should attach user to request if valid token', async () => {
      // Create user
      const user = await User.create({
        username: 'authtest',
        email: 'auth@test.com',
        password: 'password123',
        registerAs: 'innovator',
      });

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id.toString()).toBe(user._id.toString());
      expect(req.user.password).toBeUndefined(); // Should be excluded
    });

    it('should return 401 if no token provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'You are not logged in',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalidtoken';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid or expired token',
      });
    });

    it('should return 401 if user no longer exists', async () => {
      // Create and delete user
      const user = await User.create({
        username: 'deleteduser',
        email: 'deleted@test.com',
        password: 'password123',
        registerAs: 'expert',
      });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'test-secret');
      await User.findByIdAndDelete(user._id);

      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User no longer exists',
      });
    });
  });

  describe('restrictTo', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: {
          registerAs: 'innovator',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should call next if user has required role', () => {
      const middleware = restrictTo('innovator', 'expert');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      const middleware = restrictTo('investor', 'expert');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'You do not have permission to perform this action',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should work with single role', () => {
      const middleware = restrictTo('innovator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
