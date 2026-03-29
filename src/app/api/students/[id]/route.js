import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();

  const updated = await Student.findByIdAndUpdate(
    params.id,
    body,
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(_, { params }) {
  await connectDB();
  await Student.findByIdAndDelete(params.id);

  return NextResponse.json({
    message: "Deleted successfully",
  });
}