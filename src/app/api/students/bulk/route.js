import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import Student from "../../../../models/Student";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { students } = await req.json();

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No student data provided" }, { status: 400 });
    }

    // Filter out students with missing required fields
    const valid = students.filter(s => s.name && s.rollNo && s.branch);
    if (valid.length === 0) {
      return NextResponse.json({ error: "No valid student records found. Check your Excel columns: Full Name, Roll Number, Branch are required." }, { status: 400 });
    }

    // Insert new students, skip duplicates (same rollNo)
    let inserted = 0;
    let skipped  = 0;
    const savedStudents = [];

    for (const s of valid) {
      try {
        const exists = await Student.findOne({ rollNo: s.rollNo });
        if (exists) { skipped++; continue; }
        const created = await Student.create({
          name:     s.name.trim(),
          rollNo:   String(s.rollNo).trim(),
          email:    s.email?.trim()    || `${s.rollNo}@college.com`,
          password: s.password?.trim() || "Student@123",
          branch:   s.branch.trim().toUpperCase(),
          year:     s.year?.trim()     || "Year 1",
        });
        savedStudents.push(created);
        inserted++;
      } catch (e) {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      inserted,
      skipped,
      students: savedStudents,
    }, { status: 200 });

  } catch (error) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload students." }, { status: 500 });
  }
}