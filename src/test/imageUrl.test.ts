import { describe, it, expect } from "vitest";
import { optimizedImageUrl } from "@/lib/imageUrl";

const OBJECT =
  "https://x.supabase.co/storage/v1/object/public/product-images/abc.png";

describe("optimizedImageUrl", () => {
  it("rewrites Supabase object URLs to the render endpoint", () => {
    const out = optimizedImageUrl(OBJECT, "thumb");
    expect(out).toContain("/storage/v1/render/image/public/");
    expect(out).not.toContain("/object/public/");
    expect(out).toContain("width=400");
    expect(out).toContain("quality=60");
  });

  it("uses larger dimensions for bigger variants", () => {
    expect(optimizedImageUrl(OBJECT, "card")).toContain("width=800");
    expect(optimizedImageUrl(OBJECT, "full")).toContain("width=1200");
  });

  it("leaves non-Supabase URLs untouched", () => {
    const ext = "https://cdn.example.com/a.jpg";
    expect(optimizedImageUrl(ext)).toBe(ext);
  });

  it("handles empty/nullish values", () => {
    expect(optimizedImageUrl("")).toBe("");
    expect(optimizedImageUrl(undefined)).toBe("");
    expect(optimizedImageUrl(null)).toBe("");
  });

  it("appends params with & when the URL already has a query", () => {
    const out = optimizedImageUrl(`${OBJECT}?token=1`);
    expect(out).toContain("?token=1&width=");
  });
});
