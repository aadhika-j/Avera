import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subjectId: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [etaText, setEtaText] = useState("");
  const [flash, setFlash] = useState("");
  const { isCR } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: matData }, { data: subjData }] = await Promise.all([
        api.get("/materials"),
        api.get("/subjects"),
      ]);
      setMaterials(matData.materials || []);
      setSubjects(subjData.subjects || []);
    };
    fetchData();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setEtaText("");
    const startedAt = Date.now();
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data: uploadResp } = await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / (event.total || 1));
          const elapsedMs = Date.now() - startedAt;
          const bytesPerMs = event.loaded / Math.max(elapsedMs, 1);
          const remainingBytes = (event.total || 0) - event.loaded;
          const remainingMs = bytesPerMs ? remainingBytes / bytesPerMs : 0;
          const etaSeconds = Number.isFinite(remainingMs) ? Math.max(0, Math.round(remainingMs / 1000)) : 0;
          setProgress(percent);
          setEtaText(etaSeconds ? `${etaSeconds}s remaining` : "");
        },
      });
      const url = uploadResp.url;
      const { data } = await api.post("/materials", {
        ...form,
        url,
        storageProvider: "cloudinary",
      });
      setMaterials((prev) => [data.material, ...prev]);
      setForm({ title: "", description: "", subjectId: "" });
      setFile(null);
      setFlash("Material uploaded successfully");
    } finally {
      setUploading(false);
      setEtaText("");
      setTimeout(() => setFlash(""), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Study Materials</h1>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 border rounded"
        >
          {flash && (
            <div className="md:col-span-5 text-sm rounded bg-green-50 text-green-700 px-3 py-2 border border-green-200">
              {flash}
            </div>
          )}
          <input
            className="border rounded px-3 py-2"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.png"
            className="border rounded px-3 py-2"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {uploading && (
            <div className="md:col-span-5 h-2 bg-slate-200 rounded overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          )}
          {uploading && (
            <div className="md:col-span-5 flex justify-between text-xs text-slate-600">
              <span>{progress}%</span>
              {etaText ? <span>{etaText}</span> : null}
            </div>
          )}
        </form>
      )}

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