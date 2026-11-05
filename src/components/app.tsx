"use client";
import {
  useState,
  useEffect,
  useCallback,
  useId,
  cloneElement,
  type ReactElement,
  type FormEvent,
  type ReactNode,
} from "react";
import { createAuthClient } from "better-auth/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Sprout,
  LayoutDashboard,
  Utensils,
  TrendingUp,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpLeft,
  Flame,
  Wheat,
  Egg,
  Sun,
  Moon,
  CloudSun,
  Star,
  Search,
  X,
  Trash2,
  Pencil,
  LogOut,
  Download,
  Check,
  Heart,
  Leaf,
  LoaderCircle,
  BookOpen,
  Copy,
  Menu,
  Bell,
  Info,
} from "lucide-react";
import { foods as starterFoods } from "@/lib/foods";
import {
  today,
  latin,
  normalize,
  estimates,
  bmiLabel,
  nutrients,
  meals,
  profileSchema,
  foodSchema,
  type Profile,
  type Entry,
  type EntryInput,
  type Food,
  type Weight,
  type SavedMeal,
} from "@/lib/domain";
const authClient = createAuthClient();
const fa = (v: number, digits = 0) =>
  new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits }).format(v);
const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "long",
  },
) =>
  new Intl.DateTimeFormat("fa-IR", {
    ...options,
    timeZone: "Asia/Tehran",
  }).format(new Date(date + "T12:00:00+03:30"));
function moveDate(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
type Data = {
  profile: Profile | null;
  entries: Entry[];
  weights: Weight[];
  foods: Food[];
  favorites: string[];
  savedMeals: SavedMeal[];
};
type Tab = "dashboard" | "diary" | "progress" | "settings";
function Spinner() {
  return <LoaderCircle className="spin" size={20} />;
}
function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Sprout size={27} />
      </span>
      <span>
        جوانه<small>همراهِ رشد تو</small>
      </span>
    </div>
  );
}
function Modal({
  title,
  description,
  children,
  close,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  close: () => void;
}) {
  return (
    <Dialog.Root open onOpenChange={(v) => !v && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content
          className="modal"
          aria-describedby={description ? "modal-description" : undefined}
        >
          <div className="modal-head">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="بستن">
              <X size={20} />
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description id="modal-description" className="muted">
              {description}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-describedby": hint ? id + "-hint" : undefined,
      })}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </div>
  );
}
function NumInput({
  value,
  onChange,
  ...props
}: {
  value: string | number;
  onChange: (s: string) => void;
  [key: string]: unknown;
}) {
  return (
    <input
      {...props}
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(latin(e.target.value))}
    />
  );
}
function Auth({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({
              name: String(f.get("name")),
              email: String(f.get("email")),
              password: String(f.get("password")),
            })
          : await authClient.signIn.email({
              email: String(f.get("email")),
              password: String(f.get("password")),
            });
      if (result.error)
        setError(
          mode === "signup"
            ? "ساخت حساب انجام نشد. ایمیل، رمز عبور یا وجود حساب قبلی را بررسی کنید."
            : "ایمیل یا رمز عبور درست نیست.",
        );
      else onDone();
    } catch {
      setError("ارتباط برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="welcome">
      <div className="welcome-story">
        <Brand />
        <span className="eyebrow light">یک شروع کوچک، برای خودت</span>
        <h1>
          رشد، از همین
          <br />
          <em>لقمه‌های کوچک</em>
          <br />
          شروع می‌شود.
        </h1>
        <p>
          با غذای آشنا، هدفی روشن و قدم‌هایی که از پس‌شان برمی‌آیی؛ مسیر افزایش
          وزن را با هم پیش می‌بریم.
        </p>
        <div className="welcome-art">
          <div className="plate">
            <Leaf size={70} />
            <span className="food-orbit">✦</span>
          </div>
          <span className="art-tag">
            <Check size={16} /> هر روز، کمی بهتر
          </span>
        </div>
        <div className="welcome-points">
          <span>
            <Check /> ثبت آسان غذاهای ایرانی
          </span>
          <span>
            <Check /> هدف متناسب با بدن تو
          </span>
          <span>
            <Check /> پیگیری آرام و بدون قضاوت
          </span>
        </div>
      </div>
      <div className="welcome-form">
        <div className="mobile-brand">
          <Brand />
        </div>
        <span className="eyebrow">به جوانه خوش آمدی</span>
        <h2>{mode === "signup" ? "برای رشدت جا باز کن." : "خوش برگشتی."}</h2>
        <p className="muted">
          {mode === "signup"
            ? "حسابت را بساز و اولین قدم را بردار."
            : "وارد شو و مسیرت را ادامه بده."}
        </p>
        <form onSubmit={submit} className="stack">
          {mode === "signup" && (
            <Field label="نام شما">
              <input
                name="name"
                autoComplete="given-name"
                required
                maxLength={50}
                placeholder="چطور صدایت کنیم؟"
              />
            </Field>
          )}
          <Field label="ایمیل">
            <input
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Field>
          <Field label="رمز عبور" hint="حداقل ۱۰ کاراکتر">
            <input
              name="password"
              type="password"
              dir="ltr"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              minLength={10}
              maxLength={128}
              required
            />
          </Field>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full" disabled={busy}>
            {busy ? (
              <Spinner />
            ) : mode === "signup" ? (
              "شروع مسیر من"
            ) : (
              "ورود به جوانه"
            )}
            <ArrowUpLeft size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {mode === "signup" ? "قبلاً حساب ساخته‌ای؟" : "هنوز حساب نداری؟"}{" "}
          <button
            className="text-button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError("");
            }}
          >
            {mode === "signup" ? "وارد شو" : "ساخت حساب"}
          </button>
        </p>
        <p className="fineprint">
          برای بزرگسالان ۱۸ سال به بالا · اطلاعاتت فقط در حساب خودت نمایش داده
          می‌شود.
        </p>
      </div>
    </main>
  );
}
const defaultProfile: Profile = {
  name: "",
  weight: 55,
  height: 175,
  age: 25,
  sex: "male",
  activity: "1.2",
  targetWeight: 60,
  calorieGoal: 2400,
  preferences: "",
  reminder: false,
  reminderTime: "20:00",
  safetyAcknowledged: true,
};
function ProfileForm({
  initial,
  onSave,
  busy,
  onLogout,
}: {
  initial: Profile | null;
  onSave: (p: Profile) => Promise<void>;
  busy: boolean;
  onLogout?: () => void;
}) {
  const [p, setP] = useState<Profile>(initial ?? defaultProfile),
    [error, setError] = useState(""),
    [ack, setAck] = useState(!!initial),
    [risk, setRisk] = useState(false),
    [auto, setAuto] = useState(!initial);
  const update = (k: keyof Profile, v: unknown) =>
    setP((prev) => ({ ...prev, [k]: v }));
  const est = estimates(p);
  const validEst =
    Number.isFinite(est.goal) &&
    p.weight >= 25 &&
    p.height >= 100 &&
    p.age >= 18;
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ack) {
      setError("لطفاً شرایط استفاده را تأیید کنید.");
      return;
    }
    if (risk) {
      setError("برای تعیین هدف مناسب، با پزشک یا متخصص تغذیه مشورت کنید.");
      return;
    }
    const parsed = profileSchema.safeParse({
      ...p,
      calorieGoal: auto && validEst ? est.goal : p.calorieGoal,
    });
    if (!parsed.success) {
      setError(
        "مقادیر را بررسی کنید: سن ۱۸–۱۰۰، وزن ۲۵–۳۰۰، قد ۱۰۰–۲۵۰ و هدف کالری ۱۰۰۰–۶۰۰۰.",
      );
      return;
    }
    setError("");
    await onSave(parsed.data);
  }
  return (
    <form onSubmit={submit} className="stack">
      <div className="form-grid">
        <Field label="نام">
          <input
            value={p.name}
            required
            maxLength={50}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="سن (سال)">
          <NumInput
            value={p.age || ""}
            onChange={(v) => update("age", Number(v))}
            required
          />
        </Field>
        <Field label="وزن فعلی (کیلوگرم)">
          <NumInput
            value={p.weight || ""}
            onChange={(v) => update("weight", Number(v))}
            required
          />
        </Field>
        <Field label="قد (سانتی‌متر)">
          <NumInput
            value={p.height || ""}
            onChange={(v) => update("height", Number(v))}
            required
          />
        </Field>
        <Field
          label="جنس در معادلهٔ انرژی"
          hint="فقط برای تخمین سوخت‌وساز استفاده می‌شود."
        >
          <select value={p.sex} onChange={(e) => update("sex", e.target.value)}>
            <option value="female">زن</option>
            <option value="male">مرد</option>
          </select>
        </Field>
        <Field label="سطح فعالیت">
          <select
            value={p.activity}
            onChange={(e) => update("activity", e.target.value)}
          >
            <option value="1.2">کم‌تحرک؛ بیشتر نشسته</option>
            <option value="1.375">سبک؛ ورزش ۱–۳ روز در هفته</option>
            <option value="1.55">متوسط؛ ورزش ۳–۵ روز</option>
            <option value="1.725">زیاد؛ ورزش ۶–۷ روز</option>
          </select>
        </Field>
        <Field label="وزن هدف (کیلوگرم)">
          <NumInput
            value={p.targetWeight || ""}
            onChange={(v) => update("targetWeight", Number(v))}
            required
          />
        </Field>
        <Field label="هدف روزانه (کیلوکالری)">
          <NumInput
            value={auto && validEst ? est.goal : p.calorieGoal || ""}
            onChange={(v) => {
              setAuto(false);
              update("calorieGoal", Number(v));
            }}
            required
          />
        </Field>
      </div>
      {validEst && (
        <div className="estimate">
          <span>
            BMI <b>{fa(est.bmi, 1)}</b> · {bmiLabel(est.bmi)}
          </span>
          <span>
            نگهدارندهٔ تخمینی: <b>{fa(est.maintenance)}</b> کالری
          </span>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setAuto(true);
              update("calorieGoal", est.goal);
            }}
          >
            استفاده از پیشنهاد {fa(est.goal)} کالری
          </button>
        </div>
      )}
      <p className="fineprint">
        برآورد اولیه با معادلهٔ Mifflin–St Jeor و در BMI کمتر از ۲۵، مازاد ۳۰۰
        کالری است. BMI تشخیص پزشکی نیست. هدف را بر اساس روند چند هفته و نظر
        متخصص بازبینی کن؛ برای BMI بالاتر، افزایش وزن خودکار پیشنهاد نمی‌شود.
      </p>
      <Field
        label="ترجیحات غذایی و حساسیت‌ها"
        hint="برای یادداشت خودت؛ پیشنهادها فعلاً بر اساس حساسیت‌ها فیلتر نمی‌شوند."
      >
        <textarea
          value={p.preferences}
          maxLength={300}
          onChange={(e) => update("preferences", e.target.value)}
          placeholder="مثلاً: گیاه‌خوار، حساسیت به بادام‌زمینی"
        />
      </Field>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={p.reminder}
          onChange={(e) => update("reminder", e.target.checked)}
        />{" "}
        یادآوری ثبت غذا هنگام باز بودن برنامه
      </label>
      {p.reminder && (
        <Field label="ساعت یادآوری (تهران)">
          <input
            type="time"
            value={p.reminderTime}
            onChange={(e) => update("reminderTime", e.target.value)}
          />
        </Field>
      )}
      {!initial && (
        <>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={risk}
              onChange={(e) => setRisk(e.target.checked)}
            />{" "}
            کاهش وزن ناخواسته، بارداری/شیردهی، یا سابقهٔ اختلال خوردن دارم.
          </label>
          {risk && (
            <div className="notice">
              این برنامه برای تعیین هدف خودکار در این شرایط مناسب نیست. پیش از
              شروع، از پزشک یا متخصص تغذیه کمک بگیر.
            </div>
          )}
          <label className="checkbox">
            <input
              type="checkbox"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />{" "}
            ۱۸ سال یا بیشتر دارم و می‌دانم این برنامه جایگزین توصیهٔ پزشکی نیست.
          </label>
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy || risk}>
        {busy ? <Spinner /> : <Check size={18} />}{" "}
        {initial ? "ذخیرهٔ تنظیمات" : "ساخت برنامهٔ من"}
      </button>
      {onLogout && (
        <button type="button" className="text-button" onClick={onLogout}>
          خروج از حساب
        </button>
      )}
    </form>
  );
}
export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
      null,
    ),
    [data, setData] = useState<Data | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<Tab>("dashboard"),
    [date, setDate] = useState(today()),
    [foodOpen, setFoodOpen] = useState(false),
    [editing, setEditing] = useState<Entry | null>(null),
    [weightOpen, setWeightOpen] = useState(false),
    [toast, setToast] = useState(""),
    [mobileMenu, setMobileMenu] = useState(false),
    [deleteOpen, setDeleteOpen] = useState(false),
    [confirmText, setConfirmText] = useState(""),
    [saveMealOpen, setSaveMealOpen] = useState(false),
    [mealName, setMealName] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);
  const load = useCallback(async () => {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("دریافت اطلاعات انجام نشد. دوباره تلاش کن.");
    const d = await res.json();
    setData(d);
    return d as Data;
  }, []);
  const init = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await authClient.getSession();
      if (result.error) throw Error("ارتباط با سرور برقرار نشد.");
      setUser(result.data?.user ?? null);
      if (result.data) await load();
      else setData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارتباط برقرار نشد.");
    } finally {
      setLoading(false);
    }
  }, [load]);
  useEffect(() => {
    void init();
  }, [init]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!data?.profile?.reminder) return;
    const p = data.profile;
    const check = () => {
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).format(new Date());
      const key = `gainer-reminder-${today()}`;
      try {
        if (time >= p.reminderTime && !sessionStorage.getItem(key)) {
          setToast("وقت یک یادداشت کوچک است؛ غذای امروزت را ثبت کرده‌ای؟");
          sessionStorage.setItem(key, "1");
        }
      } catch {
        /* reminder storage is optional */
      }
    };
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [data?.profile]);
  async function mutate(
    action: string,
    payload: unknown,
    message = "ذخیره شد",
  ) {
    setBusy(true);
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: payload }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw Error(d.error || "ذخیره انجام نشد.");
      }
      if (action !== "deleteAccount") await load();
      setToast(message);
      return true;
    } catch (e) {
      setToast(e instanceof Error ? e.message : "ارتباط برقرار نشد.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await authClient.signOut();
    setUser(null);
    setData(null);
  }
  if (loading)
    return (
      <div className="loading">
        <Brand />
        <Spinner />
        <p>کمی صبر کن…</p>
      </div>
    );
  if (error)
    return (
      <div className="loading">
        <Brand />
        <p role="alert">{error}</p>
        <button className="primary" onClick={init}>
          تلاش دوباره
        </button>
      </div>
    );
  if (!user) return <Auth onDone={init} />;
  if (!data?.profile)
    return (
      <main className="onboarding">
        <Brand />
        <div className="onboard-card">
          <span className="eyebrow">قدم اول · آشنایی با تو</span>
          <h1>برنامه‌ای به اندازهٔ خودت</h1>
          <p className="muted">
            چند اطلاعات ساده، برای شروع یک مسیر تدریجی و قابل‌ادامه.
          </p>
          <ProfileForm
            initial={null}
            busy={busy}
            onSave={async (p) => {
              await mutate("profile", p, "برنامه‌ات آماده است. خوش آمدی!");
            }}
            onLogout={logout}
          />
        </div>
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </main>
    );
  const profile = data.profile,
    est = estimates(profile),
    entries = data.entries.filter((e) => e.date === date),
    calories = entries.reduce((n, e) => n + e.calories, 0),
    protein = entries.reduce((n, e) => n + e.protein, 0),
    remaining = Math.max(0, profile.calorieGoal - calories),
    pct = Math.min(100, (calories / profile.calorieGoal) * 100),
    allFoods = [...starterFoods, ...data.foods],
    weights = [...data.weights].sort((a, b) => a.date.localeCompare(b.date)),
    currentWeight = weights.at(-1)?.weight ?? profile.weight;
  const nav: [Tab, string, typeof Sprout][] = [
    ["dashboard", "نمای کلی", LayoutDashboard],
    ["diary", "دفتر غذا", Utensils],
    ["progress", "روند پیشرفت", TrendingUp],
    ["settings", "تنظیمات", Settings],
  ];
  async function repeatYesterday() {
    const prev = data!.entries.filter((e) => e.date === moveDate(date, -1));
    if (!prev.length) {
      setToast("برای روز قبل غذایی ثبت نشده است.");
      return;
    }
    await mutate("repeat", { date, items: prev }, "غذاهای روز قبل اضافه شد");
  }
  function exportData() {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), ...data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `javaneh-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <Brand />
        <div className="sidebar-rule" />
        <span className="nav-label">فضای شخصی تو</span>
        <nav>
          {nav.map(([key, label, Icon]) => (
            <button
              key={key}
              className={tab === key ? "nav-item active" : "nav-item"}
              onClick={() => {
                setTab(key);
                setMobileMenu(false);
              }}
            >
              <Icon size={20} />
              {label}
              {tab === key && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-note">
          <span className="side-note-icon">
            <Sprout size={28} />
          </span>
          <h3>آرام رشد کن.</h3>
          <p>تغییرهای کوچک امروز، حالِ بهتر فردا را می‌سازند.</p>
          <span>
            قدم‌به‌قدم، کنار تو هستیم <Heart size={13} />
          </span>
        </div>
        <div className="sidebar-bottom">
          <div className="avatar">{profile.name[0]}</div>
          <div>
            <strong>{profile.name}</strong>
            <small>مسیر شخصی من</small>
          </div>
          <button
            className="icon-button"
            onClick={logout}
            aria-label="خروج از حساب"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="mobile-scrim"
          aria-label="بستن منو"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="icon-button mobile-only"
              aria-label="باز کردن منو"
              onClick={() => setMobileMenu(true)}
            >
              <Menu />
            </button>
            <span>مسیر تندرستی من</span>
            <ChevronLeft size={14} />
            <strong>{nav.find((n) => n[0] === tab)?.[1]}</strong>
          </div>
          <div className="topbar-end">
            <span className="today-label">
              <span className="green-dot" />{" "}
              {dateLabel(today(), {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              className="icon-button"
              aria-label="تنظیم یادآوری"
              onClick={() => setTab("settings")}
            >
              <Bell size={20} />
            </button>
            <div className="avatar small">{profile.name[0]}</div>
          </div>
        </header>
        <main className="main-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">هر قدم کوچک، ارزشمند است</span>
              <h1>
                {tab === "dashboard"
                  ? `سلام ${profile.name}، به رشدت ادامه بده`
                  : tab === "diary"
                    ? "هر لقمه، یک قدم رو به جلو"
                    : tab === "progress"
                      ? "رشدت را در طول زمان ببین"
                      : "این مسیر، مخصوص توست"}
                <span className="heading-leaf">
                  {tab === "dashboard" ? " 🌱" : ""}
                </span>
              </h1>
              <p>
                {tab === "dashboard"
                  ? "امروز هم فرصتی تازه است تا کمی بیشتر به خودت برسی."
                  : tab === "diary"
                    ? "غذاها و نوشیدنی‌هایت را ثبت کن؛ حتی کوچک‌ترین میان‌وعده."
                    : tab === "progress"
                      ? "تغییرهای واقعی زمان می‌برند. به روند نگاه کن، نه فقط یک عدد."
                      : "هدف‌ها و ترجیحاتت را هر زمان که خواستی تغییر بده."}
              </p>
            </div>
            {tab !== "settings" && (
              <button
                className="primary"
                onClick={() => {
                  setEditing(null);
                  tab === "progress" ? setWeightOpen(true) : setFoodOpen(true);
                }}
              >
                <Plus size={19} />
                {tab === "progress" ? "ثبت وزن جدید" : "ثبت غذا"}
              </button>
            )}
          </div>
          {(tab === "dashboard" || tab === "diary") && (
            <>
              <div className="date-row">
                <div className="date-selector">
                  <button
                    className="icon-button"
                    aria-label="روز قبل"
                    onClick={() => setDate(moveDate(date, -1))}
                  >
                    <ChevronRight size={17} />
                  </button>
                  <strong>
                    {date === today() ? "امروز، " : ""}
                    {dateLabel(date, { day: "numeric", month: "long" })}
                  </strong>
                  <button
                    className="icon-button"
                    aria-label="روز بعد"
                    disabled={date >= today()}
                    onClick={() => setDate(moveDate(date, 1))}
                  >
                    <ChevronLeft size={17} />
                  </button>
                </div>
                <label className="date-input-label">
                  انتخاب روز
                  <input
                    aria-label="انتخاب تاریخ"
                    type="date"
                    dir="ltr"
                    value={date}
                    max={today()}
                    onChange={(e) => e.target.value && setDate(e.target.value)}
                  />
                </label>
                {date !== today() && (
                  <button
                    className="text-button"
                    onClick={() => setDate(today())}
                  >
                    بازگشت به امروز
                  </button>
                )}
              </div>
              {tab === "dashboard" && (
                <>
                  <div className="overview-grid">
                    <section className="card energy-card">
                      <div className="section-heading">
                        <h2>
                          <span className="mini-icon peach">
                            <Flame size={19} />
                          </span>{" "}
                          انرژی امروز
                        </h2>
                        <span className="badge">
                          {date === today() ? "هدف روزانه" : "گزارش روز"}
                        </span>
                      </div>
                      <div className="energy-body">
                        <div
                          className="progress-ring"
                          style={
                            { "--progress": `${pct}%` } as React.CSSProperties
                          }
                        >
                          <div>
                            <span>دریافتی</span>
                            <strong>{fa(calories)}</strong>
                            <small>کیلوکالری</small>
                          </div>
                        </div>
                        <div className="energy-details">
                          <span className="muted">
                            از هدف {fa(profile.calorieGoal)} کالری
                          </span>
                          <h3>
                            {remaining
                              ? `${fa(remaining)} کالری`
                              : "هدف امروزت کامل شد"}
                            <small>
                              {remaining
                                ? "تا رسیدن به هدفت باقی مانده"
                                : "هر قدمت ارزشمند است"}
                            </small>
                          </h3>
                          <div className="legend">
                            <span className="green-dot" /> {fa(Math.round(pct))}
                            ٪ از هدف روزانه
                          </div>
                        </div>
                      </div>
                      <div className="energy-footer">
                        <Sprout size={17} />
                        {remaining
                          ? "لازم نیست یک‌باره بخوری؛ یک میان‌وعده هم یک قدم است."
                          : "به نشانه‌های گرسنگی و سیری بدنت هم توجه کن."}
                      </div>
                    </section>
                    <div className="stat-stack">
                      <section className="card stat-card">
                        <span className="mini-icon lavender">
                          <Egg size={21} />
                        </span>
                        <div>
                          <span>پروتئین امروز</span>
                          <h3>
                            {fa(protein, 1)} <small>گرم</small>
                          </h3>
                          <p>راهنمای عمومی: حدود {fa(est.protein)} گرم</p>
                        </div>
                        <div className="small-meter">
                          <span
                            style={{
                              width: `${Math.min(100, (protein / est.protein) * 100)}%`,
                            }}
                          />
                        </div>
                      </section>
                      <section className="card stat-card">
                        <span className="mini-icon yellow">
                          <TrendingUp size={21} />
                        </span>
                        <div>
                          <span>آخرین وزن ثبت‌شده</span>
                          <h3>
                            {fa(currentWeight, 1)} <small>کیلوگرم</small>
                          </h3>
                          <p>هدف تو: {fa(profile.targetWeight, 1)} کیلوگرم</p>
                        </div>
                        <button
                          className="text-button stat-link"
                          onClick={() => setWeightOpen(true)}
                        >
                          ثبت وزن <Plus size={14} />
                        </button>
                      </section>
                    </div>
                  </div>
                  <div className="section-title">
                    <div>
                      <h2>یک لقمه نزدیک‌تر به هدفت</h2>
                      <p>
                        ایده‌های ساده، برای وقتی که کمی انرژی بیشتر می‌خواهی.
                      </p>
                    </div>
                    <span className="subtle-pill">
                      <Leaf size={14} /> کوچک، مقوی، خوشمزه
                    </span>
                  </div>
                  <div className="suggestions">
                    {[
                      {
                        title: "یک مشت انرژی",
                        subtitle: "گردو + خرما",
                        icon: "🌰",
                        kcal: 253,
                        items: [
                          { id: "starter-8", grams: 30 },
                          { id: "starter-12", grams: 20 },
                        ],
                        color: "nuts",
                      },
                      {
                        title: "یک لیوان حالِ خوب",
                        subtitle: "شیر پرچرب + موز",
                        icon: "🥛",
                        kcal: 252,
                        items: [
                          { id: "starter-5", grams: 240 },
                          { id: "starter-11", grams: 118 },
                        ],
                        color: "milk",
                      },
                      {
                        title: "یک عصرانهٔ آشنا",
                        subtitle: "نان سنگک + پنیر",
                        icon: "🧀",
                        kcal: 234,
                        items: [
                          { id: "starter-1", grams: 60 },
                          { id: "starter-7", grams: 30 },
                        ],
                        color: "bread",
                      },
                    ].map((s) => (
                      <button
                        className={`suggestion ${s.color}`}
                        key={s.title}
                        disabled={busy}
                        onClick={async () => {
                          const items = s.items.map((item) => {
                            const f = starterFoods.find(
                              (f) => f.id === item.id,
                            )!;
                            return {
                              date,
                              meal: "میان‌وعده",
                              name: f.name,
                              foodId: f.id,
                              grams: item.grams,
                              per100Calories: f.calories,
                              per100Protein: f.protein,
                              portionName: f.portionName,
                              portionGrams: f.portionGrams,
                              ...nutrients(f, item.grams),
                            };
                          });
                          await mutate(
                            "repeat",
                            { date, items },
                            "میان‌وعده به دفترت اضافه شد",
                          );
                        }}
                      >
                        <span className="suggestion-illustration">
                          {s.icon}
                        </span>
                        <div>
                          <strong>{s.title}</strong>
                          <p>{s.subtitle}</p>
                          <small>حدود {fa(s.kcal)} کالری</small>
                        </div>
                        <span className="suggestion-plus">
                          <Plus size={17} />
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="suggestion-note">
                    پیشنهادها را با حساسیت‌ها و رژیم خودت بررسی کن. با انتخاب هر
                    پیشنهاد، مقادیر مشخص به میان‌وعده اضافه می‌شود.
                  </p>
                </>
              )}
              <section className="card diary-card">
                <div className="section-heading">
                  <div>
                    <h2>
                      دفتر غذای{" "}
                      {date === today()
                        ? "امروز"
                        : dateLabel(date, { day: "numeric", month: "long" })}
                    </h2>
                    <p className="muted">
                      هر چیزی که خوردی، همین‌جا یادداشت کن.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={repeatYesterday}
                  >
                    <Copy size={15} /> تکرار روز قبل
                  </button>
                </div>
                <div className="meal-list">
                  {meals.map((meal, i) => {
                    const list = entries.filter((e) => e.meal === meal);
                    const Icon = [Sun, CloudSun, Moon, Wheat][i];
                    return (
                      <div className="meal-block" key={meal}>
                        <div className="meal-heading">
                          <div>
                            <span className={`meal-icon meal-${i}`}>
                              <Icon size={21} />
                            </span>
                            <strong>{meal}</strong>
                            <span className="muted meal-total">
                              {list.length
                                ? `${fa(list.reduce((n, e) => n + e.calories, 0))} کالری`
                                : "هنوز چیزی ثبت نکرده‌ای"}
                            </span>
                          </div>
                          <button
                            className="icon-button add-meal"
                            aria-label={`افزودن ${meal}`}
                            onClick={() => {
                              setEditing({ meal } as Entry);
                              setFoodOpen(true);
                            }}
                          >
                            <Plus size={19} />
                          </button>
                        </div>
                        {list.map((e) => (
                          <div className="entry-row" key={e.id}>
                            <div>
                              <strong>{e.name}</strong>
                              <span>
                                {fa(e.grams, 1)} گرم · {fa(e.protein, 1)} گرم
                                پروتئین
                              </span>
                            </div>
                            <b>
                              {fa(e.calories)} <small>کالری</small>
                            </b>
                            <button
                              className="icon-button"
                              aria-label={`ویرایش ${e.name}`}
                              onClick={() => {
                                setEditing(e);
                                setFoodOpen(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="icon-button danger-icon"
                              disabled={busy}
                              aria-label={`حذف ${e.name}`}
                              onClick={() =>
                                mutate(
                                  "deleteEntry",
                                  { id: e.id },
                                  "غذا حذف شد",
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className="diary-footer">
                  <span>مجموع روز</span>
                  <strong>
                    {fa(calories)} <small>کیلوکالری</small>
                  </strong>
                  <span>{fa(protein, 1)} گرم پروتئین</span>
                </div>
              </section>
              {tab === "diary" && (
                <section className="card saved-section">
                  <div className="section-heading">
                    <h2>
                      <BookOpen size={19} /> وعده‌های ذخیره‌شده
                    </h2>
                    <button
                      className="text-button"
                      disabled={!entries.length || busy}
                      onClick={() => {
                        setMealName("");
                        setSaveMealOpen(true);
                      }}
                    >
                      <Plus size={16} /> ذخیرهٔ غذاهای این روز
                    </button>
                  </div>
                  {!data.savedMeals.length ? (
                    <p className="empty-hint">
                      غذاهای تکراری‌ات را یک بار ذخیره کن و دفعهٔ بعد با یک لمس
                      اضافه کن.
                    </p>
                  ) : (
                    data.savedMeals.map((m) => (
                      <div className="saved-row" key={m.id}>
                        <div>
                          <strong>{m.name}</strong>
                          <small>
                            {fa(m.items.length)} مورد ·{" "}
                            {fa(m.items.reduce((s, e) => s + e.calories, 0))}{" "}
                            کالری
                          </small>
                        </div>
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() =>
                            mutate(
                              "repeat",
                              { date, items: m.items },
                              "وعده اضافه شد",
                            )
                          }
                        >
                          افزودن به این روز
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`حذف وعده ${m.name}`}
                          disabled={busy}
                          onClick={() =>
                            mutate("deleteMeal", { id: m.id }, "وعده حذف شد")
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </section>
              )}
              <div className="gentle-note">
                <Heart size={18} />
                <p>
                  عددها فقط راهنما هستند. استمرار، حالِ خوب و رابطهٔ آرام با غذا
                  مهم‌ترند.
                </p>
              </div>
            </>
          )}
          {tab === "progress" && (
            <>
              <div className="progress-stats">
                <section className="card">
                  <span>وزن شروع</span>
                  <h2>
                    {fa(profile.weight, 1)} <small>کیلوگرم</small>
                  </h2>
                </section>
                <section className="card">
                  <span>وزن فعلی</span>
                  <h2>
                    {fa(currentWeight, 1)} <small>کیلوگرم</small>
                  </h2>
                </section>
                <section className="card">
                  <span>تغییر از شروع</span>
                  <h2 dir="ltr">
                    {currentWeight - profile.weight > 0 ? "+" : ""}
                    {fa(currentWeight - profile.weight, 1)}{" "}
                    <small>کیلوگرم</small>
                  </h2>
                </section>
                <section className="card">
                  <span>وزن هدف</span>
                  <h2>
                    {fa(profile.targetWeight, 1)} <small>کیلوگرم</small>
                  </h2>
                </section>
              </div>
              <section className="card chart-card">
                <div className="section-heading">
                  <div>
                    <h2>داستان رشد تو</h2>
                    <p className="muted">
                      وزن‌های ثبت‌شده و میانگین هفت ثبت آخر
                    </p>
                  </div>
                  <span className="badge">کیلوگرم</span>
                </div>
                <WeightChart weights={weights} />
                <p className="fineprint">
                  در زمان و شرایط مشابه وزن کن. تغییر آب بدن روی عدد روزانه اثر
                  می‌گذارد؛ فعلاً هدف کالری به‌صورت خودکار تغییر نمی‌کند.
                </p>
              </section>
              <section className="card">
                <div className="section-heading">
                  <h2>تاریخچهٔ وزن</h2>
                  <button
                    className="text-button"
                    onClick={() => setWeightOpen(true)}
                  >
                    <Plus size={16} /> ثبت جدید
                  </button>
                </div>
                {[...weights].reverse().map((w) => (
                  <div className="weight-row" key={w.id}>
                    <span>{dateLabel(w.date)}</span>
                    <strong>{fa(w.weight, 1)} کیلوگرم</strong>
                    <button
                      className="icon-button danger-icon"
                      aria-label={`حذف وزن ${w.date}`}
                      disabled={busy}
                      onClick={() =>
                        mutate("deleteWeight", { id: w.id }, "وزن حذف شد")
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </section>
              <div className="notice">
                افزایش وزن تدریجی است. اگر بدون قصد وزن کم می‌کنی یا پس از چند
                هفته تغییری نمی‌بینی، با پزشک یا متخصص تغذیه صحبت کن.
              </div>
            </>
          )}
          {tab === "settings" && (
            <div className="settings-grid">
              <section className="card">
                <h2>اطلاعات و هدف‌های من</h2>
                <p className="muted">
                  تغییر وزن در این فرم، مبنای شروع را عوض می‌کند. برای وزن‌کشی
                  جدید از «ثبت وزن» استفاده کن.
                </p>
                <ProfileForm
                  initial={profile}
                  onSave={async (p) => {
                    await mutate("profile", p);
                  }}
                  busy={busy}
                />
              </section>
              <div className="settings-side">
                <section className="card">
                  <span className="mini-icon sage">
                    <Heart size={21} />
                  </span>
                  <h2>حریم خصوصی تو</h2>
                  <p className="muted">
                    اطلاعات غذا و وزن به حساب تو متصل است. می‌توانی یک نسخه
                    دریافت کنی یا حساب و تمام اطلاعاتش را حذف کنی.
                  </p>
                  <p className="account-email" dir="ltr">
                    {user.email}
                  </p>
                  <button className="secondary full" onClick={exportData}>
                    <Download size={17} /> دریافت اطلاعات من
                  </button>
                  <button
                    className="text-button danger"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 size={16} /> حذف حساب و اطلاعات
                  </button>
                </section>
                <section className="card resources">
                  <h2>دربارهٔ پیشنهادها</h2>
                  <p>
                    کاتالوگ اولیه برآوردی است، نه جدول رسمی تغذیهٔ ایران. مقدار
                    هر غذا و واحد خانگی را پیش از ثبت می‌توانی تغییر بدهی.
                  </p>
                  <a
                    href="https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/healthy-ways-to-gain-weight/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    راهنمای افزایش وزن سالم NHS <ArrowUpLeft size={15} />
                  </a>
                  <p>
                    یادآوری فقط هنگام باز بودن برنامه نمایش داده می‌شود. ارسال
                    پیامک یا اعلان پس‌زمینه فعال نیست.
                  </p>
                </section>
              </div>
            </div>
          )}
          <footer className="app-footer">
            <span>
              <Sprout size={15} /> جوانه؛ همراه قدم‌های کوچک تو
            </span>
            <span>با خودت مهربان باش.</span>
          </footer>
        </main>
      </div>
      {foodOpen && (
        <FoodDialog
          date={date}
          foods={allFoods}
          favorites={data.favorites}
          recent={data.entries}
          editing={editing}
          busy={busy}
          close={() => {
            setFoodOpen(false);
            setEditing(null);
          }}
          onSave={async (e) => {
            const ok = await mutate("entry", e, "غذا به دفترت اضافه شد");
            if (ok) {
              setFoodOpen(false);
              setEditing(null);
            }
          }}
          onFood={async (f) => {
            return await mutate("food", f, "غذای شخصی ذخیره شد");
          }}
          onFavorite={(foodId, enabled) =>
            mutate(
              "favorite",
              { foodId, enabled },
              enabled ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد",
            )
          }
        />
      )}
      {weightOpen && (
        <WeightDialog
          busy={busy}
          initial={currentWeight}
          close={() => setWeightOpen(false)}
          save={async (w) => {
            if (await mutate("weight", w, "وزنت ثبت شد")) setWeightOpen(false);
          }}
        />
      )}
      {saveMealOpen && (
        <Modal
          title="ذخیرهٔ یک وعدهٔ همیشگی"
          description="غذاهای این روز را به‌صورت یک مجموعه ذخیره کن تا دفعهٔ بعد راحت‌تر ثبت شوند."
          close={() => setSaveMealOpen(false)}
        >
          <form
            className="stack"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate(
                  "saveMeal",
                  { name: mealName.trim(), items: entries },
                  "مجموعه غذا ذخیره شد",
                )
              )
                setSaveMealOpen(false);
            }}
          >
            <Field label="نام مجموعه">
              <input
                autoFocus
                required
                maxLength={80}
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                placeholder="مثلاً صبحانهٔ همیشگی"
              />
            </Field>
            <p className="muted">
              {fa(entries.length)} غذا · {fa(calories)} کالری · وعده‌های ثبت‌شده
              حفظ می‌شوند.
            </p>
            <button
              className="primary full"
              disabled={busy || !mealName.trim()}
            >
              ذخیرهٔ مجموعه
            </button>
          </form>
        </Modal>
      )}
      {deleteOpen && (
        <Modal
          title="حذف حساب و اطلاعات"
          close={() => setDeleteOpen(false)}
          description="تمام غذاها، وزن‌ها و اطلاعات حسابت برای همیشه حذف می‌شوند. این کار قابل بازگشت نیست."
        >
          <Field label="برای تأیید، کلمهٔ «حذف» را بنویس">
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </Field>
          <div className="modal-actions">
            <button
              className="danger-button"
              disabled={confirmText !== "حذف" || busy}
              onClick={async () => {
                if (await mutate("deleteAccount", {}, "حساب حذف شد")) {
                  setUser(null);
                  setData(null);
                  setDeleteOpen(false);
                  setConfirmText("");
                }
              }}
            >
              حذف دائمی حساب
            </button>
            <button className="secondary" onClick={() => setDeleteOpen(false)}>
              انصراف
            </button>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Info size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label="بستن پیام"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function FoodDialog({
  date,
  foods,
  favorites,
  recent,
  editing,
  busy,
  close,
  onSave,
  onFood,
  onFavorite,
}: {
  date: string;
  foods: Food[];
  favorites: string[];
  recent: Entry[];
  editing: Entry | null;
  busy: boolean;
  close: () => void;
  onSave: (e: EntryInput & { id?: string }) => Promise<void>;
  onFood: (f: unknown) => Promise<boolean>;
  onFavorite: (id: string, enabled: boolean) => Promise<boolean>;
}) {
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState<"all" | "favorites" | "recent">("all"),
    [manual, setManual] = useState(false),
    [selected, setSelected] = useState<Food | null>(
      editing?.id
        ? {
            id: editing.foodId ?? "manual",
            name: editing.name,
            calories: editing.per100Calories,
            protein: editing.per100Protein,
            portionName: editing.portionName,
            portionGrams: editing.portionGrams,
            source: "مقادیر ذخیره‌شده در این ثبت",
          }
        : null,
    ),
    [meal, setMeal] = useState<(typeof meals)[number]>(
      editing?.meal ?? "میان‌وعده",
    ),
    [quantity, setQuantity] = useState(
      editing?.id ? String(editing.grams) : "1",
    ),
    [unit, setUnit] = useState<"portion" | "grams">(
      editing?.id ? "grams" : "portion",
    ),
    [error, setError] = useState("");
  const grams =
      Number(latin(quantity)) *
      (unit === "portion" ? (selected?.portionGrams ?? 1) : 1),
    calc = selected ? nutrients(selected, grams) : { calories: 0, protein: 0 };
  const ids = new Set(recent.map((e) => e.foodId));
  const list = foods.filter(
    (f) =>
      normalize(f.name).includes(normalize(search)) &&
      (filter === "all" ||
        (filter === "favorites" && favorites.includes(f.id)) ||
        (filter === "recent" && ids.has(f.id))),
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!selected || !Number.isFinite(grams) || grams < 1 || grams > 5000) {
      setError("مقدار باید بین ۱ تا ۵۰۰۰ گرم باشد.");
      return;
    }
    await onSave({
      ...(editing?.id ? { id: editing.id } : {}),
      date,
      meal,
      name: selected.name,
      foodId: selected.id === "manual" ? null : selected.id,
      grams,
      per100Calories: selected.calories,
      per100Protein: selected.protein,
      portionName: selected.portionName,
      portionGrams: selected.portionGrams,
      ...calc,
    });
  }
  return (
    <Modal
      title={editing?.id ? "ویرایش غذا" : "یک قدم خوشمزه به جلو"}
      description="غذایت را پیدا کن، مقدارش را بگو و به دفترت اضافه کن."
      close={close}
    >
      {!selected && !manual && (
        <>
          <div className="search-box">
            <Search size={20} />
            <input
              autoFocus
              aria-label="جستجوی غذا"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در غذاها؛ مثلاً نان سنگک"
            />
          </div>
          <div className="food-tabs">
            {(
              [
                ["all", "همهٔ غذاها"],
                ["favorites", "علاقه‌مندی‌ها"],
                ["recent", "اخیر"],
              ] as const
            ).map(([key, label]) => (
              <button
                className={filter === key ? "selected" : ""}
                key={key}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="food-results">
            {list.length ? (
              list.map((f) => (
                <div className="food-result" key={f.id}>
                  <button
                    className="food-select"
                    onClick={() => {
                      setSelected(f);
                      setQuantity("1");
                      setUnit("portion");
                    }}
                  >
                    <span className="food-result-icon">
                      <Utensils size={18} />
                    </span>
                    <span>
                      <strong>{f.name}</strong>
                      <small>
                        {fa(f.calories)} کالری در ۱۰۰ گرم{" "}
                        {f.custom ? "· غذای شخصی" : ""}
                      </small>
                    </span>
                    <Plus size={18} />
                  </button>
                  <button
                    className={`icon-button ${favorites.includes(f.id) ? "starred" : ""}`}
                    aria-label={`${favorites.includes(f.id) ? "حذف از" : "افزودن به"} علاقه‌مندی‌ها ${f.name}`}
                    disabled={busy}
                    onClick={() => onFavorite(f.id, !favorites.includes(f.id))}
                  >
                    <Star
                      size={18}
                      fill={favorites.includes(f.id) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-hint">
                غذایی پیدا نشد. می‌توانی غذای خودت را اضافه کنی.
              </div>
            )}
          </div>
          <button className="secondary full" onClick={() => setManual(true)}>
            <Plus size={17} /> غذای دلخواه من / ورود از برچسب
          </button>
          <p className="fineprint">
            مقادیر کاتالوگ تقریبی‌اند. وزن کردن غذا دقیق‌تر از واحدهای خانگی
            است.
          </p>
        </>
      )}
      {manual && !selected && (
        <CustomFood busy={busy} back={() => setManual(false)} save={onFood} />
      )}
      {selected && (
        <form className="stack" onSubmit={submit}>
          <div className="selected-food">
            <span className="mini-icon sage">
              <Utensils size={24} />
            </span>
            <div>
              <h3>{selected.name}</h3>
              <p>
                {fa(selected.calories)} کالری و {fa(selected.protein, 1)} گرم
                پروتئین در ۱۰۰ گرم
              </p>
            </div>
          </div>
          <p className="fineprint">{selected.source}</p>
          <div className="form-grid">
            <Field label="مقدار">
              <NumInput
                autoFocus
                value={quantity}
                onChange={setQuantity}
                required
              />
            </Field>
            <Field label="واحد">
              <select
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value as "grams" | "portion");
                  setQuantity(
                    e.target.value === "grams"
                      ? String(selected.portionGrams)
                      : "1",
                  );
                }}
              >
                <option value="portion">
                  {selected.portionName} (حدود {fa(selected.portionGrams)} گرم)
                </option>
                <option value="grams">گرم</option>
              </select>
            </Field>
          </div>
          <Field label="وعده">
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value as typeof meal)}
            >
              {meals.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <div className="nutrition-preview">
            <div>
              <small>انرژی</small>
              <strong>
                {Number.isFinite(calc.calories) ? fa(calc.calories) : "—"}{" "}
                <small>کالری</small>
              </strong>
            </div>
            <div>
              <small>پروتئین</small>
              <strong>
                {Number.isFinite(calc.protein) ? fa(calc.protein, 1) : "—"}{" "}
                <small>گرم</small>
              </strong>
            </div>
            <div>
              <small>وزن غذا</small>
              <strong>
                {Number.isFinite(grams) ? fa(grams, 1) : "—"} <small>گرم</small>
              </strong>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full" disabled={busy}>
            {busy ? <Spinner /> : <Plus size={18} />}{" "}
            {editing?.id ? "ذخیرهٔ تغییرات" : "افزودن به دفتر غذا"}
          </button>
          {!editing?.id && (
            <button
              type="button"
              className="text-button"
              onClick={() => setSelected(null)}
            >
              انتخاب غذای دیگر
            </button>
          )}
        </form>
      )}
    </Modal>
  );
}
function CustomFood({
  busy,
  back,
  save,
}: {
  busy: boolean;
  back: () => void;
  save: (f: unknown) => Promise<boolean>;
}) {
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = foodSchema.safeParse(raw);
    if (!parsed.success) {
      setError("کالری ۰–۹۰۰، پروتئین ۰–۱۰۰ و وزن واحد ۱–۲۰۰۰ گرم مجاز است.");
      return;
    }
    if (await save(parsed.data)) back();
  }
  return (
    <form className="stack" onSubmit={submit}>
      <div className="notice">
        مقادیر را از برچسب محصول یا منبع قابل‌اعتماد وارد کن. غذا فقط در حساب
        خودت ذخیره می‌شود.
      </div>
      <Field label="نام غذا">
        <input
          name="name"
          required
          maxLength={100}
          placeholder="مثلاً: شیرموز خانگی"
        />
      </Field>
      <div className="form-grid">
        <Field label="کالری در ۱۰۰ گرم">
          <input name="calories" inputMode="decimal" required />
        </Field>
        <Field label="پروتئین در ۱۰۰ گرم">
          <input name="protein" inputMode="decimal" required />
        </Field>
        <Field label="نام واحد">
          <input
            name="portionName"
            required
            maxLength={50}
            placeholder="مثلاً لیوان"
          />
        </Field>
        <Field label="وزن هر واحد (گرم)">
          <input name="portionGrams" inputMode="decimal" required />
        </Field>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy}>
        ذخیرهٔ غذای شخصی
      </button>
      <button type="button" className="text-button" onClick={back}>
        بازگشت به جستجو
      </button>
    </form>
  );
}
function WeightDialog({
  initial,
  busy,
  close,
  save,
}: {
  initial: number;
  busy: boolean;
  close: () => void;
  save: (w: { date: string; weight: number }) => Promise<void>;
}) {
  const [weight, setWeight] = useState(String(initial)),
    [date, setDate] = useState(today()),
    [error, setError] = useState("");
  return (
    <Modal
      title="یک نقطهٔ تازه در مسیرت"
      description="وزنت را ترجیحاً در ساعت و شرایط مشابه ثبت کن. ثبت دوباره در یک تاریخ، مقدار همان روز را اصلاح می‌کند."
      close={close}
    >
      <form
        className="stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const n = Number(latin(weight));
          if (
            !date ||
            date > today() ||
            !Number.isFinite(n) ||
            n < 25 ||
            n > 300
          ) {
            setError("تاریخ و وزن بین ۲۵ تا ۳۰۰ کیلوگرم را بررسی کن.");
            return;
          }
          await save({ date, weight: n });
        }}
      >
        <Field label="وزن (کیلوگرم)">
          <NumInput value={weight} onChange={setWeight} required autoFocus />
        </Field>
        <Field label="تاریخ">
          <input
            type="date"
            dir="ltr"
            value={date}
            max={today()}
            required
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="primary full" disabled={busy}>
          {busy ? <Spinner /> : <Check size={18} />} ثبت وزن
        </button>
      </form>
    </Modal>
  );
}
function WeightChart({ weights }: { weights: Weight[] }) {
  if (weights.length < 2)
    return (
      <div className="chart-empty">
        <TrendingUp size={44} />
        <h3>داستانت تازه شروع شده</h3>
        <p>با ثبت وزن در دو روز متفاوت، نمودار رشدت اینجا شکل می‌گیرد.</p>
      </div>
    );
  const data = weights.slice(-30),
    values = data.map((w) => w.weight),
    min = Math.floor(Math.min(...values) - 1),
    max = Math.ceil(Math.max(...values) + 1),
    start = Date.parse(data[0].date),
    end = Date.parse(data.at(-1)!.date),
    x = (i: number) =>
      60 + ((Date.parse(data[i].date) - start) / (end - start || 1)) * 800,
    y = (n: number) => 210 - ((n - min) / (max - min)) * 170;
  const points = data.map((w, i) => `${x(i)},${y(w.weight)}`).join(" "),
    average = data
      .map((_, i) => {
        const win = data.slice(Math.max(0, i - 6), i + 1);
        return `${x(i)},${y(win.reduce((n, w) => n + w.weight, 0) / win.length)}`;
      })
      .join(" ");
  return (
    <>
      <div className="chart-legend">
        <span>
          <i className="green-dot" /> وزن ثبت‌شده
        </span>
        <span>
          <i className="average-dot" /> میانگین متحرک
        </span>
      </div>
      <div className="chart">
        <svg
          viewBox="0 0 900 260"
          role="img"
          aria-label={`روند وزن از ${fa(data[0].weight, 1)} تا ${fa(data.at(-1)!.weight, 1)} کیلوگرم`}
        >
          <defs>
            <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f8262" stopOpacity=".2" />
              <stop offset="100%" stopColor="#4f8262" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => {
            const val = min + ((max - min) * i) / 4;
            return (
              <g key={i}>
                <line
                  x1="60"
                  x2="860"
                  y1={y(val)}
                  y2={y(val)}
                  stroke="#e9ede6"
                  strokeDasharray="4 5"
                />
                <text
                  x="35"
                  y={y(val) + 5}
                  fill="#8a9288"
                  fontSize="13"
                  textAnchor="middle"
                >
                  {fa(val, 1)}
                </text>
              </g>
            );
          })}
          <polygon
            points={`60,210 ${points} 860,210`}
            fill="url(#chart-fill)"
          />
          <polyline
            points={average}
            fill="none"
            stroke="#caa66a"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#4f8262"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {data.map((w, i) => (
            <circle key={w.id} cx={x(i)} cy={y(w.weight)} r="4" fill="#4f8262">
              <title>
                {dateLabel(w.date)}: {fa(w.weight, 1)} کیلوگرم
              </title>
            </circle>
          ))}
          <text x="60" y="247" textAnchor="start" fill="#8a9288" fontSize="13">
            {dateLabel(data[0].date, { month: "short", day: "numeric" })}
          </text>
          <text x="860" y="247" textAnchor="end" fill="#8a9288" fontSize="13">
            {dateLabel(data.at(-1)!.date, { month: "short", day: "numeric" })}
          </text>
        </svg>
      </div>
    </>
  );
}
