import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ✅ Third argument forces collection name to "admin" (not "admins")
const AdminSchema = new mongoose.Schema({
  name:     { type: String },
  email:    { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String },
});
// ✅ Replace with this — forces correct collection every time
delete mongoose.models.Admin;
const Admin = mongoose.model("Admin", AdminSchema, "admin");

export async function POST(request) {
  await connectDB();
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ message: "Email and password required" }, { status: 400 });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return NextResponse.json({ message: "Admin account not found" }, { status: 404 });

    if (admin.password !== password)
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET || "smartattd_secret",
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        _id:   admin._id,
        name:  admin.name,
        email: admin.email,
        role:  "admin",
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}