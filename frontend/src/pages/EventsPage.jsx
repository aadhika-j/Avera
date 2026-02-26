import React, { useEffect, useState } from "react";
import api from "../services/api";

const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await api.get("/events");
      setEvents(data.events || []);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Events & Competitions</h1>
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event._id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">{event.name}</p>
                <p className="text-sm text-slate-600">
                  {new Date(event.date).toLocaleDateString()} - {event.description}
                </p>
              </div>
              {event.registrationLink && (
                <a
                  className="text-primary underline"
                  href={event.registrationLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Register
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
