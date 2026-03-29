"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { FileUp, Save, AlertTriangle, Loader2, Users, Search, ChevronDown, Download } from "lucide-react";

const AttendanceEntry = ({ user }) => {
  const [selectedMonth,    setSelectedMonth]    = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear,     setSelectedYear]     = useState("");
  const [selectedSubject,  setSelectedSubject]  = useState("");
  const [subjectOptions,   setSubjectOptions]   = useState([]);
  const [attendanceData,   setAttendanceData]   = useState([]);
  const [showShortageOnly, setShowShortageOnly] = useState(false);
  const [isSaving,         setIsSaving]         = useState(false);
  const [isLoading,        setIsLoading]        = useState(false);
  const [loadingSubjects,  setLoadingSubjects]  = useState(false);
  const fileInputRef = useRef(null);

  // Fetch subjects when year or branch changes
  useEffect(() => {
    if (!selectedYear || !user?.branch) return;
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSelectedSubject("");
      setSubjectOptions([]);
      try {
        const yearNum = selectedYear.replace("Year ", "").trim();
        const res  = await fetch(`/api/subjects?branch=${user.branch}&year=${yearNum}`);
        const data = await res.json();
        setSubjectOptions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load subjects", e);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [selectedYear, user?.branch]);

  // Load saved attendance data
  const loadSavedData = useCallback(async () => {
    if (!user?.email || !selectedYear || !selectedSubject) return;
    setIsLoading(true);
    setAttendanceData([]);
    try {
      const res = await fetch(
        `/api/attendance/monthly?month=${selectedMonth}&branch=${user.branch}&year=${selectedYear}&section=${user.assignedSection || "A"}`
      );
      const result = await res.json();
      if (res.ok && result.data?.length > 0) {
        setAttendanceData(result.data.filter(r => r.subject === selectedSubject));
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedSubject, user]);

  useEffect(() => { loadSavedData(); }, [loadSavedData]);

  // ── DOWNLOAD TEMPLATE ──
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { rollNo: "101", name: "A. Example", "Total Classes": 30, "Classes Attended": 28 },
      { rollNo: "102", name: "B. Example", "Total Classes": 30, "Classes Attended": 22 },
      { rollNo: "103", name: "C. Example", "Total Classes": 30, "Classes Attended": 15 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_Template_${selectedSubject || "Subject"}_${selectedMonth}.xlsx`);
  };

  // ── IMPORT EXCEL ──
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedYear || !selectedSubject) {
      alert("Please select Year and Subject before importing.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const data     = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const json     = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const processed = json.map(row => {
        const total    = Number(row["Total Classes"]    || row["totalClasses"]    || 0);
        const attended = Number(row["Classes Attended"] || row["attendedClasses"] || 0);
        return {
          rollNo:          String(row["rollNo"] || row["Roll Number"] || "").trim(),
          name:            row["name"] || row["Name"] || "Unknown",
          totalClasses:    total,
          attendedClasses: attended,
          percentage:      total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0,
        };
      }).filter(item => item.rollNo !== "");
      setAttendanceData(processed);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // ── SAVE TO DB ──
  const handleSaveToDatabase = async () => {
    if (attendanceData.length === 0) return;
    if (!user?.email)                      { alert("Staff email not found. Please log in again."); return; }
    if (!selectedYear || !selectedSubject) { alert("Please select Year and Subject first."); return; }

    setIsSaving(true);
    try {
      const response = await fetch("/api/attendance/monthly", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month:      selectedMonth,
          email:      user.email,
          subject:    selectedSubject,
          // FIX: send exactly as stored in MonthlyAttendance schema e.g. "Year 2"
          year:       selectedYear,
          branch:     user.branch || "",
          section:    user.assignedSection || "A",
          attendance: attendanceData,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert(`✅ ${result.count} records saved successfully!`);
      } else {
        alert(`❌ Failed: ${result.error || "Check validation requirements"}`);
      }
    } catch {
      alert("Error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  const finalViewList = showShortageOnly
    ? attendanceData.filter(s => Number(s.percentage) < 75)
    : attendanceData;

  const canImport = selectedYear && selectedSubject;

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">

      {/* HEADER */}
      <div className="bg-slate-900 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold leading-tight">
                {user?.branch || "General"} — Attendance Entry
              </h3>
              <p className="text-blue-400 text-[10px] uppercase font-black tracking-[0.2em]">
                {selectedYear ? selectedYear : "Select year below"}
                {selectedSubject ? ` · ${selectedSubject}` : ""}
              </p>
            </div>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* Year — FIX: values now match schema "Year 1", "Year 2" etc. */}
          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-slate-800 text-white pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="">Select Year</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
              <option value="Year 4">Year 4</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Subject */}
          <div className="relative">
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedYear || loadingSubjects}
              className="appearance-none bg-slate-800 text-white pl-4 pr-10 py-2.5 rounded-xl text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 min-w-[180px]">
              <option value="">
                {!selectedYear ? "Select year first" : loadingSubjects ? "Loading..." : subjectOptions.length === 0 ? "No subjects found" : "Select Subject"}
              </option>
              {subjectOptions.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Download Template */}
          <button onClick={downloadTemplate}
            className="bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
            <Download size={14} /> Template
          </button>

          {/* Import Excel */}
          <button onClick={() => canImport && fileInputRef.current.click()} disabled={!canImport}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-lg">
            <FileUp size={14} /> Import Excel
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls" />

          {/* Shortage toggle */}
          <button onClick={() => setShowShortageOnly(!showShortageOnly)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              showShortageOnly ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}>
            <AlertTriangle size={14} /> {showShortageOnly ? "Shortage Only" : "All Students"}
          </button>
        </div>

        {!canImport && (
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            ↑ Select year and subject to import or view attendance
          </p>
        )}
      </div>

      {/* TABLE */}
      <div className="p-4 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="mt-4 text-slate-400 text-sm font-bold animate-pulse">Fetching Records...</p>
          </div>
        ) : finalViewList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-slate-100 rounded-[2rem]">
            <Search size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold italic">
              {!canImport ? "Select year and subject above to get started." : "No records found. Import an Excel file to begin."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-black">
                  <th className="px-8 py-4">Roll Number</th>
                  <th className="px-8 py-4">Full Name</th>
                  <th className="px-8 py-4 text-center">Month Attendance</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {finalViewList.map((s, i) => (
                  <tr key={i} className={`group shadow-sm hover:shadow-md transition-all ${Number(s.percentage) < 75 ? "bg-red-50/50" : "bg-slate-50/50"}`}>
                    <td className="px-8 py-5 font-black text-blue-600 italic rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200">{s.rollNo}</td>
                    <td className="px-8 py-5 font-bold text-slate-700 border-y group-hover:border-slate-200">{s.name}</td>
                    <td className={`px-8 py-5 text-center font-black border-y group-hover:border-slate-200 ${Number(s.percentage) < 75 ? "text-red-500" : "text-emerald-500"}`}>
                      {s.percentage}%
                    </td>
                    <td className="px-8 py-5 text-right rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200">
                      <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase ring-1 ${
                        Number(s.percentage) < 75 ? "bg-red-100 text-red-600 ring-red-200" : "bg-emerald-100 text-emerald-600 ring-emerald-200"
                      }`}>
                        {Number(s.percentage) < 75 ? "Shortage" : "Clear"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {attendanceData.length > 0 && (
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Students: {attendanceData.length}
          </p>
          <button onClick={handleSaveToDatabase} disabled={isSaving}
            className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? "Syncing Database..." : "Save to Database"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendanceEntry;