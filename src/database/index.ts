import mongoose from "mongoose";
import { MONGODB_URI } from "../config/env";

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
      autoIndex: true,
    });

    console.log("Mongoose connected to MongoDB");

    mongoose.connection.on("error", (err) => {
      console.error("Mongo connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongo connection disconnected");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB via Mongoose:", err);
    throw err;
  }
}