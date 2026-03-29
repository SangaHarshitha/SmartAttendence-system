import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/db";
import MonthlyAttendance from "../../../../../models/MonthlyAttendance";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rollNumber = searchParams.get("rollNumber");

    await connectToDatabase();
    
    // Fetch all records for this student, sorted by newest month first
    const history = await MonthlyAttendance.find({ rollNumber }).sort({ month: -1 });

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}