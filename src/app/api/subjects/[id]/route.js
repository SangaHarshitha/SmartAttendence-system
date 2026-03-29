import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  branch: { type: String, required: true },
  year:   { type: Number, required: true },
});

const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

// DELETE /api/subjects/:id
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    await Subject.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// GET single subject
export async function GET(req, { params }) {
  await connectDB();
  try {
    const subject = await Subject.findById(params.id);
    if (!subject) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(subject);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}