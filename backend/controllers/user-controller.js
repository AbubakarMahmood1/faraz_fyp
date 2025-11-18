const Signup = require("./../modal/signup-schema");
exports.getUser = async (req, res) => {
  const { username } = req.body;
  const user = await Signup.findOne({ username });
  try {
    if (user) {
      return res.status(200).json({
        message: "success",
        data: {
          user,
        },
      });
    }
    if (!user) {
      return res.status(404).json({
        message: "fail",
        data: {
          message: "user not found",
        },
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
