import { Router } from "express";
import {
  login,
  register,
  logout,
  forgetPassword,
  emailVerification,
  resetPassword,
} from "../controllers/authController.js";
import { isAuthorized } from "../middlewares/authMidleware.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/email-verification", emailVerification);
authRouter.post("/logout", isAuthorized, logout);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
