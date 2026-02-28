import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { uploadToCloudinary } from "../services/upload";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Manage Subjects</h1>
        <span className="text-sm text-slate-500">Logged in as {user?.role}</span>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded border">
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
          <option value="">Select Semester</option>
          {semesters.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
          Add Subject
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject._id} className="bg-white border rounded p-4 shadow-sm">
            <p className="text-sm text-slate-500">{subject.semester?.name}</p>
            <p className="text-lg font-semibold text-slate-800">{subject.name}</p>
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
