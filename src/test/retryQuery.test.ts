import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { retryQuery } from "@/lib/retryQuery";

describe("retryQuery", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns data on success", async () => {
    const p = retryQuery(async () => ({ data: [1, 2], error: null }));
    await vi.runAllTimersAsync();
    expect(await p).toEqual({ data: [1, 2], error: null });
  });

  // The catalog spinner used to hang forever when the query rejected instead of
  // resolving with an { error } payload.
  it("normalises a thrown error instead of rejecting", async () => {
    const p = retryQuery(async () => {
      throw new TypeError("Failed to fetch");
    });
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
  });

  it("does not reject when the function throws synchronously", async () => {
    const p = retryQuery(() => {
      throw new Error("boom sync");
    });
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result.error?.message).toContain("boom sync");
  });

  it("settles with a timeout error when the query never resolves", async () => {
    const p = retryQuery<string>(() => new Promise(() => {}), 1, 1000);
    await vi.advanceTimersByTimeAsync(1500);
    const result = await p;
    expect(result.error?.message).toContain("timeout");
  });

  it("retries transient errors and succeeds", async () => {
    let calls = 0;
    const p = retryQuery(async () => {
      calls++;
      if (calls < 3) return { data: null, error: { code: "PGRST002" } };
      return { data: "ok", error: null };
    });
    await vi.runAllTimersAsync();
    expect(await p).toEqual({ data: "ok", error: null });
    expect(calls).toBe(3);
  });

  it("does not retry non-transient errors", async () => {
    let calls = 0;
    const p = retryQuery(async () => {
      calls++;
      return { data: null, error: { code: "42501", message: "permission denied" } };
    });
    await vi.runAllTimersAsync();
    await p;
    expect(calls).toBe(1);
  });
});
