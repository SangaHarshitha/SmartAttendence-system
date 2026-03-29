"use client";
import React, { useState, useEffect } from "react";
import { Layers, Book, Plus, Trash2, CheckCircle2, AlertCircle, Save, Loader2 } from "lucide-react";

const YEARS = [1, 2, 3, 4];

const AcademicSettings = () => {
  const [branches, setBranches]     = useState([]);
  const [subjects, setSubjects]     = useState([]);
  const [activeBranch, setActiveBranch] = useState(null);
  const [activeYear, setActiveYear] = useState(1);
  const [branchInput, setBranchInput] = useState("");  // NEW: for adding branches
  const [manualInput, setManualInput] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Load branches and subjects from DB on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bRes, sRes] = await Promise.all([
          fetch("/api/branches"),
          fetch("/api/subjects"),
        ]);
        const bData = bRes.ok ? await bRes.json() : [];
        const sData = sRes.ok ? await sRes.json() : [];
        setBranches(Array.isArray(bData) ? bData : []);
        setSubjects(Array.isArray(sData) ? sData : []);
      } catch (e) {
        showToast("Failed to load data", false);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Add a new branch to DB
  const handleAddBranch = async () => {
    const name = branchInput.trim().toUpperCase();
    if (!name) return;
    if (branches.find(b => b.code === name || b.name === name)) {
      showToast("Branch already exists!", false);
      return;
    }
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code: name }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "Failed to add branch", false);
        return;
      }
      const newBranch = await res.json();
      setBranches(prev => [...prev, newBranch]);
      setBranchInput("");
      showToast(`Branch "${name}" added!`);
    } catch (e) {
      showToast("Server error adding branch", false);
    }
  };

  const deleteBranch = async (id) => {
    if (!confirm("Delete this branch and its subjects?")) return;
    const b = branches.find(b => b._id === id);
    try {
      await fetch(`/api/branches/${id}`, { method: "DELETE" });
      setBranches(prev => prev.filter(b => b._id !== id));
      if (b) setSubjects(prev => prev.filter(s => s.branch !== (b.code || b.name).toUpperCase()));
      if (activeBranch?._id === id) setActiveBranch(null);
      showToast("Branch deleted.");
    } catch (e) {
      showToast("Failed to delete branch", false);
    }
  };

  // Add subject locally
  const handleAddSubject = () => {
    if (!manualInput.trim() || !activeBranch) return;
    const key  = (activeBranch.code || activeBranch.name).toUpperCase().trim();
    const name = manualInput.trim().toUpperCase();
    const code = `${key}-Y${activeYear}-${name.replace(/\s+/g, "").slice(0, 6)}`;
    // Avoid duplicates locally
    const exists = subjects.find(s => s.branch === key && Number(s.year) === activeYear && s.name === name);
    if (exists) { showToast("Subject already exists!", false); return; }
    setSubjects(prev => [...prev, {
      _id: `local-${Date.now()}`,
      name, code, branch: key, year: activeYear,
    }]);
    setManualInput("");
  };

  const deleteSubject = (id) => {
    setSubjects(prev => prev.filter(s => s._id !== id));
  };

  // Save all subjects to DB
  const handleSave = async () => {
    setSaving(true);
    try {
      const res    = await fetch("/api/subjects");
      const dbSubs = res.ok ? await res.json() : [];
      const dbKeys = new Set(dbSubs.map(s => `${s.branch}-${s.year}-${s.name}`));
      const locKeys = new Set(subjects.map(s => `${s.branch}-${s.year}-${s.name}`));

      // Add new subjects not in DB
      const toAdd = subjects.filter(s => !dbKeys.has(`${s.branch}-${s.year}-${s.name}`));
      await Promise.all(toAdd.map(s =>
        fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: s.name, code: s.code, branch: s.branch, year: parseInt(s.year) }),
        })
      ));

      // Delete subjects removed locally
      const toDelete = dbSubs.filter(s => !locKeys.has(`${s.branch}-${s.year}-${s.name}`));
      await Promise.all(toDelete.map(s =>
        fetch(`/api/subjects/${s._id}`, { method: "DELETE" })
      ));

      // Refresh from DB
      const fresh = await fetch("/api/subjects");
      const freshData = fresh.ok ? await fresh.json() : [];
      setSubjects(Array.isArray(freshData) ? freshData : []);

      showToast(`Saved! ${toAdd.length} added, ${toDelete.length} removed.`);
    } catch (e) {
      showToast("Save failed — check console", false);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const activeKey = activeBranch ? (activeBranch.code || activeBranch.name).toUpperCase() : null;
  const visibleSubjects = subjects.filter(
    s => s.branch === activeKey && Number(s.year) === Number(activeYear)
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] gap-3 text-slate-400">
      <Loader2 size={22} className="animate-spin" />
      <span className="text-sm">Loading academic settings…</span>
    </div>
  );

  return (
    <div className="p-6 animate-in fade-in duration-500">

      {/* Save bar */}
      <div className="flex justify-end items-center gap-3 mb-5">
        {toast && (
          <span className={`text-xs font-semibold px-4 py-2 rounded-lg ${toast.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {toast.msg}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl font-bold text-sm transition-all"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : "Save & publish"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── BRANCH MANAGER ── */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="font-black uppercase italic mb-6 text-slate-800 flex items-center gap-2 tracking-tighter">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Layers size={20} /></div>
            Branch Manager
          </h3>

          {/* Add branch input */}
          <div className="relative mb-5">
            <input
              placeholder="Enter branch code (e.g. CSE, ECE)..."
              value={branchInput}
              onChange={e => setBranchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddBranch()}
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs outline-none border-2 border-slate-100 focus:border-indigo-500 focus:bg-white transition-all pr-24 uppercase"
            />
            <button
              onClick={handleAddBranch}
              className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all"
            >
              <Plus size={16} strokeWidth={4} /><span>Add</span>
            </button>
          </div>

          {/* Branch list */}
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
            {branches.length === 0 && (
              <p className="text-slate-400 text-xs text-center py-8">No branches yet. Add one above!</p>
            )}
            {branches.map((b) => (
              <div
                key={b._id}
                onClick={() => { setActiveBranch(b); setActiveYear(1); }}
                className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border-2 group ${
                  activeBranch?._id === b._id
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-gray-50 border-transparent hover:border-gray-200"
                }`}
              >
                <div>
                  <p className="font-black uppercase text-sm text-slate-700">{b.code || b.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {subjects.filter(s => s.branch === (b.code || b.name).toUpperCase()).length} subjects configured
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activeBranch?._id === b._id && <CheckCircle2 size={18} className="text-indigo-600" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBranch(b._id); }}
                    className="p-2 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SUBJECT CONTROL ── */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="font-black uppercase italic mb-6 text-slate-800 flex items-center gap-2 tracking-tighter">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><Book size={20} /></div>
            Subject Control
            {activeBranch && (
              <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                {activeBranch.code || activeBranch.name} — Year {activeYear}
              </span>
            )}
          </h3>

          {activeBranch ? (
            <div className="space-y-5">
              {/* Year tabs */}
              <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    onClick={() => setActiveYear(y)}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                      activeYear === y
                        ? "bg-white text-indigo-600 shadow-sm scale-[1.02]"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>

              {/* Manual add */}
              <div className="relative">
                <input
                  placeholder="Enter subject name and press Enter..."
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddSubject()}
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold text-xs outline-none border-2 border-slate-100 focus:border-indigo-500 focus:bg-white transition-all pr-24"
                />
                <button
                  onClick={handleAddSubject}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all"
                >
                  <Plus size={16} strokeWidth={4} /><span>Add</span>
                </button>
              </div>

              {/* Subject list */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {visibleSubjects.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-6">
                    No subjects for Year {activeYear}. Add one above!
                  </p>
                ) : (
                  visibleSubjects.map((s) => (
                    <div
                      key={s._id}
                      className="p-4 bg-white rounded-2xl flex justify-between items-center group border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-black text-xs uppercase text-slate-700">{s.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.code}</p>
                      </div>
                      <button
                        onClick={() => deleteSubject(s._id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                {visibleSubjects.length} subject{visibleSubjects.length !== 1 ? "s" : ""} — click <strong>Save & publish</strong> to sync to database
              </p>
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                <AlertCircle size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
                Select a branch to manage subjects
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicSettings;