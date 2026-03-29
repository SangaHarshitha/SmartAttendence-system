"use client";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function MonthlyAttendance() {
  const [students, setStudents] = useState([]);
  const [showLowAttendance, setShowLowAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
      
      const updatedData = data.map(s => {
        // MATCHING YOUR EXCEL HEADERS:
        // Excel: "Total Classes" -> Code: total
        // Excel: "Classes Attended" -> Code: attended
        const total = Number(s["Total Classes"] || 0);
        const attended = Number(s["Classes Attended"] || 0);
        
        // FIX: Mapping Excel "rollNo" to Schema "rollNumber"
        const rollNumberValue = String(s.rollNo || s.rollNumber || "").trim();

        return {
          rollNumber: rollNumberValue, 
          name: s.name || "Unknown",
          branch: s.branch || "AI",
          year: s.year || "Year 2",
          totalClasses: total,
          attendedClasses: attended,
          percentage: total > 0 ? ((attended / total) * 100).toFixed(2) : 0
        };
      }).filter(s => s.rollNumber !== ""); 
      
      setStudents(updatedData);
    };
    reader.readAsBinaryString(file);
  };

  // Save to MongoDB
  const handleSave = async () => {
    if (students.length === 0) return alert("Please upload an Excel file first!");
    
    setIsSaving(true);
    try {
      const response = await fetch("/api/attendance/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          attendance: students,
          month: new Date().toISOString().slice(0, 7) 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Success: Attendance saved to database!");
      } else {
        alert(`❌ Error: ${result.error || "Validation failed on server"}`);
      }
    } catch (err) {
      alert("❌ Server connection failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayedStudents = showLowAttendance 
    ? students.filter(s => s.percentage < 75) 
    : students;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-slate-900 p-6 rounded-3xl text-white shadow-2xl">
          <h1 className="text-xl font-black italic tracking-tighter">SMART-ATTD</h1>
          <div className="flex gap-3">
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="excel-upload" 
              accept=".xlsx, .xls" 
            />
            <label htmlFor="excel-upload" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl cursor-pointer font-bold text-xs transition-all">
              UPLOAD EXCEL
            </label>
            <button 
              onClick={() => setShowLowAttendance(!showLowAttendance)}
              className={`${showLowAttendance ? 'bg-amber-500' : 'bg-slate-700'} text-white px-6 py-2 rounded-xl font-bold text-xs transition-all`}
            >
              {showLowAttendance ? "SHOW ALL" : "BELOW 75%"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="p-5">Roll No</th>
                <th className="p-5">Name</th>
                <th className="p-5 text-center">Attendance %</th>
                <th className="p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((student, index) => (
                <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="p-5 font-bold text-blue-600 italic">{student.rollNumber}</td>
                  <td className="p-5 font-bold text-slate-700">{student.name}</td>
                  <td className={`p-5 text-center font-black ${student.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {student.percentage}%
                  </td>
                  <td className="p-5 text-right">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase ${student.percentage < 75 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {student.percentage < 75 ? 'Shortage' : 'Regular'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? "SAVING..." : "SAVE TO DATABASE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}