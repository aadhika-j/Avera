import React, { useState } from "react";
import useSWR from "swr";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { formatDateDMY, ensureAbsoluteUrl } from "../utils/dateFormat";
import { PageLoader, ButtonSpinner } from "../components/Spinner";

const EventsPage = () => {
  const { data: eventsData, mutate: mutateEvents } = useSWR("/events");
  const events = eventsData?.events || [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", description: "", registrationLink: "" });
  const { isCR } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/events", form);
      mutateEvents();
      setForm({ name: "", date: "", description: "", registrationLink: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/events/${id}`);
    mutateEvents();
  };

  if (!eventsData && !events.length) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Campus</p>
        <h1 className="text-3xl font-semibold text-ink">Events & Competitions</h1>
      </div>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-5 rounded-3xl"
        >
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
          <button 
            className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg flex items-center justify-center" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <ButtonSpinner /> : null}
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event._id} className="neo-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-ink">{event.name}</p>
                <p className="text-sm text-slate-600">
                  {formatDateDMY(event.date)} - {event.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {event.registrationLink && (
                  <a
                    className="text-primary underline"
                    href={ensureAbsoluteUrl(event.registrationLink)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Register
                  </a>
                )}
                {isCR && (
                  <button onClick={() => remove(event._id)} className="text-red-600 text-sm" type="button">
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;