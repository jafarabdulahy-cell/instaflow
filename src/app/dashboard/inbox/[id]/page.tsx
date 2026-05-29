"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Message = { id: string; direction: string; text?: string; createdAt: string };
type Conversation = { id: string; displayName?: string; username?: string; isVip: boolean; contact?: { phone?: string; status?: string; notes?: string } };

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/inbox/${id}/messages`).then((res) => {
      if (res.status === 401) window.location.href = "/auth/login";
      return res.json();
    }).then((json) => {
      setConversation(json.conversation || null);
      setMessages(json.messages || []);
    }).catch(() => {});
  }, [id]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || !id) return;
    setText("");
    const res = await fetch(`/api/inbox/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value }),
    });
    if (res.ok) {
      const json = await res.json();
      setMessages((prev) => [...prev, json.message]);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] pb-24">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 safe-top">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard/inbox" className="text-slate-500 text-lg">←</Link>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center font-black">
            {(conversation?.displayName || conversation?.username || "U").slice(0,1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold truncate">{conversation?.displayName || conversation?.username || "گفتگو"}</p>
            <p className="text-xs text-slate-500" dir="ltr">@{conversation?.username || "instagram_user"}</p>
          </div>
          <Badge variant={conversation?.isVip ? "warning" : "brand"}>{conversation?.isVip ? "VIP" : conversation?.contact?.status || "Lead"}</Badge>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <section className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-lg">📞</div><p className="text-[10px] mt-1">تلفن</p></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-lg">🏷️</div><p className="text-[10px] mt-1">تگ</p></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-lg">📝</div><p className="text-[10px] mt-1">یادداشت</p></div>
          </div>
        </section>

        <section className="space-y-3">
          {!messages.length ? (
            <div className="text-center text-sm text-slate-500 py-12">هنوز پیامی در این گفتگو ثبت نشده است.</div>
          ) : messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${m.direction === "outbound" ? "bg-[#6d5dfc] text-white rounded-br-lg" : "bg-white text-slate-900 rounded-bl-lg border border-slate-100"}`}>
                {m.text || "پیام بدون متن"}
              </div>
            </div>
          ))}
        </section>
      </main>

      <form onSubmit={sendMessage} className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 safe-bottom">
        <div className="max-w-md mx-auto p-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="پاسخ را بنویس..." className="bg-slate-50 border-slate-200" />
          <Button type="submit" className="px-5">ارسال</Button>
        </div>
      </form>
    </div>
  );
}
