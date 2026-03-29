import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Branch from "@/models/Branch";
import Subject from "@/models/Subject";

export async function DELETE(req, { params }) {
  try {
    await connectToDatabase();
    const branch = await Branch.findByIdAndDelete(params.id);
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    // Also delete all subjects for this branch
    await Subject.deleteMany({ branch: branch.code || branch.name });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}