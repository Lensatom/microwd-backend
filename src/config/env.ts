import dotenv from "dotenv";

dotenv.config();

export const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  JWT_SECRET,
  MONGODB_URI,
} = process.env;