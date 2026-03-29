import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  className: { type: String }, // Required: true theesesaam (api lo generate chesthunnam)
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
}, { timestamps: true });

export default mongoose.models.Class || mongoose.model("Class", ClassSchema);