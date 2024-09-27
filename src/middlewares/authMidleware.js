import jwt from "jsonwebtoken";

const isAuthorized = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]
      : null;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided" });
  }
  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    req._id = _id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export { isAuthorized };
