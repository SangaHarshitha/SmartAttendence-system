import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Branch from "@/models/Branch";

export async function GET() {
  try {
    await connectToDatabase();
    const branches = await Branch.find({}).sort({ code: 1 });
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, code } = body;
    if (!name || !code) {
      return NextResponse.json({ error: "name and code are required" }, { status: 400 });
    }
    const branch = await Branch.create({ name: name.trim().toUpperCase(), code: code.trim().toUpperCase() });
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Branch already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}