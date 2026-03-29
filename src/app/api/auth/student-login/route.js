// import mongoose from "mongoose";

// const StudentSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     rollNo: { type: String, unique: true },
//     email: { type: String, unique: true },
//     password: { type: String, required: true },
//     section: String,
//     academicYear: String,
//     branch: String,
//     year: Number,
//     role: { type: String, default: "student" },
//   },
//   { timestamps: true }
// );

// export default mongoose.models.Student ||
//   mongoose.model("Student", StudentSchema);
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ── Inline Student model (checks standalone students collection) ──────────────
const StudentSchema = new mongoose.Schema({
  name:         { type: String },
  rollNo:       { type: String },
  email:        { type: String },
  password:     { type: String },
  section:      String,
  academicYear: String,
  branch:       String,
  year:         Number,
  role:         { type: String, default: "student" },
});
const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

// ── Inline Class model (checks students embedded in classes) ──────────────────
const ClassSchema = new mongoose.Schema({
  academicYear: String,
  branch:       String,
  section:      String,
  students: [{
    name:     String,
    rollNo:   String,
    email:    String,
    password: String,
    year:     Number,
    branch:   String,
  }],
});
const Class = mongoose.models.Class || mongoose.model("Class", ClassSchema);

export async function POST(request) {
  await connectDB();
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });

    // ── 1. Check standalone Student collection first ───────────────────────
    const student = await Student.findOne({
      $or: [{ email }, { rollNo: email }],
    });

    if (student && student.password === password) {
      const token = jwt.sign(
        { id: student._id, role: "student" },
        process.env.JWT_SECRET || "smartattd_secret",
        { expiresIn: "7d" }
      );
      return NextResponse.json({
        token,
        user: {
          _id:          student._id,
          name:         student.name,
          email:        student.email,
          rollNo:       student.rollNo,
          role:         "student",
          branch:       student.branch,
          section:      student.section,
          academicYear: student.academicYear,
          year:         student.year,
        },
      });
    }

    // ── 2. Check students embedded inside Class documents ─────────────────
    const classes = await Class.find({});
    for (const cls of classes) {
      const found = cls.students.find(
        (s) => (s.email === email || s.rollNo === email) && s.password === password
      );
      if (found) {
        const token = jwt.sign(
          { id: found._id, role: "student" },
          process.env.JWT_SECRET || "smartattd_secret",
          { expiresIn: "7d" }
        );
        return NextResponse.json({
          token,
          user: {
            _id:          found._id,
            name:         found.name,
            email:        found.email,
            rollNo:       found.rollNo,
            role:         "student",
            branch:       cls.branch,
            section:      cls.section,
            academicYear: cls.academicYear,
            year:         found.year,
          },
        });
      }
    }

    return NextResponse.json({ message: "Invalid email/rollNo or password" }, { status: 401 });

  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}