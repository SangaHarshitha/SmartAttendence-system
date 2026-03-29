"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, Zap, ChevronDown, ChevronUp, CheckCircle, Loader2, X } from "lucide-react";

const DEFAULTS = {
  CSE: {
    1: ["C", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Data Structures", "Operating Systems", "Mathematics II", "Digital Logic", "OOP"],
    3: ["DBMS", "Computer Networks", "Software Engineering", "Web Technologies", "Theory of Computation"],
    4: ["AI/ML", "Cloud Computing", "Cyber Security", "Mobile Computing", "Project"],
  },
  AIML: {
    1: ["C", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Data Structures", "Probability & Statistics", "Mathematics II", "Python", "OOP"],
    3: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP", "Big Data"],
    4: ["Reinforcement Learning", "AI Ethics", "MLOps", "Generative AI", "Project"],
  },
  IT: {
    1: ["C", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Data Structures", "Operating Systems", "Mathematics II", "Digital Logic", "OOP"],
    3: ["DBMS", "Computer Networks", "Software Engineering", "Web Technologies", "Information Security"],
    4: ["Cloud Computing", "IoT", "Cyber Security", "Mobile App Development", "Project"],
  },
  EC: {
    1: ["Basic Electronics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Signals & Systems", "Digital Electronics", "Circuit Theory", "Mathematics II", "Electromagnetics"],
    3: ["Control Systems", "VLSI", "Communication Systems", "Microprocessors", "Analog Circuits"],
    4: ["Embedded Systems", "Wireless Communication", "Optical Communication", "IoT", "Project"],
  },
  MECH: {
    1: ["Engineering Mechanics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Thermodynamics", "Fluid Mechanics", "Manufacturing", "Mathematics II", "Material Science"],
    3: ["Heat Transfer", "Machine Design", "Dynamics", "CAD/CAM", "Metrology"],
    4: ["Automobile Engineering", "Robotics", "Industrial Engineering", "Mechatronics", "Project"],
  },
  CIVIL: {
    1: ["Engineering Mechanics", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Surveying", "Fluid Mechanics", "Building Materials", "Mathematics II", "Geology"],
    3: ["Structural Analysis", "Geotechnical Engineering", "Transportation", "Hydraulics", "Concrete Technology"],
    4: ["Design of Structures", "Environmental Engineering", "Construction Management", "Estimation", "Project"],
  },
  EEE: {
    1: ["Basic Electrical", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Circuit Analysis", "Electrical Machines I", "Electromagnetics", "Mathematics II", "Measurements"],
    3: ["Power Systems", "Electrical Machines II", "Control Systems", "Power Electronics", "Microcontrollers"],
    4: ["Power System Protection", "Renewable Energy", "High Voltage", "Smart Grid", "Project"],
  },
  DS: {
    1: ["C", "Mathematics I", "Statistics", "English", "Engineering Drawing"],
    2: ["Data Structures", "Probability", "Mathematics II", "Python", "Database Systems"],
    3: ["Machine Learning", "Data Visualization", "Big Data", "Data Mining", "Business Analytics"],
    4: ["Deep Learning", "AI Applications", "Cloud Analytics", "Data Ethics", "Project"],
  },
  CHEMICAL: {
    1: ["Chemistry", "Mathematics I", "Physics", "English", "Engineering Drawing"],
    2: ["Thermodynamics", "Fluid Mechanics", "Mass Transfer", "Mathematics II", "Material Science"],
    3: ["Chemical Reaction Engineering", "Process Control", "Heat Transfer", "Separation Processes", "Safety Engineering"],
    4: ["Petroleum Engineering", "Polymer Technology", "Environmental Engineering", "Plant Design", "Project"],
  },
};

const BRANCHES = Object.keys(DEFAULTS);
const YEARS = [1, 2, 3, 4];

const YEAR_COLORS = {
  1: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", badge: "bg-blue-500" },
  2: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", badge: "bg-emerald-500" },
  3: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", badge: "bg-violet-500" },
  4: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500" },
};

export default function AdminSubjectManager() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [subjects, setSubjects] = useState([]);
  const [branch, setBranch] = useState("CSE");
  const [year, setYear] = useState(1);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedingAll, setSeedingAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedBranches, setExpandedBranches] = useState({});

  useEffect(() => { fetchSubjects(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subjects", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch { setSubjects([]); }
    setLoading(false);
  };

  const addSubject = async () => {
    if (!newName.trim() || !branch || !year) return;
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        // FIX: year sent as integer — matches Subject schema { year: Number }
        body: JSON.stringify({ name: newName.trim(), branch, year: parseInt(year) }),
      });
      if (res.ok) {
        setNewName("");
        fetchSubjects();
        showToast(`"${newName.trim()}" added to ${branch} Year ${year}`);
      } else {
        const d = await res.json();
        showToast(d.message || d.error || "Failed to add", "error");
      }
    } catch { showToast("Network error", "error"); }
  };

  const deleteSubject = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await fetch(`/api/subjects/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchSubjects();
      showToast(`"${name}" deleted`, "error");
    } catch { showToast("Failed to delete", "error"); }
  };

  // Seed defaults for selected branch + year
  const seedDefaults = async () => {
    const defaults = DEFAULTS[branch]?.[year] || [];
    if (!defaults.length) return;
    setSeeding(true);
    let added = 0;
    for (const name of defaults) {
      // FIX: compare year as Number consistently
      const exists = subjects.find(
        s => s.name === name && s.branch === branch && Number(s.year) === Number(year)
      );
      if (!exists) {
        const res = await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, branch, year: parseInt(year) }),
        });
        if (res.ok) added++;
      }
    }
    await fetchSubjects();
    setSeeding(false);
    showToast(added > 0 ? `Added ${added} subjects to ${branch} Year ${year}` : "All defaults already exist");
  };

  // Seed ALL branches ALL years
  const seedAll = async () => {
    if (!confirm("This will add all default subjects for ALL branches and years. Continue?")) return;
    setSeedingAll(true);
    let total = 0;
    for (const br of BRANCHES) {
      for (const yr of YEARS) {
        const defaults = DEFAULTS[br]?.[yr] || [];
        for (const name of defaults) {
          const exists = subjects.find(
            s => s.name === name && s.branch === br && Number(s.year) === Number(yr)
          );
          if (!exists) {
            const res = await fetch("/api/subjects", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ name, branch: br, year: parseInt(yr) }),
            });
            if (res.ok) total++;
          }
        }
      }
    }
    await fetchSubjects();
    setSeedingAll(false);
    showToast(`✓ Seeded ${total} subjects across all branches!`);
  };

  const toggleBranch = (br) => setExpandedBranches(p => ({ ...p, [br]: !p[br] }));

  // Group subjects by branch → year
  const grouped = {};
  for (const s of subjects) {
    if (!grouped[s.branch]) grouped[s.branch] = {};
    const yr = Number(s.year); // FIX: normalise to number for grouping
    if (!grouped[s.branch][yr]) grouped[s.branch][yr] = [];
    grouped[s.branch][yr].push(s);
  }

  const filteredForForm = subjects.filter(
    s => s.branch === branch && Number(s.year) === Number(year)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all
          ${toast.type === "error" ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
          {toast.type === "error" ? <X size={15} /> : <CheckCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Subject Management</h1>
            <p className="text-slate-400 text-sm">{subjects.length} subjects across {Object.keys(grouped).length} branches</p>
          </div>
        </div>
        <button
          onClick={seedAll}
          disabled={seedingAll}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition disabled:opacity-60"
        >
          {seedingAll ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          {seedingAll ? "Seeding All..." : "Seed All Defaults"}
        </button>
      </div>

      {/* Add Subject Form */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Add Subject</h2>
        <div className="flex flex-wrap gap-3">
          {/* Branch */}
          <select
            value={branch}
            onChange={e => setBranch(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>

          {/* Subject name */}
          <input
            className="flex-1 min-w-48 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            placeholder="Subject name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addSubject()}
          />

          <button
            onClick={addSubject}
            disabled={!newName.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Plus size={15} /> Add
          </button>

          <button
            onClick={seedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {seeding ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            Load Defaults
          </button>
        </div>

        {/* Current filter subjects */}
        {filteredForForm.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredForForm.map(s => (
              <span key={s._id} className="flex items-center gap-1.5 bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-full">
                {s.name}
                <button onClick={() => deleteSubject(s._id, s.name)} className="text-slate-400 hover:text-red-400 transition">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Overview — all branches */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">All Subjects Overview</h2>

        {loading ? (
          <div className="flex justify-center py-12 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-slate-800 border border-dashed border-slate-600 rounded-2xl p-12 text-center">
            <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium">No subjects yet</p>
            <p className="text-slate-500 text-sm mt-1">Click <span className="text-amber-400 font-semibold">Seed All Defaults</span> to populate everything at once</p>
          </div>
        ) : (
          BRANCHES.map(br => {
            if (!grouped[br]) return null;
            const isOpen = expandedBranches[br] !== false;
            const totalCount = Object.values(grouped[br]).flat().length;
            return (
              <div key={br} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                {/* Branch header */}
                <button
                  onClick={() => toggleBranch(br)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-750 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">{br}</span>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full">{totalCount} subjects</span>
                    <div className="flex gap-1">
                      {YEARS.map(y => grouped[br][y] ? (
                        <span key={y} className={`text-xs px-1.5 py-0.5 rounded ${YEAR_COLORS[y].badge} text-white`}>
                          Y{y}:{grouped[br][y].length}
                        </span>
                      ) : null)}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {YEARS.map(yr => {
                      const subs = grouped[br]?.[yr] || [];
                      const c = YEAR_COLORS[yr];
                      return (
                        <div key={yr} className={`rounded-xl border p-3 ${c.bg} ${c.border}`}>
                          <div className={`text-xs font-semibold mb-2 ${c.text}`}>Year {yr} · {subs.length} subjects</div>
                          <div className="space-y-1">
                            {subs.length === 0 ? (
                              <p className="text-slate-500 text-xs italic">No subjects</p>
                            ) : subs.map(s => (
                              <div key={s._id} className="flex items-center justify-between group">
                                <span className="text-slate-200 text-xs truncate">{s.name}</span>
                                <button
                                  onClick={() => deleteSubject(s._id, s.name)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition ml-1 flex-shrink-0"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
