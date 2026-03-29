import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Staff from "@/models/Staff";
import jwt from "jsonwebtoken";

export async function POST(request) {
  await connectDB();
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });

    const staff = await Staff.findOne({ email });
    if (!staff)
      return NextResponse.json({ message: "Staff account not found" }, { status: 404 });

    // plain text compare (add bcrypt later)
    if (staff.password !== password)
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });

    const token = jwt.sign(
      { id: staff._id, role: "lecturer" },
      process.env.JWT_SECRET || "smartattd_secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        _id:              staff._id,
        name:             staff.name,
        email:            staff.email,
        role:             "lecturer",
        position:         staff.position,
        branch:           staff.branch,
        academicYear:     staff.academicYear,
        assignedSection:  staff.assignedSection,
        assignedSubjects: staff.assignedSubjects,
        canMarkAttendance: staff.canMarkAttendance,
      },
    });
  } catch (err) {
    console.error("Lecturer login error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}