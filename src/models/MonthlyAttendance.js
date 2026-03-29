import mongoose from "mongoose";

const MonthlyAttendanceSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  name: { type: String, default: "Unknown" },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  subject: { type: String, required: true },
  month: { type: String, required: true },
  totalClasses: { type: Number, default: 0 },
  attendedClasses: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" }
}, { timestamps: true });

export default mongoose.models.MonthlyAttendance || mongoose.model("MonthlyAttendance", MonthlyAttendanceSchema);