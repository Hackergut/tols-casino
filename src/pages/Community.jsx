import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Send, Hash, Users, LogIn, Loader2, Trophy } from "lucide-react";
import CollectorLeaderboard from "@/components/community/CollectorLeaderboard";

const CHANNELS = [
  { id: "generale", label: "General", desc: "Main community chat" },
  { id: "italiano", label: "Italian", desc: "Italian community" },
  { id: "vip", label: "VIP Lounge", desc: "VIP members only" },
  { id: "supporto", label: "Support", desc: "Help and questions" },
];

const COLORS = ["#ccff00", "#4f8aff", "#ff4fa3", "#ff8a4f", "#2a8a6a", "#c4a01a", "#8a5a1a", "#a06aff"];

function userColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function fmtTime(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Community() {
  const [channel, setChannel] = useState("generale");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        let guest = localStorage.getItem("tols_chat_guest");
        if (!guest) {
          guest = "Guest" + Math.floor(Math.random() * 9000 + 1000);
          localStorage.setItem("tols_chat_guest", guest);
        }
        setUser({ full_name: guest, email: null, id: "guest" });
      }
    })();
  }, []);

  const loadMessages = useCallback(async (ch) => {
    setLoading(true);
    try {
      const list = await base44.entities.ChatMessage.filter({ channel: ch }, "-created_date", 50);
      setMessages((list || []).reverse());
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages(channel);
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data && event.data.channel === channel) {
        if (event.type === "create") {
          setMessages((prev) => (prev.some((m) => m.id === event.data.id) ? prev : [...prev, event.data]));
        } else if (event.type === "delete") {
          setMessages((prev) => prev.filter((m) => m.id !== event.data.id));
        }
      }
    });
    return () => unsub && unsub();
  }, [channel, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg || !user || sending) return;
    if (user.id === "guest") return;
    setSending(true);
    setText("");
    try {
      await base44.entities.ChatMessage.create({
        username: user.full_name || user.email || "Anonymous",
        avatar_color: userColor(user.full_name || user.email || "x"),
        message: msg.slice(0, 500),
        channel,
      });
    } catch {
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const isGuest = user && user.id === "guest";

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-black tracking-tight text-white">
            <span className="text-lime">Community</span> Chat
          </h1>
          <p className="text-sm text-white/50 mt-1">Meet other players, share wins and strategies.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] grid-rows-[auto_1fr] lg:grid-rows-1 gap-3 lg:gap-4 h-[68vh] lg:h-[calc(100vh-180px)] min-h-[440px]">
          {/* Canali */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111] overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 shrink-0">
              <Hash className="w-3.5 h-3.5" /> Channels
            </div>
            <div className="flex flex-row lg:flex-col lg:flex-1 overflow-x-auto lg:overflow-y-auto scrollbar-hide p-2 gap-1 min-h-0">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`shrink-0 w-auto lg:w-full text-left px-3 py-2.5 rounded-lg transition ${
                    channel === c.id ? "bg-lime/10 text-lime" : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-sm font-bold whitespace-nowrap">{c.label}</span>
                  </div>
                  <p className="hidden lg:block text-[11px] text-white/40 mt-0.5 truncate pl-5">{c.desc}</p>
                </button>
              ))}
            </div>
            <div className="px-3 py-2.5 border-t border-white/5 flex items-center gap-2 text-xs text-white/40">
              <Users className="w-3.5 h-3.5" />
              <span>{Math.max(1, messages.length)} messages</span>
            </div>
          </div>

          {/* Chat */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-[#111] overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
              <Hash className="w-4 h-4 text-lime" />
              <span className="text-sm font-black text-white">{CHANNELS.find((c) => c.id === channel)?.label}</span>
              <span className="ml-auto text-xs text-white/40">{loading ? "Loading…" : "Live"}</span>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full text-white/40">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-white/40">
                  <Hash className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No messages in this channel.</p>
                  <p className="text-xs mt-1">Be the first to write!</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="flex gap-3 group">
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-black"
                      style={{ backgroundColor: m.avatar_color || "#ccff00" }}
                    >
                      {(m.username || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white truncate">{m.username}</span>
                        <span className="text-[10px] text-white/30 shrink-0">{fmtTime(m.created_date)}</span>
                      </div>
                      <p className="text-sm text-white/80 break-words mt-0.5">{m.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {isGuest ? (
              <div className="px-4 py-3 border-t border-white/5 bg-[#0f0f0f]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-white/50">Log in to join the conversation.</p>
                  <Link to="/login" className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-lime text-black text-xs font-black hover:opacity-90 transition">
                    <LogIn className="w-3.5 h-3.5" /> Log in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={send} className="px-4 py-3 border-t border-white/5 bg-[#0f0f0f] flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message in #${channel}…`}
                  maxLength={500}
                  className="flex-1 h-10 px-3 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder-white/30 outline-none focus:border-lime/40 transition"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-lime text-black disabled:opacity-30 hover:opacity-90 transition"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Collector leaderboard */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-lime" />
            <h2 className="text-lg font-black text-white">Collector Leaderboard</h2>
            <span className="text-xs text-white/40">Top collectors on TOLS</span>
          </div>
          <CollectorLeaderboard />
        </div>
      </div>
    </div>
  );
}