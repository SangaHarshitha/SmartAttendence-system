"use client";
// src/components/student/StudentProfile.jsx
import React from "react";
import { User, Mail, Hash, Building2, Calendar, BookOpen, Shield } from "lucide-react";

const StudentProfile = ({ user }) => {
  const initials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const fields = [
    {
      icon: <Hash size={18} />,
      label: "Roll Number",
      value: user?.rollNo || "—",
      accent: "#2563eb",
      bg: "#eff6ff",
    },
    {
      icon: <Mail size={18} />,
      label: "Email Address",
      value: user?.email || "—",
      accent: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      icon: <Building2 size={18} />,
      label: "Branch / Department",
      value: user?.branch || "—",
      accent: "#0891b2",
      bg: "#ecfeff",
    },
    {
      icon: <Calendar size={18} />,
      label: "Academic Year",
      value: user?.year ? `Year ${user.year}`.replace("Year Year", "Year") : "—",
      accent: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      icon: <BookOpen size={18} />,
      label: "Section",
      value: user?.section || "—",
      accent: "#ea580c",
      bg: "#fff7ed",
    },
    {
      icon: <Shield size={18} />,
      label: "Access Level",
      value: "Student — View Only",
      accent: "#6b7280",
      bg: "#f9fafb",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6fb",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Avatar card */}
        <div style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #eaecf0",
          padding: "36px 24px 28px",
          textAlign: "center",
          marginBottom: 16,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: "#fff",
            margin: "0 auto 16px",
          }}>
            {initials(user?.name)}
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: -0.5 }}>
            {user?.name || "Student"}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 8, padding: "4px 14px", borderRadius: 99,
            background: "#eff6ff", color: "#2563eb",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
          }}>
            <User size={11} />
            STUDENT ACCOUNT
          </div>
        </div>

        {/* Info fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {fields.map(({ icon, label, value, accent, bg }) => (
            <div key={label} style={{
              background: "#fff",
              border: "1px solid #eaecf0",
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: bg, color: accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StudentProfile;