import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    materials: 0,
    reminders: 0,
    events: 0,
    chat: 0,
  });
  const [latestMaterials, setLatestMaterials] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [materialsRes, remindersRes, eventsRes, chatRes] = await Promise.all([
          api.get("/materials"),
          api.get("/components/upcoming"),
          api.get("/events"),
          api.get("/chat"),
        ]);
        const materials = materialsRes.data?.materials || [];
        const reminders = remindersRes.data?.components || [];
        const events = eventsRes.data?.events || [];
        const chats = chatRes.data?.messages || [];
        setStats({
          materials: materials.length,
          reminders: reminders.length,
          events: events.length,
          chat: chats.length,
        });
        setLatestMaterials(materials.slice(0, 3));
        setUpcoming(reminders.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Materials", value: stats.materials, to: "/materials" },
    { label: "Reminders", value: stats.reminders, to: "/reminders" },
    { label: "Events", value: stats.events, to: "/events" },
    { label: "Chat", value: stats.chat, to: "/chat" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Overview</p>
          <h1 className="text-3xl font-semibold text-ink">Dashboard</h1>
          <p className="text-slate-600 mt-2">
            Snapshot of the semester: deadlines, uploads, and active conversations.
          </p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-full text-sm text-slate-600">
          {loading ? "Refreshing" : "Live"} data
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => navigate(card.to)}
            className="neo-card p-5 text-left hover-lift"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold text-primary">
              {loading ? "--" : card.value}
            </p>
            <p className="text-xs text-slate-400 mt-2">Tap to open</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="liquid-card p-6">
          <h2 className="text-xl font-semibold text-ink">Latest materials</h2>
          <div className="mt-4 space-y-3">
            {latestMaterials.length ? (
              latestMaterials.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => navigate(`/materials/${item._id}`)}
                  className="glass-panel w-full text-left px-4 py-3 rounded-2xl hover-lift"
                >
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.subject?.name}</p>
                </button>
              ))
            ) : (
              <p className="text-slate-500">No materials yet.</p>
            )}
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl">
          <h2 className="text-xl font-semibold text-ink">Upcoming deadlines</h2>
          <div className="mt-4 space-y-3">
            {upcoming.length ? (
              upcoming.map((item) => (
                <div key={item._id} className="neo-card p-4">
                  <p className="font-semibold text-ink">{item.subject?.name}</p>
                  <p className="text-sm text-slate-500">{item.type}</p>
                  <p className="text-xs text-slate-400">
                    {item.deadline ? new Date(item.deadline).toLocaleString() : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">All clear for now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
