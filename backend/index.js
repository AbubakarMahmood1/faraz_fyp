const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authControllers = require("./controllers/auth-controller");
const userControllers = require("./controllers/user-controller");
const { validate } = require("./middleware/validation.middleware");
const { signupSchema, loginSchema } = require("./utils/validators");
const { protect } = require("./middleware/auth.middleware");
const profileRoutes = require("./routes/profile.routes");
const userRoutes = require("./routes/user.routes");
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

// CORS configuration - restrict to frontend only
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Auth routes (public)
app.post("/api/signup", validate(signupSchema), authControllers.signup);
app.post("/api/login", validate(loginSchema), authControllers.login);
app.post("/api/password/forgot", authControllers.forgotPassword);
app.get("/api/get-hello", authControllers.hello);

// Auth routes (protected)
app.post("/api/logout", protect, authControllers.logout);
app.patch("/api/users/update-password", protect, authControllers.updatePassword);

// Resource routes
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);

// Legacy route (deprecated - use /api/users/:username instead)
app.get("/api/get-user", userControllers.getUser);

app.listen(process.env.PORT, () => {
  console.log("server is running on port ", process.env.PORT);
});
