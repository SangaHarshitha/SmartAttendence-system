import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";

// ======================
// GET STAFF PROFILE 
// ======================
export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // ✅ Fix: Next.js latest version lo params ni await cheyali
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const staff = await Staff.findById(id).select("-password");
    
    if (!staff) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error("[staff GET Error]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ======================
// UPDATE STAFF (PUT)
// ======================
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const body = await req.json();
    const {
      name, email, password, position,
      branch, academicYear,
      assignedSection, assignedSubjects,
      canMarkAttendance,
    } = body;

    const updateData = {
      name, email,
      position:          position || "",
      branch:            branch || "",
      academicYear:      academicYear || "",
      assignedSection:   assignedSection || "",
      assignedSubjects:  assignedSubjects || [],
      canMarkAttendance: canMarkAttendance || false,
    };

    if (password && password.trim() !== "") {
      updateData.password = password;
    }

    const updated = await Staff.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[staff PUT Error]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ======================
// DELETE STAFF
// ======================
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Staff not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Staff deleted successfully" });
  } catch (error) {
    console.error("[staff DELETE Error]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}