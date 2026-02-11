import mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

export const port = `${process.env.PORT}` || 5000;

export const connetdedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string).then(() => {
      console.log("mongosDB connected successfully");
    });
  } catch (error) {
    console.log(error);
  }
};
