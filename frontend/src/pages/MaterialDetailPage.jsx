import React, { useState } from "react";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { PageLoader, ButtonSpinner } from "../components/Spinner";

const MaterialDetailPage = () => {
  const { id } = useParams();
  const { data: materialData, isLoading: matLoading } = useSWR(`/materials/${id}`);
  const material = materialData?.material || null;

  const { data: commentsData, mutate: mutateComments } = useSWR(`/materials/${id}/comments`);
  const comments = commentsData?.comments || [];

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/materials/${id}/comments`, { content: commentText });
      setCommentText("");
      mutateComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const pinComment = async (commentId) => {
    await api.post(`/materials/${id}/comments/pin/${commentId}`);
    mutateComments();
  };

  const deleteComment = async (commentId) => {
    await api.delete(`/materials/${id}/comments/${commentId}`);
    mutateComments();
  };

  if (matLoading || !material) return <PageLoader />;

  return (
      <div className="space-y-6">
        <div className="glass-panel rounded-3xl p-6">
          <h1 className="text-2xl font-semibold text-ink">{material.title}</h1>
          <p className="text-slate-600">{material.description}</p>
        <a className="text-primary underline" href={material.secureUrl || material.url} target="_blank" rel="noreferrer noopener" download={material.originalFilename || material.title || "download"}>
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
            <button 
              className="micro-btn bg-primary text-white px-4 py-2 rounded-full flex items-center justify-center" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <ButtonSpinner /> : null}
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
