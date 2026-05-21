import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { uploadToCloudinary } from "../services/upload";
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
  const [flashError, setFlashError] = useState("");
  const { isCR } = useAuth();

  const getMaxUploadBytes = () => {
    const raw = import.meta.env.VITE_MAX_UPLOAD_MB;
    const maxMb = Number(raw);
    if (!Number.isFinite(maxMb) || maxMb <= 0) return null;
    return Math.round(maxMb * 1024 * 1024);
  };

  const maxUploadBytes = getMaxUploadBytes();
  const maxUploadMb = maxUploadBytes ? Math.round(maxUploadBytes / (1024 * 1024)) : null;

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
    if (!maxUploadBytes) {
      setFlashError("Upload limit not configured");
      return;
    }
    if (file.size > maxUploadBytes) {
      setFlashError(`File too large. Max ${maxUploadMb} MB.`);
      return;
    }
    setUploading(true);
    setProgress(0);
    setEtaText("");
    setFlashError("");
    const startedAt = Date.now();
    try {
      const onProgress = (event) => {
        const percent = Math.round((event.loaded * 100) / (event.total || 1));
        const elapsedMs = Date.now() - startedAt;
        const bytesPerMs = event.loaded / Math.max(elapsedMs, 1);
        const remainingBytes = (event.total || 0) - event.loaded;
        const remainingMs = bytesPerMs ? remainingBytes / bytesPerMs : 0;
        const etaSeconds = Number.isFinite(remainingMs) ? Math.max(0, Math.round(remainingMs / 1000)) : 0;
        setProgress(percent);
        setEtaText(etaSeconds ? `${etaSeconds}s remaining` : "");
      };

      let uploadResp;
      try {
        uploadResp = await uploadToCloudinary(file, { onProgress });
      } catch (err) {
        const formData = new FormData();
        formData.append("file", file);
        uploadResp = (
          await api.post("/uploads", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: onProgress,
          })
        ).data;
      }

      const url = uploadResp.secure_url || uploadResp.secureUrl || uploadResp.url;
      const { data } = await api.post("/materials", {
        ...form,
        url,
        secureUrl: uploadResp.secure_url || uploadResp.secureUrl,
        publicId: uploadResp.public_id || uploadResp.publicId,
        resourceType: uploadResp.resource_type || uploadResp.resourceType,
        format: uploadResp.format,
        version: uploadResp.version,
        size: uploadResp.bytes || uploadResp.size,
        originalFilename: uploadResp.original_filename || uploadResp.originalFilename,
        storageProvider: "cloudinary",
      });
      setMaterials((prev) => [data.material, ...prev]);
      setForm({ title: "", description: "", subjectId: "" });
      setFile(null);
      setFlash("Material uploaded successfully");
    } catch (err) {
      setFlashError(err?.message || "Failed to upload material");
    } finally {
      setUploading(false);
      setEtaText("");
      setTimeout(() => setFlash(""), 2000);
      setTimeout(() => setFlashError(""), 3000);
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
          {flashError && (
            <div className="md:col-span-5 text-sm rounded bg-rose-50 text-rose-700 px-3 py-2 border border-rose-200">
              {flashError}
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
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              if (!selected) {
                setFile(null);
                return;
              }
              if (!maxUploadBytes) {
                setFlashError("Upload limit not configured");
                setTimeout(() => setFlashError(""), 2000);
                return;
              }
              if (selected.size > maxUploadBytes) {
                setFlashError(`File too large. Max ${maxUploadMb} MB.`);
                setTimeout(() => setFlashError(""), 3000);
                return;
              }
              setFile(selected);
            }}
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