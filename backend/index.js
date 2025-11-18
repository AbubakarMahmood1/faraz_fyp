const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authControllers = require("./controllers/auth-controller");
const userControllers = require("./controllers/user-controller");
const { validate } = require("./middleware/validation.middleware");
const { signupSchema, loginSchema } = require("./utils/validators");
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

// Routes with validation
app.post("/api/signup", validate(signupSchema), authControllers.signup);
app.post("/api/login", validate(loginSchema), authControllers.login);
app.get("/api/get-user", userControllers.getUser);
app.get("/api/get-hello", authControllers.hello);

app.listen(process.env.PORT, () => {
  console.log("server is running on port ", process.env.PORT);
});
