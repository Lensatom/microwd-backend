import { model, Schema } from "mongoose";

const eventSchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  additionalInfoFields: { type: [String] },
  user_id: { type: String, required: true, ref: 'User' },
  isDeleted: { type: Boolean, default: false }
})

export const Event = model('Event', eventSchema);