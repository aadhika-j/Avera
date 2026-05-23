import React, { useEffect, useState } from "react";
import api from "../services/api";

const componentTypes = [
  { value: "assignment1", label: "Assignment 1" },
  { value: "assignment2", label: "Assignment 2" },
  { value: "classTest1", label: "Class Test 1" },
  { value: "classTest2", label: "Class Test 2" },
  { value: "presentation", label: "Presentation" },
  { value: "research", label: "Research" },
];

const AdminComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: "", type: "assignment1", deadline: "", description: "" });

  useEffect(() => {
    const load = async () => {
      const [{ data: compData }, { data: subjData }] = await Promise.all([
        api.get("/components"),
        api.get("/subjects"),
      ]);
      setComponents(compData.components || []);
      setSubjects(subjData.subjects || []);
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/components", form);
    const { data } = await api.get("/components");
    setComponents(data.components || []);
    setForm({ subjectId: "", type: "assignment1", deadline: "", description: "" });
  };

  const remove = async (id) => {
    await api.delete(`/components/${id}`);
    setComponents((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
        <h1 className="text-3xl font-semibold text-ink">Manage Internal Components</h1>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-5 rounded-3xl">
        <select
          className="rounded-xl px-4 py-3 micro-input"
          value={form.subjectId}
          onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl px-4 py-3 micro-input"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
        >
          {componentTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          className="rounded-xl px-4 py-3 micro-input"
          value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          required
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg" type="submit">
          Save
        </button>
      </form>

      <div className="grid gap-4">
        {components.map((c) => (
          <div key={c._id} className="neo-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-ink">{c.subject?.name}</p>
                <p className="text-sm text-slate-600">{componentTypes.find((t) => t.value === c.type)?.label}</p>
                <p className="text-sm text-slate-600">Due: {new Date(c.deadline).toLocaleString()}</p>
                <p className="text-sm text-slate-600">{c.description}</p>
              </div>
              <button onClick={() => remove(c._id)} className="text-red-600 text-sm" type="button">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminComponentsPage;
