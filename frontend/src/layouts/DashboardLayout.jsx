import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import useSWR from "swr";
import { useAuth } from "../hooks/useAuth";
import ThemeToggle from "../components/ThemeToggle.jsx";
import api from "../services/api";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/subjects", label: "Subjects" },
  { to: "/materials", label: "Materials" },
  { to: "/reminders", label: "Reminders" },
  { to: "/events", label: "Events" },
  { to: "/chat", label: "Chat" },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const lastSeenKeys = useMemo(
    () => ({
      materials: user?._id ? `materialsLastSeen:${user._id}` : "materialsLastSeen",
      reminders: user?._id ? `remindersLastSeen:${user._id}` : "remindersLastSeen",
      events: user?._id ? `eventsLastSeen:${user._id}` : "eventsLastSeen",
      chat: user?._id ? `chatLastSeen:${user._id}` : "chatLastSeen",
    }),
    [user?._id]
  );

  const countNew = (items = [], lastSeen) => {
    const seenDate = lastSeen ? new Date(lastSeen) : null;
    if (!seenDate) return items.length;
    return items.filter((item) => {
      const createdAt = item?.createdAt;
      if (!createdAt) return true;
      return new Date(createdAt) > seenDate;
    }).length;
  };

  const { data: materialsData } = useSWR("/materials");
  const { data: remindersData } = useSWR("/components/upcoming");
  const { data: eventsData } = useSWR("/events");
  const { data: chatData } = useSWR("/chat");
  // Prefetch subjects as well so it's ready when navigating
  useSWR("/subjects");

  const counts = useMemo(() => {
    const lastSeen = {
      materials: localStorage.getItem(lastSeenKeys.materials),
      reminders: localStorage.getItem(lastSeenKeys.reminders),
      events: localStorage.getItem(lastSeenKeys.events),
      chat: localStorage.getItem(lastSeenKeys.chat),
    };
    return {
      materials: countNew(materialsData?.materials, lastSeen.materials),
      reminders: countNew(remindersData?.components, lastSeen.reminders),
      events: countNew(eventsData?.events, lastSeen.events),
      chat: countNew(chatData?.messages, lastSeen.chat),
    };
  }, [materialsData, remindersData, eventsData, chatData, lastSeenKeys]);

  useEffect(() => {
    const pathToKey = {
      "/materials": "materials",
      "/reminders": "reminders",
      "/events": "events",
      "/chat": "chat",
    };

    const matchedKey = Object.entries(pathToKey).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1];

    if (matchedKey) {
      const now = new Date().toISOString();
      localStorage.setItem(lastSeenKeys[matchedKey], now);
    }
  }, [location.pathname, lastSeenKeys]);

  const links = baseLinks;

  return (
    <div className="min-h-screen app-shell">
      <header className="glass-nav px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold text-lg text-ink">
          Student Academic Reminder
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <span className="text-slate-600">{user?.name}</span>
          <button
            onClick={logout}
            className="micro-btn glass-btn text-primary border border-primary/30 px-3 py-1 rounded-full"
            type="button"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex gap-6 px-6 pb-8 pt-6">
        <aside className="w-64 glass-panel rounded-3xl p-4 space-y-2 h-fit">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 px-3">Menu</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-4 py-3 rounded-2xl hover-lift transition ${
                  isActive
                    ? "glass-active text-primary shadow"
                    : "text-slate-600 hover:text-primary"
                }`
              }
            >
              <span className="font-medium">{link.label}</span>
              {link.to === "/materials" && counts.materials > 0 && (
                <span className="text-[11px] bg-primary text-white rounded-full px-2 py-[2px]">
                  {counts.materials}
                </span>
              )}
              {link.to === "/reminders" && counts.reminders > 0 && (
                <span className="text-[11px] bg-primary text-white rounded-full px-2 py-[2px]">
                  {counts.reminders}
                </span>
              )}
              {link.to === "/events" && counts.events > 0 && (
                <span className="text-[11px] bg-primary text-white rounded-full px-2 py-[2px]">
                  {counts.events}
                </span>
              )}
              {link.to === "/chat" && counts.chat > 0 && (
                <span className="text-[11px] bg-primary text-white rounded-full px-2 py-[2px]">
                  {counts.chat}
                </span>
              )}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 space-y-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
