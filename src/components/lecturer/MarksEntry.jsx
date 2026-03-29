"use client";
import React, { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Users, RefreshCw, X, BookOpen } from "lucide-react";

const EXAM_TYPES = [
  { key: "Mid-1",    label: "Mid-1",    max: 30  },
  { key: "Mid-2",    label: "Mid-2",    max: 30  },
  { key: "Semester",   label: "Semester",   max: 60 },
  { key: "Assignment", label: "Assignment", max: 10 },
];

const grade = (marks, max) => {
  if (marks === "" || marks === null || marks === undefined) return "—";
  const pct = (Number(marks) / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
};

const gradeColor = (g) => ({
  "A+": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "A":  "text-green-600  bg-green-50  border-green-200",
  "B":  "text-blue-600   bg-blue-50   border-blue-200",
  "C":  "text-yellow-600 bg-yellow-50 border-yellow-200",
  "D":  "text-orange-600 bg-orange-50 border-orange-200",
  "F":  "text-red-600    bg-red-50    border-red-200",
  "—":  "text-gray-400   bg-gray-50   border-gray-200",
}[g] || "text-gray-400 bg-gray-50 border-gray-200");

// ─────────────────────────────────────────────────────────────────────────────
const MarksEntry = ({ user }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [staffInfo, setStaffInfo]         = useState(null);
  const [sections, setSections]           = useState([]);
  const [selectedSection, setSection]     = useState("");
  const [classInfo, setClassInfo]         = useState(null);
  const [students, setStudents]           = useState([]);
  const [subjects, setSubjects]           = useState([]);
  const [selectedSubject, setSubject]     = useState("");
  const [examType, setExamType]           = useState("Mid-1");
  const [marksMap, setMarksMap]           = useState({});   // { studentId: marksValue }
  const [loading, setLoading]             = useState(true);
  const [loadingClass, setLoadingClass]   = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [saved, setSaved]                 = useState(false);

  const maxMarks = EXAM_TYPES.find(e => e.key === examType)?.max || 30;

  // ── init: load staff profile ───────────────────────────────────────────────
  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
      const sd  = res.ok ? await res.json() : user;
      setStaffInfo(sd);

      const subs = sd.assignedSubjects || user.assignedSubjects || [];
      setSubjects(subs);
      if (subs.length) setSubject(subs[0]);

      const rawSection  = sd.assignedSection || user.assignedSection || "";
      const sectionList = rawSection.split(",").map(s => s.trim()).filter(Boolean);
      setSections(sectionList);
      if (sectionList.length > 0) setSection(sectionList[0]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ── load class when section / staffInfo changes ────────────────────────────
  useEffect(() => {
    if (!selectedSection || !staffInfo) return;
    loadClass(selectedSection);
  }, [selectedSection, staffInfo]);

  const loadClass = async (section) => {
    setLoadingClass(true);
    setStudents([]);
    setClassInfo(null);
    setMarksMap({});
    try {
      const branch            = staffInfo?.branch            || user.branch            || "";
      const classAcademicYear = staffInfo?.classAcademicYear || user.classAcademicYear || "";
      const url = classAcademicYear
        ? `/api/classes?branch=${branch}&section=${section}&academicYear=${classAcademicYear}`
        : `/api/classes?branch=${branch}&section=${section}`;

      const cRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (cRes.ok) {
        const list = await cRes.json();
        const cls  = list[0];
        if (cls) {
          setClassInfo(cls);
          setStudents(cls.students || []);
        }
      }
    } catch (e) { console.error(e); }
    setLoadingClass(false);
  };

  // ── load existing marks when subject / examType / class changes ────────────
  useEffect(() => {
    if (!classInfo || !selectedSubject || !examType) return;
    loadMarks();
  }, [classInfo, selectedSubject, examType]);

  const loadMarks = async () => {
    try {
      const res = await fetch(
        `/api/marks?classId=${classInfo._id}&subject=${encodeURIComponent(selectedSubject)}&examType=${encodeURIComponent(examType)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const rows = await res.json();
        const map  = {};
        rows.forEach(r => { map[r.studentId] = r.marks; });
        setMarksMap(map);
      }
    } catch (e) { console.error(e); }
  };

  const setMark = (studentId, val) => {
    const num = val === "" ? "" : Math.min(Math.max(0, Number(val)), maxMarks);
    setMarksMap(prev => ({ ...prev, [studentId]: num }));
  };

  const fillAll = (val) => {
    const map = {};
    students.forEach(s => { map[s._id || s.rollNo] = val; });
    setMarksMap(map);
  };

  const handleSave = async () => {
    if (!selectedSubject) return alert("Please select a subject.");
    if (!classInfo)       return alert("No class loaded.");
    setIsSaving(true);
    setSaved(false);
    try {
      const records = students.map(s => ({
        studentId:    s._id || s.rollNo,
        studentName:  s.name,
        rollNo:       s.rollNo,
        classId:      classInfo._id,
        branch:       classInfo.branch,
        section:      classInfo.section,
        academicYear: classInfo.academicYear,
        year:         staffInfo?.academicYear || "",
        subject:      selectedSubject,
        examType,
        marks:        marksMap[s._id || s.rollNo] ?? "",
        maxMarks,
      }));

      const res = await fetch("/api/marks", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(records),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json();
        alert(d.message || "Save failed");
      }
    } catch (e) { console.error(e); alert("Network error"); }
    setIsSaving(false);
  };

  // ── stats ──────────────────────────────────────────────────────────────────
  const entered   = students.filter(s => marksMap[s._id || s.rollNo] !== "" && marksMap[s._id || s.rollNo] !== undefined);
  const avgMarks  = entered.length
    ? (entered.reduce((sum, s) => sum + Number(marksMap[s._id || s.rollNo] || 0), 0) / entered.length).toFixed(1)
    : "—";
  const passCount = entered.filter(s => grade(marksMap[s._id || s.rollNo], maxMarks) !== "F").length;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-blue-500">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Marks Entry</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {staffInfo?.branch || "—"} · Year {staffInfo?.academicYear || "—"} ·{" "}
            {classInfo ? `Section ${classInfo.section} · ${students.length} students` : "Select a section"}
          </p>
        </div>
        <button onClick={init} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-400 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Section Selector */}
      {sections.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Section</label>
          <div className="flex gap-2 flex-wrap">
            {sections.map(sec => (
              <button key={sec} onClick={() => setSection(sec)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition border ${
                  selectedSection === sec
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}>
                Section {sec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingClass && (
        <div className="flex items-center justify-center h-32 text-blue-400">
          <Loader2 className="animate-spin" size={24} />
          <span className="ml-2 text-sm">Loading Section {selectedSection}...</span>
        </div>
      )}

      {/* No class */}
      {!loadingClass && !classInfo && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <Users size={44} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-400">No class found for Section {selectedSection}</p>
        </div>
      )}

      {/* Main */}
      {classInfo && !loadingClass && (
        <>
          {/* Controls */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            {/* Class pills */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-50 flex-wrap">
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">{classInfo.branch}</span>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">Section {classInfo.section}</span>
              <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-semibold">Year {staffInfo?.academicYear}</span>
              <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-semibold">{classInfo.academicYear}</span>
              <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold ml-auto">{students.length} Students</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                <select value={selectedSubject} onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                  <option value="">— select subject —</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Exam Type</label>
                <div className="flex gap-2">
                  {EXAM_TYPES.map(e => (
                    <button key={e.key} onClick={() => setExamType(e.key)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition border ${
                        examType === e.key
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                      }`}>
                      {e.label}
                      <span className="block text-xs font-normal opacity-70">/{e.max}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats + quick fill */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 flex-wrap gap-3">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-gray-500">
                  Entered: <strong className="text-gray-800">{entered.length}/{students.length}</strong>
                </span>
                <span className="text-gray-500">
                  Avg: <strong className="text-blue-600">{avgMarks}</strong>
                </span>
                <span className="text-gray-500">
                  Pass: <strong className="text-green-600">{passCount}</strong>
                </span>
                <span className="text-gray-500">
                  Fail: <strong className="text-red-500">{entered.length - passCount}</strong>
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => fillAll(maxMarks)}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition font-semibold">
                  Fill Max ({maxMarks})
                </button>
                <button onClick={() => fillAll(0)}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold">
                  Fill 0
                </button>
                <button onClick={() => setMarksMap({})}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-200 transition font-semibold">
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Marks Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Section {classInfo.section} · {students.length} Students
              </span>
              <span className="text-xs text-gray-400">
                {selectedSubject || "—"} · {examType} · Max {maxMarks}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Roll No</th>
                    <th className="px-4 py-3 text-center w-36">Marks / {maxMarks}</th>
                    <th className="px-4 py-3 text-center">Grade</th>
                    <th className="px-4 py-3 text-center">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s, i) => {
                    const id   = s._id || s.rollNo;
                    const val  = marksMap[id];
                    const g    = grade(val, maxMarks);
                    const pct  = val !== "" && val !== undefined
                      ? Math.round((Number(val) / maxMarks) * 100)
                      : null;

                    return (
                      <tr key={id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 text-gray-300 text-xs font-mono">{String(i+1).padStart(2,"0")}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {s.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.rollNo}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={maxMarks}
                            value={val ?? ""}
                            onChange={e => setMark(id, e.target.value)}
                            placeholder="—"
                            className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${gradeColor(g)}`}>
                            {g}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-semibold text-gray-500">
                          {pct !== null ? `${pct}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                <CheckCircle size={16} /> Marks saved!
              </span>
            )}
            <button onClick={handleSave} disabled={isSaving || !selectedSubject}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition shadow-sm text-sm">
              {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              {isSaving ? "Saving..." : `Save Marks · ${examType} · Section ${selectedSection}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MarksEntry;