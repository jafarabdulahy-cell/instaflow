"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Send,
  Sparkles,
  StickyNote,
  Tag,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  const crmActions = [
    { label: "تماس", value: conversation?.contact?.phone || "ثبت نشده", icon: Phone, tone: "bg-[#ECFEFF] text-[#0891B2]" },
    { label: "وضعیت", value: conversation?.contact?.status || (conversation?.isVip ? "VIP" : "Lead"), icon: Tag, tone: "bg-[#F2EEFF] text-[#5B2BE2]" },
    { label: "یادداشت", value: conversation?.contact?.notes ? "دارد" : "خالی", icon: StickyNote, tone: "bg-[#FFF7ED] text-[#F97316]" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F1FF] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#eadfff_0,#faf8ff_42%,#ffffff_78%)]" />

      <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-5 px-4 pb-[104px] pt-4 lg:grid-cols-[390px_1fr] lg:px-6 lg:pb-8">
        <aside className="lg:sticky lg:top-4">
          <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#17112A] via-[#34205A] to-[#5B2BE2] p-5 text-white shadow-[0_28px_80px_rgba(42,16,90,0.28)]">
            <div className="flex items-start justify-between gap-3">
              <Link href="/dashboard/inbox" className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/14 active:scale-[0.98]">
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="text-right">
                <p className="text-[12px] font-black text-white/70">پرونده مشتری</p>
                <h1 className="mt-2 max-w-[250px] truncate text-[28px] font-black leading-tight">{name(conversation)}</h1>
                <p className="mt-2 text-[12px] font-bold text-white/68" dir="ltr">
                  @{conversation?.username || "instagram_user"}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-[28px] bg-white/10 p-3 ring-1 ring-white/12">
              <div className="flex gap-2">
                {conversation?.isVip && <Badge className="bg-amber-100 text-amber-800">VIP</Badge>}
                <Badge className="bg-white/14 text-white">{conversation?.contact?.status || "Lead"}</Badge>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-[26px] bg-gradient-to-br from-[#FF2D55] via-[#8E58FF] to-[#5B2BE2] text-[26px] font-black text-white shadow-xl">
                {initial(conversation)}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {crmActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.label} className="rounded-[22px] bg-white p-3 text-center text-[#17112A]">
                    <div className={`mx-auto grid h-10 w-10 place-items-center rounded-2xl ${action.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-[10px] font-black text-[#7C748E]">{action.label}</p>
                    <p className="mt-1 truncate text-[11px] font-black">{action.value}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="flex min-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-[36px] bg-white shadow-[0_24px_70px_rgba(42,16,90,0.09)] ring-1 ring-[#ECE8F6]">
          <header className="border-b border-[#F0EAF8] bg-white/90 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <button className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FAF9FF] text-[#6D6780] ring-1 ring-[#ECE8F6]" aria-label="گزینه‌ها">
                <MoreHorizontal className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 flex-1 items-center justify-end gap-3 text-right">
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-black">{name(conversation)}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#7C748E]">
                    <Clock3 className="h-3.5 w-3.5" /> مرکز مکالمه و پیگیری
                  </p>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#5B2BE2] to-[#FF2D55] text-[20px] font-black text-white">
                  {initial(conversation)}
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-[#F0EAF8] bg-[#FAF9FF] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#ECE8F6]">
                <BadgeCheck className="h-5 w-5 text-[#10B981]" />
                <p className="mt-3 text-[12px] font-black text-[#7C748E]">مرحله فروش</p>
                <p className="mt-1 text-[14px] font-black">{conversation?.contact?.status || "Lead"}</p>
              </div>
              <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#ECE8F6]">
                <Sparkles className="h-5 w-5 text-[#5B2BE2]" />
                <p className="mt-3 text-[12px] font-black text-[#7C748E]">ارزش لید</p>
                <p className="mt-1 text-[14px] font-black">{conversation?.isVip ? "VIP" : "معمولی"}</p>
              </div>
              <div className="rounded-[24px] bg-white p-4 ring-1 ring-[#ECE8F6]">
                <UserRound className="h-5 w-5 text-[#0EA5E9]" />
                <p className="mt-3 text-[12px] font-black text-[#7C748E]">مشتری</p>
                <p className="mt-1 truncate text-[14px] font-black">{conversation?.contact?.phone || "شماره ثبت نشده"}</p>
              </div>
            </div>
          </div>

          <section className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#F7F4FF_100%)] p-4">
            {!messages.length ? (
              <div className="mx-auto mt-10 max-w-[380px] rounded-[32px] border border-dashed border-[#D8CEEE] bg-white p-7 text-center shadow-sm">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-[30px] bg-[#F2EEFF] text-[#5B2BE2]">
                  <MessageCircle className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-[18px] font-black">هنوز پیامی در این گفتگو نیست</h2>
                <p className="mt-3 text-[13px] font-medium leading-7 text-[#6D6780]">
                  وقتی پیام‌های این مشتری از اینستاگرام برسد، اینجا مثل یک چت CRM نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const outbound = message.direction === "outbound";
                return (
                  <div key={message.id} className={`flex ${outbound ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[82%] rounded-[28px] px-4 py-3 text-[14px] leading-7 shadow-sm ${
                        outbound
                          ? "rounded-br-lg bg-gradient-to-br from-[#5B2BE2] to-[#8E58FF] text-white"
                          : "rounded-bl-lg bg-white text-[#17112A] ring-1 ring-[#ECE8F6]"
                      }`}
                    >
                      <p>{message.text || "پیام بدون متن"}</p>
                      <p className={`mt-1 text-[10px] font-bold ${outbound ? "text-white/62" : "text-[#9A93AA]"}`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          <form onSubmit={sendMessage} className="border-t border-[#F0EAF8] bg-white p-3 safe-bottom">
            <div className="flex gap-2 rounded-[24px] bg-[#FAF9FF] p-2 ring-1 ring-[#ECE8F6]">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="پاسخ را بنویس..."
                className="h-12 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
              />
              <Button type="submit" className="h-12 rounded-2xl bg-[#5B2BE2] px-5 text-white shadow-lg shadow-violet-200 hover:bg-[#4A20C9]">
                <Send className="h-5 w-5" />
                ارسال
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
