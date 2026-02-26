import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/subjects", label: "Subjects" },
  { to: "/materials", label: "Materials" },
  { to: "/events", label: "Events" },
  { to: "/chat", label: "Chat" },
];

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();

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
                `block px-3 py-2 rounded hover:bg-slate-100 ${
                  isActive ? "bg-slate-100 text-primary" : "text-slate-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 p-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
