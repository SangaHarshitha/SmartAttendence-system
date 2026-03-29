import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const year   = searchParams.get("year");

    const query = {};
    if (branch) query.branch = branch.toUpperCase();
    if (year)   query.year   = parseInt(year);   // ✅ year is number in DB

    const subjects = await Subject.find(query).sort({ name: 1 });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Subject GET error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, branch, year } = body;

    if (!name || !branch || year === undefined || year === null) {
      return NextResponse.json({ error: "name, branch, and year are required" }, { status: 400 });
    }

    const code = body.code || `${branch}-Y${year}-${name.slice(0, 4).toUpperCase().replace(/\s/g, "")}`;

    const subject = await Subject.findOneAndUpdate(
      { name: name.trim(), branch: branch.toUpperCase(), year: parseInt(year) },
      { $setOnInsert: { name: name.trim(), branch: branch.toUpperCase(), year: parseInt(year), code } },
      { upsert: true, new: true }
    );

    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    console.error("Subject POST error:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 400 });
  }
}