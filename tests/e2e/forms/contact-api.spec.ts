import { test, expect } from "@playwright/test";

test.describe("Form APIs", () => {
  test("contact rejects invalid payload", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { email: "not-an-email" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json().catch(() => ({}));
    expect(body.success === true).toBeFalsy();
  });

  test("booking rejects missing fields", async ({ request }) => {
    const res = await request.post("/api/booking", {
      data: { name: "A" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json().catch(() => ({}));
    expect(body.success === true).toBeFalsy();
  });

  test("checklist rejects invalid email", async ({ request }) => {
    const res = await request.post("/api/checklist", {
      data: { email: "bad", type: "lead_magnet" },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
