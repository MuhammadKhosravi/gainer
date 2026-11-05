import { z } from "zod";
export function normalize(text: string) {
  return text
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\s]+/g, " ")
    .trim()
    .toLowerCase();
}
export function latin(text: string) {
  return text
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/٫/g, ".");
}
export const number = (min: number, max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? Number(latin(v)) : NaN) : v),
    z.number().finite().min(min).max(max),
  );
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((s) => {
    const d = new Date(s + "T12:00:00Z");
    return !isNaN(+d) && d.toISOString().slice(0, 10) === s;
  }, "تاریخ نامعتبر است");
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(50),
  weight: number(25, 300),
  height: number(100, 250),
  age: number(18, 100).refine(Number.isInteger),
  sex: z.enum(["female", "male"]),
  activity: z.enum(["1.2", "1.375", "1.55", "1.725"]),
  targetWeight: number(25, 300),
  calorieGoal: number(1000, 6000),
  preferences: z.string().max(300),
  reminder: z.boolean(),
  reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  safetyAcknowledged: z.literal(true),
});
export type Profile = z.infer<typeof profileSchema>;
export function estimates(
  p: Pick<Profile, "weight" | "height" | "age" | "sex" | "activity">,
) {
  const bmi = p.weight / (p.height / 100) ** 2;
  const bmr =
    10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === "male" ? 5 : -161);
  const maintenance = Math.round(bmr * Number(p.activity));
  return {
    bmi: Math.round(bmi * 10) / 10,
    maintenance,
    goal: Math.round((maintenance + (bmi < 25 ? 300 : 0)) / 50) * 50,
    protein: Math.round(p.weight * 1.2),
  };
}
export const meals = ["صبحانه", "ناهار", "شام", "میان‌وعده"] as const;
export const foodSchema = z.object({
  name: z.string().trim().min(1).max(100),
  calories: number(0, 900),
  protein: number(0, 100),
  portionName: z.string().trim().min(1).max(50),
  portionGrams: number(1, 2000),
});
export const entrySchema = z.object({
  date: dateSchema,
  meal: z.enum(meals),
  name: z.string().trim().min(1).max(100),
  grams: number(1, 5000),
  calories: number(0, 50000),
  protein: number(0, 1000),
  foodId: z.string().max(100).nullable(),
  per100Calories: number(0, 900),
  per100Protein: number(0, 100),
  portionName: z.string().max(50),
  portionGrams: number(1, 2000),
});
export type EntryInput = z.infer<typeof entrySchema>;
export type Entry = EntryInput & { id: string };
export type Weight = { id: string; date: string; weight: number };
export type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  portionName: string;
  portionGrams: number;
  source: string;
  custom?: boolean;
};
export type SavedMeal = { id: string; name: string; items: EntryInput[] };
export function nutrients(
  food: Pick<Food, "calories" | "protein">,
  grams: number,
) {
  return {
    calories: Math.round((food.calories * grams) / 100),
    protein: Math.round(((food.protein * grams) / 100) * 10) / 10,
  };
}
export function bmiLabel(bmi: number) {
  return bmi < 18.5
    ? "کم‌وزن"
    : bmi < 25
      ? "محدودهٔ معمول"
      : bmi < 30
        ? "بالاتر از محدودهٔ معمول"
        : "BMI بالا";
}
