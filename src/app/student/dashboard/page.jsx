"use client";
// app/student/dashboard/page.jsx
import { useEffect, useState } from "react";
import StudentDashboard from "@/components/student/StudentDashboard";

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Pull student info from localStorage — adjust keys if yours differ
    const rollNo = localStorage.getItem("rollNo") || localStorage.getItem("roll") || "";
    const name   = localStorage.getItem("name")   || localStorage.getItem("studentName") || "";
    const token  = localStorage.getItem("token")  || "";
    setUser({ rollNo, name, token });
  }, []);

  if (!user) return null;

  return <StudentDashboard user={user} />;
}