"use client";
import React, { useState, useEffect } from "react";
import MainApp from "./MainApp"; // Adjust based on your actual file name

export default function Home() {
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulation: Replace this with your actual login logic later
  const LOGGED_IN_EMAIL = "123@gmail.com"; 

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/staff");
        if (!response.ok) throw new Error("Failed to load staff list");
        
        const allStaff = await response.json();
        
        // Find Mahesh's record in the data
        const maheshRecord = allStaff.find(s => s.email === LOGGED_IN_EMAIL);
        
        if (maheshRecord) {
          setActiveUser(maheshRecord);
        }
      } catch (err) {
        console.error("Profile Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <div className="p-20 text-center font-black italic uppercase">Loading Data...</div>;

  // Pass the user data down to your components
  return <MainApp currentUser={activeUser} />;
}