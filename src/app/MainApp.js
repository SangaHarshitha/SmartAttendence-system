"use client";
import React, { useState, useEffect } from "react";
import AppShell from "@/components/common/AppShell";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminStaffManager from "@/components/admin/AdminStaffManager";
import AdminStudentManagement from "@/components/admin/AdminStudentManagement";
import AcademicSettings from "@/components/admin/AcademicSettings";
import AdminSubjectManager from "@/components/admin/AdminSubjectManager";
import AttendanceEntry from "@/components/lecturer/AttendanceEntry";
import StaffProfile from "@/components/lecturer/StaffProfile";
import LecturerDashboard from "@/components/lecturer/LecturerDashboard";
import LandingPage from "@/components/common/LandingPage";
import StudentDashboard from "@/components/student/StudentDashboard";
import StudentProfile from "@/components/student/StudentProfile";

const ROLE_ENDPOINTS = {
  admin:    "/api/auth/admin-login",
  lecturer: "/api/auth/lecturer-login",
  student:  "/api/auth/student-login",
};

const MainApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView,  setActiveView]  = useState("dashboard");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError,  setLoginError]  = useState("");

  const [students,    setStudents]    = useState([]);
  const [staffList,   setStaffList]   = useState([]);
  const [branches,    setBranches]    = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (saved && token) {
      try { setCurrentUser(JSON.parse(saved)); }
      catch { localStorage.clear(); }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const loadData = async () => {
      setDataLoading(true);
      try {
        const [stuRes, staRes, braRes, subRes] = await Promise.all([
          fetch("/api/students", { headers }),
          fetch("/api/staff",    { headers }),
          fetch("/api/branches", { headers }),
          fetch("/api/subjects", { headers }),
        ]);
        setStudents( stuRes.ok ? await stuRes.json() : []);
        setStaffList(staRes.ok ? await staRes.json() : []);
        setBranches( braRes.ok ? await braRes.json() : []);
        setSubjects( subRes.ok ? await subRes.json() : []);
      } catch (err) {
        console.error("Data load error:", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, [currentUser]);

  const handleLogin = async (role, credentials) => {
    setLoginError("");
    const endpoint = ROLE_ENDPOINTS[role];
    if (!endpoint) { setLoginError("Invalid role"); return; }

    const res  = await fetch(endpoint, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(credentials),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoginError(data.message || "Login failed");
      return;
    }

    localStorage.setItem("token",       data.token);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    // Also store rollNo and name separately so StudentDashboard can read them
    if (data.user?.rollNo) localStorage.setItem("rollNo", data.user.rollNo);
    if (data.user?.name)   localStorage.setItem("name",   data.user.name);

    setCurrentUser(data.user);
    setActiveView("dashboard");
  };

  const isAdmin    = currentUser?.role === "admin";
  const isLecturer = currentUser?.role === "lecturer" || currentUser?.role === "staff";
  const isStudent  = currentUser?.role === "student";

  const renderContent = () => {
    if (dataLoading) {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs italic">Syncing Database...</p>
          </div>
        </div>
      );
    }

    // ── STUDENT VIEWS ──────────────────────────────────────────────────────
    if (isStudent) {
      switch (activeView) {
        case "profile":
          return <StudentProfile user={currentUser} />;
        case "dashboard":
        default:
          return <StudentDashboard user={currentUser} />;
      }
    }

    // ── LECTURER VIEWS ─────────────────────────────────────────────────────
    if (isLecturer) {
      switch (activeView) {
        case "attendance-entry":
          return <AttendanceEntry allStudents={students} user={currentUser} />;
        case "profile":
          return <StaffProfile user={currentUser} />;
        case "dashboard":
        default:
          return (
            <LecturerDashboard
              user={currentUser}
              students={students}
              subjects={subjects}
              setActiveView={setActiveView}
            />
          );
      }
    }

    // ── ADMIN VIEWS ────────────────────────────────────────────────────────
    if (isAdmin) {
      switch (activeView) {
        case "staff-management":
          return <AdminStaffManager staffList={staffList} setStaffList={setStaffList} branches={branches} subjects={subjects} />;
        case "student-management":
          return <AdminStudentManagement students={students} setStudents={setStudents} branches={branches} />;
        case "academic-settings":
          return <AcademicSettings />;
        case "subject-manager":
          return <AdminSubjectManager />;
        case "attendance-entry":
          return <AttendanceEntry allStudents={students} user={currentUser} />;
        case "profile":
          return <StaffProfile user={currentUser} />;
        case "dashboard":
        default:
          return <AdminDashboard students={students} staffList={staffList} branches={branches} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-screen text-red-400 text-sm">
        Unknown role: "{currentUser?.role}". Please logout and login again.
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage onLogin={handleLogin} error={loginError} />;
  }

  return (
    <AppShell
      user={currentUser}
      activeView={activeView}
      setActiveView={setActiveView}
      onLogout={() => {
        localStorage.clear();
        setCurrentUser(null);
        setActiveView("dashboard");
      }}
    >
      {renderContent()}
    </AppShell>
  );
};

export default MainApp;