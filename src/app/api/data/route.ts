import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import * as s from "@/lib/schema";
import {
  dateSchema,
  today,
  entrySchema,
  foodSchema,
  profileSchema,
  number,
  nutrients,
} from "@/lib/domain";
export const dynamic = "force-dynamic";
async function userId() {
  return (await auth.api.getSession({ headers: await headers() }))?.user.id;
}
export async function GET() {
  const id = await userId();
  if (!id)
    return NextResponse.json(
      { error: "ابتدا وارد حساب شوید." },
      { status: 401 },
    );
  const [profile, entries, weights, foods, favorites, savedMeals] =
    await Promise.all([
      db.select().from(s.profiles).where(eq(s.profiles.userId, id)),
      db.select().from(s.entries).where(eq(s.entries.userId, id)),
      db.select().from(s.weights).where(eq(s.weights.userId, id)),
      db.select().from(s.customFoods).where(eq(s.customFoods.userId, id)),
      db.select().from(s.favorites).where(eq(s.favorites.userId, id)),
      db.select().from(s.savedMeals).where(eq(s.savedMeals.userId, id)),
    ]);
  return NextResponse.json(
    {
      profile: profile[0]?.data ?? null,
      entries: entries.map((e) => ({ id: e.id, ...e.data })),
      weights: weights.map(({ id, date, weight }) => ({ id, date, weight })),
      foods: foods.map((f) => ({
        id: f.id,
        ...(f.data as object),
        custom: true,
        source: "واردشده توسط شما",
      })),
      favorites: favorites.map((f) => f.foodId),
      savedMeals: savedMeals.map(({ id, name, items }) => ({
        id,
        name,
        items,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
const idSchema = z.string().uuid();
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (
    !origin ||
    origin !== new URL(process.env.BETTER_AUTH_URL || req.url).origin
  )
    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 403 },
    );
  const id = await userId();
  if (!id)
    return NextResponse.json(
      { error: "ابتدا وارد حساب شوید." },
      { status: 401 },
    );
  try {
    const bodyText = await req.text();
    if (bodyText.length > 65536)
      return NextResponse.json(
        { error: "درخواست بیش از حد بزرگ است." },
        { status: 413 },
      );
    const body = JSON.parse(bodyText);
    const { action, data } = body;
    if (action === "profile") {
      const p = profileSchema.parse(data);
      await db.transaction(async (tx) => {
        const existing = await tx
          .select()
          .from(s.profiles)
          .where(eq(s.profiles.userId, id));
        await tx
          .insert(s.profiles)
          .values({ userId: id, data: p })
          .onConflictDoUpdate({ target: s.profiles.userId, set: { data: p } });
        if (!existing.length)
          await tx
            .insert(s.weights)
            .values({
              id: crypto.randomUUID(),
              userId: id,
              date: new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Tehran",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(new Date()),
              weight: p.weight,
            })
            .onConflictDoNothing();
      });
    } else if (action === "entry") {
      const { id: entryId, ...raw } = data;
      const e = entrySchema.parse(raw);
      const calculated = nutrients(
        { calories: e.per100Calories, protein: e.per100Protein },
        e.grams,
      );
      const values = { ...e, ...calculated };
      if (entryId) {
        const changed = await db
          .update(s.entries)
          .set({ data: values })
          .where(
            and(
              eq(s.entries.id, idSchema.parse(entryId)),
              eq(s.entries.userId, id),
            ),
          )
          .returning();
        if (!changed.length)
          return NextResponse.json(
            { error: "این مورد پیدا نشد." },
            { status: 404 },
          );
      } else
        await db
          .insert(s.entries)
          .values({ id: crypto.randomUUID(), userId: id, data: values });
    } else if (action === "deleteEntry") {
      await db
        .delete(s.entries)
        .where(
          and(
            eq(s.entries.id, idSchema.parse(data.id)),
            eq(s.entries.userId, id),
          ),
        );
    } else if (action === "weight") {
      const w = z
        .object({
          date: dateSchema.refine((d) => d <= today()),
          weight: number(25, 300),
        })
        .parse(data);
      await db
        .insert(s.weights)
        .values({ id: crypto.randomUUID(), userId: id, ...w })
        .onConflictDoUpdate({
          target: [s.weights.userId, s.weights.date],
          set: { weight: w.weight },
        });
    } else if (action === "deleteWeight") {
      await db
        .delete(s.weights)
        .where(
          and(
            eq(s.weights.id, idSchema.parse(data.id)),
            eq(s.weights.userId, id),
          ),
        );
    } else if (action === "food") {
      const { id: foodId, ...f } = foodSchema
        .extend({ id: idSchema.optional() })
        .parse(data);
      if (foodId) {
        const changed = await db
          .update(s.customFoods)
          .set({ data: f })
          .where(
            and(
              eq(s.customFoods.id, foodId),
              eq(s.customFoods.userId, id),
            ),
          )
          .returning({ id: s.customFoods.id });
        if (!changed.length)
          return NextResponse.json(
            { error: "این غذا پیدا نشد." },
            { status: 404 },
          );
      } else {
        await db
          .insert(s.customFoods)
          .values({ id: crypto.randomUUID(), userId: id, data: f });
      }
    } else if (action === "favorite") {
      const f = z
        .object({ foodId: z.string().min(1).max(100), enabled: z.boolean() })
        .parse(data);
      if (f.enabled)
        await db
          .insert(s.favorites)
          .values({ id: crypto.randomUUID(), userId: id, foodId: f.foodId })
          .onConflictDoNothing();
      else
        await db
          .delete(s.favorites)
          .where(
            and(eq(s.favorites.userId, id), eq(s.favorites.foodId, f.foodId)),
          );
    } else if (action === "saveMeal") {
      const m = z
        .object({
          name: z.string().trim().min(1).max(80),
          items: z.array(entrySchema).min(1).max(40),
        })
        .parse(data);
      await db
        .insert(s.savedMeals)
        .values({ id: crypto.randomUUID(), userId: id, ...m });
    } else if (action === "deleteMeal") {
      await db
        .delete(s.savedMeals)
        .where(
          and(
            eq(s.savedMeals.id, idSchema.parse(data.id)),
            eq(s.savedMeals.userId, id),
          ),
        );
    } else if (action === "repeat") {
      const m = z
        .object({
          date: dateSchema,
          items: z.array(entrySchema).min(1).max(100),
        })
        .parse(data);
      await db.insert(s.entries).values(
        m.items.map((e) => ({
          id: crypto.randomUUID(),
          userId: id,
          data: {
            ...e,
            date: m.date,
            ...nutrients(
              { calories: e.per100Calories, protein: e.per100Protein },
              e.grams,
            ),
          },
        })),
      );
    } else if (action === "deleteAccount") {
      await db.delete(s.user).where(eq(s.user.id, id));
    } else
      return NextResponse.json(
        { error: "عملیات نامعتبر است." },
        { status: 400 },
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError || e instanceof SyntaxError)
      return NextResponse.json(
        { error: "لطفاً اطلاعات و محدودهٔ مقادیر را بررسی کنید." },
        { status: 400 },
      );
    console.error(
      "Data operation failed",
      e instanceof Error ? e.message : "unknown",
    );
    return NextResponse.json(
      { error: "ذخیره انجام نشد. دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
