import { model, Schema } from "mongoose";

const attendanceSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  event_id: { type: String, required: true, ref: 'Event' },
  additionalInfo: { type: [{key: String, value: String}] }
})

const Attendance = model('Attendance', attendanceSchema);

export { Attendance };
