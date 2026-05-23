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
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
        <h1 className="text-3xl font-semibold text-ink">Manage Events</h1>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-5 rounded-3xl">
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Registration link"
          value={form.registrationLink}
          onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
        />
        <button className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg" type="submit">
          Save
        </button>
      </form>

      <div className="grid gap-4">
        {events.map((ev) => (
          <div key={ev._id} className="neo-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-ink">{ev.name}</p>
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
