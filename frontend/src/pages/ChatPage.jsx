import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useSWR from "swr";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { formatTimeIST, formatDateLabel, getISTDateString } from "../utils/dateFormat";
import { PageLoader, ButtonSpinner } from "../components/Spinner";

const socket = io(import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:5000");

const ChatPage = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id || "";
  const [messages, setMessages] = useState([]);
  const { data: initialData, isLoading } = useSWR("/chat", {
    onSuccess: (data) => {
      setMessages(data.messages || []);
    },
    revalidateOnFocus: false,
  });
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState("Smileys");
  const [emojiSearch, setEmojiSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      const stored = localStorage.getItem("recentEmojis");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const EMOJI_CATEGORIES = {
    Smileys: [
      "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😍","😘","😗","😙","😚","😋","😛","😜","🤪","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😝","🤤","😒","😓","😔","😕","🙁","😖","😞","😟","😢","😭","😤","😠","😡","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶‍🌫️","😶‍🌫","🫠","🤢","🤮","🤧","😷","🤒","🤕"
    ],
    Animals: ["🐶","🐱","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🦄","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🐢","🐍","🦕","🦖","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🦭","🐳","🐋"],
    Food: ["🍎","🍌","🍇","🍉","🍓","🍒","🍑","🍍","🥭","🥥","🥝","🍅","🥑","🍆","🥕","🌽","🥔","🥐","🥯","🥨","🥖","🍞","🥞","🧇","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥙","🥗","🍝","🍜","🍣"],
    Activities: ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥅","⛳","🥊","🥋","🎽","🛹","🎿","⛷","🏂","🏋️","⛸","🤺","🤼","🤸","⛹","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚴","🚵"],
    Travel: ["✈️","🛩","🛫","🛬","🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍","🛵","🚲","🚏","🛣","🛤","⛵","🚤","🛥","🛳","⛴","🚢","🗺","🧭","🏔","⛰","🌋","🗻"],
    Objects: ["⌚","📱","💻","⌨️","🖥","🖨","🖱","🖲","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽","🎞","📞","☎️","📟","📠","📺","📻","🎙","🎚","🎛","🧭","⏱","⏲","⏰","🕰","⌛","⏳","📡"],
    Symbols: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🔞","🔠","🔡","🔢","🔣","🔤","🅰️","🅱️","🆎","🆑","🆒","🆓","🆔","🆕","🆖","🆗","🆘","🆙","🆚","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵"]
  };

  const allEmojisFlat = Object.values(EMOJI_CATEGORIES).flat();

  const filteredEmojis = (category) => {
    const base = category === "Recent" ? recentEmojis : EMOJI_CATEGORIES[category] || [];
    if (!emojiSearch.trim()) return base;
    return base.filter((emoji) => emoji.includes(emojiSearch.trim()));
  };

  const insertEmoji = (emoji) => {
    const input = document.getElementById("chat-input-box");
    if (!input) {
      setText((t) => `${t}${emoji}`);
    } else {
      const start = input.selectionStart || input.value.length;
      const end = input.selectionEnd || input.value.length;
      const newValue = input.value.slice(0, start) + emoji + input.value.slice(end);
      setText(newValue);
      const cursor = start + emoji.length;
      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(cursor, cursor);
      });
    }

    const updatedRecent = [emoji, ...recentEmojis.filter((e) => e !== emoji)].slice(0, 18);
    setRecentEmojis(updatedRecent);
    localStorage.setItem("recentEmojis", JSON.stringify(updatedRecent));
    setShowEmojis(false);
  };

  const formatTime = formatTimeIST;

  const chatDateLabel = formatDateLabel;

  const addMessage = (incoming, replaceId) => {
    setMessages((prev) => {
      // If we have a temp/placeholder id to replace, swap it out
      if (replaceId) {
        const replaced = prev.map((m) => (m._id === replaceId ? incoming : m));
        const found = replaced.some((m) => m._id === incoming._id);
        return found ? replaced : [...replaced, incoming];
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

      return [...prev, incoming];
    });
  };


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
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/chat", { content: payload });
      addMessage(data.message, tempId);
    } catch (err) {
      // Remove optimistic if failed
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      // Optionally could surface a toast; keep console for now
      // eslint-disable-next-line no-console
      console.error("Failed to send message", err?.response?.data || err?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh] glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live</p>
          <h1 className="text-2xl font-semibold text-ink">Class Chat</h1>
        </div>
        <span className="text-xs text-slate-500">Stay in sync</span>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 flex flex-col">
        {messages.map((msg, idx) => {
          const senderId =
            typeof msg.sender === "string"
              ? msg.sender
              : msg.sender?._id || msg.sender?.id || "";
          const isMine = senderId === userId;
          const readCount = (msg.readBy || []).filter((u) => (u._id || u.id) !== senderId).length;

          const prevMsg = messages[idx - 1];
          const showDateLabel = !prevMsg ||
            getISTDateString(msg.createdAt) !== getISTDateString(prevMsg.createdAt);

          return (
            <React.Fragment key={msg._id}>
              {showDateLabel && (
                <div className="flex justify-center mt-2 mb-1">
                  <span className="px-3 py-1 rounded-full bg-slate-200 text-xs text-slate-600">
                    {chatDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <div
                className={`relative max-w-[80%] border rounded-2xl p-3 shadow-sm leading-relaxed break-words ${
                  isMine
                    ? "self-end bg-blue-100 border-blue-200 text-slate-900"
                    : "self-start bg-blue-200 border-blue-300 text-slate-900"
                }`}
              >
                {/* bubble tail */}
                <span
                  className={`absolute bottom-2 h-3 w-3 rotate-45 ${
                    isMine
                      ? "bg-blue-100 border-b border-r border-blue-200 right-[-6px] top-3"
                      : "bg-blue-200 border-b border-l border-blue-300 left-[-6px] top-3"
                  }`}
                  aria-hidden
                />

                <p className="text-sm text-slate-500 mb-1">{msg.sender?.name || "User"}</p>
                <p className="text-base text-slate-900 whitespace-pre-wrap">{msg.content}</p>
                {msg.attachments?.length ? (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => (
                      <div key={att.url} className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">{att.name || att.type || "Attachment"}</span>
                        <a
                          className="glass-chip text-primary px-2 py-1 rounded"
                          href={att.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Preview
                        </a>
                        <a
                          className="micro-btn bg-primary text-white px-2 py-1 rounded"
                          href={att.url}
                          download
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMine && (
                    <span className="flex items-center gap-1">
                      {readCount > 0 ? (
                        <span className="text-blue-600">✓✓</span>
                      ) : (
                        <span className="text-slate-400">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2 items-center relative">
        <div className="relative">
          <button
            type="button"
            className="h-10 w-10 rounded-full glass-chip text-xl"
            onClick={() => setShowEmojis((v) => !v)}
          >
            😊
          </button>
          {showEmojis && (
            <div className="absolute z-20 bottom-12 left-0 w-80 glass-panel rounded-2xl shadow-xl p-3">
              <div className="flex items-center gap-2 mb-2 overflow-x-auto whitespace-nowrap text-xs text-slate-700">
                {"Recent" && (
                  <button
                    type="button"
                    className={`px-2 py-1 rounded glass-chip ${emojiCategory === "Recent" ? "glass-chip-active" : ""}`}
                    onClick={() => setEmojiCategory("Recent")}
                  >
                    Recent
                  </button>
                )}
                {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`px-2 py-1 rounded glass-chip ${emojiCategory === cat ? "glass-chip-active" : ""}`}
                    onClick={() => setEmojiCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="w-full micro-input rounded-xl px-3 py-2 text-sm mb-2"
                placeholder="Search emojis"
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
              />
              <div className="h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {filteredEmojis(emojiCategory).map((emoji) => (
                    <button
                      key={`${emoji}-${emojiCategory}`}
                      type="button"
                      className="text-xl flex items-center justify-center rounded glass-emoji"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <input
          id="chat-input-box"
          className="micro-input rounded-xl px-4 py-3 flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
        />
        <button
          onClick={sendMessage}
          className="micro-btn bg-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center justify-center"
          type="button"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ButtonSpinner /> : null}
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
