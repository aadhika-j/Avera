import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data } = await api.get("/materials");
      setMaterials(data.materials || []);
    };
    fetchMaterials();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Study Materials</h1>
      <div className="space-y-3">
        {materials.map((m) => (
          <div key={m._id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">{m.title}</p>
                <p className="text-sm text-slate-600">{m.subject?.name}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link className="text-primary underline" to={`/materials/${m._id}`}>
                  Details
                </Link>
                <a
                  className="text-primary underline"
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-2">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsPage;
