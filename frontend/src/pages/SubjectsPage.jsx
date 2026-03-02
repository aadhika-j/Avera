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
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [components, setComponents] = useState([]);
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

  useEffect(() => {
    const loadComponents = async () => {
      if (!selectedSubject?._id) return;
      try {
        const { data } = await api.get(`/components?subjectId=${selectedSubject._id}`);
        setComponents(data.components || []);
      } catch (err) {
        setComponents([]);
      }
    };
    loadComponents();
  }, [selectedSubject]);

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
    if (selectedSubject?._id === id) {
      setSelectedSubject(null);
      setComponents([]);
    }
  };

  const formatLabel = (type) => {
    if (type === "presentation") return "Will be conducted on";
    if (type === "classTest1" || type === "classTest2") return "Will be conducted on";
    return "To be submitted on";
  };

  const formatDateOnly = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const componentSlots = [
    "assignment1",
    "assignment2",
    "classTest1",
    "classTest2",
    "presentation",
    "research",
  ];

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
          <button
            key={subject._id}
            type="button"
            onClick={() => setSelectedSubject(subject)}
            className={`rounded-lg border shadow-sm text-left p-4 transition hover:-translate-y-0.5 hover:shadow-md bg-sky-900 text-white ${
              selectedSubject?._id === subject._id ? "ring-2 ring-sky-400" : ""
            }`}
          >
            <p className="text-sm text-sky-100">{subject.semester?.name}</p>
            <p className="text-lg font-semibold">{subject.name}</p>
            <p className="text-sky-100/80">Code: {subject.code}</p>
            {isCR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(subject._id);
                }}
                className="text-rose-200 text-sm mt-2 underline"
                type="button"
              >
                Delete
              </button>
            )}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <div className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-800">{selectedSubject.name} Components</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {componentSlots.map((slot) => {
              const found = components.find((c) => c.type === slot);
              const label = formatLabel(slot);
              return (
                <div
                  key={slot}
                  className="border rounded-lg bg-white p-3 shadow-sm flex flex-col gap-2"
                >
                  <p className="text-sm font-semibold text-slate-800">{slot}</p>
                  {found ? (
                    <p className="text-sm text-slate-600">
                      {label} {formatDateOnly(found.deadline || found.createdAt)}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">Not assigned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;