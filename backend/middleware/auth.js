const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Check if token exists
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user id to request object
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
