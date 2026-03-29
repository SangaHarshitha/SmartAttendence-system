"use client";
import React, { useState, useEffect } from "react";
import RiskBadge from "../common/RiskBadge";
import { Loader2, RefreshCw, Users, Search } from "lucide-react";

const ClassAttendanceView = ({ currentUser }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [classmates, setClassmates]     = useState([]);
  const [attendance, setAttendance]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterMode, setFilterMode]     = useState("all"); // all | safe | danger

  useEffect(() => {
    if (currentUser?.branch && currentUser?.section) fetchAll();
  }, [currentUser]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch classmates from same branch+section
      const [classRes, attRes] = await Promise.all([
        fetch(`/api/classes?branch=${currentUser.branch}&section=${currentUser.section}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/attendance?branch=${currentUser.branch}&section=${currentUser.section}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (classRes.ok) {
        const classes = await classRes.json();
        // Flatten students from all matching classes
        const allStudents = classes.flatMap((c) => c.students || []);
        setClassmates(allStudents);
      }
      if (attRes.ok) setAttendance(await attRes.json());
    } catch (err) {
      console.error("ClassAttendanceView fetch error:", err);
    }
    setLoading(false);
  };

  const getPercent = (studentId) => {
    const records  = attendance.filter((r) => String(r.studentId) === String(studentId));
    const total    = records.reduce((a, b) => a + (b.totalHours || 0), 0);
    const attended = records.reduce((a, b) => a + (b.attendedHours || 0), 0);
    return total === 0 ? null : ((attended / total) * 100).toFixed(1);
  };

  const enriched = classmates
    .map((s) => ({ ...s, percentage: getPercent(s._id) }))
    .filter((s) => {
      if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) &&
          !s.rollNo?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMode === "safe"   && parseFloat(s.percentage) < 75)  return false;
      if (filterMode === "danger" && parseFloat(s.percentage) >= 75) return false;
      return true;
    });

  const safeCount   = classmates.filter((s) => parseFloat(getPercent(s._id)) >= 75).length;
  const dangerCount = classmates.filter((s) => {
    const p = parseFloat(getPercent(s._id));
    return !isNaN(p) && p < 75;
  }).length;

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-400">
      <Loader2 size={28} className="animate-spin mr-2" /> Loading class data...
    </div>
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={22} className="text-blue-500" />
            {currentUser.branch} — Section {currentUser.section}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {classmates.length} students · {safeCount} safe · {dangerCount} at risk
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            placeholder="Search by name or roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {["all", "safe", "danger"].map((mode) => (
          <button
            key={mode}
            onClick={() => setFilterMode(mode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              filterMode === mode
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {mode === "all" ? "All" : mode === "safe" ? "✅ Safe (≥75%)" : "⚠️ At Risk (<75%)"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">#</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Name</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Roll No</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Attendance</th>
              <th className="text-left px-4 py-3 text-slate-500 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {enriched.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  No students found
                </td>
              </tr>
            ) : (
              enriched.map((s, i) => (
                <tr
                  key={s._id}
                  className={`border-b border-slate-100 last:border-0 ${
                    String(s._id) === String(currentUser._id) ? "bg-blue-50" : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {s.name}
                    {String(s._id) === String(currentUser._id) && (
                      <span className="ml-2 text-xs text-blue-500 font-semibold">(You)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{s.rollNo}</td>
                  <td className="px-4 py-3">
                    {s.percentage !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.percentage >= 75 ? "bg-green-500" :
                              s.percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(s.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{s.percentage}%</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">No data</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.percentage !== null
                      ? <RiskBadge percent={s.percentage} />
                      : <span className="text-xs text-slate-400">—</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassAttendanceView;
