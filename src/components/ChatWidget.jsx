/**
 * components/ChatWidget.jsx
 *
 * Storefront AI chat widget (replaces the former Tawk.to embed).
 *  • Country + language aware: the server resolves the country from the storefront host (Axios sends
 *    X-Storefront-Host) and the AI replies in the language the shopper is browsing in.
 *  • The AI answers first, collects name / email / WhatsApp, and hands over to a human desk
 *    (Sales / Manager / IT / Director) — the visitor then sees that person's name, role and photo.
 *  • Conversation survives reloads (id + secret token in localStorage); logged-in customers resume
 *    their open chat on any device.
 *  • Short-polling (see server PRD addendum 3): 3 s while open, 15 s in the background once a human is involved.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, UserRound, Bot, Star, Loader2, Headset } from "lucide-react";
import Axios from "../utils/Axios";
import { useCountry } from "../context/CountryContext";

const LS = "icvng_chat_v1";
const read = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } };
const write = (v) => { try { localStorage.setItem(LS, JSON.stringify(v)); } catch { /* private mode */ } };
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export default function ChatWidget() {
  const { t, language, country } = useCountry();
  const [cfg, setCfg] = useState(null);
  const [open, setOpen] = useState(false);
  const [conv, setConv] = useState(null); // public view
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const [err, setErr] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "", whatsapp: "" });
  const [rated, setRated] = useState(false);
  const store = useRef(read());
  const lastSeq = useRef(0);
  const bottom = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;

  const headers = () => ({ "x-chat-token": store.current.token || "" });
  const merge = useCallback((incoming) => {
    if (!incoming?.length) return;
    setMsgs((m) => {
      const seen = new Set(m.map((x) => x.seq));
      const add = incoming.filter((x) => !seen.has(x.seq));
      if (!add.length) return m;
      if (!openRef.current) setUnread((u) => u + add.filter((x) => x.senderType !== "visitor").length);
      return [...m, ...add].sort((a, b) => a.seq - b.seq);
    });
    lastSeq.current = Math.max(lastSeq.current, ...incoming.map((x) => x.seq));
  }, []);

  // config (is chat enabled for this country?)
  useEffect(() => {
    let alive = true;
    Axios.get("/api/chat/config", { params: { language } })
      .then((r) => alive && setCfg(r.data?.data))
      .catch(() => alive && setCfg({ enabled: false }));
    return () => { alive = false; };
  }, [language, country?.code]);

  const start = useCallback(async () => {
    setErr("");
    try {
      if (!store.current.visitorId) { store.current.visitorId = uid(); write(store.current); }
      const body = { visitorId: store.current.visitorId, language, channel: "web", pageUrl: window.location.href };
      if (store.current.id && store.current.token && store.current.country === country?.code) body.resume = { id: store.current.id, token: store.current.token };
      const r = await Axios.post("/api/chat/conversations", body);
      const d = r.data.data;
      store.current = { ...store.current, id: d.conversation.id, token: d.token, country: country?.code };
      write(store.current);
      lastSeq.current = 0; setMsgs([]); setRated(false);
      setConv(d.conversation); merge(d.messages);
    } catch (e) {
      setErr(e?.response?.data?.code === "CHAT_DISABLED" ? t("chat.unavailable") : t("chat.error"));
    }
  }, [language, country?.code, merge, t]);

  // open → ensure a conversation exists
  useEffect(() => { if (open && !conv) start(); }, [open, conv, start]);
  useEffect(() => { if (open) setUnread(0); }, [open]);

  // poll
  useEffect(() => {
    if (!conv || conv.status === "closed") return undefined;
    const human = conv.humanInvolved;
    if (!open && !human) return undefined; // nothing can arrive unprompted from the AI
    const ms = open ? (human ? 2500 : 4000) : 15000;
    const id = setInterval(async () => {
      try {
        const r = await Axios.get(`/api/chat/conversations/${conv.id}`, { params: { after: lastSeq.current }, headers: headers() });
        setConv(r.data.data.conversation); merge(r.data.data.messages);
      } catch (e) {
        if (e?.response?.status === 404) { store.current = { visitorId: store.current.visitorId }; write(store.current); setConv(null); }
      }
    }, ms);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv?.id, conv?.status, conv?.humanInvolved, open, merge]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs.length, open, busy]);

  // inline contact form: show once the AI asked, or if still no contact after a few messages
  useEffect(() => {
    const asked = msgs.some((m) => m.kind === "contact_request");
    const many = msgs.filter((m) => m.senderType === "visitor").length >= 3;
    if (conv?.contactMissing && (asked || many) && !showContact && !store.current.contactDismissed) setShowContact(true);
    if (conv && !conv.contactMissing) setShowContact(false);
  }, [msgs, conv, showContact]);

  const send = async () => {
    const v = text.trim();
    if (!v || busy || !conv) return;
    setBusy(true); setText(""); setErr("");
    try {
      const r = await Axios.post(`/api/chat/conversations/${conv.id}/messages`, { text: v, after: lastSeq.current }, { headers: headers() });
      setConv(r.data.data.conversation); merge(r.data.data.messages);
    } catch (e) {
      setText(v);
      const code = e?.response?.data?.code;
      setErr(code === "CLOSED" ? t("chat.closedNote") : e?.response?.status === 429 ? t("chat.slowDown") : t("chat.error"));
      if (code === "CLOSED") setConv((c) => ({ ...c, status: "closed" }));
    } finally { setBusy(false); }
  };

  const callHuman = async () => {
    if (!conv || busy) return;
    setBusy(true);
    try {
      const r = await Axios.post(`/api/chat/conversations/${conv.id}/human`, { after: lastSeq.current }, { headers: headers() });
      setConv(r.data.data.conversation); merge(r.data.data.messages);
    } catch { setErr(t("chat.error")); } finally { setBusy(false); }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    if (!contact.email && !contact.whatsapp) return;
    try {
      const r = await Axios.post(`/api/chat/conversations/${conv.id}/lead`, contact, { headers: headers() });
      setConv(r.data.data.conversation); setShowContact(false);
    } catch (er) { setErr(er?.response?.data?.code === "BAD_EMAIL" ? t("chat.badEmail") : t("chat.error")); }
  };

  const endChat = async () => {
    if (!conv || !window.confirm(t("chat.confirmEnd"))) return;
    try {
      const r = await Axios.post(`/api/chat/conversations/${conv.id}/close`, {}, { headers: headers() });
      setConv(r.data.data.conversation);
    } catch { /* ignore */ }
  };
  const rate = async (score) => {
    setRated(true);
    try { await Axios.post(`/api/chat/conversations/${conv.id}/rate`, { score }, { headers: headers() }); } catch { /* ignore */ }
  };
  const newChat = () => { store.current = { visitorId: store.current.visitorId }; write(store.current); setConv(null); setMsgs([]); lastSeq.current = 0; };

  if (!cfg?.enabled) return null;

  const agent = conv?.agent;
  const closed = conv?.status === "closed";
  const waiting = conv?.waitingForAgent;

  return (
    <div className="fixed z-[9990] bottom-20 sm:bottom-5 right-4 rtl:right-auto rtl:left-4 font-sans" data-testid="chat-widget">
      {open && (
        <div className="fixed inset-0 sm:static sm:w-[370px] sm:h-[540px] sm:mb-3 bg-white rounded-none sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#4a2c17] text-white">
            {agent?.image ? <img src={agent.image} alt="" className="w-9 h-9 rounded-full object-cover bg-white/20" />
              : <div className="w-9 h-9 rounded-full bg-white/15 grid place-items-center">{conv?.humanInvolved ? <UserRound className="w-5 h-5" /> : <Bot className="w-5 h-5" />}</div>}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{agent ? agent.name : conv?.humanInvolved ? t("chat.teamTitle") : cfg.brand}</div>
              <div className="text-[11px] opacity-80 truncate">{agent ? agent.role : waiting ? t("chat.waitingAgent") : t("chat.aiSubtitle")}</div>
            </div>
            {conv && !closed && <button onClick={endChat} className="text-[11px] underline opacity-80 hover:opacity-100">{t("chat.endChat")}</button>}
            <button onClick={() => setOpen(false)} aria-label={t("chat.close")} className="p-1 hover:bg-white/10 rounded"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-[#faf7f3]">
            {!conv && !err && <div className="h-full grid place-items-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}
            {msgs.map((m) => {
              if (m.senderType === "system") return <div key={m.seq} className="text-center text-[11px] text-gray-400 px-4">{m.text}</div>;
              const mine = m.senderType === "visitor";
              return (
                <div key={m.seq} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && m.senderType === "agent" && (m.sender?.image ? <img src={m.sender.image} alt="" className="w-6 h-6 rounded-full object-cover mr-1.5 mt-1" /> : <div className="w-6 h-6 rounded-full bg-[#4a2c17] text-white text-[10px] grid place-items-center mr-1.5 mt-1">{(m.sender?.name || "?")[0]}</div>)}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${mine ? "bg-[#4a2c17] text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"}`}>
                    {m.senderType === "agent" && <div className="text-[10px] text-gray-400 mb-0.5">{m.sender?.name} · {m.sender?.role}</div>}
                    {m.text}
                  </div>
                </div>
              );
            })}
            {busy && !waiting && <div className="text-xs text-gray-400 px-2">{t("chat.typing")}</div>}
            {waiting && <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><Headset className="w-4 h-4" /> {t("chat.waitingAgentLong")}</div>}

            {showContact && conv && !closed && (
              <form onSubmit={saveContact} className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                <div className="text-xs text-gray-600">{t("chat.contactIntro")}</div>
                <input className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" placeholder={t("chat.name")} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                <input type="email" className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" placeholder={t("chat.email")} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm" placeholder={t("chat.whatsapp")} value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-[#4a2c17] text-white rounded-lg py-1.5 text-sm">{t("chat.saveContact")}</button>
                  <button type="button" onClick={() => { store.current.contactDismissed = true; write(store.current); setShowContact(false); }} className="px-3 text-sm text-gray-500">{t("chat.skip")}</button>
                </div>
              </form>
            )}

            {closed && (
              <div className="text-center space-y-2 py-2">
                <div className="text-xs text-gray-500">{t("chat.closedNote")}</div>
                {!rated ? (
                  <div><div className="text-xs text-gray-600 mb-1">{t("chat.rateTitle")}</div>
                    <div className="flex justify-center gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => rate(s)} aria-label={`${s}`}><Star className="w-6 h-6 text-amber-400 hover:fill-amber-400" /></button>)}</div></div>
                ) : <div className="text-xs text-green-700">{t("chat.rateThanks")}</div>}
                <button onClick={newChat} className="text-sm underline text-[#4a2c17]">{t("chat.startNew")}</button>
              </div>
            )}
            {err && <div className="text-xs text-red-600 text-center">{err}</div>}
            <div ref={bottom} />
          </div>

          {!closed && (
            <div className="border-t border-gray-200 bg-white p-2">
              {conv && !conv.humanInvolved && (
                <button onClick={callHuman} disabled={busy} className="mb-1.5 text-[11px] text-[#4a2c17] underline">{t("chat.talkToPerson")}</button>
              )}
              <div className="flex items-end gap-2">
                <textarea rows={1} value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={t("chat.placeholder")} className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm max-h-28 focus:outline-none focus:ring-2 focus:ring-[#4a2c17]/30" />
                <button onClick={send} disabled={busy || !text.trim() || !conv} aria-label={t("chat.send")} className="w-10 h-10 rounded-full bg-[#4a2c17] text-white grid place-items-center disabled:opacity-40">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!open && (
        <button onClick={() => setOpen(true)} aria-label={t("chat.open")} className="relative w-14 h-14 rounded-full bg-[#4a2c17] text-white shadow-xl grid place-items-center hover:scale-105 transition-transform">
          <MessageCircle className="w-7 h-7" />
          {unread > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-[11px] grid place-items-center">{unread}</span>}
        </button>
      )}
    </div>
  );
}
