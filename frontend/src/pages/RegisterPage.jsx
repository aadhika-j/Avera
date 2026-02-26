import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-primary">Create account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-600">Name</label>
            <input
              type="text"
              name="name"
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border rounded px-3 py-2"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border rounded px-3 py-2"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Role</label>
            <select
              name="role"
              className="w-full border rounded px-3 py-2"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="cr">CR / Admin</option>
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
          <p className="text-sm text-center text-slate-600">
            Already registered? <Link className="text-primary" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
