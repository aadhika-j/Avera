import React, { useState } from "react";
import useSWR from "swr";
import api from "../services/api";
import { uploadToCloudinary } from "../services/upload";
import { useAuth } from "../hooks/useAuth";
import { formatDateShort } from "../utils/dateFormat";
import { PageLoader, ButtonSpinner, Spinner } from "../components/Spinner";

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
  const { data: subjectsData, mutate: mutateSubjects } = useSWR("/subjects");
  const subjects = subjectsData?.subjects || [];

  const { data: semestersData } = useSWR("/semesters");
  const semesters = semestersData?.semesters
    ? [{ value: "", label: "Select semester" }].concat(
        semestersData.semesters.map((s) => ({ value: s._id || s.number, label: s.name }))
      )
    : DEFAULT_SEMESTERS;

  const { data: componentsData, mutate: mutateComponents, isLoading: isComponentsLoading } = useSWR(
    selectedSubject?._id ? `/components?subjectId=${selectedSubject._id}` : null,
    {
      onSuccess: (data) => {
        const drafts = {};
        (data.components || []).forEach((c) => {
          drafts[c._id] = c.attachmentNote || "";
        });
        setNoteDrafts(drafts);
      }
    }
  );
  const components = componentsData?.components || [];

  const refreshComponents = () => mutateComponents();

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/subjects", {
      name: form.name,
      code: form.code,
      semesterId: form.semesterId,
    });
    mutateSubjects();
    setForm({ name: "", code: "", semesterId: "" });
  };

  const remove = async (id) => {
    await api.delete(`/subjects/${id}`);
    mutateSubjects();
    if (selectedSubject?._id === id) {
      setSelectedSubject(null);
      setShowModal(false);
    }
  };

  const formatLabel = (type) => {
    if (type === "presentation") return "Will be conducted on";
    if (type === "classTest1" || type === "classTest2") return "Will be conducted on";
    return "To be submitted on";
  };

  const formatDateOnly = formatDateShort;

  const componentSlots = [
    "assignment1",
    "assignment2",
    "classTest1",
    "classTest2",
    "presentation",
    "research",
  ];

  const getMaxUploadBytes = () => {
    const raw = import.meta.env.VITE_MAX_UPLOAD_MB;
    const maxMb = Number(raw);
    if (!Number.isFinite(maxMb) || maxMb <= 0) return null;
    return Math.round(maxMb * 1024 * 1024);
  };

  const maxUploadBytes = getMaxUploadBytes();
  const maxUploadMb = maxUploadBytes ? Math.round(maxUploadBytes / (1024 * 1024)) : null;

  const sanitizeLink = (rawLink) => {
    if (!rawLink || typeof rawLink !== "string") return "";
    const trimmed = rawLink.trim().replace(/^"|"$/g, "");
    return trimmed;
  };

  const buildCloudinaryUrl = (att) => {
    const base = import.meta.env.VITE_CLOUDINARY_DELIVERY_BASE;
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud || !base) return "";
    const publicId = att?.publicId;
    const format = att?.format;
    if (!publicId || !format) return "";
    const version = att?.version ? `v${att.version}/` : "";
    const type = att?.resourceType || "raw";
    return `${base}/${cloud}/${type}/upload/${version}${publicId}.${format}`;
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
      const viewerBase = import.meta.env.VITE_DOC_PREVIEW_BASE;
      if (!viewerBase) return link;
      return `${viewerBase}?embedded=1&url=${encodeURIComponent(link)}`;
    }
    return link;
  };

  const openPreview = (att) => {
    const rawUrl = pickLink(att);
    if (!rawUrl) {
      setFlashError("Preview unavailable");
      setTimeout(() => setFlashError(""), 2000);
      return;
    }
    const format = (inferFormat(att, rawUrl) || "").toLowerCase();
    const imageFormats = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
    const isImage = imageFormats.includes(format);
    const url = isImage ? rawUrl : buildPreviewLink(att, rawUrl);
    setPreview({ url, rawUrl, name: att?.name || "Attachment", isImage });
  };

  const closePreview = () => setPreview(null);

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
    const onProgress = (event) => {
      const percent = Math.round((event.loaded * 100) / (event.total || 1));
      const elapsedMs = Date.now() - startedAt;
      const bytesPerMs = event.loaded / Math.max(elapsedMs, 1);
      const remainingBytes = (event.total || 0) - event.loaded;
      const remainingMs = bytesPerMs ? remainingBytes / bytesPerMs : 0;
      const etaSeconds = Number.isFinite(remainingMs) ? Math.max(0, Math.round(remainingMs / 1000)) : 0;
      const eta = etaSeconds ? `${etaSeconds}s remaining` : "";
      setUploadProgress({ current: percent, eta, startedAt });
    };

    try {
      return await uploadToCloudinary(file, { onProgress });
    } catch (err) {
      const formData = new FormData();
      formData.append("file", file);
      return (await api.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: onProgress,
      })).data;
    }
  };

  const saveAttachments = async (componentId, nextAttachments, note) => {
    await api.put(`/components/${componentId}`, {
      attachments: nextAttachments,
      attachmentNote: note,
    });
    mutateComponents();
  };

  const handleAddAttachment = async (component, file) => {
    if (!file) return;
    setUploading(component._id);
    try {
      const upload = await uploadFile(file);
      const uploadedUrl = sanitizeLink(
        upload.secure_url || upload.secureUrl || upload.url || upload.signedUrl
      );
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
          publicId: upload.public_id || upload.publicId,
          resourceType: upload.resource_type || upload.resourceType,
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
    } catch (err) {
      setFlashError("Failed to upload attachment: " + (err?.message || "Unknown error"));
      setTimeout(() => setFlashError(""), 3000);
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
    try {
      await saveAttachments(component._id, next, note);
      setFlash("Attachment deleted");
      setTimeout(() => setFlash(""), 1500);
    } catch (err) {
      setFlashError("Failed to delete attachment: " + (err?.message || "Unknown error"));
      setTimeout(() => setFlashError(""), 3000);
    }
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

  if (!subjectsData && !subjects.length) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Academics</p>
        <h1 className="text-3xl font-semibold text-ink">Subjects</h1>
      </div>

      {isCR && (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 glass-panel p-5 rounded-3xl"
        >
          <input
            className="rounded-xl px-4 py-3 micro-input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="rounded-xl px-4 py-3 micro-input"
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <select
            className="rounded-xl px-4 py-3 micro-input"
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
          <button className="micro-btn bg-primary text-white px-4 py-3 rounded-full shadow-lg" type="submit" disabled={!subjectsData}>
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
            className={`neo-card text-left p-5 cursor-pointer hover-lift ${
              selectedSubject?._id === subject._id ? "ring-2 ring-primary/40" : ""
            }`}
          >
            <p className="text-sm text-slate-500">{subject.semester?.name}</p>
            <p className="text-lg font-semibold text-ink">{subject.name}</p>
            <p className="text-slate-500">Code: {subject.code}</p>
            {isCR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(subject._id);
                }}
                className="text-rose-500 text-sm mt-2 underline"
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
          <div className="glass-panel rounded-3xl shadow-xl w-full max-w-4xl p-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedSubject(null);
              }}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
            <div className="mb-4">
              <p className="text-sm text-slate-500">{selectedSubject.semester?.name}</p>
              <h2 className="text-2xl font-semibold text-ink">{selectedSubject.name}</h2>
              {flash && (
                <div className="mt-2 rounded text-sm px-3 py-2 glass-toast glass-toast-success">
                  {flash}
                </div>
              )}
              {flashError && (
                <div className="mt-2 rounded text-sm px-3 py-2 glass-toast glass-toast-error">
                  {flashError}
                </div>
              )}
            </div>
            {isComponentsLoading ? (
              <div className="py-12"><Spinner /></div>
            ) : (
            <div className="grid grid-cols-1 gap-4 max-h-[70vh] overflow-y-auto pr-1">
              {componentSlots.map((slot) => {
                const found = components.find((c) => c.type === slot);
                const label = formatLabel(slot);
                const isAssigned = Boolean(found);
                return (
                  <div
                    key={slot}
                    className="neo-card p-4 flex flex-col gap-2"
                  >
                    <p className="text-sm font-semibold text-ink">{slot}</p>
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
                              return (
                                <div
                                  key={link || `${idx}`}
                                  className="flex items-center justify-between text-sm glass-chip rounded px-2 py-1"
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
                                        <button
                                          type="button"
                                          className="text-primary underline"
                                          onClick={() => openPreview(att)}
                                          title={link}
                                        >
                                          Preview
                                        </button>
                                        <a
                                          className="text-primary underline"
                                          href={link}
                                          download={filename}
                                          target="_blank"
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
                              onChange={(e) => {
                                const selected = e.target.files?.[0];
                                if (!selected) return;
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
                                setPendingFiles((prev) => ({ ...prev, [found._id]: selected }));
                              }}
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
                                  {uploading === found._id ? <ButtonSpinner /> : null}
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
                                className="w-full micro-input rounded-xl px-3 py-2 text-sm"
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
            )}
          </div>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="glass-panel rounded-3xl shadow-xl w-full max-w-3xl p-4 relative">
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
            <div className="mb-3">
              <p className="text-sm text-slate-500">Preview</p>
              <h3 className="text-lg font-semibold text-slate-800">{preview.name}</h3>
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {preview.isImage ? (
                <img src={preview.url} alt={preview.name} className="w-full h-auto" />
              ) : (
                <iframe
                  src={preview.url}
                  title={preview.name}
                  className="w-full h-[70vh]"
                />
              )}
            </div>
            <div className="mt-3 text-xs text-slate-600 flex items-center gap-3">
              <a
                className="text-primary underline"
                href={preview.rawUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;