import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// ── Marks Schema ──────────────────────────────────────────────────────────────
const MarksSchema = new mongoose.Schema(
  {
    studentId:    { type: String, required: true },
    studentName:  { type: String },
    rollNo:       { type: String },
    classId:      { type: String },
    branch:       { type: String },
    section:      { type: String },
    academicYear: { type: String },
    year:         { type: String },
    subject:      { type: String, required: true },
    examType:     { type: String, required: true }, // "Mid-1","Mid-2","Semester","Assignment"
    marks:        { type: Number },
    maxMarks:     { type: Number },
  },
  { timestamps: true }
);

// Unique per student+subject+examType
MarksSchema.index({ studentId: 1, subject: 1, examType: 1 }, { unique: true });

delete mongoose.models.Marks;
const Marks = mongoose.model("Marks", MarksSchema);

// ── GET — fetch marks by filters ─────────────────────────────────────────────
export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const query = {};
    if (searchParams.get("classId"))   query.classId   = searchParams.get("classId");
    if (searchParams.get("subject"))   query.subject   = searchParams.get("subject");
    if (searchParams.get("examType"))  query.examType  = searchParams.get("examType");
    if (searchParams.get("studentId")) query.studentId = searchParams.get("studentId");
    if (searchParams.get("section"))   query.section   = searchParams.get("section");
    if (searchParams.get("branch"))    query.branch    = searchParams.get("branch");

    const marks = await Marks.find(query);
    return NextResponse.json(marks);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// ── POST — upsert array of marks records ─────────────────────────────────────
export async function POST(request) {
  await connectDB();
  try {
    const records = await request.json();
    if (!Array.isArray(records)) {
      return NextResponse.json({ message: "Expected an array" }, { status: 400 });
    }

    const ops = records.map(r => ({
      updateOne: {
        filter: {
          studentId: r.studentId,
          subject:   r.subject,
          examType:  r.examType,
        },
        update: { $set: r },
        upsert: true,
      },
    }));

    const result = await Marks.bulkWrite(ops);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("[marks POST]", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}