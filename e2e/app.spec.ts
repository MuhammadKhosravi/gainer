import { test, expect, type Page } from "@playwright/test";
async function signup(page: Page, name: string) {
  await page.goto("/");
  await page.getByLabel("نام شما").fill(name);
  await page
    .getByLabel("ایمیل", { exact: true })
    .fill(`test-${crypto.randomUUID()}@example.com`);
  await page
    .getByLabel("رمز عبور", { exact: true })
    .fill("Secure-test-password-2026");
  await page.getByRole("button", { name: "شروع مسیر من" }).click();
  await expect(
    page.getByRole("heading", { name: "برنامه‌ای به اندازهٔ خودت" }),
  ).toBeVisible();
  await page.getByLabel("نام", { exact: true }).fill(name);
  await page.getByLabel("۱۸ سال یا بیشتر").check();
  await page.getByRole("button", { name: "ساخت برنامهٔ من" }).click();
  await expect(
    page.getByRole("heading", { name: new RegExp(`سلام ${name}`) }),
  ).toBeVisible();
}
async function nav(page: Page, label: string) {
  if (await page.getByRole("button", { name: "باز کردن منو" }).isVisible())
    await page.getByRole("button", { name: "باز کردن منو" }).click();
  await page.getByRole("button", { name: label, exact: true }).click();
}
async function deleteAccount(page: Page) {
  await nav(page, "تنظیمات");
  await page
    .getByRole("button", { name: "حذف حساب و اطلاعات", exact: true })
    .click();
  await page.getByLabel("برای تأیید").fill("حذف");
  await page.getByRole("button", { name: "حذف دائمی حساب" }).click();
  await expect(
    page.getByRole("heading", { name: "برای رشدت جا باز کن." }),
  ).toBeVisible();
}
test("Persian diary, portions, persistence, personal foods, saved meals, weight and deletion", async ({
  page,
}) => {
  await signup(page, "سارا");
  await page.getByRole("button", { name: "ثبت غذا", exact: true }).click();
  await page.getByRole("textbox", { name: "جستجوی غذا" }).fill("برنج");
  await page
    .getByRole("button", { name: "افزودن به علاقه‌مندی‌ها برنج سفید پخته" })
    .click();
  await page
    .getByRole("button", { name: "برنج سفید پخته", exact: false })
    .filter({ has: page.locator(".food-result-icon") })
    .click();
  await page.getByLabel("مقدار", { exact: true }).fill("۲");
  await page.getByLabel("وعده", { exact: true }).selectOption("ناهار");
  await expect(page.locator(".nutrition-preview")).toContainText("۲۰۸");
  await page.getByRole("button", { name: "افزودن به دفتر غذا" }).click();
  await expect(page.locator(".entry-row")).toContainText("۲۰۸");
  await page.reload();
  await expect(page.locator(".entry-row")).toContainText("برنج سفید پخته");
  await page.getByRole("button", { name: "ویرایش برنج سفید پخته" }).click();
  await page.getByLabel("مقدار", { exact: true }).fill("۸۰");
  await page.getByRole("button", { name: "ذخیرهٔ تغییرات" }).click();
  await expect(page.locator(".entry-row")).toContainText("۱۰۴");
  await page.getByRole("button", { name: "ثبت غذا", exact: true }).click();
  await page
    .getByRole("button", { name: "غذای دلخواه من / ورود از برچسب" })
    .click();
  await page.getByLabel("نام غذا", { exact: true }).fill("اسموتی خانگی");
  await page.getByLabel("کالری در ۱۰۰ گرم").fill("۱۲۰");
  await page.getByLabel("پروتئین در ۱۰۰ گرم").fill("۴");
  await page.getByLabel("نام واحد").fill("لیوان");
  await page.getByLabel("وزن هر واحد").fill("۲۵۰");
  await page.getByRole("button", { name: "ذخیرهٔ غذای شخصی" }).click();
  await page.getByRole("textbox", { name: "جستجوی غذا" }).fill("اسموتی");
  await page.getByRole("button", { name: /اسموتی خانگی.*کالری/ }).click();
  await page.getByRole("button", { name: "افزودن به دفتر غذا" }).click();
  await expect(
    page.locator(".entry-row").filter({ hasText: "اسموتی" }),
  ).toContainText("۳۰۰");
  await nav(page, "دفتر غذا");
  await page.getByRole("button", { name: "ذخیرهٔ غذاهای این روز" }).click();
  await page.getByLabel("نام مجموعه").fill("ناهار همیشگی");
  await page
    .getByRole("button", { name: "ذخیرهٔ مجموعه", exact: true })
    .click();
  await expect(page.locator(".saved-row")).toContainText("ناهار همیشگی");
  await page.getByRole("button", { name: "افزودن به این روز" }).click();
  await expect(page.locator(".entry-row")).toHaveCount(4);
  await nav(page, "روند پیشرفت");
  await page.getByRole("button", { name: "ثبت وزن جدید" }).click();
  await page.getByLabel("وزن (کیلوگرم)", { exact: true }).fill("۵۶٫۲");
  await page.getByLabel("تاریخ", { exact: true }).fill("2026-11-04");
  await page.getByRole("button", { name: "ثبت وزن", exact: true }).click();
  await expect(page.locator('svg[role="img"]')).toBeVisible();
  await expect(
    page.locator(".weight-row").filter({ hasText: "۵۶٫۲" }),
  ).toBeVisible();
  await nav(page, "تنظیمات");
  await page.getByLabel("هدف روزانه").fill("۲۵۰۰");
  await page.getByRole("button", { name: "ذخیرهٔ تنظیمات" }).click();
  await nav(page, "نمای کلی");
  await expect(page.locator(".energy-details")).toContainText("۲٬۵۰۰");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await nav(page, "تنظیمات");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "دریافت اطلاعات من" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain("javaneh");
  await deleteAccount(page);
});
test("mobile RTL layout and user data isolation", async ({ page, browser }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signup(page, "رضا");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const sessionResponse = await page.request.get("/api/data");
  expect(sessionResponse.ok()).toBe(true);
  const d = await sessionResponse.json();
  expect(d.entries).toHaveLength(0);
  const other = await browser.newContext();
  const anonymous = await other.request.get("http://localhost:3000/api/data");
  expect(anonymous.status()).toBe(401);
  await other.close();
  await page.getByRole("button", { name: "یک مشت انرژی" }).click();
  await expect(page.locator(".entry-row")).toHaveCount(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await deleteAccount(page);
});
