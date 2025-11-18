const { validate } = require('../../middleware/validation.middleware');
const { signupSchema, loginSchema, completeProfileSchema } = require('../../utils/validators');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('signup validation', () => {
    it('should call next with valid signup data', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      const middleware = validate(signupSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email', () => {
      req.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        registerAs: 'innovator',
      };

      const middleware = validate(signupSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for short username', () => {
      req.body = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      const middleware = validate(signupSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for short password', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
        registerAs: 'innovator',
      };

      const middleware = validate(signupSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid registerAs', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'invalid_role',
      };

      const middleware = validate(signupSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('login validation', () => {
    it('should call next with valid login data', () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for missing email', () => {
      req.body = {
        password: 'password123',
      };

      const middleware = validate(loginSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('profile validation', () => {
    it('should call next with valid profile data', () => {
      req.body = {
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      };

      const middleware = validate(completeProfileSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for short bio', () => {
      req.body = {
        firstName: 'John',
        bio: 'Too short',
      };

      const middleware = validate(completeProfileSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should accept optional fields', () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'This is a bio that is definitely more than fifty characters long.',
        expertise: ['ai-ml', 'web-dev'],
        skills: ['react', 'nodejs'],
      };

      const middleware = validate(completeProfileSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
