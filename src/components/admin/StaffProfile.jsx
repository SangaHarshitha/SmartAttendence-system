"use client";
import React from "react";
import { User, Mail, Book, Building } from "lucide-react";

const StaffProfile = ({ user }) => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 text-center">
        {/* Profile Avatar */}
        <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center text-3xl font-black mx-auto mb-6 uppercase">
          {user.name?.charAt(0)}
        </div>

        <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tight">
          {user.name}
        </h2>
        <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-8">
          Faculty Member
        </p>

        <div className="grid grid-cols-1 gap-4 text-left">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl shadow-sm">
                <Mail className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
              <p className="font-bold text-gray-700">{user.email || "Not Provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl shadow-sm">
                <Book className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Subject</p>
              <p className="font-bold text-gray-700">{user.subject || "All Subjects"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
            <div className="p-3 bg-white rounded-xl shadow-sm">
                <Building className="text-blue-500" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Department / Branch</p>
              <p className="font-bold text-gray-700">{user.branch || "General"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;