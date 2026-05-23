import React, { useEffect, useState } from "react";
import api from "../services/api";
import { uploadToCloudinary } from "../services/upload";

const AdminMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subjectId: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: matData }, { data: subjData }] = await Promise.all([
        api.get("/materials"),
        api.get("/subjects"),
      ]);
      setMaterials(matData.materials || []);
      setSubjects(subjData.subjects || []);
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const uploadResp = await uploadToCloudinary(file);
      const url = uploadResp.secure_url;
      const { data } = await api.post("/materials", {
        ...form,
        url,
        secureUrl: uploadResp.secure_url,
        publicId: uploadResp.public_id,
        resourceType: uploadResp.resource_type,
        format: uploadResp.format,
        version: uploadResp.version,
        size: uploadResp.bytes,
        originalFilename: uploadResp.original_filename,
        storageProvider: "cloudinary",
      });
      setMaterials((prev) => [data.material, ...prev]);
      setForm({ title: "", description: "", subjectId: "" });
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
        <h1 className="text-3xl font-semibold text-ink">Manage Materials</h1>
      </div>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 glass-panel p-5 rounded-3xl">
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="rounded-xl px-4 py-3 micro-input"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <select
          className="rounded-xl px-4 py-3 micro-input"
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
          className="rounded-xl px-4 py-3 micro-input"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        <button className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <div className="grid gap-4">
        {materials.map((m) => (
          <div key={m._id} className="neo-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-ink">{m.title}</p>
                <p className="text-sm text-slate-600">{m.subject?.name}</p>
              </div>
              <a className="text-primary underline" href={m.url} target="_blank" rel="noreferrer">
                View
              </a>
            </div>
            <p className="text-sm text-slate-600 mt-2">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMaterialsPage;
