const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const profileController = require('../../controllers/profile.controller');
const User = require('../../models/user.model');
const Profile = require('../../models/profile.model');
const { protect } = require('../../middleware/auth.middleware');
require('../setup');

// Mock protect middleware for testing
const mockProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = await User.findById(decoded.id).select('-password');
  }
  next();
};

// Create mini Express app for testing
const app = express();
app.use(express.json());
app.post('/profile/complete', mockProtect, profileController.completeProfile);
app.get('/profile/me', mockProtect, profileController.getMyProfile);
app.put('/profile', mockProtect, profileController.updateProfile);

describe('Profile Controller', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      username: 'profiletest',
      email: 'profile@example.com',
      password: 'password123',
      registerAs: 'innovator',
    });
    userId = user._id;

    // Generate token
    authToken = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
  });

  describe('POST /profile/complete', () => {
    it('should create a profile with valid data', async () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'This is a bio that is definitely more than fifty characters long to pass validation.',
        expertise: ['ai-ml', 'web-dev'],
        skills: ['react', 'nodejs'],
        experienceLevel: '3-5',
      };

      const res = await request(app)
        .post('/profile/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.profile.firstName).toBe('John');
      expect(res.body.data.profile.bio).toBe(profileData.bio);
      expect(res.body.data.user.profileCompleted).toBe(true);

      // Verify user was updated
      const user = await User.findById(userId);
      expect(user.profileCompleted).toBe(true);
    });

    it('should return 400 if profile already exists', async () => {
      // Create initial profile
      await Profile.create({
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      });

      // Try to create another profile
      const res = await request(app)
        .post('/profile/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
          bio: 'Another bio that is definitely more than fifty characters long here.',
        })
        .expect(400);

      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Profile already completed');
    });

    it('should create profile with investor-specific fields', async () => {
      const profileData = {
        firstName: 'Investor',
        lastName: 'User',
        bio: 'I am an investor with lots of experience in various domains and industries.',
        organizationName: 'Invest Corp',
        investingExperience: ['fintech', 'healthtech'],
        experienceLevel: '5+',
      };

      const res = await request(app)
        .post('/profile/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(res.body.data.profile.organizationName).toBe('Invest Corp');
      expect(res.body.data.profile.investingExperience).toEqual(['fintech', 'healthtech']);
    });
  });

  describe('GET /profile/me', () => {
    beforeEach(async () => {
      // Create profile
      await Profile.create({
        user: userId,
        firstName: 'Test',
        lastName: 'User',
        bio: 'This is my test bio that is definitely more than fifty characters long.',
      });
    });

    it('should return user and profile data', async () => {
      const res = await request(app)
        .get('/profile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.profile).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined(); // Password should be excluded
      expect(res.body.data.profile.firstName).toBe('Test');
    });

    it('should return null profile if not completed', async () => {
      // Delete profile
      await Profile.deleteOne({ user: userId });

      const res = await request(app)
        .get('/profile/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.profile).toBeNull();
    });
  });

  describe('PUT /profile', () => {
    beforeEach(async () => {
      // Create profile
      await Profile.create({
        user: userId,
        firstName: 'Original',
        lastName: 'Name',
        bio: 'Original bio that is definitely more than fifty characters long enough.',
      });
    });

    it('should update profile with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        bio: 'Updated bio that is also definitely more than fifty characters long here.',
      };

      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data.profile.firstName).toBe('Updated');
      expect(res.body.data.profile.bio).toBe(updateData.bio);
      expect(res.body.data.profile.lastName).toBe('Name'); // Unchanged field
    });

    it('should return 404 if profile does not exist', async () => {
      // Delete profile
      await Profile.deleteOne({ user: userId });

      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          bio: 'Updated bio that is definitely more than fifty characters long.',
        })
        .expect(404);

      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Profile not found');
    });

    it('should update only provided fields', async () => {
      const res = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ city: 'New York' })
        .expect(200);

      expect(res.body.data.profile.city).toBe('New York');
      expect(res.body.data.profile.firstName).toBe('Original');
      expect(res.body.data.profile.lastName).toBe('Name');
    });
  });
});
