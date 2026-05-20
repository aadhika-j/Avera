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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Manage Materials</h1>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 border rounded">
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
      </form>

      <div className="space-y-3">
        {materials.map((m) => (
          <div key={m._id} className="bg-white border rounded p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-800">{m.title}</p>
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
