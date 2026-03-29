"use client";
import React from "react";
import { LayoutDashboard, CalendarCheck, Users, User, LogOut, UserPlus, Settings } from "lucide-react";

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
      active 
      ? "bg-blue-600 text-white shadow-lg shadow-blue-100 rounded-2xl mx-2 w-[calc(100%-16px)]" 
      : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
    }`}
  >
    {icon}
    <span className="font-bold text-sm tracking-wide">{label}</span>
  </button>
);

const AppShell = ({ children, user, onLogout, activeView, setActiveView, darkMode }) => {
  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-[#F8FAFC]"}`}>
      <div className="w-64 bg-[#0F172A] flex flex-col border-r border-gray-800">
        <div className="p-8">
          <h1 className="text-white text-2xl font-black italic tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center not-italic">S</div>
            SmartAttd
          </h1>
        </div>

        <nav className="flex-1 mt-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")} 
          />
          
          {/* Show if Role is Lecturer OR Permission is True in MongoDB */}
          {(user?.role === "lecturer" || user?.canMarkAttendance === true) && (
            <SidebarItem 
              icon={<CalendarCheck size={20} />} 
              label="Attendance Entry" 
              active={activeView === "attendance-entry"}
              onClick={() => setActiveView("attendance-entry")} 
            />
          )}

          {user?.role === "admin" && (
            <>
              <SidebarItem icon={<Users size={20} />} label="Staff Manager" active={activeView === "staff-management"} onClick={() => setActiveView("staff-management")} />
              <SidebarItem icon={<UserPlus size={20} />} label="Student Manager" active={activeView === "student-management"} onClick={() => setActiveView("student-management")} />
              <SidebarItem icon={<Settings size={20} />} label="Academic Settings" active={activeView === "academic-settings"} onClick={() => setActiveView("academic-settings")} />
            </>
          )}

          <SidebarItem icon={<User size={20} />} label="My Profile" active={activeView === "profile"} onClick={() => setActiveView("profile")} />
        </nav>

        <div className="p-4 mt-auto border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/10 transition-colors rounded-2xl">
            <LogOut size={20} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;