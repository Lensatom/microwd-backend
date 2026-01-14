import { model, Schema } from "mongoose";

const userSchema = new Schema({
  google_id: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  provider: { type: String, enum: ['google', 'local'], default: 'local' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  otp: { type: String },
  otp_expiry: { type: Date },
  is_verified: { type: Boolean, default: false }
})

export const User = model('User', userSchema);