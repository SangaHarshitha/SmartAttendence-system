import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: {
      type: String,
      enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Instructor", ""],
      default: "Lecturer",
    },
    branch: { type: String, default: "" },
    academicYear: { type: String, default: "" },
    classAcademicYear: { type: String, default: "2024-2025" },
    assignedSection: { type: String, default: "" },
    assignedSubjects: [{ type: String }],
    canMarkAttendance: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// This check prevents Mongoose from trying to re-compile the model on every refresh
const Staff = mongoose.models.Staff || mongoose.model("Staff", StaffSchema);

export default Staff; // THIS LINE IS CRITICAL