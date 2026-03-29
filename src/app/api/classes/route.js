import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Class from "@/models/Class";
import Student from "@/models/Student";

export async function GET(request) {
  await connectDB();
  try {
    const { searchParams } = new URL(request.url);
    const query = {};
    if (searchParams.get("branch")) query.branch = searchParams.get("branch");
    if (searchParams.get("section")) query.section = searchParams.get("section");
    if (searchParams.get("year")) query.year = String(searchParams.get("year"));
    if (searchParams.get("academicYear")) query.academicYear = searchParams.get("academicYear");

    const classes = await Class.find(query).populate("students");
    return NextResponse.json(classes);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// Ee POST function unteనే 405 error podhu
export async function POST(request) {
  await connectDB();
  try {
    const body = await request.json();
    const newClass = await Class.create(body);
    return NextResponse.json(newClass, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}