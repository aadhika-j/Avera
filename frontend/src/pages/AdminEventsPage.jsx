import React, { useEffect, useState } from "react";
import api from "../services/api";

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ name: "", date: "", description: "", registrationLink: "" });

  const load = async () => {
    const { data } = await api.get("/events");
    setEvents(data.events || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/events", form);
    await load();
    setForm({ name: "", date: "", description: "", registrationLink: "" });
  };

  const remove = async (id) => {
    await api.delete(`/events/${id}`);
    setEvents((prev) => prev.filter((ev) => ev._id !== id));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Manage Events</h1>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 border rounded">
        <input
          className="border rounded px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Registration link"
          value={form.registrationLink}
          onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
        />
        <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
          Save
        </button>
      </form>

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev._id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">{ev.name}</p>
                <p className="text-sm text-slate-600">{new Date(ev.date).toLocaleDateString()}</p>
                <p className="text-sm text-slate-600">{ev.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {ev.registrationLink && (
                  <a className="text-primary underline" href={ev.registrationLink} target="_blank" rel="noreferrer">
                    Register
                  </a>
                )}
                <button onClick={() => remove(ev._id)} className="text-red-600 text-sm" type="button">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventsPage;
