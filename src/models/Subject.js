import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  code:   { type: String, default: "" },       // made optional so seeding doesn't fail
  branch: { type: String, required: true },
  year:   { type: Number, required: true },    // ← ADDED: stored as integer 1/2/3/4
});

// Compound unique index: same subject name can exist in different branch/year combos
SubjectSchema.index({ name: 1, branch: 1, year: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
