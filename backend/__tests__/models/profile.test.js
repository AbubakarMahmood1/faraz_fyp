const Profile = require('../../models/profile.model');
const User = require('../../models/user.model');
require('../setup');

describe('Profile Model', () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      username: 'profiletest',
      email: 'profile@test.com',
      password: 'password123',
      registerAs: 'innovator',
    });
    userId = user._id;
  });

  describe('Schema validation', () => {
    it('should create a valid profile', async () => {
      const profileData = {
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      };

      const profile = await Profile.create(profileData);

      expect(profile.firstName).toBe('John');
      expect(profile.bio).toBe(profileData.bio);
      expect(profile.user.toString()).toBe(userId.toString());
    });

    it('should fail without required fields', async () => {
      const profile = new Profile({
        user: userId,
      });

      await expect(profile.save()).rejects.toThrow();
    });

    it('should fail with bio shorter than 50 characters', async () => {
      const profile = new Profile({
        user: userId,
        firstName: 'John',
        bio: 'Too short bio',
      });

      await expect(profile.save()).rejects.toThrow();
    });

    it('should enforce unique user constraint', async () => {
      await Profile.create({
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      });

      await expect(
        Profile.create({
          user: userId,
          firstName: 'Jane',
          bio: 'Another bio that is definitely more than fifty characters long.',
        })
      ).rejects.toThrow();
    });

    it('should accept optional fields', async () => {
      const profile = await Profile.create({
        user: userId,
        firstName: 'John',
        lastName: 'Doe',
        bio: 'This is a bio that is definitely more than fifty characters long.',
        gender: 'male',
        phoneNo: '+1234567890',
        country: 'USA',
        city: 'New York',
      });

      expect(profile.lastName).toBe('Doe');
      expect(profile.gender).toBe('male');
      expect(profile.phoneNo).toBe('+1234567890');
    });

    it('should accept expertise and skills arrays', async () => {
      const profile = await Profile.create({
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
        expertise: ['ai-ml', 'web-dev'],
        skills: ['react', 'nodejs', 'python'],
      });

      expect(profile.expertise).toEqual(['ai-ml', 'web-dev']);
      expect(profile.skills).toHaveLength(3);
    });

    it('should accept investor-specific fields', async () => {
      const profile = await Profile.create({
        user: userId,
        firstName: 'Investor',
        bio: 'I am an investor with lots of experience in various domains.',
        organizationName: 'Invest Corp',
        investingExperience: ['fintech', 'healthtech'],
      });

      expect(profile.organizationName).toBe('Invest Corp');
      expect(profile.investingExperience).toEqual(['fintech', 'healthtech']);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const profile = await Profile.create({
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      });

      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
    });

    it('should have completedAt with default value', async () => {
      const profile = await Profile.create({
        user: userId,
        firstName: 'John',
        bio: 'This is a bio that is definitely more than fifty characters long.',
      });

      expect(profile.completedAt).toBeDefined();
      expect(profile.completedAt).toBeInstanceOf(Date);
    });
  });
});
