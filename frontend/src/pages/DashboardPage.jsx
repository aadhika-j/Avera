import React from "react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { formatDateTime } from "../utils/dateFormat";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: materialsData, isLoading: mLoading } = useSWR("/materials");
  const { data: remindersData, isLoading: rLoading } = useSWR("/components/upcoming");
  const { data: eventsData, isLoading: eLoading } = useSWR("/events");
  const { data: chatData, isLoading: cLoading } = useSWR("/chat");

  const materials = materialsData?.materials || [];
  const reminders = remindersData?.components || [];
  const events = eventsData?.events || [];
  const chats = chatData?.messages || [];

  const loading = mLoading || rLoading || eLoading || cLoading;

  const stats = {
    materials: materials.length,
    reminders: reminders.length,
    events: events.length,
    chat: chats.length,
  };

  const latestMaterials = materials.slice(0, 3);
  const upcoming = reminders.slice(0, 3);

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
                    {item.deadline ? formatDateTime(item.deadline) : ""}
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
