const jwtDecode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
function getToken(id, registerAs = "") {
  return jwt.sign({ id, registerAs }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
exports.hello = async(req,res)=>{
  return res.status(200).json({
    message:"hello world"
  })
}
//signup request
exports.signup = async (req, res) => {
  try {
    //first check if same email exist
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(409).json({
        status: "fail",
        data: {
          message: "Email already exists",
        },
      });
    }
    //then check if same username exist
    user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(409).json({
        status: "fail",
        data: {
          message: "Username already exists",
        },
      });
    }
    // console.log(req.body);
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      registerAs: req.body.registerAs,
    });
    const token = getToken(newUser._id);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
//login request
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //1) check if body contains email and password
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }
    //2) check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    //3) If everything is ok, send token to client
    const token = getToken(user._id, user.registerAs);
    return res.status(200).json({
      status: "success",
      data: {
        token,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

// Logout
exports.logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCorrect = await user.correctPassword(req.body.currentPassword, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect',
      });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Forgot password (basic version, no email for now)
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that email',
      });
    }

    // TODO: Generate reset token and send email
    // For now, just respond with success
    res.status(200).json({
      status: 'success',
      message: 'Password reset email sent (not implemented yet)',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
