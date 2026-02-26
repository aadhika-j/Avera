import React, { useEffect, useState } from "react";
import api from "../services/api";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await api.get("/subjects");
      setSubjects(data.subjects || []);
    };
    fetchSubjects();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Subjects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div key={subject._id} className="bg-white border rounded p-4 shadow-sm">
            <p className="text-sm text-slate-500">{subject.semester?.name}</p>
            <p className="text-lg font-semibold text-slate-800">{subject.name}</p>
            <p className="text-slate-600">Code: {subject.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;
