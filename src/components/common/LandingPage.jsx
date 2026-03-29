import React, { useState } from "react";

const LandingPage = ({ onLogin, error: externalError }) => {
  const [role,       setRole]       = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [localError, setLocalError] = useState("");
  const [loading,    setLoading]    = useState(false);

  const error = externalError || localError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    try {
      const credentials = {
        email:    identifier,
        rollNo:   identifier,
        password,
      };
      await onLogin(role, credentials);
    } catch {
      setLocalError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  const placeholders = {
    student:  "Roll No or Email",
    lecturer: "Email",
    admin:    "Email",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          SmartAttd Login
        </h2>

        {/* Role selector */}
        <div className="flex gap-2 mb-6">
          {["student", "lecturer", "admin"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => { setRole(r); setLocalError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                role === r
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={placeholders[role]}
            required
            className="w-full border border-gray-200 p-2.5 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full border border-gray-200 p-2.5 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Shows both API errors from MainApp and local errors */}
          {error && <div className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition text-sm"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
