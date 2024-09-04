import bcrypt from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/User.model.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendPasswordResentEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ sucess: false, message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    generateTokenAndSetCookie(res, user.id);

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      sucess: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    generateTokenAndSetCookie(res, user._id);

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      sucess: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verify email", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.status(400).send("Please provide email and password.");
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid === false) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in sucessfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Error in login", error);
    res.status(400).json({ sucess: false, message: error.message });
  }
};
const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ sucess: true, message: "Logged out successfully" });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;

    await user.save();

    // send email
    await sendPasswordResentEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({sucess: true, message: "Password reset lint sent to you email"});
  } catch (error) {
    console.log("Error in forgetPassword", error);
    res.status(400).json({success: false, message: error.message});
  }
};

const resetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        });
        if(!user) {
            return res.status(400).json({success: false, message: "Invalid or expired reset token"})
        }

        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({success: true, message: "Password reset successfully"});
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(400).json({Sucess: false, message: error.message})
    }
}

const checkAuth = async (req, res) => {
    console.log(req.userId)
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user) {
            return res.status(400).json({success: false, message: "User not found"});
        }

        res.status(200).json({success: true, user})
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({success: false, message: error.message})
    }
}

export { signup, login, logout, verifyEmail, forgetPassword, resetPassword, checkAuth };
