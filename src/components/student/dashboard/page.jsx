"use client";
import React from "react";
import StudentDashboard from "@/components/student/StudentDashboard";

export default function StudentPage() {
  // 1. Manually set this data first to see if it appears.
  // 2. If this works, we will then connect it to your database.
  const mockStudent = {
    name: "Sai Kumar",
    rollNumber: "22K61A0501",
    branch: "CSE",
    year: "III",
    section: "A",
    _id: "12345" 
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* This ensures the Student Dashboard is the ONLY thing that renders */}
      <StudentDashboard student={mockStudent} />
    </div>
  );
}