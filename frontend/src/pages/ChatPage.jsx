import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const socket = io(import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:5000");

const ChatPage = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const addMessage = (incoming, replaceId) => {
    setMessages((prev) => {
      // If we have a temp/placeholder id to replace, swap it out
      if (replaceId) {
        const replaced = prev.map((m) => (m._id === replaceId ? incoming : m));
        const found = replaced.some((m) => m._id === incoming._id);
        return found ? replaced : [incoming, ...replaced];
      }

      // De-dupe by id; also replace optimistic message that matches content/sender
      const existing = prev.find((m) => m._id === incoming._id);
      if (existing) return prev;

      const optimisticIndex = prev.findIndex(
        (m) => m._id?.toString().startsWith("temp-") && m.content === incoming.content && (m.sender === userId || m.sender?._id === userId)
      );

      if (optimisticIndex !== -1) {
        const copy = [...prev];
        copy[optimisticIndex] = incoming;
        return copy;
      }

      return [incoming, ...prev];
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await api.get("/chat");
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("chat:new", (message) => {
      addMessage(message);
      if (message.sender !== userId && message.sender?._id !== userId && userId) {
        api.post("/chat/read", { messageIds: [message._id] }).catch(() => {});
      }
    });

    socket.on("chat:read", (payload) => {
      if (!payload?.messageIds) return;
      setMessages((prev) =>
        prev.map((msg) =>
          payload.messageIds.includes(msg._id)
            ? {
                ...msg,
                readBy: msg.readBy?.some((u) => (u._id || u.id) === payload.userId)
                  ? msg.readBy
                  : [...(msg.readBy || []), { _id: payload.userId }],
              }
            : msg
        )
      );
    });
    return () => {
      socket.off("chat:new");
      socket.off("chat:read");
    };
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      content: text,
      sender: { _id: userId, name: user?.name },
      createdAt: new Date().toISOString(),
      readBy: [{ _id: userId }],
    };

    addMessage(optimistic);
    const payload = text;
    setText("");

    try {
      const { data } = await api.post("/chat", { content: payload });
      addMessage(data.message, tempId);
    } catch (err) {
      // Remove optimistic if failed
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      // Optionally could surface a toast; keep console for now
      // eslint-disable-next-line no-console
      console.error("Failed to send message", err?.response?.data || err?.message);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Class Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className="bg-white border rounded p-3 shadow-sm">
            <p className="text-sm text-slate-500">{msg.sender?.name || "User"}</p>
            <p className="text-slate-800">{msg.content}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</span>
              <span>
                {msg.sender?._id === userId || msg.sender === userId
                  ? msg.readBy && msg.readBy.length > 1
                    ? `Seen by ${msg.readBy.length - 1}`
                    : "Sent"
                  : msg.readBy?.some((u) => (u._id || u.id) === userId)
                  ? "Seen"
                  : "Delivered"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
          type="button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
