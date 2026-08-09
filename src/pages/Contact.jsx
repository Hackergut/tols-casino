import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send, MessageSquare, Twitter, MessageCircle, Github, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Contact <span className="text-lime">TOLS</span>
        </h1>
        <p className="mt-3 text-white/60">
          We usually reply within 24 hours. Pick the channel that works best for you.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <Channel icon={<Mail className="w-5 h-5" />} label="Email" value="support@tols.casino" href="mailto:support@tols.casino" />
          <Channel icon={<Twitter className="w-5 h-5" />} label="X / Twitter" value="@tolscasino" href="#" />
          <Channel icon={<MessageCircle className="w-5 h-5" />} label="Telegram" value="@tols_support" href="#" />
        </div>

        <form onSubmit={submit} className="mt-8 rounded-2xl border border-white/[0.06] bg-[#121212] p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <MessageSquare className="w-4 h-4 text-lime" /> Send us a message
          </div>

          {sent && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-lime/10 border border-lime/30 text-sm text-lime">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Thanks! Your message has been received.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white outline-none focus:border-lime/40 placeholder-white/20"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 text-sm text-white outline-none focus:border-lime/40 placeholder-white/20"
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className="w-full mt-1.5 rounded-xl bg-[#1a1a1a] border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-lime/40 placeholder-white/20 resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-lime text-black font-black hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Send message
          </button>
        </form>

        <div className="flex items-center gap-2 mt-6 text-xs text-white/40">
          <Github className="w-4 h-4" /> Built and maintained by the TOLS team.
        </div>
      </div>
    </div>
  );
}

function Channel({ icon, label, value, href }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#121212] p-4 hover:border-lime/40 transition"
    >
      <div className="w-9 h-9 rounded-lg bg-lime/10 flex items-center justify-center text-lime shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
      </div>
    </a>
  );
}