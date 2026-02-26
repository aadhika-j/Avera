import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const socket = io(import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:5000");

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await api.get("/chat");
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("chat:new", (message) => {
      setMessages((prev) => [message, ...prev]);
    });
    return () => {
      socket.off("chat:new");
    };
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await api.post("/chat", { content: text });
    socket.emit("chat:send", { content: text, userId: user.id });
    setText("");
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">Class Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg._id} className="bg-white border rounded p-3 shadow-sm">
            <p className="text-sm text-slate-500">{msg.sender?.name || "User"}</p>
            <p className="text-slate-800">{msg.content}</p>
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
