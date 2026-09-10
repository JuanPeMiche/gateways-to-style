// Retry helper for transient backend errors (e.g. PGRST002 schema cache reload, 503).
//
// Contract: NEVER throws and NEVER hangs. Callers rely on this to always settle so
// their loading state can be cleared — a rejected promise here used to leave the
// catalog spinner running forever.

const DEFAULT_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout after ${ms}ms`)),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** Supabase query builders are thenables, not real Promises. */
type QueryResult<T> = { data: T | null; error: any };

export async function retryQuery<T>(
  fn: () => PromiseLike<{ data: T | null; error: any }>,
  maxAttempts = 4,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<QueryResult<T>> {
  let lastResult: QueryResult<T> = { data: null, error: null };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // A thrown/rejected query (network down, CORS, aborted fetch) is normalised
      // into the same { data, error } shape instead of escaping to the caller.
      lastResult = await withTimeout(
        Promise.resolve().then(fn),
        timeoutMs
      );
    } catch (thrown: any) {
      lastResult = {
        data: null,
        error: thrown instanceof Error ? thrown : new Error(String(thrown)),
      };
    }

    const err = lastResult.error;
    if (!err) return lastResult;

    const code = err.code || "";
    const msg = (err.message || "").toLowerCase();
    const isTransient =
      code === "PGRST002" ||
      code === "503" ||
      msg.includes("schema cache") ||
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network request failed") ||
      msg.includes("load failed") ||
      msg.includes("timeout") ||
      msg.includes("aborted");

    if (!isTransient || attempt === maxAttempts - 1) return lastResult;

    // Backoff: 800ms, 1800ms, 3500ms
    const delay = 800 * Math.pow(2, attempt) + Math.random() * 200;
    await new Promise((r) => setTimeout(r, delay));
  }

  return lastResult;
}
