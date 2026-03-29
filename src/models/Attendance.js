import mongoose from "mongoose";

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentName: { type: String, required: true },
  rollNo:      { type: String, required: true },
  year:        { type: String, required: true },   // "1","2","3","4"
  branch:      { type: String, required: true },   // "CSE","ECE","MECH","CIVIL"
  subject:     { type: String, required: true },   // "DBMS","OS","DSA","CN","SE"
  totalClasses:   { type: Number, required: true },
  attendedClasses:{ type: Number, required: true },
}, { timestamps: true });

// Virtual: percentage
attendanceSchema.virtual('percentage').get(function () {
  return Math.round((this.attendedClasses / this.totalClasses) * 100);
});

 

export default mongoose.models.MonthlyAttendance || mongoose.model("MonthlyAttendance", MonthlyAttendanceSchema);