import type { Request, Response } from "express";
import {
  forgotPassword,
  login,
  passwordReset,
  registerUser,
  resendOtp,
  verifyOtp,
} from "../services/auth.service.js";

export const registration = async (req: Request, res: Response) => {
  try {
    const { user } = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful, check your email",
      user: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
        gender: user?.gender,
        id: user?._id,
        role: user?.role,

        verified: user?.isVerified,
        available: user?.availableNow,
      },
    });
  } catch (error: any) {
    if (error.message === "User already exists") {
      return res.status(400).json({ success: false, message: error.message });
    } else
      return res.status(500).json({ success: false, message: error.message });
  }
};

export const otpVerification = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const users = await verifyOtp(email, otp);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully. Login to your account",
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, phone } = req.body;

    const { user, accessToken, refreshToken } = await login(
      email,
      password,
      phone,
    );

    return res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,

          id: user?._id,
          role: user?.role,

          verified: user.isVerified,
          available: user.availableNow,
          isProfileComplete: user.isProfileComplete,
        },

        accessToken,
      });
  } catch (error: any) {
    if (error.message === "User not found.") {
      return res.status(404).json({ success: false, message: error.message });
    } else if (error.message === "Incorrect email or password.") {
      return res.status(400).json({ success: false, message: error.message });
    } else {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const handleForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const forgottenPassword = await forgotPassword(email);

    return res.status(200).json({
      success: true,
      message: "Forgot password email sent successfully",
      forgottenPassword,
    });
  } catch (error: any) {
    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const handleResetPassword = async (req: Request, res: Response) => {
  try {
    const { otp, password } = req.body;

    const resetPassword = await passwordReset(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      resetPassword,
    });
  } catch (error: any) {
    console.error(error.message);
    if (error.message === "User not found") {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    } else {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export const handleResendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const newOtp = await resendOtp(req.body);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully.",
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
