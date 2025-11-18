const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/auth-controller');
const User = require('../../models/user.model');
require('../setup');

// Create mini Express app for testing
const app = express();
app.use(express.json());
app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

describe('Auth Controller', () => {
  describe('POST /signup', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      const res = await request(app)
        .post('/signup')
        .send(userData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.token).toBeDefined();
      expect(res.body.data.user.username).toBe('testuser');
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.password).not.toBe('password123'); // Should be hashed
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
        registerAs: 'expert',
      };

      // Create first user
      await request(app).post('/signup').send(userData);

      // Try to create second user with same email
      const res = await request(app)
        .post('/signup')
        .send({ ...userData, username: 'user2' })
        .expect(409);

      expect(res.body.status).toBe('fail');
      expect(res.body.data.message).toContain('Email already exists');
    });

    it('should return 409 for duplicate username', async () => {
      const userData = {
        username: 'duplicate',
        email: 'user1@example.com',
        password: 'password123',
        registerAs: 'investor',
      };

      // Create first user
      await request(app).post('/signup').send(userData);

      // Try to create second user with same username
      const res = await request(app)
        .post('/signup')
        .send({ ...userData, email: 'user2@example.com' })
        .expect(409);

      expect(res.body.status).toBe('fail');
      expect(res.body.data.message).toContain('Username already exists');
    });

    it('should hash password before saving', async () => {
      const userData = {
        username: 'hashtest',
        email: 'hash@example.com',
        password: 'plainpassword',
        registerAs: 'explorer',
      };

      await request(app).post('/signup').send(userData);

      const user = await User.findOne({ email: 'hash@example.com' });
      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash length
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post('/signup').send({
        username: 'logintest',
        email: 'login@example.com',
        password: 'password123',
        registerAs: 'innovator',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Incorrect email or password');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body.status).toBe('fail');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          password: 'password123',
        })
        .expect(400);

      expect(res.body.status).toBe('fail');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@example.com',
        })
        .expect(400);

      expect(res.body.status).toBe('fail');
    });
  });

  describe('POST /logout', () => {
    it('should return success message', async () => {
      const res = await request(app).post('/logout').expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Logged out successfully');
    });
  });
});
