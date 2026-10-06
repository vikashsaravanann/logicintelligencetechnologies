/**
 * A loaded-or-errored wrapper for admin data reads. Admin pages must never
 * render a swallowed query error as an empty state, so loaders return Loaded<T>
 * and pages show a QueryErrorState when state === "error". Pure module.
 */

export type Loaded<T> = { state: "ok"; data: T } | { state: "error"; message: string };

interface SupabaseLike<T> {
  data: T | null;
  error: { message?: string } | null;
}

/**
 * Turn a Supabase result into Loaded<T>. On error, the generic message is shown
 * to the admin; the underlying error should be logged separately, never leaked
 * in detail to the UI.
 */
export function fromSupabase<T>(res: SupabaseLike<T>, fallback: T): Loaded<T> {
  if (res.error) {
    return { state: "error", message: "Could not load this data. The database request failed." };
  }
  return { state: "ok", data: (res.data ?? fallback) as T };
}

export function ok<T>(data: T): Loaded<T> {
  return { state: "ok", data };
}

export function errored<T>(message = "Could not load this data."): Loaded<T> {
  return { state: "error", message };
}
