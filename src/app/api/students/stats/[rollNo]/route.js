import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect("mongodb://localhost:27017/attendanceDB");
};

export async function GET(req, { params }) {
  await connectDB();
  const { rollNo } = params;

  try {
    // 1. Find all attendance documents where this student exists in the 'records' array
    const allRecords = await Attendance.find({ "records.rollNo": rollNo });

    if (!allRecords.length) {
      return NextResponse.json({ message: "No attendance data found" }, { status: 404 });
    }

    // 2. Calculate totals
    let totalClasses = allRecords.length;
    let attendedClasses = 0;

    allRecords.forEach(doc => {
      const studentEntry = doc.records.find(r => r.rollNo === rollNo);
      if (studentEntry && studentEntry.status === 'PRESENT') {
        attendedClasses++;
      }
    });

    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2);

    // 3. Return the data in the format your "SmartAttd" UI expects
    return NextResponse.json({
      rollNo,
      totalClasses,
      attendedClasses,
      percentage: parseFloat(percentage),
      status: percentage >= 75 ? "Good" : "Low"
    });

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}