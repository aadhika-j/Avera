import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const DEFAULT_SEMESTERS = [
  { value: "", label: "Select semester" },
  { value: 1, label: "I" },
  { value: 2, label: "II" },
  { value: 3, label: "III" },
  { value: 4, label: "IV" },
  { value: 5, label: "V" },
  { value: 6, label: "VI" },
  { value: 7, label: "VII" },
  { value: 8, label: "VIII" },
];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState(DEFAULT_SEMESTERS);
  const [form, setForm] = useState({ name: "", code: "", semesterId: "" });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [components, setComponents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [flash, setFlash] = useState("");
  const [flashError, setFlashError] = useState("");
  const [pendingFiles, setPendingFiles] = useState({});
  const [copyMessage, setCopyMessage] = useState("");
  const { isCR } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await api.get("/subjects");
      setSubjects(data.subjects || []);
    };
    const fetchSemesters = async () => {
      try {
        const { data } = await api.get("/semesters");
        const opts = [{ value: "", label: "Select semester" }].concat(
          (data.semesters || []).map((s) => ({ value: s._id || s.number, label: s.name }))
        );
        setSemesters(opts);
      } catch (err) {
        setSemesters(DEFAULT_SEMESTERS);
      }
    };

    fetchSubjects();
    fetchSemesters();
  }, []);

  useEffect(() => {
    const loadComponents = async () => {
      if (!selectedSubject?._id) return;
      await refreshComponents(selectedSubject._id);
    };
    loadComponents();
  }, [selectedSubject]);

  const refreshComponents = async (subjectId) => {
    try {
      const { data } = await api.get(`/components?subjectId=${subjectId}`);
      setComponents(data.components || []);
      const drafts = {};
      (data.components || []).forEach((c) => {
        drafts[c._id] = c.attachmentNote || "";
      });
      setNoteDrafts(drafts);
    } catch (err) {
      setComponents([]);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/subjects", {
      name: form.name,
      code: form.code,
      semesterId: form.semesterId,
    });
    setSubjects((prev) => [data.subject, ...prev]);
    setForm({ name: "", code: "", semesterId: "" });
  };

  const remove = async (id) => {
    await api.delete(`/subjects/${id}`);
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    if (selectedSubject?._id === id) {
      setSelectedSubject(null);
      setShowModal(false);
      setComponents([]);
    }
  };

  const formatLabel = (type) => {
    if (type === "presentation") return "Will be conducted on";
    if (type === "classTest1" || type === "classTest2") return "Will be conducted on";
    return "To be submitted on";
  };

  const formatDateOnly = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const componentSlots = [
    "assignment1",
    "assignment2",
    "classTest1",
    "classTest2",
    "presentation",
    "research",
  ];

  const sanitizeLink = (rawLink) => {
    if (!rawLink || typeof rawLink !== "string") return "";
    const trimmed = rawLink.trim().replace(/^"|"$/g, "");
    return trimmed;
  };

  const buildCloudinaryUrl = (att) => {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return "";
    const publicId = att?.publicId;
    const format = att?.format;
    if (!publicId || !format) return "";
    const version = att?.version ? `v${att.version}/` : "";
    const type = att?.resourceType || "raw";
    return `https://res.cloudinary.com/${cloud}/${type}/upload/${version}${publicId}.${format}`;
  };

  const pickLink = (att) => {
    const candidates = [att?.secureUrl, att?.secure_url, att?.url, att?.signedUrl, att?.link];
    const first = candidates.find((c) => typeof c === "string" && c.trim());
    if (first) return sanitizeLink(first);
    const fallback = buildCloudinaryUrl(att);
    return sanitizeLink(fallback);
  };

  const inferFormat = (att, link) => {
    if (att?.format) return att.format;
    if (att?.mimeType?.includes("/")) return att.mimeType.split("/")[1];
    const fromName = (att?.name || link || "").split(".").pop();
    return fromName;
  };

  const buildPreviewLink = (att, link) => {
    if (!link) return "";
    const format = (inferFormat(att, link) || "").toLowerCase();
    const docTypes = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"]; // force Google viewer for Office docs
    if (docTypes.includes(format)) {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(link)}`;
    }
    return link;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Link copied");
      setTimeout(() => setCopyMessage(""), 1500);
    } catch (err) {
      setCopyMessage("Copy failed");
      setTimeout(() => setCopyMessage(""), 1500);
    }
  };

  const uploadFile = async (file) => {
    const startedAt = Date.now();
    setUploadProgress({ current: 0, eta: "", startedAt });
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        const percent = Math.round((event.loaded * 100) / (event.total || 1));
        const elapsedMs = Date.now() - startedAt;
        const bytesPerMs = event.loaded / Math.max(elapsedMs, 1);
        const remainingBytes = (event.total || 0) - event.loaded;
        const remainingMs = bytesPerMs ? remainingBytes / bytesPerMs : 0;
        const etaSeconds = Number.isFinite(remainingMs) ? Math.max(0, Math.round(remainingMs / 1000)) : 0;
        const eta = etaSeconds ? `${etaSeconds}s remaining` : "";
        setUploadProgress({ current: percent, eta, startedAt });
      },
    });
    return data;
  };

  const saveAttachments = async (componentId, nextAttachments, note) => {
    const { data } = await api.put(`/components/${componentId}`, {
      attachments: nextAttachments,
      attachmentNote: note,
    });
    const updated = data.component || null;
    setComponents((prev) =>
      prev.map((c) =>
        c._id === componentId ? updated || { ...c, attachments: nextAttachments, attachmentNote: note } : c
      )
    );
    // refresh from server to ensure persisted URLs are used
    await refreshComponents(selectedSubject?._id || "");
  };

  const handleAddAttachment = async (component, file) => {
    if (!file) return;
    setUploading(component._id);
    try {
      const upload = await uploadFile(file);
      const uploadedUrl = sanitizeLink(upload.secure_url || upload.url || upload.signedUrl || upload.secureUrl);
      if (!uploadedUrl) {
        throw new Error("Upload did not return a file URL");
      }
      const next = [
        ...(component.attachments || []),
        {
          name: file.name,
          url: uploadedUrl,
          secureUrl: uploadedUrl,
          signedUrl: upload.signedUrl || uploadedUrl,
          publicId: upload.publicId,
          resourceType: upload.resourceType,
          format: upload.format,
          version: upload.version,
          mimeType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        },
      ];
      const note = noteDrafts[component._id] || "";
      await saveAttachments(component._id, next, note);
      setFlash("Attachment uploaded successfully");
      setFlashError("");
    } finally {
      setUploading(null);
      setUploadProgress((prev) => ({ ...prev, current: 0 }));
      setPendingFiles((prev) => ({ ...prev, [component._id]: null }));
      setTimeout(() => setFlash(""), 2000);
    }
  };

  const triggerPendingUpload = (component) => {
    const pending = pendingFiles[component._id];
    if (pending) {
      handleAddAttachment(component, pending);
    }
  };

  const handleRemoveAttachment = async (component, index) => {
    const current = component.attachments || [];
    const next = current.filter((_, i) => i !== index);
    const note = noteDrafts[component._id] || "";
    await saveAttachments(component._id, next, note);
    setFlash("Attachment deleted");
    setTimeout(() => setFlash(""), 1500);
  };

  const handleNoteChange = (componentId, value) => {
    setNoteDrafts((prev) => ({ ...prev, [componentId]: value }));
  };

  const handleNoteSave = async (component) => {
    const note = noteDrafts[component._id] || "";
    try {
      await saveAttachments(component._id, component.attachments || [], note);
      setFlash("Message saved");
      setFlashError("");
    } catch (err) {
      setFlashError("Failed to save message");
    } finally {
      setTimeout(() => {
        setFlash("");
        setFlashError("");
      }, 2000);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">Subjects</h1>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 border rounded"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="border rounded px-3 py-2"
            value={form.semesterId}
            onChange={(e) => setForm({ ...form, semesterId: e.target.value })}
            required
          >
            {semesters.map((s) => (
              <option key={s.value || s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
            Add Subject
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <div
            key={subject._id}
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedSubject(subject);
              setShowModal(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setSelectedSubject(subject);
                setShowModal(true);
              }
            }}
            className={`rounded-lg border shadow-sm text-left p-4 transition hover:-translate-y-0.5 hover:shadow-md bg-sky-900 text-white cursor-pointer ${
              selectedSubject?._id === subject._id ? "ring-2 ring-sky-400" : ""
            }`}
          >
            <p className="text-sm text-sky-100">{subject.semester?.name}</p>
            <p className="text-lg font-semibold">{subject.name}</p>
            <p className="text-sky-100/80">Code: {subject.code}</p>
            {isCR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(subject._id);
                }}
                className="text-rose-200 text-sm mt-2 underline"
                type="button"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-5 relative">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedSubject(null);
                setComponents([]);
              }}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
            <div className="mb-4">
              <p className="text-sm text-slate-500">{selectedSubject.semester?.name}</p>
              <h2 className="text-xl font-semibold text-slate-800">{selectedSubject.name}</h2>
              {flash && (
                <div className="mt-2 rounded bg-green-50 text-green-700 text-sm px-3 py-2 border border-green-200">
                  {flash}
                </div>
              )}
              {flashError && (
                <div className="mt-2 rounded bg-rose-50 text-rose-700 text-sm px-3 py-2 border border-rose-200">
                  {flashError}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {componentSlots.map((slot) => {
                const found = components.find((c) => c.type === slot);
                const label = formatLabel(slot);
                const isAssigned = Boolean(found);
                return (
                  <div
                    key={slot}
                    className="border rounded-lg bg-white p-3 shadow-sm flex flex-col gap-2"
                  >
                    <p className="text-sm font-semibold text-slate-800">{slot}</p>
                    {found ? (
                      <p className="text-sm text-slate-600">
                        {label} {formatDateOnly(found.deadline || found.createdAt)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400">Not assigned</p>
                    )}

                    {isAssigned && (
                      <div className="mt-1 space-y-2">
                        <p className="text-xs font-semibold text-slate-700">Attachments</p>
                        {found.attachments?.length ? (
                          <div className="space-y-2">
                            {found.attachments.map((att, idx) => {
                              const link = pickLink(att);
                              const isValidLink = /^https?:\/\//i.test(link);
                              const filename = att.name || `attachment-${idx + 1}`;
                              const previewLink = buildPreviewLink(att, link);
                              return (
                                <div
                                  key={link || `${idx}`}
                                  className="flex items-center justify-between text-sm bg-slate-50 border rounded px-2 py-1"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-slate-500">📎</span>
                                    <span className="text-slate-700 truncate" title={filename}>
                                      {filename}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    {isValidLink ? (
                                      <>
                                        <a
                                          className="text-primary underline"
                                          href={previewLink}
                                          target="_blank"
                                          rel="noreferrer noopener"
                                          title={link}
                                        >
                                          Preview
                                        </a>
                                        <a
                                          className="text-primary underline"
                                          href={link}
                                          download={filename}
                                          rel="noreferrer noopener"
                                          title={link}
                                        >
                                          Download
                                        </a>
                                        <button
                                          type="button"
                                          className="text-primary underline"
                                          onClick={() => window.open(link, "_blank", "noopener")}
                                        >
                                          Open externally
                                        </button>
                                        <button
                                          type="button"
                                          className="text-slate-600 underline"
                                          onClick={() => copyToClipboard(link)}
                                        >
                                          Copy link
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-amber-600">Link unavailable</span>
                                    )}
                                    {isCR && (
                                      <button
                                        type="button"
                                        className="text-rose-600 underline"
                                        onClick={() => handleRemoveAttachment(found, idx)}
                                        disabled={uploading === found._id}
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 flex items-center gap-2">
                            <span>📎</span>
                            <span>No attachments</span>
                          </p>
                        )}

                        {isCR && (
                          <div className="space-y-2">
                            <label className="block text-xs text-slate-600" htmlFor={`${found._id}-file`}>
                              Add/replace attachments
                            </label>
                            <input
                              id={`${found._id}-file`}
                              type="file"
                              className="text-sm"
                              onChange={(e) =>
                                setPendingFiles((prev) => ({ ...prev, [found._id]: e.target.files?.[0] }))
                              }
                              disabled={uploading === found._id}
                            />
                            {pendingFiles[found._id] && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <span>{pendingFiles[found._id]?.name}</span>
                                <button
                                  type="button"
                                  className="bg-primary text-white px-2 py-1 rounded"
                                  onClick={() => triggerPendingUpload(found)}
                                  disabled={uploading === found._id}
                                >
                                  Save attachment
                                </button>
                              </div>
                            )}
                            {uploading === found._id ? (
                              <div className="space-y-1">
                                <div className="h-2 bg-slate-200 rounded overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${uploadProgress.current}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-600">
                                  <span>{uploadProgress.current}%</span>
                                  {uploadProgress.eta ? <span>{uploadProgress.eta}</span> : null}
                                </div>
                              </div>
                            ) : null}
                            {copyMessage && (
                              <p className="text-xs text-green-700">{copyMessage}</p>
                            )}
                            <div className="space-y-1">
                              <p className="text-xs text-slate-600">Message (optional)</p>
                              <textarea
                                className="w-full border rounded px-2 py-1 text-sm"
                                rows={2}
                                value={noteDrafts[found._id] ?? ""}
                                onChange={(e) => handleNoteChange(found._id, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleNoteSave(found)}
                                className="bg-primary text-white text-xs px-3 py-1 rounded"
                                disabled={uploading === found._id}
                              >
                                Save message
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;