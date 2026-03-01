import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [materials, reminders, events, chats] = await Promise.all([
          api.get("/materials"),
          api.get("/components/upcoming"),
          api.get("/events"),
          api.get("/chat"),
        ]);
        setCounts({
          materials: materials.data?.materials?.length || 0,
          reminders: reminders.data?.components?.length || 0,
          events: events.data?.events?.length || 0,
          chat: chats.data?.messages?.length || 0,
        });
      } catch (err) {
        // ignore count errors
      }
    };
    loadCounts();
  }, []);

  const links = baseLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-semibold text-primary">
          Student Academic Reminder
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{user?.name}</span>
          <button
            onClick={logout}
            className="text-primary hover:underline"
            type="button"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="flex">
        <aside className="w-56 bg-white border-r min-h-screen p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative block px-3 py-2 rounded hover:bg-slate-100 ${
                  isActive ? "bg-slate-100 text-primary" : "text-slate-700"
                }`
              }
            >
              <span className="pr-6 inline-block">{link.label}</span>
              {link.to === "/materials" && counts.materials > 0 && (
                <span className="absolute right-2 bottom-2 text-[11px] bg-red-500 text-white rounded-full px-2 py-[2px]">
                  {counts.materials}
                </span>
              )}
              {link.to === "/reminders" && counts.reminders > 0 && (
                <span className="absolute right-2 bottom-2 text-[11px] bg-red-500 text-white rounded-full px-2 py-[2px]">
                  {counts.reminders}
                </span>
              )}
              {link.to === "/events" && counts.events > 0 && (
                <span className="absolute right-2 bottom-2 text-[11px] bg-red-500 text-white rounded-full px-2 py-[2px]">
                  {counts.events}
                </span>
              )}
              {link.to === "/chat" && counts.chat > 0 && (
                <span className="absolute right-2 bottom-2 text-[11px] bg-red-500 text-white rounded-full px-2 py-[2px]">
                  {counts.chat}
                </span>
              )}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 p-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
