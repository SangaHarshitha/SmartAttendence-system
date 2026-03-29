import React, { useState, useEffect } from "react";

const SubjectManager = ({ branches }) => {
  const [subjects, setSubjects] = useState([]);
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("1");
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");

  const fetchSubjects = async () => {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    setSubjects(data);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async () => {
    if (!name) return;

    await fetch("/api/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, branch, year }),
    });

    setName("");
    fetchSubjects();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/subjects/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchSubjects();
  };

  const filtered = subjects.filter(
    (s) => s.branch === branch && String(s.year) === year
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Subject Management</h2>

      <div className="flex gap-3 mb-4">
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b._id || b} value={b.name || b}>
              {b.name || b}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded"
        >
          {["1", "2", "3", "4"].map((y) => (
            <option key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name"
          className="border p-2 rounded"
        />

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {filtered.map((s) => (
        <div key={s._id} className="flex justify-between p-2 border-b">
          <span>{s.name}</span>
          <button
            onClick={() => handleDelete(s._id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default SubjectManager;