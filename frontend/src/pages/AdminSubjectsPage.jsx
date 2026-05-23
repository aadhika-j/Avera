import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const AdminSubjectsPage = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", semesterId: "" });

  useEffect(() => {
    const load = async () => {
      const [{ data: subData }, { data: semData }] = await Promise.all([
        api.get("/subjects"),
        api.get("/semesters"),
      ]);
      setSubjects(subData.subjects || []);
      setSemesters(semData.semesters || []);
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/subjects", form);
    const { data } = await api.get("/subjects");
    setSubjects(data.subjects || []);
    setForm({ name: "", code: "", semesterId: "" });
  };

  const remove = async (id) => {
    await api.delete(`/subjects/${id}`);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
          <h1 className="text-3xl font-semibold text-ink">Manage Subjects</h1>
        </div>
        <span className="text-sm text-slate-500">Logged in as {user?.role}</span>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 glass-panel p-5 rounded-3xl">
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <select
          className="rounded-xl px-4 py-3 micro-input"
          value={form.semesterId}
          onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
          required
        >
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg" type="submit">
          Add Subject
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject._id} className="neo-card p-5 hover-lift">
            <p className="text-sm text-slate-500">{subject.semester?.name}</p>
            <p className="text-lg font-semibold text-ink">{subject.name}</p>
            <p className="text-slate-600">Code: {subject.code}</p>
            <button
              onClick={() => remove(subject._id)}
              className="text-red-600 text-sm mt-2"
              type="button"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSubjectsPage;
