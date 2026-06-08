// Retry helper for transient backend errors (e.g. PGRST002 schema cache reload, 503).
export async function retryQuery<T>(
  fn: () => Promise<{ data: T | null; error: any }>,
  maxAttempts = 4
): Promise<{ data: T | null; error: any }> {
  let lastResult: { data: T | null; error: any } = { data: null, error: null };
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    lastResult = await fn();
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
      msg.includes("timeout");

    if (!isTransient || attempt === maxAttempts - 1) return lastResult;

    // Backoff: 800ms, 1800ms, 3500ms
    const delay = 800 * Math.pow(2, attempt) + Math.random() * 200;
    await new Promise((r) => setTimeout(r, delay));
  }
  return lastResult;
}
