import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  otp: string;
  otpExpiresAt?: Date;
  isVerified?: boolean;
  availableNow?: boolean;

  isProfileComplete: boolean;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
    },

    otp: {
      type: String,
    },
    otpExpiresAt: { type: Date },

    isVerified: {
      type: Boolean,
      default: false,
    },
    availableNow: {
      type: Boolean,
      default: true,
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
