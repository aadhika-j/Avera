import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

const DEFAULT_SEMESTERS = [
  { value: 1, label: "I" },
  { value: 2, label: "II" },
  { value: 3, label: "III" },
  { value: 4, label: "IV" },
  { value: 5, label: "V" },
  { value: 6, label: "VI" },
  { value: 7, label: "VII" },
  { value: 8, label: "VIII" },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    semester: DEFAULT_SEMESTERS[0].value,
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const { data } = await api.get("/semesters");
        const opts = (data.semesters || []).map((s) => ({ value: s._id || s.number, label: s.name }));
        if (opts.length) {
          setSemesters(opts);
          setForm((prev) => ({ ...prev, semester: opts[0].value }));
        }
      } catch (err) {
        setSemesters(DEFAULT_SEMESTERS);
      }
    };

    loadSemesters();
  }, []);

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Get started</p>
        <h1 className="text-3xl font-semibold mb-4 text-ink">Create account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-slate-600">Name</label>
            <input
              type="text"
              name="name"
              className="w-full rounded-xl px-4 py-3 micro-input"
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
              className="w-full rounded-xl px-4 py-3 micro-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full rounded-xl px-4 py-3 pr-12 micro-input"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 text-sm text-slate-500"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600">Semester</label>
            <select
              name="semester"
              className="w-full rounded-xl px-4 py-3 micro-input"
              value={form.semester}
              onChange={handleChange}
              required
            >
              {semesters.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-600">Role</label>
            <select
              name="role"
              className="w-full rounded-xl px-4 py-3 micro-input"
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
            className="w-full micro-btn bg-primary text-white py-3 rounded-full shadow-lg"
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
