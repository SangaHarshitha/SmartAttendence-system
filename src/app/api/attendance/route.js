// app/api/attendance/monthly/route.js  ← move it here, or keep path but fix the imports

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MonthlyAttendance from "@/models/MonthlyAttendance"; // ✅ correct model

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ success: false, error: "No data provided" }, { status: 400 });
    }

    // Delete existing records for same month/subject/section to avoid duplicates
    const { month, subject, section, year, branch } = data[0];
    await MonthlyAttendance.deleteMany({ month, subject, section, year, branch }); // ✅ now works

    const records = await MonthlyAttendance.insertMany(data);
    return NextResponse.json({ success: true, count: records.length });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const subject = searchParams.get("subject");
    const section = searchParams.get("section");
    const year = searchParams.get("year");
    const branch = searchParams.get("branch");

    const query = {};
    if (month) query.month = month;
    if (subject) query.subject = subject;
    if (section) query.section = section;
    if (year) query.year = year;
    if (branch) query.branch = branch;

    const records = await MonthlyAttendance.find(query).sort({ rollNo: 1 });
    return NextResponse.json({ success: true, data: records });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}