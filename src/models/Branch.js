import mongoose from "mongoose";
const BranchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Computer Science"
  code: { type: String, required: true, unique: true }, // e.g., "CSE"
});
export default mongoose.models.Branch || mongoose.model("Branch", BranchSchema);