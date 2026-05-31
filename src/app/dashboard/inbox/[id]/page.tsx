"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Phone, Send, Sparkles, Tag, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Message = { id: string; direction: string; text?: string; createdAt: string };
type Conversation = {
  id: string;
  displayName?: string;
  username?: string;
  isVip: boolean;
  contact?: { phone?: string; status?: string; notes?: string };
};

function initial(conversation?: Conversation | null) {
  return (conversation?.displayName || conversation?.username || "U").slice(0, 1);
}

function name(conversation?: Conversation | null) {
  return conversation?.displayName || conversation?.username || "گفتگو";
}

function formatTime(value?: string) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

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

    fetch(`/api/inbox/${id}/messages`)
      .then((res) => {
        if (res.status === 401) window.location.href = "/auth/login";
        return res.json();
      })
      .then((json) => {
        setConversation(json.conversation || null);
        setMessages(json.messages || []);
      })
      .catch(() => {});
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
    <div className="h-[100dvh] overflow-hidden bg-[#F4F0FF] text-[#17112A]">
      <main className="mx-auto flex h-full w-full max-w-[430px] flex-col gap-3 px-4 pb-3 pt-3">
        <header className="h-[76px] shrink-0 rounded-[28px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="flex h-full items-center justify-between gap-3">
            <Link href="/dashboard/inbox" className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2] active:scale-95">
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate text-[17px] font-black">{name(conversation)}</p>
              <p className="mt-1 truncate text-[11px] font-bold text-[#7C748E]" dir="ltr">
                @{conversation?.username || "instagram_user"}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-gradient-to-br from-[#FF2D55] via-[#8E58FF] to-[#5B2BE2] text-xl font-black text-white">
              {initial(conversation)}
            </div>
          </div>
        </header>

        <section className="grid h-[74px] shrink-0 grid-cols-3 gap-2">
          <div className="rounded-[22px] bg-white p-2 text-center shadow-[0_10px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <Phone className="mx-auto h-5 w-5 text-[#0891B2]" />
            <p className="mt-1 text-[10px] font-black text-[#7C748E]">تماس</p>
            <p className="truncate text-[11px] font-black">{conversation?.contact?.phone || "ثبت نشده"}</p>
          </div>
          <div className="rounded-[22px] bg-white p-2 text-center shadow-[0_10px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <Tag className="mx-auto h-5 w-5 text-[#5B2BE2]" />
            <p className="mt-1 text-[10px] font-black text-[#7C748E]">وضعیت</p>
            <p className="truncate text-[11px] font-black">{conversation?.contact?.status || (conversation?.isVip ? "VIP" : "Lead")}</p>
          </div>
          <div className="rounded-[22px] bg-white p-2 text-center shadow-[0_10px_26px_rgba(42,16,90,0.06)] ring-1 ring-[#ECE8F6]">
            <UserRound className="mx-auto h-5 w-5 text-[#FF2D55]" />
            <p className="mt-1 text-[10px] font-black text-[#7C748E]">نوع لید</p>
            <p className="truncate text-[11px] font-black">{conversation?.isVip ? "VIP" : "معمولی"}</p>
          </div>
        </section>

        <section className="min-h-0 flex-1 overflow-y-auto rounded-[30px] bg-white p-3 shadow-[0_14px_34px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          {!messages.length ? (
            <div className="flex h-full flex-col items-center justify-center rounded-[24px] bg-[#FAF9FF] p-5 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-[#F2EEFF] text-[#5B2BE2]">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-[17px] font-black">هنوز پیامی در این گفتگو نیست</h2>
              <p className="mt-2 max-w-[280px] text-[12px] font-bold leading-6 text-[#7C748E]">
                پیام‌های این مشتری بعد از دریافت از اینستاگرام اینجا نمایش داده می‌شود.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                const outbound = message.direction === "outbound";
                return (
                  <div key={message.id} className={`flex ${outbound ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[82%] rounded-[24px] px-3 py-2 text-[13px] font-bold leading-6 ${outbound ? "rounded-br-md bg-[#5B2BE2] text-white" : "rounded-bl-md bg-[#F4F0FF] text-[#17112A]"}`}>
                      <p>{message.text || "پیام بدون متن"}</p>
                      <p className={`mt-1 text-[10px] ${outbound ? "text-white/60" : "text-[#8A8498]"}`}>{formatTime(message.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <form onSubmit={sendMessage} className="h-[72px] shrink-0 rounded-[28px] bg-white p-2 shadow-[0_-8px_28px_rgba(42,16,90,0.08)] ring-1 ring-[#ECE8F6] safe-bottom">
          <div className="flex h-full items-center gap-2 rounded-[22px] bg-[#FAF9FF] px-2 ring-1 ring-[#ECE8F6]">
            <Sparkles className="h-5 w-5 shrink-0 text-[#8E58FF]" />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="پاسخ را بنویس..."
              className="h-11 border-0 bg-transparent px-1 text-[13px] shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="h-11 shrink-0 rounded-2xl bg-[#5B2BE2] px-4 text-white shadow-lg shadow-violet-200 hover:bg-[#4A20C9]">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
