"use client";
import React, { useState, useRef } from "react";
import { Plus, FileUp, X, Save, Users, ChevronRight, GraduationCap, Download, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

const AdminStudentManagement = ({ students, setStudents, branches }) => {
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formError,      setFormError]      = useState("");
  const [submitting,     setSubmitting]     = useState(false);
  const fileInputRef = useRef(null);

  const [newStudent, setNewStudent] = useState({
    name: "", rollNo: "", email: "", password: "", branch: "", year: ""
  });

  const academicYears = ["Year 1", "Year 2", "Year 3", "Year 4"];
  const safeStudents  = Array.isArray(students) ? students : [];
  const getBranchName = (b) => (typeof b === "string" ? b : b?.code || b?.name || "");
  const safeBranches  = Array.isArray(branches) ? branches : [];

  // ── EXCEL UPLOAD ──
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const wb   = XLSX.read(new Uint8Array(event.target.result), { type: "array" });
      const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const formatted = json.map((row) => ({
        name:     row["Full Name"]     || row["name"]   || "",
        rollNo:   String(row["Roll Number"] || row["rollNo"] || ""),
        email:    row["Email"]         || row["email"]  || "",
        branch:   row["Branch"]        || row["branch"] || "",
        year:     row["Academic Year"] || row["year"]   || "",
        password: row["Password"]      || "Student@123",
      }));
      await saveBulkStudents(formatted);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  // ── FIXED: saveBulkStudents ──
  const saveBulkStudents = async (studentData) => {
    try {
      const res = await fetch("/api/students/bulk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ students: studentData }),
      });

      const result = await res.json();

      if (res.ok) {
        // ✅ result.students is the actual saved array from DB
        setStudents(prev => [
          ...(Array.isArray(prev) ? prev : []),
          ...(Array.isArray(result.students) ? result.students : []),
        ]);
        alert(`✅ Imported ${result.inserted} students!${result.skipped > 0 ? ` (${result.skipped} skipped — duplicates)` : ""}`);
      } else {
        alert("❌ Import failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Bulk upload failed:", err);
      alert("❌ Error uploading file.");
    }
  };

  // ── DOWNLOAD TEMPLATE ──
  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      "Full Name": "S. Harshi", "Roll Number": "210001",
      "Email": "harshi@college.com", "Branch": "CSE",
      "Academic Year": "Year 1", "Password": "optional",
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  };

  // ── ADD INDIVIDUAL ──
  const handleAddIndividual = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const res  = await fetch("/api/students", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
        setShowAddModal(false);
        setNewStudent({ name: "", rollNo: "", email: "", password: "", branch: "", year: "" });
      } else {
        setFormError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Failed to add student:", err);
      setFormError("Network error. Please check your connection.");
    }
    setSubmitting(false);
  };

  // ── DELETE ──
  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      const res = await fetch("/api/students", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
      if (res.ok) setStudents(prev => (Array.isArray(prev) ? prev : []).filter(s => s._id !== id));
    } catch (err) { console.error("Delete failed:", err); }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">Student Management</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {safeStudents.length} student{safeStudents.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
          <button onClick={downloadTemplate}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-3 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all">
            <Download size={16} /> Template
          </button>
          <button onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 transition-transform hover:scale-105">
            <FileUp size={18} /> Upload Excel
          </button>
          <button onClick={() => { setShowAddModal(true); setFormError(""); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 transition-transform hover:scale-105">
            <Plus size={18} /> Add Student
          </button>
        </div>
      </div>

      {/* BRANCH CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {safeBranches.length === 0 ? (
          <div className="col-span-4 text-center py-10 text-slate-300 font-bold italic text-sm">
            No branches found — add branches in Academic Settings first
          </div>
        ) : (
          safeBranches.map((branch) => {
            const bName     = getBranchName(branch);
            const count     = safeStudents.filter(s => s.branch === bName).length;
            const isSelected = selectedBranch === bName;
            return (
              <button key={branch._id || bName} onClick={() => setSelectedBranch(isSelected ? null : bName)}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${
                  isSelected ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100"
                             : "border-slate-100 bg-white hover:border-blue-200"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:text-blue-600"}`}>
                    <Users size={24} />
                  </div>
                  <span className="font-black text-2xl text-slate-300">{count}</span>
                </div>
                <h4 className="font-black uppercase italic text-slate-800 text-sm tracking-tighter">{bName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
              </button>
            );
          })
        )}
      </div>

      {/* STUDENT LIST */}
      {selectedBranch ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4">
            <h3 className="text-xl font-black italic uppercase text-slate-800">{selectedBranch}</h3>
            <button onClick={() => setSelectedBranch(null)}
              className="text-[10px] font-black text-blue-600 uppercase hover:underline">Clear</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {academicYears.map((year) => {
              const yearStudents = safeStudents.filter(s => s.branch === selectedBranch && s.year === year);
              return (
                <div key={year} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <h5 className="font-black uppercase italic text-slate-700">{year}</h5>
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black">
                      {yearStudents.length} Students
                    </span>
                  </div>
                  <div className="space-y-3">
                    {yearStudents.length > 0 ? yearStudents.map((student) => (
                      <div key={student._id}
                        className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                        <div>
                          <p className="font-bold text-slate-700">{student.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {student.rollNo} · {student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(student._id); }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center py-6 text-slate-300 font-bold italic text-sm">No students in {year}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="font-black text-slate-400 uppercase italic tracking-widest text-sm">Select a branch above to view students</p>
          <p className="text-slate-300 text-xs mt-2">{safeStudents.length} student{safeStudents.length !== 1 ? "s" : ""} registered across all branches</p>
        </div>
      )}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black italic uppercase text-slate-800">New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold">{formError}</div>
            )}
            <form onSubmit={handleAddIndividual} className="space-y-4">
              <input required type="text" placeholder="Full Name" value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="Roll Number" value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400" />
                <select required value={newStudent.year}
                  onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400">
                  <option value="">Year</option>
                  {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <input required type="email" placeholder="Email" value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400" />
              <input required type="password" placeholder="Password" value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400" />
              <select required value={newStudent.branch}
                onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-blue-400">
                <option value="">Select Branch</option>
                {safeBranches.map(b => {
                  const n = getBranchName(b);
                  return <option key={b._id || n} value={n}>{n}</option>;
                })}
              </select>
              <button type="submit" disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-4 rounded-2xl font-black uppercase tracking-widest mt-4 flex items-center justify-center gap-2 transition-colors">
                <Save size={18} />
                {submitting ? "Registering..." : "Register Student"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentManagement;