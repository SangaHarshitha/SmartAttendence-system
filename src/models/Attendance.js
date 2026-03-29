import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  year: { type: String, required: true },
  branch: { type: String, required: true },
  subject: { type: String, required: true },
  totalClasses: { type: Number, required: true },
  attendedClasses: { type: Number, required: true },
}, { timestamps: true });

attendanceSchema.virtual('percentage').get(function () {
  return Math.round((this.attendedClasses / this.totalClasses) * 100);
});

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);