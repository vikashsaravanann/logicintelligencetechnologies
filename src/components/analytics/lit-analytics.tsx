"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Paths whose URLs carry single-use secrets in the query string (onboarding
 * tokens, proposal access tokens). Their query strings must never reach
 * analytics. Matched on the pathname prefix.
 */
const SCRUB_PREFIXES = ["/onboard", "/proposal"];

/**
 * Strips the query string (and hash) from events on token-bearing paths before
 * anything is sent to Vercel Analytics. Everything else passes through
 * unchanged. Runs client-side; this is why it lives in its own client module.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    const shouldScrub = SCRUB_PREFIXES.some(
      (p) => url.pathname === p || url.pathname.startsWith(p + "/"),
    );
    if (shouldScrub && (url.search || url.hash)) {
      url.search = "";
      url.hash = "";
      return { ...event, url: url.toString() };
    }
  } catch {
    // If the URL cannot be parsed, drop the event rather than risk leaking it.
    return null;
  }
  return event;
}

export function LitAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
