"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { ClubChatMessage } from "@/lib/supabase/types";
import {
  deleteClubMessage,
  postClubMessage,
} from "../actions";

function messageTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ClubChat({
  clubId,
  slug,
  messages,
}: {
  clubId: string;
  slug: string;
  messages: ClubChatMessage[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(postClubMessage, null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`club-chat:${clubId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "club_messages", filter: `club_id=eq.${clubId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [clubId, router]);

  return (
    <section className="mt-12 overflow-hidden rounded-[18px] border border-[#97b4de]/40 bg-[#080d20]" aria-labelledby="club-chat-title">
      <header className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-powder">Members only</p>
        <h2 id="club-chat-title" className="mt-1 font-display text-2xl font-semibold uppercase text-cream">Club chat</h2>
        <p className="mt-1 text-sm text-cream/60">A private conversation for approved members and Club leadership.</p>
      </header>

      <div className="max-h-[30rem] space-y-4 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
        {messages.length ? messages.map((message) => (
          <article key={message.id} className="flex gap-3">
            {message.author_avatar_url ? (
              <Image src={message.author_avatar_url} alt="" width={36} height={36} className="size-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream font-bold text-navy">
                {message.author_name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1 rounded-[14px] bg-white/5 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-cream">{message.author_name}</p>
                <time dateTime={message.created_at} className="text-[11px] text-cream/45">{messageTime(message.created_at)}</time>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-cream/80">{message.body}</p>
              {message.can_delete ? (
                <form action={deleteClubMessage} className="mt-2 text-right">
                  <input type="hidden" name="club_id" value={clubId} />
                  <input type="hidden" name="message_id" value={message.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button className="text-xs font-semibold text-cream/50 hover:text-[#f78660]">Delete</button>
                </form>
              ) : null}
            </div>
          </article>
        )) : (
          <p className="py-8 text-center text-sm text-cream/55">No messages yet. Start the Club conversation.</p>
        )}
      </div>

      <form ref={formRef} action={action} className="border-t border-white/10 p-4 sm:p-5">
        <input type="hidden" name="club_id" value={clubId} />
        <input type="hidden" name="slug" value={slug} />
        <label htmlFor="club-chat-message" className="sr-only">Message the Club</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id="club-chat-message"
            name="body"
            required
            maxLength={2000}
            rows={2}
            placeholder="Message your Club…"
            className="min-h-12 flex-1 resize-y rounded-[14px] border border-white/15 bg-white/5 px-4 py-3 text-sm text-cream outline-none placeholder:text-cream/35 focus:border-powder"
          />
          <button disabled={pending} className="h-11 rounded-full bg-cream px-6 text-sm font-bold text-black disabled:cursor-wait disabled:opacity-60">
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
        {state ? <p role="status" className={`mt-2 text-xs ${state.ok ? "text-powder" : "text-[#f78660]"}`}>{state.message}</p> : null}
      </form>
    </section>
  );
}
