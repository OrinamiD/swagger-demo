import jwt, { type JwtPayload } from "jsonwebtoken";

import joi from "joi";
import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import User from "../models/user.model.js";

export const validateSignup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { role, firstName, lastName, email, password, phone } = req.body;

  const errors = [];

  if (!role) {
    errors.push("role is required");
  }
  if (!firstName) {
    errors.push("firstName is required");
  }
  if (!lastName) {
    errors.push("lastName is required");
  }
  if (!email) {
    errors.push("email is required");
  }
  if (!password) {
    errors.push("password is required");
  }
  if (!phone) {
    errors.push("phone is required");
  }

  if (errors.length > 0) {
    return res.status(200).json({ success: false, message: errors });
  }

  const signupSchema = joi.object({
    role: joi.string().required().min(3).max(50),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi
      .string()
      .required()
      .min(4)
      .max(60)
      .pattern(new RegExp("^[^@]+@[^@]+.[^@]+$"))
      .messages({
        "string.pattern.base":
          "Please enter a valid email address (e.g., name@example.com).",
        "string.email": "Please enter a valid email address.",
      }),
    password: joi
      .string()
      .required()
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        ),
      )
      .messages({
        "string.pattern.base":
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      }),
    phone: joi.string().required().min(8).max(15),
  });

  const { error } = signupSchema.validate({
    role,
    firstName,
    lastName,
    email,
    password,
    phone,
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const loginValidation: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { email, phone, password } = req.body as {
    email?: string;
    phone?: string;
    password?: string;
  };

  if (email) email = email.trim().toLowerCase();
  if (phone) phone = phone.trim();

  if (!email && !phone) {
    throw new Error("Provide your email or phone number.");
  }

  if (!password) {
    throw new Error("Incorrect password, email or phone number.");
  }
  next();
};

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid response" });
    }

    const splitToken = token.split(" ");

    const realToken = splitToken[1];

    if (!realToken) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect credentials" });
    }

    const decoded = jwt.verify(
      realToken,
      process.env.ACCESS_TOKEN as string,
    ) as JwtPayload;

    if (!decoded) {
      return res.status(401).json({ success: false, Message: "Forbidden!" });
    }

    req.role = decoded.role;
    req.user = await User.findById(decoded.id);

    const user = await User.findById(decoded?.id);

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "user not found" });
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.error(error.message);
    return res.status(401).json({ success: false, message: error.message });
  }
};

interface AuthRequest extends Request {
  role?: "client" | "admin";
}

export const checkProfileComplete = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isProfileComplete === false) {
      return res.status(403).json({
        success: false,
        message: "Please complete your profile first",
      });
    }

    next();
  } catch (error) {
    console.error("Error checking profile:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
