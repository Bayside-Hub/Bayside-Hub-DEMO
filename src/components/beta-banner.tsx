"use client";

import { useSyncExternalStore } from "react";

const DISMISS_KEY = "bayside_beta_banner_dismissed";
const DISMISS_EVENT = "bayside-beta-banner-change";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
  };
}

function isVisible() {
  return window.localStorage.getItem(DISMISS_KEY) !== "1";
}

/** Announces the closed beta without blocking navigation or page content. */
export default function BetaBanner() {
  const visible = useSyncExternalStore(subscribe, isVisible, () => true);

  if (!visible) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <div className="beta-banner-shell shrink-0 px-3 py-2 sm:px-5 sm:py-3">
      <div
        role="status"
        className="beta-banner-card mx-auto flex w-full max-w-[1880px] items-start gap-3 rounded-[10px] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.16)] sm:items-center sm:px-5"
      >
        <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0 sm:mt-0" aria-hidden>
          <path d="M12 3 2.75 20h18.5L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 9v5M12 17.25v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <p className="min-w-0 flex-1 text-xs font-medium leading-5 sm:text-sm">
          Bayside-Hub is currently in closed beta. Some features may be limited or unavailable. Test participants are requested to submit feedback via{" "}
          <a
            href="https://form.typeform.com/to/MFaFBYej"
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline decoration-black/40 underline-offset-2 hover:decoration-black"
          >
            our feedback form
          </a>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss closed beta notice"
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
            <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
