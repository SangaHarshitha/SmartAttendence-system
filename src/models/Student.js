import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  rollNo:   { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  branch:   { type: String, required: true },
  year:     { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);