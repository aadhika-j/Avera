import React, { useState } from "react";
import useSWR from "swr";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { formatDateTime, toDatetimeLocalIST, fromDatetimeLocalIST } from "../utils/dateFormat";
import { PageLoader, ButtonSpinner } from "../components/Spinner";

const typeLabels = {
  assignment1: "Assignment 1",
  assignment2: "Assignment 2",
  classTest1: "Class Test 1",
  classTest2: "Class Test 2",
  presentation: "Presentation",
  research: "Research",
};

const ReminderDashboard = () => {
  const { data: upcomingData, mutate: mutateUpcoming } = useSWR("/components/upcoming");
  const upcoming = upcomingData?.components || [];

  const { data: subjectsData } = useSWR("/subjects");
  const subjects = subjectsData?.subjects || [];

  const [form, setForm] = useState({ subjectId: "", type: "assignment1", deadline: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isCR } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.deadline) {
        payload.deadline = fromDatetimeLocalIST(payload.deadline);
      }
      
      if (editingId) {
        await api.put(`/components/${editingId}`, payload);
      } else {
        await api.post("/components", payload);
      }
      mutateUpcoming();
      setForm({ subjectId: "", type: "assignment1", deadline: "", description: "" });
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/components/${id}`);
    mutateUpcoming();
    if (editingId === id) {
      setEditingId(null);
      setForm({ subjectId: "", type: "assignment1", deadline: "", description: "" });
    }
  };

  if (!upcomingData || !subjectsData) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Planner</p>
        <h1 className="text-3xl font-semibold text-ink">Reminders</h1>
      </div>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-5 rounded-3xl"
        >
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
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          <button 
            className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <ButtonSpinner /> : null}
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {upcoming.length === 0 ? (
        <p className="text-slate-600">No upcoming items.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((c) => (
            <div key={c._id} className="neo-card p-5 hover-lift">
              <p className="text-lg font-semibold text-ink">{c.subject?.name}</p>
              <p className="text-sm text-slate-600">{typeLabels[c.type] || c.type}</p>
              <p className="text-sm text-slate-600">Due: {formatDateTime(c.deadline)}</p>
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
                        deadline: c.deadline ? toDatetimeLocalIST(c.deadline) : "",
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