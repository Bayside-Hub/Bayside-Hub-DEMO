"use client";

import { useActionState, useState } from "react";
import { createAnnouncement } from "../actions";

const tagOptions = ["Announcements", "Events", "Clubs", "Sports", "Opportunities"];

export default function AnnouncementForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(createAnnouncement, null);
  const [preview, setPreview] = useState({ title: "", tag: "Announcements", body: "" });
  const [showPreview, setShowPreview] = useState(false);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-ink">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          disabled={disabled}
          placeholder="e.g. Winter Blood Drive Sign-Up"
          onChange={(event) => setPreview((current) => ({ ...current, title: event.target.value }))}
          className="h-10 w-full rounded-full border border-black/10 bg-content-bg px-4 text-sm text-ink outline-none transition-shadow placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="tag" className="mb-1 block text-sm font-medium text-ink">
          Tag
        </label>
        <select
          id="tag"
          name="tag"
          disabled={disabled}
          defaultValue="Announcements"
          onChange={(event) => setPreview((current) => ({ ...current, tag: event.target.value }))}
          className="h-10 w-full rounded-full border border-black/10 bg-content-bg px-4 text-sm text-ink outline-none transition-shadow focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-50"
        >
          {tagOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-ink">
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          minLength={3}
          maxLength={10000}
          rows={5}
          disabled={disabled}
          placeholder="What should the school know?"
          onChange={(event) => setPreview((current) => ({ ...current, body: event.target.value }))}
          className="w-full rounded-card border border-black/10 bg-content-bg px-4 py-3 text-sm leading-6 text-ink outline-none transition-shadow placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-50"
        />
      </div>

      <button
        type="button"
        onClick={() => setShowPreview((visible) => !visible)}
        className="self-start text-sm font-semibold text-navy hover:underline"
      >
        {showPreview ? "Hide preview" : "Preview announcement"}
      </button>

      {showPreview ? (
        <article className="rounded-card border border-black/10 bg-content-bg p-5" aria-label="Announcement preview">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{preview.tag}</p>
          <h3 className="mt-2 font-display text-xl font-bold uppercase text-ink">
            {preview.title.trim() || "Your announcement title"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">
            {preview.body.trim() || "Your announcement body will appear here."}
          </p>
        </article>
      ) : null}

      <label className="flex items-start gap-2 text-xs leading-5 text-muted">
        <input type="checkbox" required className="mt-1" />
        <span>I reviewed the title and message and am ready to publish it to the school.</span>
      </label>

      <div>
        <label htmlFor="version_note" className="mb-1 block text-sm font-medium text-ink">
          Version note
        </label>
        <input
          id="version_note"
          name="version_note"
          maxLength={240}
          defaultValue="Initial publication"
          disabled={disabled}
          className="h-10 w-full rounded-full border border-black/10 bg-content-bg px-4 text-sm text-ink outline-none transition-shadow focus:border-navy focus:ring-2 focus:ring-navy/20 disabled:opacity-50"
        />
      </div>

      {state && !state.ok && (
        <p role="alert" className="rounded-control bg-orange/10 px-3 py-2 text-xs font-medium text-orange">
          {state.message}
        </p>
      )}
      {state && state.ok && (
        <p role="status" className="rounded-control bg-navy/10 px-3 py-2 text-xs font-medium text-navy">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || pending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-navy px-6 text-sm font-semibold text-cream transition-colors hover:bg-navy-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish announcement"}
      </button>
    </form>
  );
}
