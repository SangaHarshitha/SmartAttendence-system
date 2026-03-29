import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Student from "@/models/Student";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/attendanceDB");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
};

// ✅ FETCH ALL STUDENTS (with optional filters)
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const branch  = searchParams.get("branch");
    const year    = searchParams.get("year");
    const section = searchParams.get("section");

    const filter = {};
    if (branch)  filter.branch  = branch;
    if (year)    filter.year    = year;
    if (section) filter.section = section;

    const students = await Student.find(filter).sort({ createdAt: -1 }).lean();

    // Always return a plain array
    return NextResponse.json(Array.isArray(students) ? students : []);
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// ✅ CREATE NEW STUDENT
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();
    const { name, rollNo, email, branch, year, section, password } = body;

    // Validate required fields
    if (!name || !rollNo || !email || !branch || !year || !password) {
      return NextResponse.json(
        { error: "All fields are required (name, rollNo, email, branch, year, password)" },
        { status: 400 }
      );
    }

    const newStudent = await Student.create({
      name, rollNo, email, branch, year,
      section: section || "",
      password,
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Students POST error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return NextResponse.json(
        { error: `A student with this ${field} already exists.` },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || "Save failed" }, { status: 500 });
  }
}

// ✅ DELETE STUDENT
export async function DELETE(req) {
  await connectDB();

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Student.findByIdAndDelete(id);
    return NextResponse.json({ message: "Student deleted" }, { status: 200 });
  } catch (error) {
    console.error("Students DELETE error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
