import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Staff from "@/models/Staff";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect("mongodb://localhost:27017/attendanceDB");
    console.log("MongoDB Connected (Staff)");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

// ✅ GET ALL STAFF
export async function GET() {
  await connectDB();

  try {
    const staff = await Staff.find().sort({ branch: 1 });
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

// ✅ CREATE STAFF
export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    // Ensure assignedSubjects is always an array
    if (body.assignedSubjects && typeof body.assignedSubjects === "string") {
      body.assignedSubjects = body.assignedSubjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    } else if (!body.assignedSubjects) {
      body.assignedSubjects = [];
    }

    const newStaff = await Staff.create(body);

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error("Save Error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Invalid data" },
      { status: 400 }
    );
  }
}

// ✅ DELETE STAFF
export async function DELETE(req) {
  await connectDB();

  try {
    const { id } = await req.json();
    await Staff.findByIdAndDelete(id);

    return NextResponse.json({ message: "Staff deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

// 🔥🔥🔥 IMPORTANT: STAFF PROFILE API (NEW)
export async function PUT(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    const staff = await Staff.findOne({ email });

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: staff.name,
      email: staff.email,
      branch: staff.branch,
      year: staff.academicYear,
      section: staff.assignedSection,
      subjects: staff.assignedSubjects,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}