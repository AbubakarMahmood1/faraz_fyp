const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const signupSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "User name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
  registerAs: {
    type: [String],
    default: ["explorer"],
  },
});

signupSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
signupSchema.methods.correctPassword = async (
  enteredPassword,
  userPasdsword
) => {
  return await bcrypt.compare(enteredPassword, userPasdsword);
};
const Signup = mongoose.model("Signup", signupSchema);
module.exports = Signup;
