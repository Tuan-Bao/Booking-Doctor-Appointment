import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import UnauthorizedError from "../errors/unauthorized.js";

configDotenv({ path: "src/.env" });

const authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authentication Invalid"));
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      user_id: decoded.user_id,
      username: decoded.username,
    };
    next();
  } catch (error) {
    return next(new UnauthorizedError("Authentication Invalid"));
  }
};

export default authentication;
