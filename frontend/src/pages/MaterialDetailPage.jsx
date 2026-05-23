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
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-ink">{material.title}</h1>
          <p className="text-slate-600">{material.description}</p>
        <a className="text-primary underline" href={material.url} target="_blank" rel="noreferrer">
          View / Download
        </a>
      </div>

        <div className="glass-panel rounded-3xl p-6 space-y-3">
          <h2 className="text-xl font-semibold text-ink">Comments</h2>
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              className="rounded-xl px-4 py-2 flex-1 micro-input"
              placeholder="Add a comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="micro-btn bg-primary text-white px-4 py-2 rounded-full" type="submit">
            Post
          </button>
        </form>

        <div className="space-y-2">
          {comments.map((c) => (
              <div key={c._id} className={`neo-card p-4 ${c.isPinned ? "ring-2 ring-primary/40" : ""}`}>
              <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold text-ink">{c.author?.name || "User"}</p>
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
