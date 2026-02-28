import React, { useEffect, useState } from "react";
import api from "../services/api";

const typeLabels = {
  assignment1: "Assignment 1",
  assignment2: "Assignment 2",
  classTest1: "Class Test 1",
  classTest2: "Class Test 2",
  presentation: "Presentation",
  research: "Research",
};

const ReminderDashboard = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await api.get("/components/upcoming");
      setUpcoming(data.components || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <p className="text-slate-600">Loading reminders...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Reminders</h1>
      {upcoming.length === 0 ? (
        <p className="text-slate-600">No upcoming items.</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((c) => (
            <div key={c._id} className="bg-white border rounded p-4 shadow-sm">
              <p className="text-lg font-semibold text-slate-800">{c.subject?.name}</p>
              <p className="text-sm text-slate-600">{typeLabels[c.type] || c.type}</p>
              <p className="text-sm text-slate-600">Due: {new Date(c.deadline).toLocaleString()}</p>
              <p className="text-sm text-slate-600">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReminderDashboard;
