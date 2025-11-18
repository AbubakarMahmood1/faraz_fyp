const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup: Connect to in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.9', // Use a stable version that exists
    },
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup: Clear database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Teardown: Disconnect and stop server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
