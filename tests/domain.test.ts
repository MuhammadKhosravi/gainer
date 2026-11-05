import { describe, it, expect } from "vitest";
import {
  normalize,
  latin,
  estimates,
  profileSchema,
  dateSchema,
  nutrients,
  entrySchema,
} from "../src/lib/domain";
describe("Persian input and search", () => {
  it("normalizes Arabic letters and half-spaces", () => {
    expect(normalize("  كره بادام‌زميني ")).toBe(normalize("کره بادام زمینی"));
    expect(latin("۵۵٫۵")).toBe("55.5");
    expect(latin("١٢٣")).toBe("123");
  });
});
const profile = {
  name: "سارا",
  weight: "۵۵٫۵",
  height: 175,
  age: 25,
  sex: "female",
  activity: "1.2",
  targetWeight: 60,
  calorieGoal: 2200,
  preferences: "",
  reminder: false,
  reminderTime: "20:00",
  safetyAcknowledged: true,
};
describe("calorie estimates and validation", () => {
  it("uses Mifflin–St Jeor and a modest surplus", () => {
    const e = estimates({
      weight: 55,
      height: 175,
      age: 25,
      sex: "male",
      activity: "1.2",
    });
    expect(e.bmi).toBe(18);
    expect(e.maintenance).toBe(1829);
    expect(e.goal).toBe(2150);
    expect(e.protein).toBe(66);
  });
  it("does not suggest a surplus for high BMI", () => {
    const e = estimates({
      weight: 90,
      height: 170,
      age: 30,
      sex: "female",
      activity: "1.2",
    });
    expect(e.goal).toBe(Math.round(e.maintenance / 50) * 50);
  });
  it("accepts Persian decimal weight", () => {
    expect(profileSchema.parse(profile).weight).toBe(55.5);
  });
  it.each([
    { age: 17 },
    { weight: "" },
    { height: 0 },
    { calorieGoal: Infinity },
    { calorieGoal: 6001 },
    { safetyAcknowledged: false },
    { activity: "2.5" },
  ])("rejects unsafe or invalid inputs %j", (change) => {
    expect(profileSchema.safeParse({ ...profile, ...change }).success).toBe(
      false,
    );
  });
  it("rejects impossible calendar dates", () => {
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
    expect(dateSchema.safeParse("2026-02-28").success).toBe(true);
  });
  it("calculates portions without mutating food values", () => {
    expect(nutrients({ calories: 130, protein: 2.7 }, 160)).toEqual({
      calories: 208,
      protein: 4.3,
    });
  });
  it("rejects zero food quantity", () => {
    expect(
      entrySchema.safeParse({
        date: "2026-01-01",
        meal: "صبحانه",
        name: "نان",
        grams: 0,
        calories: 0,
        protein: 0,
        foodId: null,
        per100Calories: 260,
        per100Protein: 9,
        portionName: "گرم",
        portionGrams: 1,
      }).success,
    ).toBe(false);
  });
});
