const jwtDecode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const Signup = require("./../modal/signup-schema");
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
    let user = await Signup.findOne({ email: req.body.email });
    if (user) {
      return res.status(401).json({
        status: "fail",
        data: {
          message: "email already exist",
        },
      });
    }
    //then check if same username exist
    user = await Signup.findOne({ username: req.body.username });
    if (user) {
      return res.status(402).json({
        status: "fail",
        data: {
          message: "username already exist",
        },
      });
    }
    // console.log(req.body);
    const newUser = await Signup.create({
      ...req.body,
      registerAs: [req.body.registerAs],
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
    const user = await Signup.findOne({ email }).select("+password");
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
// //route for getting user roles
// exports.getRole = (req, res) => {
//   const
// };
