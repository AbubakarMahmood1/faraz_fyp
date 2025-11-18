const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const authControllers = require("./controllers/auth-controller");
const userControllers = require("./controllers/user-controller");
const { validate } = require("./middleware/validation.middleware");
const { signupSchema, loginSchema } = require("./utils/validators");
const { protect } = require("./middleware/auth.middleware");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter.middleware");
const { globalErrorHandler, notFoundHandler } = require("./middleware/error.middleware");
const profileRoutes = require("./routes/profile.routes");
const userRoutes = require("./routes/user.routes");
const verificationRoutes = require("./routes/verification.routes");
const searchRoutes = require("./routes/search.routes");
const connectionRoutes = require("./routes/connection.routes");
const activityRoutes = require("./routes/activity.routes");
const messageRoutes = require("./routes/message.routes");
require("dotenv").config({ path: "./.env" });

//database connection
const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
console.log("✓ Database connection string configured");
mongoose
  .connect(DB)
  .then((con) => {
    console.log("✓ Database connected successfully");
  })
  .catch((err) => {
    console.error("✗ Database connection failed:", err.message);
  });

const app = express();

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration - restrict to frontend only
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Auth routes (public) - with rate limiting
app.post("/api/signup", authLimiter, validate(signupSchema), authControllers.signup);
app.post("/api/login", authLimiter, validate(loginSchema), authControllers.login);
app.post("/api/social-login", authLimiter, authControllers.socialLogin);
app.post("/api/password/forgot", authLimiter, authControllers.forgotPassword);
app.post("/api/password/reset/:token", authLimiter, authControllers.resetPassword);
app.get("/api/get-hello", authControllers.hello);

// Auth routes (protected)
app.post("/api/logout", protect, authControllers.logout);
app.patch("/api/users/update-password", protect, authControllers.updatePassword);

// Email verification routes
app.use("/api/auth", verificationRoutes);

// Resource routes with general API rate limiting
app.use("/api/profile", apiLimiter, profileRoutes);
app.use("/api/users", apiLimiter, userRoutes);

// Phase 5: Social Features (all require authentication - handled in route files)
app.use("/api/search", apiLimiter, searchRoutes);
app.use("/api/connections", apiLimiter, connectionRoutes);
app.use("/api/activities", apiLimiter, activityRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

// Legacy route (deprecated - use /api/users/:username instead)
app.get("/api/get-user", userControllers.getUser);

// 404 handler for undefined routes
app.all('*', notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log("✓ Server is running on port", process.env.PORT);
  console.log("✓ Environment:", process.env.NODE_ENV || 'development');
});
