const User = require('../../models/user.model');
require('../setup');

describe('User Model', () => {
  describe('Schema validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        registerAs: 'innovator',
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.registerAs).toBe('innovator');
      expect(user.profileCompleted).toBe(false); // Default
      expect(user.isActive).toBe(true); // Default
    });

    it('should fail without required fields', async () => {
      const user = new User({});

      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
        registerAs: 'expert',
      });

      await expect(
        User.create({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password123',
          registerAs: 'innovator',
        })
      ).rejects.toThrow();
    });

    it('should fail with duplicate username', async () => {
      await User.create({
        username: 'duplicate',
        email: 'user1@example.com',
        password: 'password123',
        registerAs: 'investor',
      });

      await expect(
        User.create({
          username: 'duplicate',
          email: 'user2@example.com',
          password: 'password123',
          registerAs: 'innovator',
        })
      ).rejects.toThrow();
    });

    it('should have default values', async () => {
      const user = await User.create({
        username: 'defaulttest',
        email: 'default@example.com',
        password: 'password123',
        registerAs: 'explorer',
      });

      expect(user.profileCompleted).toBe(false);
      expect(user.isActive).toBe(true);
    });
  });

  describe('Password hashing', () => {
    it('should hash password on save', async () => {
      const user = await User.create({
        username: 'hashtest',
        email: 'hash@example.com',
        password: 'plainpassword',
        registerAs: 'innovator',
      });

      expect(user.password).not.toBe('plainpassword');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        username: 'nohash',
        email: 'nohash@example.com',
        password: 'password123',
        registerAs: 'expert',
      });

      const originalHash = user.password;
      user.username = 'updatedhash';
      await user.save();

      expect(user.password).toBe(originalHash);
    });
  });

  describe('correctPassword method', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'passwordtest',
        email: 'password@example.com',
        password: 'testpassword',
        registerAs: 'innovator',
      });
    });

    it('should return true for correct password', async () => {
      const isCorrect = await user.correctPassword('testpassword', user.password);
      expect(isCorrect).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isCorrect = await user.correctPassword('wrongpassword', user.password);
      expect(isCorrect).toBe(false);
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt and updatedAt', async () => {
      const user = await User.create({
        username: 'timestamp',
        email: 'timestamp@example.com',
        password: 'password123',
        registerAs: 'innovator',
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });
});
