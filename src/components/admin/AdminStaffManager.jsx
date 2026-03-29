"use client";
import React, { useState } from "react";
import { Briefcase, BadgeCheck, X, Plus, Trash2, Mail } from "lucide-react";

const AdminStaffManager = ({ staffList = [], setStaffList, branches = [] }) => {
  const [showForm,       setShowForm]       = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formError,      setFormError]      = useState("");
  const [submitting,     setSubmitting]     = useState(false);

  const [newStaff, setNewStaff] = useState({
    name: "", email: "", password: "", branch: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async () => {
    setFormError("");
    if (!newStaff.name || !newStaff.email || !newStaff.password || !newStaff.branch) {
      setFormError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: newStaff.name, email: newStaff.email,
        password: newStaff.password, branch: newStaff.branch,
        position: "Lecturer", canMarkAttendance: true,
        classAcademicYear: "2024-2025", assignedSection: "A",
        assignedSubjects: [], academicYear: "",
      };
      const res    = await fetch("/api/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok) {
        setStaffList(prev => [...prev, result]);
        setShowForm(false);
        setNewStaff({ name: "", email: "", password: "", branch: "" });
      } else {
        setFormError(result.error || result.message || "Save failed.");
      }
    } catch {
      setFormError("Network error.");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this staff member?")) return;
    try {
      const res = await fetch("/api/staff", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (res.ok) setStaffList(prev => prev.filter(s => s._id !== id));
    } catch { console.error("Delete failed"); }
  };

  const safeStaff    = Array.isArray(staffList) ? staffList : [];
  const safeBranches = Array.isArray(branches)  ? branches  : [];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black italic uppercase text-slate-800 tracking-tighter">Staff Manager</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">{safeStaff.length} staff member{safeStaff.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg transition-transform hover:scale-105">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-black italic uppercase text-slate-700 mb-1">New Staff Profile</h3>
          <p className="text-xs text-slate-400 mb-6">Staff will select their year and subject when entering attendance.</p>
          {formError && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold">{formError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input name="name" placeholder="Full Name" className="p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 font-bold focus:border-indigo-400" value={newStaff.name} onChange={handleInputChange} />
            <input name="email" placeholder="Email" type="email" className="p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 font-bold focus:border-indigo-400" value={newStaff.email} onChange={handleInputChange} />
            <input name="password" type="password" placeholder="Password" className="p-4 bg-slate-50 rounded-xl outline-none border border-slate-200 font-bold focus:border-indigo-400" value={newStaff.password} onChange={handleInputChange} />
            <select name="branch" className="p-4 bg-slate-50 rounded-xl font-bold border border-slate-200 outline-none focus:border-indigo-400" value={newStaff.branch} onChange={handleInputChange}>
              <option value="">Select Branch</option>
              {safeBranches.map(b => <option key={b._id} value={b.code || b.name}>{b.code || b.name}</option>)}
            </select>
          </div>
          <button onClick={handleAddStaff} disabled={submitting}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-colors">
            {submitting ? "Saving..." : "Save Staff Profile"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {safeBranches.length === 0 ? (
          <div className="col-span-4 text-center py-10 text-slate-300 font-bold italic text-sm">No branches found — add branches in Academic Settings first</div>
        ) : (
          safeBranches.map(branch => {
            const bName = branch.code || branch.name;
            const count = safeStaff.filter(s => s.branch === bName).length;
            const isSel = selectedBranch === bName;
            return (
              <button key={branch._id || bName} onClick={() => setSelectedBranch(isSel ? null : bName)}
                className={`p-6 rounded-[2rem] border-2 transition-all text-left group ${isSel ? "border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100" : "border-slate-100 bg-white hover:border-indigo-200"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isSel ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:text-indigo-600"}`}><BadgeCheck size={22} /></div>
                  <span className="font-black text-2xl text-slate-300">{count}</span>
                </div>
                <h4 className="font-black uppercase italic text-slate-800 text-sm tracking-tighter">{bName}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
              </button>
            );
          })
        )}
      </div>

      {selectedBranch ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-4 mb-6">
            <Briefcase size={18} className="text-indigo-600" />
            <h3 className="text-xl font-black italic uppercase text-slate-800">{selectedBranch}</h3>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">{safeStaff.filter(s => s.branch === selectedBranch).length} staff</span>
            <button onClick={() => setSelectedBranch(null)} className="text-[10px] font-black text-indigo-500 uppercase hover:underline ml-2">Clear</button>
          </div>
          {safeStaff.filter(s => s.branch === selectedBranch).length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <BadgeCheck size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="font-black text-slate-400 uppercase italic text-sm">No staff in {selectedBranch}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeStaff.filter(s => s.branch === selectedBranch).map(staff => (
                <div key={staff._id} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-start justify-between group hover:border-indigo-200 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                      {staff.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{staff.name}</p>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">{staff.position || "Lecturer"} · {staff.branch}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold"><Mail size={10} /> {staff.email}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(staff._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-all flex-shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <BadgeCheck size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="font-black text-slate-400 uppercase italic tracking-widest text-sm">Select a branch above to view staff</p>
        </div>
      )}
    </div>
  );
};

export default AdminStaffManager;