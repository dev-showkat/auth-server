import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

const register = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    if (!email?.trim() || !username?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ message: "Email, Username and Password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = Date.now();
    const user = new User({
      email,
      username,
      password: hashedPassword,
      verificationCode,
    });
    await user.save();
    const link = `${
      process.env.CLIENT
    }/email-verification?code=${verificationCode}&email=${encodeURIComponent(
      email
    )}`;
    await sendEmail({
      email,
      html: `<a href="${link}">Verify your email</a><hr/><p>Your verification code: ${verificationCode}</p>`,
    });
    return res.status(200).json({
      email,
    });
  } catch (error) {
    const { statusCode, message } = error;
    return res
      .status(statusCode || 500)
      .json({ message: message || "Server error" });
  }
};

const emailVerification = async (req, res) => {
  const { verificationCode, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }
    if (user.isVerified) {
      return res.status(200).json({ message: "Account already verified" });
    }
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid Verification Code" });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    return res.status(200).json({ message: "Account Verified" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email });
    if (!user?.isVerified) {
      return res.status(400).json({ message: "Please verify your Email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    const { statusCode, message } = error;
    return res
      .status(statusCode || 500)
      .json({ message: message || "Server error" });
  }
};

const logout = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    return res.status(200).json({
      message: "User logged out",
    });
  } catch (error) {
    const { statusCode, message } = error;
    return res
      .status(statusCode || 500)
      .json({ message: message || "Server error" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }
    const verificationCode = Date.now();
    user.verificationCode = verificationCode;
    const link = `${
      process.env.CLIENT
    }/reset-password?code=${verificationCode}&email=${encodeURIComponent(
      email
    )}`;
    await sendEmail({
      email,
      html: `<a href="${link}">Verify your email</a><hr/><p>Your verification code: ${verificationCode}</p>`,
    });
    await user.save();
    return res.status(200).json({ email });
  } catch (error) {
    const { statusCode, message } = error;
    return res
      .status(statusCode || 500)
      .json({ message: message || "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, password, verificationCode } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid Verification Code" });
    }
    user.password = await bcrypt.hash(password, 12);
    user.verificationCode = null;
    await user.save();
    return res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

export {
  register,
  emailVerification,
  login,
  logout,
  forgetPassword,
  resetPassword,
};
