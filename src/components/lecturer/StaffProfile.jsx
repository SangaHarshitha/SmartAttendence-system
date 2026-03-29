"use client";
import React from "react";
import { Mail, Book, Building, ShieldCheck } from "lucide-react";

const StaffProfile = ({ user }) => {
  // Safeguard against missing data while syncing
  if (!user || !user.email) {
    return <div className="p-10 text-center font-black animate-pulse">SYNCING PROFILE DATA...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-gray-100 p-10 text-center">
        
        {/* Avatar using the first letter of the name from DB */}
        <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 uppercase shadow-lg">
          {user.name?.charAt(0) || "U"}
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase italic tracking-tighter">
          {user.name}
        </h2>
        <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mb-8">
          {user.position || "Faculty Member"}
        </p>

        <div className="grid grid-cols-1 gap-4 text-left">
          
          {/* Email Address */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500">
                <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
              <p className="font-bold text-slate-700">{user.email}</p>
            </div>
          </div>

          {/* Assigned Subjects - Maps the array: ["Applied Physics"] */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500">
                <Book size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Subjects</p>
              <p className="font-bold text-slate-700">
                {user.assignedSubjects && user.assignedSubjects.length > 0 
                  ? user.assignedSubjects.join(", ") 
                  : "No subjects assigned"}
              </p>
            </div>
          </div>

          {/* Branch & Year - Maps: "CSE" and "Year 1" */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500">
                <Building size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department & Year</p>
              <p className="font-bold text-slate-700">
                {user.branch || "General"} — <span className="text-indigo-600 italic">{user.academicYear || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Level</p>
              <p className={`font-black text-xs uppercase ${user.canMarkAttendance ? 'text-green-600' : 'text-slate-500'}`}>
                {user.canMarkAttendance ? "Attendance Marking Active" : "View-Only Access"}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffProfile;