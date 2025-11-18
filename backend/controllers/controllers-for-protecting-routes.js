const Signup = require("./../modal/signup-schema");

exports.protectSignup = async (req, res, next) => {
  try {
    const { email, username } = req.body;
    let user = await Signup.findOne({ email });
    if (user) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "email already exist",
        },
      });
    }
    user = await Signup.findOne({ username });
    if (user) {
      return res.status(400).json({
        status: "fail",
        data: {
          message: "username already exist",
        },
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
