"use client";

import React, { useState } from "react";
import { Plus, Trash2, X, Save, Layers } from "lucide-react";

const AdminBranchManager = ({ branches, setBranches }) => {
  const [showModal, setShowModal] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [saving, setSaving] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const refreshBranches = async () => {
    const res = await fetch("/api/branches");
    const data = await res.json();
    setBranches(data);
  };

  const handleSave = async () => {
    if (!branchName.trim()) return alert("Enter branch name");
    setSaving(true);
    await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: branchName }),
    });
    await refreshBranches();
    setShowModal(false);
    setBranchName("");
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this branch? This may affect assigned staff and students.")) return;
    await fetch(`/api/branches/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await refreshBranches();
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Branch Management</h2>
          <p className="text-sm text-gray-400 mt-0.5">{branches.length} branch{branches.length !== 1 ? "es" : ""} configured</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          <Plus size={16} /> Add Branch
        </button>
      </div>

      {/* Branch List */}
      {branches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Layers size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No branches yet</p>
          <p className="text-sm mt-1">Add your first branch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {branches.map((b) => (
            <div key={b._id}
              className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Layers size={16} className="text-blue-600" />
                </div>
                <span className="font-semibold text-gray-800">{b.name}</span>
              </div>
              <button
                onClick={() => handleDelete(b._id)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={15} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Add New Branch</h3>
              <button onClick={() => { setShowModal(false); setBranchName(""); }}
                className="p-1.5 hover:bg-gray-100 rounded-full">
                <X size={18} />
              </button>
            </div>
            <input
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              placeholder="Branch name (e.g. CSE, ECE, MECH)"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-xl transition">
                <Save size={15} /> {saving ? "Saving..." : "Save Branch"}
              </button>
              <button onClick={() => { setShowModal(false); setBranchName(""); }}
                className="px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm text-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBranchManager;
