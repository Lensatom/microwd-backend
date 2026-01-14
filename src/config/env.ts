import dotenv from "dotenv";

dotenv.config();

export const {
  CLIENT_ID,
  CLIENT_SECRET,
  JWT_SECRET,
} = process.env;