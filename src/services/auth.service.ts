import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { IUser } from "../models/user.model.js";
import User from "../models/user.model.js";
import { generateOTP, handleHashedPassword } from "../utils/hashedPassword.js";

import { registrationEmail } from "../emails/registrationEmail.js";
import type { RequestEmail, RequestPassword } from "../types/auth.types.js";
import { resendOtpEmail } from "../emails/resendEmail.js";
import { forgottenPasswordEmail } from "../emails/forgottenPassword.js";

export const registerUser = async (data: IUser) => {
  const { email, phone, password, firstName, lastName } = data;

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashed = await handleHashedPassword(password);

  const otp = generateOTP();

  const newUser = new User({
    ...data,
    password: hashed,
    otp,
    otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const savedUser = await newUser.save();

  (savedUser as any).password = undefined;

  if (!savedUser?._id) {
    throw new Error("User ID missing — wallet cannot be created");
  }

  await registrationEmail(email, firstName, lastName, otp);

  const userObj = savedUser.toObject();

  return { user: userObj };
};

export const login = async (email: string, password: string, phone: string) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (!existingUser) {
      throw new Error("User not found.");
    }

    if (!existingUser.isVerified) {
      throw new Error("Account not verified. Please check your email for OTP.");
    }

    const isMatch = await bcrypt.compare(password, existingUser?.password);
    if (!isMatch) {
      throw new Error("Incorrect email or password.");
    }

    (existingUser as any).password = undefined;

    const accessToken = jwt.sign(
      { id: existingUser?._id, role: existingUser.role },
      `${process.env.ACCESS_TOKEN}`,
      { expiresIn: "5m" },
    );

    const refreshToken = jwt.sign(
      { id: existingUser?._id, role: existingUser.role },
      `${process.env.REFRESH_TOKEN}`,
      { expiresIn: "7d" },
    );

    const userObject = existingUser.toObject();

    return {
      message: "Account verified successfully.",
      user: userObject,
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  if (!otp) {
    throw new Error("otp is required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.otp || !user.otpExpiresAt) {
    throw new Error("No OTP set");
  }

  if (user.otpExpiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid OTP.");
  }

  user.isVerified = true;

  await user.save();

  return user;
};

export const resendOtp = async (data: IUser) => {
  const { email } = data;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    if (user.isVerified) throw new Error("User already verified");

    const newOtp = generateOTP();

    user.otp = newOtp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await resendOtpEmail(email, newOtp);

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const forgotPassword = async (data: RequestEmail) => {
  try {
    const { email } = data;
    if (!email) {
      throw new Error("Email not provided");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const firstName = user.firstName;
    const lastName = user.lastName;
    const fullName = `${firstName} ${lastName}`;

    const forgotPasswordData = {
      email: email,
      fullName: fullName,
    };

    const otp = generateOTP();

    await forgottenPasswordEmail(email, firstName, lastName, otp);

    console.log(`✅ Forgot password email sent to: ${email}`);

    return forgotPasswordData;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const passwordReset = async (data: RequestPassword) => {
  try {
    const { password, otp } = data;

    if (!password || !otp) {
      throw new Error("Password reset credential missing");
    }

    const user = await User.findOne({ otp });

    if (!user) {
      throw new Error("Invalid OTP");
    }

    const hashedPassword = await handleHashedPassword(password);

    user.password = hashedPassword;

    await user.save();
  } catch (error: any) {
    console.error(error.message);
    throw new Error(error.message);
  }
};
