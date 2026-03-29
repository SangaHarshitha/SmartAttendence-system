// import React, { useState } from "react";

// const LecturerSettings = ({ user }) => {
//   const token = localStorage.getItem("token");

//   const [name, setName] = useState(user.name);
//   const [email, setEmail] = useState(user.email);
//   const [newPassword, setNewPassword] = useState("");

//   const handleUpdate = async () => {
//     await fetch("/api/staff/update", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ name, email, password: newPassword }),
//     });

//     alert("Profile Updated");
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-bold mb-4">Settings</h2>

//       <input value={name} onChange={(e) => setName(e.target.value)} />
//       <input value={email} onChange={(e) => setEmail(e.target.value)} />
//       <input
//         type="password"
//         placeholder="New Password"
//         onChange={(e) => setNewPassword(e.target.value)}
//       />

//       <button onClick={handleUpdate}>Save</button>
//     </div>
//   );
// };

// export default LecturerSettings;
"use client";
import React, { useState } from "react";
import { Save, Loader2, CheckCircle, Eye, EyeOff, User, Mail, Lock, Shield } from "lucide-react";

const LecturerSettings = ({ user, setUser }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const [name, setName]             = useState(user.name  || "");
  const [email, setEmail]           = useState(user.email || "");
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState("");

  const handleSave = async () => {
    setError("");
    if (newPw && newPw !== confirmPw) return setError("New passwords do not match.");
    if (newPw && newPw.length < 6)   return setError("Password must be at least 6 characters.");

    setIsSaving(true);
    try {
      const body = { name, email };
      if (newPw) { body.currentPassword = currentPw; body.password = newPw; }

      const res = await fetch(`/api/staff/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Update failed."); }
      else {
        if (setUser) setUser(prev => ({ ...prev, name, email }));
        setSaved(true);
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { setError("Network error."); }
    setIsSaving(false);
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Update your profile and password</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <User size={15} className="text-blue-500" /> Profile Info
        </h3>

        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className={inputClass} />
        </div>

        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className={inputClass} />
        </div>

        {/* Read-only assignment info */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 mt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assignment (read-only)</p>
          {[
            ["Position",    user.position        || "—"],
            ["Branch",      user.branch          || "—"],
            ["Section",     user.assignedSection || "—"],
            ["Year",        user.academicYear    || "—"],
            ["Subjects",    (user.assignedSubjects || []).join(", ") || "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-gray-400">{k}</span>
              <span className="font-medium text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Lock size={15} className="text-blue-500" /> Change Password
          <span className="text-xs text-gray-300 font-normal ml-1">(leave blank to keep current)</span>
        </h3>

        {[
          { val: currentPw, set: setCurrentPw, placeholder: "Current password" },
          { val: newPw,     set: setNewPw,     placeholder: "New password" },
          { val: confirmPw, set: setConfirmPw, placeholder: "Confirm new password" },
        ].map(({ val, set, placeholder }) => (
          <div key={placeholder} className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type={showPw ? "text" : "password"}
              value={val} onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>
        ))}

        <button onClick={() => setShowPw(!showPw)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition">
          {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPw ? "Hide" : "Show"} passwords
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl text-sm font-medium">
            <CheckCircle size={14} /> Profile updated
          </div>
        )}
        <div className="ml-auto">
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-7 py-2.5 rounded-xl transition shadow-sm text-sm">
            {isSaving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LecturerSettings;