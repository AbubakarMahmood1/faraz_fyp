const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authControllers = require("./controllers/auth-controller");
const userControllers = require("./controllers/user-controller");
require("dotenv").config({ path: "./config.env" });

//database connection
const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
console.log(DB);
mongoose
  .connect(DB)
  .then((con) => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(cors());
app.use(express.json());
//signup request
app.post("/api/signup", authControllers.signup);
app.post("/api/login", authControllers.login);
app.get("/api/get-user", userControllers.getUser);
app.get("/api/get-hello",authControllers.hello);

app.listen(process.env.PORT, () => {
  console.log("server is running on port ", process.env.PORT);
});
