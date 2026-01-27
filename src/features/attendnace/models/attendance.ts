import { model, Schema } from "mongoose";

const attendanceSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  event_id: { type: String, required: true, ref: 'Event' },
  additionalInfo: { type: [{field: String, value: String}] },
  user_id: { type: String, required: true, ref: 'User' },
  created_at: { type: Date, default: Date.now },
})

const Attendance = model('Attendance', attendanceSchema);

export { Attendance };