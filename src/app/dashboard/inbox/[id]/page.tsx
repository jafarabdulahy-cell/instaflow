"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FileText,
  Home,
  Link2,
  MessageCircle,
  Phone,
  Send,
  Settings,
  Tag,
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

function firstLetter(value?: string) {
  return (value || "U").slice(0, 1);
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

  const title = conversation?.displayName || conversation?.username || "گفتگو";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F6FF] pb-[98px] text-[#17112A]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,#efe9ff_0,#f9f7ff_38%,#ffffff_76%)]" />

      <header className="safe-top sticky top-0 z-20 border-b border-[#E9E4F5] bg-white/92 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard/inbox"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F2EEFF] text-[#5B2BE2] shadow-sm ring-1 ring-[#E6E2F4]"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>

          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#5B2BE2] via-[#8E58FF] to-[#FF2D55] text-lg font-black text-white shadow-lg">
            {firstLetter(title)}
          </div>

          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-[15px] font-black text-[#17112A]">{title}</p>
            <p className="truncate text-[11px] font-bold text-[#8A8498]" dir="ltr">
              @{conversation?.username || "instagram_user"}
            </p>
          </div>

          <Badge className={conversation?.isVip ? "bg-amber-50 text-amber-700" : "bg-[#F2EEFF] text-[#5B2BE2]"}>
            {conversation?.isVip ? "VIP" : conversation?.contact?.status || "Lead"}
          </Badge>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[430px] px-4 pt-4">
        <section className="rounded-[28px] bg-white p-4 shadow-[0_14px_32px_rgba(42,16,90,0.07)] ring-1 ring-[#ECE8F6]">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Phone, label: "تلفن", value: conversation?.contact?.phone || "ثبت نشده" },
              { icon: Tag, label: "وضعیت", value: conversation?.contact?.status || "Lead" },
              { icon: FileText, label: "یادداشت", value: conversation?.contact?.notes ? "دارد" : "ندارد" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[20px] bg-[#FAF9FF] p-3 ring-1 ring-[#F0ECFA]">
                  <Icon className="mx-auto h-5 w-5 text-[#5B2BE2]" />
                  <p className="mt-2 text-[10px] font-black text-[#8A8498]">{item.label}</p>
                  <p className="mt-1 truncate text-[11px] font-black text-[#17112A]">{item.value}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {!messages.length ? (
            <div className="rounded-[28px] border border-dashed border-[#D8D2E8] bg-white/82 px-5 py-10 text-center shadow-[0_16px_38px_rgba(42,16,90,0.05)]">
              <Clock3 className="mx-auto h-9 w-9 text-[#8E58FF]" />
              <p className="mt-3 text-sm font-black text-[#17112A]">هنوز پیامی در این گفتگو ثبت نشده است.</p>
            </div>
          ) : (
            messages.map((message) => {
              const outbound = message.direction === "outbound";
              return (
                <div key={message.id} className={`flex ${outbound ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm font-medium leading-7 shadow-sm ${
                      outbound
                        ? "rounded-br-md bg-gradient-to-br from-[#5B2BE2] to-[#8E58FF] text-white"
                        : "rounded-bl-md bg-white text-[#17112A] ring-1 ring-[#ECE8F6]"
                    }`}
                  >
                    {message.text || "پیام بدون متن"}
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${outbound ? "text-white/65" : "text-[#9A94AA]"}`}>
                      <BadgeCheck className="h-3 w-3" />
                      ثبت شد
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <form onSubmit={sendMessage} className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-[#E9E4F5] bg-white/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[430px] gap-2 p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="پاسخ را بنویس..."
            className="h-12 rounded-2xl border-[#E6E2F4] bg-[#FAF9FF] text-right font-bold text-[#17112A] placeholder:text-[#9A94AA]"
          />
          <Button type="submit" className="h-12 rounded-2xl bg-[#5B2BE2] px-4 text-white hover:bg-[#4A20C9]">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto hidden max-w-[430px] border-t border-[#E9E4F5] bg-white/92 px-3 pb-2 pt-2 shadow-[0_-18px_40px_rgba(42,16,90,0.08)] backdrop-blur-xl">
        <div className="grid grid-cols-4 text-center">
          {[
            { icon: Settings, label: "تنظیمات", href: "/dashboard", active: false },
            { icon: Link2, label: "اتصال", href: "/connect", active: false },
            { icon: MessageCircle, label: "اینباکس", href: "/dashboard/inbox", active: true },
            { icon: Home, label: "داشبورد", href: "/dashboard", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`mx-1 flex h-[62px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black transition active:scale-[0.98] ${
                  item.active ? "bg-[#F2EEFF] text-[#5B2BE2]" : "text-[#6D6780]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
