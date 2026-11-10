import { test, expect, request } from "@playwright/test";
import { today } from "../src/lib/domain";
test("authenticated data is isolated, mutations are validated, deletion cascades", async () => {
  const a = await request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { Origin: "http://localhost:3000" },
  });
  const b = await request.newContext({
    baseURL: "http://localhost:3000",
    extraHTTPHeaders: { Origin: "http://localhost:3000" },
  });
  test.setTimeout(60000);
  const emails: string[] = [];
  for (const ctx of [a, b]) {
    const email = `security-${crypto.randomUUID()}@example.com`;
    emails.push(email);
    const signup = () =>
      ctx.post("/api/auth/sign-up/email", {
        data: {
          name: "تست امنیت",
          email,
          password: "Secure-test-password-2026",
        },
      });
    let res = await signup();
    if (res.status() === 429) {
      const seconds = Number(res.headers()["retry-after"] || 11);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(15, Math.max(11, seconds)) * 1000),
      );
      res = await signup();
    }
    expect(res.ok(), await res.text()).toBe(true);
  }
  const entry = {
    date: today(),
    meal: "ناهار",
    name: "غذای خصوصی",
    grams: 160,
    calories: 999,
    protein: 999,
    foodId: null,
    per100Calories: 130,
    per100Protein: 2.7,
    portionName: "کفگیر",
    portionGrams: 80,
  };
  expect(
    (
      await a.post("/api/data", { data: { action: "entry", data: entry } })
    ).ok(),
  ).toBe(true);
  await a.post("/api/auth/sign-out", { data: {} });
  expect((await a.get("/api/data")).status()).toBe(401);
  const signin = await a.post("/api/auth/sign-in/email", {
    data: { email: emails[0], password: "Secure-test-password-2026" },
  });
  expect(signin.ok(), await signin.text()).toBe(true);
  const first = await (await a.get("/api/data")).json();
  expect(first.entries[0].calories).toBe(208);
  const id = first.entries[0].id;
  expect((await (await b.get("/api/data")).json()).entries).toHaveLength(0);
  expect(
    (
      await b.post("/api/data", {
        data: { action: "entry", data: { ...entry, id } },
      })
    ).status(),
  ).toBe(404);
  const food = {
    name: "غذای خصوصی",
    calories: 120,
    protein: 4,
    portionName: "لیوان",
    portionGrams: 200,
  };
  expect(
    (await a.post("/api/data", { data: { action: "food", data: food } })).ok(),
  ).toBe(true);
  const personalFood = (await (await a.get("/api/data")).json()).foods[0];
  expect(
    (
      await b.post("/api/data", {
        data: {
          action: "food",
          data: { ...food, id: personalFood.id, name: "دستکاری" },
        },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await a.post("/api/data", {
        data: { action: "food", data: { ...food, id: "invalid-id" } },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await a.post("/api/data", {
        data: {
          action: "food",
          data: { ...food, id: personalFood.id, calories: 150 },
        },
      })
    ).ok(),
  ).toBe(true);
  expect((await (await a.get("/api/data")).json()).foods).toMatchObject([
    { ...food, id: personalFood.id, calories: 150 },
  ]);
  expect((await (await b.get("/api/data")).json()).foods).toHaveLength(0);

  await b.post("/api/data", { data: { action: "deleteEntry", data: { id } } });
  expect((await (await a.get("/api/data")).json()).entries).toHaveLength(1);
  expect(
    (
      await a.post("/api/data", {
        data: { action: "entry", data: { ...entry, grams: 0 } },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await a.post("/api/data", {
        headers: { Origin: "https://untrusted.example" },
        data: { action: "deleteEntry", data: { id } },
      })
    ).status(),
  ).toBe(403);
  for (const ctx of [a, b]) {
    expect(
      (
        await ctx.post("/api/data", {
          data: { action: "deleteAccount", data: {} },
        })
      ).ok(),
    ).toBe(true);
    expect((await ctx.get("/api/data")).status()).toBe(401);
    await ctx.dispose();
  }
});
