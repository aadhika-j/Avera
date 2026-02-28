import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const typeLabels = {
  assignment1: "Assignment 1",
  assignment2: "Assignment 2",
  classTest1: "Class Test 1",
  classTest2: "Class Test 2",
  presentation: "Presentation",
  research: "Research",
};

const ReminderDashboard = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: "", type: "assignment1", deadline: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const { isCR } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: compData }, { data: subjData }] = await Promise.all([
        api.get("/components/upcoming"),
        api.get("/subjects"),
      ]);
      setUpcoming(compData.components || []);
      setSubjects(subjData.subjects || []);
      setLoading(false);
    };
    load();
  }, []);

  const refreshUpcoming = async () => {
    const { data } = await api.get("/components/upcoming");
    setUpcoming(data.components || []);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/components/${editingId}`, form);
    } else {
      await api.post("/components", form);
    }
    await refreshUpcoming();
    setForm({ subjectId: "", type: "assignment1", deadline: "", description: "" });
    setEditingId(null);
  };

  const remove = async (id) => {
    await api.delete(`/components/${id}`);
    setUpcoming((prev) => prev.filter((c) => c._id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ subjectId: "", type: "assignment1", deadline: "", description: "" });
    }
  };

  if (loading) {
    return <p className="text-slate-600">Loading reminders...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Reminders</h1>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 border rounded"
        >
          <select
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            required
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {upcoming.length === 0 ? (
        <p className="text-slate-600">No upcoming items.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((c) => (
            <div key={c._id} className="bg-white border rounded p-4 shadow-sm">
              <p className="text-lg font-semibold text-slate-800">{c.subject?.name}</p>
              <p className="text-sm text-slate-600">{typeLabels[c.type] || c.type}</p>
              <p className="text-sm text-slate-600">Due: {new Date(c.deadline).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{c.description}</p>
              {isCR && (
                <div className="flex gap-3 text-xs text-primary mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(c._id);
                      setForm({
                        subjectId: c.subject?._id || "",
                        type: c.type,
                        deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 16) : "",
                        description: c.description || "",
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button className="text-red-600" type="button" onClick={() => remove(c._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderDashboard;