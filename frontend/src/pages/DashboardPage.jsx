import React from "react";

const DashboardPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
    <p className="text-slate-600">
      Quick overview of reminders, materials, and events. Build on this section with
      charts and deadlines.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {["Reminders", "Materials", "Events"].map((item) => (
        <div key={item} className="bg-white rounded shadow p-4 border">
          <p className="text-sm text-slate-500">{item}</p>
          <p className="text-2xl font-semibold text-primary">--</p>
        </div>
      ))}
    </div>
  </div>
);

export default DashboardPage;
