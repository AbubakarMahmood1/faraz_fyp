const User = require("../models/user.model");

exports.getUser = async (req, res) => {
  try {
    const { username } = req.query; // Fixed: Changed from req.body to req.query for GET request

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
