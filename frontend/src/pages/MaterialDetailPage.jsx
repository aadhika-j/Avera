import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const MaterialDetailPage = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();

  const fetchSignedUrl = async (material) => {
    if (!material?.publicId) return null;
    const payload = {
      publicId: material.publicId,
      resourceType: material.resourceType,
      format: material.format,
      version: material.version,
      url: material.url || material.secureUrl,
    };
    const { data } = await api.post("/uploads/signed-url", payload);
    return data?.url || null;
  };

  const openMaterialLink = async (material) => {
    const fallbackUrl = material?.secureUrl || material?.url;
    if (!fallbackUrl) return;
    try {
      const signedUrl = await fetchSignedUrl(material);
      window.open(signedUrl || fallbackUrl, "_blank", "noopener");
    } catch (err) {
      window.open(fallbackUrl, "_blank", "noopener");
    }
  };

  const fetchComments = async () => {
    const { data } = await api.get(`/materials/${id}/comments`);
    setComments(data.comments || []);
  };

  useEffect(() => {
    const load = async () => {
      const { data: matData } = await api.get(`/materials/${id}`);
      setMaterial(matData.material || null);
      await fetchComments();
    };
    load();
  }, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await api.post(`/materials/${id}/comments`, { content: commentText });
    setCommentText("");
    await fetchComments();
  };

  const pinComment = async (commentId) => {
    await api.post(`/materials/${id}/comments/pin/${commentId}`);
    await fetchComments();
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/materials/${id}/comments/${commentId}`);
    await fetchComments();
  };

  if (!material) return <p className="text-slate-600">Loading material...</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded p-4">
        <h1 className="text-2xl font-semibold text-slate-800">{material.title}</h1>
        <p className="text-slate-700">{material.description}</p>
        <button
          type="button"
          className="text-primary underline"
          onClick={() => openMaterialLink(material)}
        >
          View / Download
        </button>
      </div>

      <div className="bg-white border rounded p-4 space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">Comments</h2>
        <form onSubmit={submitComment} className="flex gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">
            Post
          </button>
        </form>

        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c._id} className={`border rounded p-3 ${c.isPinned ? "border-primary" : "border-slate-200"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.author?.name || "User"}</p>
                  <p className="text-sm text-slate-700">{c.content}</p>
                </div>
                {user && (user.role === "cr" || user.role === "admin") && (
                  <div className="flex gap-2 text-xs text-primary">
                    {!c.isPinned && (
                      <button onClick={() => pinComment(c._id)} type="button">
                        Pin
                      </button>
                    )}
                    <button onClick={() => deleteComment(c._id)} className="text-red-600" type="button">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;
