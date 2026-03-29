"use client";
import React, { useState, useEffect } from "react";
import PredictionCard from "./PredictionCard";
import OverallPredictionPanel from "./OverallPredictionPanel";
import AttendanceCalculator from "./AttendanceCalculator";
import { Loader2, RefreshCw } from "lucide-react";

const StudentDashboard = ({ student }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [attendanceData, setAttendanceData] = useState([]);
  const [marksData, setMarksData]           = useState([]);
  const [selectedMonth, setSelectedMonth]   = useState("all");
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");

  useEffect(() => {
    if (student?._id) fetchAll();
  }, [student]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [attRes, marksRes] = await Promise.all([
        fetch(`/api/attendance?studentId=${student._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/marks?studentId=${student._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (attRes.ok)   setAttendanceData(await attRes.json());
      if (marksRes.ok) setMarksData(await marksRes.json());
    } catch (err) {
      setError("Failed to load data. Please refresh.");
    }
    setLoading(false);
  };

  // ── filter by month ────────────────────────────────────────────────────────
  const myAttendance = attendanceData.filter(
    (r) => selectedMonth === "all" || r.month === selectedMonth
  );

  const totalConducted = myAttendance.reduce((a, b) => a + (b.totalHours || 0), 0);
  const totalAttended  = myAttendance.reduce((a, b) => a + (b.attendedHours || 0), 0);
  const overallPercent = totalConducted === 0
    ? 0
    : ((totalAttended / totalConducted) * 100).toFixed(1);

  const months  = [...new Set(attendanceData.map((r) => r.month).filter(Boolean))].sort();
  const subjects = [...new Set(myAttendance.map((r) => r.subject).filter(Boolean))];

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-400">
      <Loader2 size={28} className="animate-spin mr-2" /> Loading your data...
    </div>
  );

  return (
    <div className="p-4 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome, {student?.name} 👋
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {student?.branch} · Section {student?.section} · Year {student?.year}
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Overall % banner */}
      <OverallPredictionPanel
        totalAttended={totalAttended}
        totalConducted={totalConducted}
      />

      {/* Month filter */}
      {months.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedMonth("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              selectedMonth === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Months
          </button>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                selectedMonth === m
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* What-If Calculator */}
      <AttendanceCalculator
        currentAttended={totalAttended}
        currentTotal={totalConducted}
      />

      {/* Subject-wise cards */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Subject Analytics</h3>

      {subjects.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-10 text-center text-slate-400">
          No attendance records found yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjects.map((subject) => {
            const records  = myAttendance.filter((r) => r.subject === subject);
            const total    = records.reduce((a, b) => a + (b.totalHours || 0), 0);
            const attended = records.reduce((a, b) => a + (b.attendedHours || 0), 0);

            // Get marks for this subject
            const subjectMarks = marksData.filter((m) => m.subject === subject);
            const mid1   = subjectMarks.find((m) => m.examType === "Mid-1");
            const mid2   = subjectMarks.find((m) => m.examType === "Mid-2");
            const sem    = subjectMarks.find((m) => m.examType === "Semester");
            const assign = subjectMarks.find((m) => m.examType === "Assignment");

            return (
              <PredictionCard
                key={subject}
                subject={subject}
                total={total}
                attended={attended}
                mid1={mid1}
                mid2={mid2}
                sem={sem}
                assign={assign}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;