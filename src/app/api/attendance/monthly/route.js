import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import MonthlyAttendance from "../../../../models/MonthlyAttendance";
import Staff from "../../../../models/Staff";

// ── GET ── supports both staff view (branch/year/section) and student view (rollNo)
export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const rollNo  = searchParams.get("rollNo");
    const month   = searchParams.get("month");
    const branch  = searchParams.get("branch");
    const year    = searchParams.get("year");
    const section = searchParams.get("section");
    const email   = searchParams.get("email");

    const query = {};

    // ── STUDENT view: fetch ALL records for this rollNo across all months ──
    if (rollNo) {
      // Normalize rollNo — strip leading zeros for matching
      const normalized = String(rollNo).replace(/^0+(?=\d)/, "");
      query.$or = [
        { rollNo: normalized },
        { rollNo: String(rollNo) },
      ];
      const records = await MonthlyAttendance.find(query).sort({ month: -1 });
      return NextResponse.json({ success: true, data: records }, { status: 200 });
    }

    // ── STAFF view via email: look up staff to get branch/section/year ──
    if (email) {
      const staff = await Staff.findOne({ email });
      if (!staff) {
        return NextResponse.json({ error: "Staff not found" }, { status: 404 });
      }
      if (month)   query.month   = month;
      query.branch  = staff.branch;
      query.section = staff.assignedSection;
      query.year    = staff.academicYear;
      const records = await MonthlyAttendance.find(query).sort({ rollNo: 1 });
      return NextResponse.json({ success: true, data: records }, { status: 200 });
    }

    // ── ADMIN/STAFF view via direct params ──
    if (!month || !branch || !year || !section) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }
    query.month   = month;
    query.branch  = branch;
    query.year    = year;
    query.section = section;

    const records = await MonthlyAttendance.find(query).sort({ rollNo: 1 });
    return NextResponse.json({ success: true, data: records }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── POST ── saves monthly attendance uploaded by staff
export async function POST(req) {
  try {
    await connectToDatabase();
    const { month, email, subject, attendance,year } = await req.json();

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return NextResponse.json({ error: "Staff profile not found" }, { status: 404 });
    }

    // Delete old records for this month/subject/section to avoid duplicates
    await MonthlyAttendance.deleteMany({
      month,
      subject,
      section: staff.assignedSection,
      branch:  staff.branch,
    });

    const formattedData = attendance.map((item) => ({
      rollNo:          String(item.rollNo || "").trim(),
      name:            item.name || "Unknown",
      branch:          staff.branch,
      year:            String(year || "1"),
      section:         staff.assignedSection,
      subject:         subject,
      month:           month,
      totalClasses:    Number(item.totalClasses    || 0),
      attendedClasses: Number(item.attendedClasses || 0),
      percentage:      Number(item.percentage      || 0),
      markedBy:        staff._id,
    }));

    await MonthlyAttendance.insertMany(formattedData);
    return NextResponse.json({ success: true, count: formattedData.length }, { status: 200 });

  } catch (error) {
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}