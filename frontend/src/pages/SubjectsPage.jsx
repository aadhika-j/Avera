import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const DEFAULT_SEMESTERS = [
  { value: "", label: "Select semester" },
  { value: 1, label: "I" },
  { value: 2, label: "II" },
  { value: 3, label: "III" },
  { value: 4, label: "IV" },
  { value: 5, label: "V" },
  { value: 6, label: "VI" },
  { value: 7, label: "VII" },
  { value: 8, label: "VIII" },
];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [form, setForm] = useState({ name: "", code: "", semesterId: "" });
  const { isCR } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await api.get("/subjects");
      setSubjects(data.subjects || []);
    };
    const fetchSemesters = async () => {
      try {
        const { data } = await api.get("/semesters");
        const opts = [{ value: "", label: "Select semester" }].concat(
          (data.semesters || []).map((s) => ({ value: s._id || s.number, label: s.name }))
        );
        setSemesters(opts);
      } catch (err) {
        setSemesters(DEFAULT_SEMESTERS);
      }
    };

    fetchSubjects();
    fetchSemesters();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/subjects", {
      name: form.name,
      code: form.code,
      semesterId: form.semesterId,
    });
    setSubjects((prev) => [data.subject, ...prev]);
    setForm({ name: "", code: "", semesterId: "" });
  };

  const remove = async (id) => {
    await api.delete(`/subjects/${id}`);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Subjects</h1>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 border rounded"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.semesterId}
            onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
            required
          >
            {semesters.map((s) => (
              <option key={s.value || s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
            Add Subject
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject._id} className="bg-white border rounded p-4 shadow-sm">
            <p className="text-sm text-slate-500">{subject.semester?.name}</p>
            <p className="text-lg font-semibold text-slate-800">{subject.name}</p>
            <p className="text-slate-600">Code: {subject.code}</p>
            {isCR && (
              <button
                onClick={() => remove(subject._id)}
                className="text-red-600 text-sm mt-2"
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;