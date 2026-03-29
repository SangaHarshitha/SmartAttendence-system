"use client";
import React, { useMemo } from "react";
import { Users, UserCheck, PieChart, TrendingUp, Award } from "lucide-react";

const AdminDashboard = ({ students = [], staffList = [] }) => {
  const stats = useMemo(() => {
    const branches = ["CSE", "ECE", "MECH", "CIVIL"];
    return branches.map(branch => {
      const studentCount = students.filter(s => s.branch === branch).length;
      return {
        name: branch,
        students: studentCount,
        avgAttendance: studentCount > 0 ? 84 : 0 
      };
    });
  }, [students]);

  return (
    <div className="p-6 space-y-10"> {/* Increased spacing */}
      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Students</p>
            <h3 className="text-3xl font-black text-gray-800">{students.length}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faculty</p>
            <h3 className="text-3xl font-black text-gray-800">{staffList.length}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><UserCheck size={24} /></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Attendance</p>
            <h3 className="text-3xl font-black text-gray-800">84%</h3>
          </div>
          <div className="p-4 bg-green-50 text-green-500 rounded-2xl"><PieChart size={24} /></div>
        </div>
      </div>

      {/* BRANCH SUMMARY SECTION */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 italic uppercase">
          <TrendingUp className="text-blue-600" size={20} /> Branch Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((branch) => (
            <div key={branch.name} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 relative overflow-hidden">
              <h4 className="text-xl font-black text-gray-800 mb-4">{branch.name}</h4>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase">Students</p>
                  <p className="text-2xl font-black text-blue-600">{branch.students}</p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-gray-400 uppercase">Status</p>
                   <p className="text-xs font-bold text-green-500">Active</p>
                </div>
              </div>
              {/* Decorative Background Icon */}
              <Award className="absolute -right-2 -bottom-2 text-gray-50" size={60} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;