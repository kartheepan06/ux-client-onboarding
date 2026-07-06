"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

/* ─── Types ───────────────────────────────────────────────────── */
type FieldErrors = {
  name?: string;
  email?: string;
  project_type?: string;
};

type SubmittedData = {
  projectName: string;
  projectType: string;
  timeline: string;
  features: string[];
};

/* ─── Constants ───────────────────────────────────────────────── */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FEATURE_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Core Features",
    items: ["Login / Signup", "User Profiles", "Dashboard", "Search"],
  },
  {
    title: "Business Features",
    items: ["Payments", "Booking System", "Analytics", "Admin Panel"],
  },
  {
    title: "Communication",
    items: ["Chat", "Notifications", "Email Updates"],
  },
  {
    title: "Advanced",
    items: ["AI Features", "Multi-language", "Dark Mode", "API Integrations"],
  },
];

const ALL_FEATURES = FEATURE_GROUPS.flatMap((g) => g.items);

// Each style chip has its own color identity.
// from/to = gradient stops. hover = border+text hint. glow = box-shadow alpha.
const STYLE_CHIPS: {
  label: string;
  from: string;
  to: string;
  hoverBorder: string;
  hoverText: string;
  hoverBg: string;
  glow: string;
}[] = [
  {
    label: "Minimal",
    from: "#64748B", to: "#94A3B8",
    hoverBorder: "#64748B", hoverText: "#334155", hoverBg: "rgba(100,116,139,0.08)",
    glow: "rgba(100,116,139,0.30)",
  },
  {
    label: "Modern",
    from: "#2563EB", to: "#06B6D4",
    hoverBorder: "#2563EB", hoverText: "#1D4ED8", hoverBg: "rgba(37,99,235,0.07)",
    glow: "rgba(37,99,235,0.35)",
  },
  {
    label: "Premium",
    from: "#D97706", to: "#F59E0B",
    hoverBorder: "#D97706", hoverText: "#B45309", hoverBg: "rgba(217,119,6,0.08)",
    glow: "rgba(217,119,6,0.32)",
  },
  {
    label: "Playful",
    from: "#EC4899", to: "#A855F7",
    hoverBorder: "#EC4899", hoverText: "#DB2777", hoverBg: "rgba(236,72,153,0.08)",
    glow: "rgba(236,72,153,0.32)",
  },
  {
    label: "Bold",
    from: "#EF4444", to: "#F97316",
    hoverBorder: "#EF4444", hoverText: "#DC2626", hoverBg: "rgba(239,68,68,0.08)",
    glow: "rgba(239,68,68,0.30)",
  },
  {
    label: "Corporate",
    from: "#0369A1", to: "#0284C7",
    hoverBorder: "#0369A1", hoverText: "#075985", hoverBg: "rgba(3,105,161,0.08)",
    glow: "rgba(3,105,161,0.30)",
  },
  {
    label: "Luxury",
    from: "#7C3AED", to: "#4F46E5",
    hoverBorder: "#7C3AED", hoverText: "#6D28D9", hoverBg: "rgba(124,58,237,0.08)",
    glow: "rgba(124,58,237,0.32)",
  },
  {
    label: "Dark",
    from: "#1E293B", to: "#334155",
    hoverBorder: "#475569", hoverText: "#1E293B", hoverBg: "rgba(30,41,59,0.08)",
    glow: "rgba(30,41,59,0.40)",
  },
  {
    label: "Vibrant",
    from: "#10B981", to: "#06B6D4",
    hoverBorder: "#10B981", hoverText: "#059669", hoverBg: "rgba(16,185,129,0.08)",
    glow: "rgba(16,185,129,0.30)",
  },
];

const CONTACT_OPTIONS = ["Email", "WhatsApp", "Phone Call", "Video Call"];

const SECTIONS = [
  "Personal Info",
  "Project Details",
  "Target Audience",
  "Key Features",
  "Design Preferences",
  "Budget & Contact",
];

const SECTION_IDS = [
  "section-personal",
  "section-project",
  "section-audience",
  "section-features",
  "section-design",
  "section-budget",
];

/* ─── Component ───────────────────────────────────────────────── */
export default function ClientOnboarding() {
  /* theme */
  const [darkMode, setDarkMode] = useState(false);

  /* form state */
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* required field state */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");

  /* features */
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  /* style chips */
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  /* contact method */
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  /* progress */
  const [activeSection, setActiveSection] = useState(0);

  /* scroll */
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* submitted data for success screen */
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  /* ── Companion ────────────────────── */
  const [companionMsg, setCompanionMsg] = useState<string | null>(null);
  const [companionCelebrate, setCompanionCelebrate] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [blinkState, setBlinkState] = useState(false);
  const submitRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const companionRef = useRef<HTMLDivElement>(null);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  // Section messages keyed to activeSection index
  const SECTION_MESSAGES = useMemo(
    () => [
      "Let's start with the basics.",
      "Tell me what you're building.",
      "Who are we designing for?",
      "Let's map out the essentials.",
      "This is where the fun begins.",
      "Last stretch — almost done!",
    ],
    []
  );

  const CELEBRATE_MESSAGES = ["Nice work!", "Looking great!", "Almost there!"];

  // Show section message when activeSection changes
  useEffect(() => {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setCompanionMsg(SECTION_MESSAGES[activeSection] ?? null);
    msgTimer.current = setTimeout(() => setCompanionMsg(null), 3500);
    return () => { if (msgTimer.current) clearTimeout(msgTimer.current); };
  }, [activeSection, SECTION_MESSAGES]);

  // Subtle cursor-aware eye movement (clamped to ±4px)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (prefersReducedMotion.current || !companionRef.current) return;
    const rect = companionRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const strength = Math.min(dist / 300, 1);
    setEyeOffset({
      x: (dx / dist) * strength * 4,
      y: (dy / dist) * strength * 4,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Random blink every 3–6 seconds
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => setBlinkState(false), 150);
        blinkTimerRef.current = scheduleBlink();
      }, delay);
    };
    const blinkTimerRef = { current: scheduleBlink() };
    return () => clearTimeout(blinkTimerRef.current);
  }, []);

  // Trigger celebration on section advance
  const prevSection = useRef(activeSection);
  useEffect(() => {
    if (activeSection > prevSection.current) {
      const msg =
        CELEBRATE_MESSAGES[
          Math.floor(Math.random() * CELEBRATE_MESSAGES.length)
        ];
      setCompanionCelebrate(true);
      setCompanionMsg(msg);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => {
        setCompanionCelebrate(false);
        setCompanionMsg(null);
      }, 2500);
    }
    prevSection.current = activeSection;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  /* ── Scroll + progress tracking ───── */
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      const offsets = sectionRefs.current.map((el) =>
        el ? el.getBoundingClientRect().top : Infinity
      );
      const idx = offsets.reduce(
        (best, top, i) =>
          top <= window.innerHeight * 0.5 && top > -window.innerHeight
            ? i
            : best,
        0
      );
      setActiveSection(idx);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Helpers ───────────────────────── */
  const toggleFeature = (item: string) =>
    setSelectedFeatures((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );

  const toggleStyle = (s: string) =>
    setSelectedStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const toggleContact = (c: string) =>
    setSelectedContacts((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToSubmit = () =>
    submitRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  /* ── Change handlers with live error clearing ─ */
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setName(v);
    if (v.trim() && fieldErrors.name)
      setFieldErrors((p) => { const n = { ...p }; delete n.name; return n; });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEmail(v);
    if (EMAIL_PATTERN.test(v.trim()) && fieldErrors.email)
      setFieldErrors((p) => { const n = { ...p }; delete n.email; return n; });
  };

  const handleProjectTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setProjectType(v);
    if (v && fieldErrors.project_type)
      setFieldErrors((p) => { const n = { ...p }; delete n.project_type; return n; });
  };

  /* ── Submit ───────────────────────── */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "* Name is required";
    if (!email.trim()) nextErrors.email = "* Email is required";
    else if (!EMAIL_PATTERN.test(email.trim()))
      nextErrors.email = "* Please enter a valid email address";
    if (!projectType) nextErrors.project_type = "* Please select a project type";

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("https://formspree.io/f/mqeoarnb", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmittedData({
          projectName: (data.get("project_name") as string) || "",
          projectType,
          timeline: (data.get("timeline") as string) || "",
          features: selectedFeatures,
        });
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Design tokens ────────────────── */
  const pageClass = darkMode ? "bg-[#0d0d0f] text-white" : "bg-[#f4f5f7] text-[#0B3558]";

  // Card: more padding, softer border, refined shadow
  const cardClass = darkMode
    ? "bg-[#18181b] border border-zinc-800/60 rounded-[20px] p-8 md:p-14 shadow-[0_1px_2px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(0,0,0,0.60)]"
    : "bg-white border border-zinc-200/50 rounded-[20px] p-8 md:p-14 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_16px_48px_-20px_rgba(0,0,0,0.10)] transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.11),0_1px_4px_rgba(0,0,0,0.04)]";

  // Inputs: 56px height, 10px radius (Calendly-style), generous padding, premium focus ring
  const inputBase = darkMode
    ? "w-full rounded-[10px] border bg-[#0d0d0f] px-5 py-[15px] text-base text-zinc-200 placeholder:text-zinc-600 transition-all duration-200 focus:outline-none focus:ring-[3px]"
    : "w-full rounded-[10px] border bg-white px-5 py-[15px] text-base text-[#1E3A5F] placeholder:text-[#94A3B8] transition-all duration-200 focus:outline-none focus:ring-[3px]";

  const inputBorder = darkMode
    ? "border-zinc-500 hover:border-zinc-400 focus:border-[#1A73E8] focus:ring-[#1A73E8]/18"
    : "border-[#BABABA] hover:border-[#888888] focus:border-[#1A73E8] focus:ring-[#1A73E8]/12";

  const inputErrorBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/15";
  const inputClass = `${inputBase} ${inputBorder}`;

  // Labels: 13.5px, medium, zinc-600, tighter spacing
  const labelClass = darkMode
    ? "block text-[13.5px] font-medium text-zinc-400 mb-1.5 leading-5"
    : "block text-[13.5px] font-medium text-[#1E3A5F] mb-1.5 leading-5";

  const helperClass = darkMode ? "text-zinc-500" : "text-[#64748B]";
  const errorTextClass = darkMode ? "mt-2 text-xs font-medium text-red-400" : "mt-2 text-xs font-medium text-red-500";

  // Deep navy headings (Calendly: rgb(11, 53, 88)) + softer section titles
  const sectionTitleClass = darkMode
    ? "text-[22px] md:text-[28px] font-bold tracking-[-0.3px] leading-snug text-white"
    : "text-[22px] md:text-[28px] font-bold tracking-[-0.3px] leading-snug text-[#0B3558]";

  // Checkbox rows: premium hover with blue accent
  const checkboxLabelClass = darkMode
    ? "flex items-center gap-3.5 border border-zinc-500 rounded-xl px-4 py-4 text-sm text-zinc-300 cursor-pointer transition-all duration-200 hover:border-[#1A73E8]/50 hover:bg-[#1A73E8]/[0.06] hover:-translate-y-px hover:shadow-sm"
    : "flex items-center gap-3.5 border border-[#BABABA] rounded-xl px-4 py-4 text-sm text-zinc-700 cursor-pointer transition-all duration-200 hover:border-[#1A73E8]/50 hover:bg-[#1A73E8]/[0.025] hover:-translate-y-px hover:shadow-sm";

  // ── Shared chip base
  const chipBase = "inline-flex items-center gap-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/35 focus:ring-offset-1";

  const featureChipClass = (active: boolean) => {
    if (active) {
      return darkMode
        ? `${chipBase} px-3.5 py-1.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white border border-white/20 shadow-[0_2px_12px_rgba(37,99,235,0.45)]`
        : `${chipBase} px-3.5 py-1.5 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white border border-transparent shadow-[0_2px_12px_rgba(37,99,235,0.28)]`;
    }
    return darkMode
      ? `${chipBase} px-3.5 py-1.5 border border-zinc-700 text-zinc-400 bg-transparent hover:border-[#7C3AED]/55 hover:bg-[#2563EB]/10 hover:text-[#93b4fd] hover:scale-[1.02] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(37,99,235,0.18)]`
      : `${chipBase} px-3.5 py-1.5 border border-zinc-200 text-zinc-500 bg-white hover:border-[#2563EB]/45 hover:bg-[#2563EB]/[0.04] hover:text-[#2563EB] hover:scale-[1.02] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(37,99,235,0.10)]`;
  };

  const selectedChipClass = darkMode
    ? `${chipBase} pl-3 pr-2 py-1.5 border border-[#7C3AED]/45 bg-gradient-to-r from-[#2563EB]/22 to-[#7C3AED]/22 text-[#93b4fd] hover:from-[#2563EB]/32 hover:to-[#7C3AED]/32 hover:-translate-y-px`
    : `${chipBase} pl-3 pr-2 py-1.5 border border-[#2563EB]/28 bg-gradient-to-r from-[#2563EB]/[0.06] to-[#7C3AED]/[0.06] text-[#2563EB] hover:from-[#2563EB]/[0.10] hover:to-[#7C3AED]/[0.10] hover:-translate-y-px`;

  const contactPillClass = (active: boolean) => {
    if (active) {
      return darkMode
        ? `${chipBase} px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white border border-white/20 shadow-[0_2px_12px_rgba(37,99,235,0.40)] scale-[1.02]`
        : `${chipBase} px-4 py-2 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white border border-transparent shadow-[0_2px_12px_rgba(37,99,235,0.26)] scale-[1.02]`;
    }
    return darkMode
      ? `${chipBase} px-4 py-2 border border-zinc-700 text-zinc-400 bg-transparent hover:border-[#7C3AED]/55 hover:bg-[#2563EB]/10 hover:text-[#93b4fd] hover:scale-[1.02] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(37,99,235,0.18)]`
      : `${chipBase} px-4 py-2 border border-zinc-200 text-zinc-500 bg-white hover:border-[#2563EB]/45 hover:bg-[#2563EB]/[0.04] hover:text-[#2563EB] hover:scale-[1.02] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(37,99,235,0.10)]`;
  };

  // CTA: taller, wider, premium presence
  const buttonClass =
    "inline-flex items-center justify-center w-full sm:w-auto px-10 py-[15px] text-[15px] font-semibold rounded-[10px] transition-all duration-200 bg-[#1A73E8] text-white shadow-[0_2px_8px_rgba(26,115,232,0.28)] hover:bg-[#1967D2] hover:shadow-[0_4px_16px_rgba(26,115,232,0.38)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#1A73E8]/28 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm";

  const fabClass =
    "flex h-12 w-12 items-center justify-center rounded-full bg-[#1A73E8] text-white text-xl leading-none shadow-lg transition-all duration-200 hover:bg-[#1967D2] hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#1A73E8]/30";

  const themeToggle = (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle color theme"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
        darkMode
          ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
          : "border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm"
      }`}
    >
      {darkMode ? "☀️ Light" : "🌙 Dark"}
    </button>
  );

  /* ── Chevron SVG ──────────────────── */
  const chevron = (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  /* ── Section header helper ────────── */
  const SectionHeader = ({
    title,
    subtitle,
    icon: _icon,
    illustration,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    illustration: React.ReactNode;
  }) => (
    <div className="mb-10">
      <div className="mb-5">{illustration}</div>
      <h2 className={sectionTitleClass}>{title}</h2>
      <p className={`mt-2 text-[14px] leading-6 ${helperClass}`}>{subtitle}</p>
    </div>
  );

  /* ══════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════ */
  if (submitted && submittedData) {
    const steps = [
      "We'll review your submission carefully.",
      "We'll prepare initial recommendations for your project.",
      "We'll contact you within 24–48 hours.",
    ];

    return (
      <div className={`min-h-screen ${pageClass}`}>
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-24">
          <div className="flex justify-end mb-14">{themeToggle}</div>

          <div className="max-w-2xl mx-auto">
            <div className={cardClass}>
              {/* Companion celebration on success */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative h-20 w-20 mb-3" aria-hidden="true">
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_4px_16px_rgba(26,115,232,0.35)]">
                    <defs>
                      <radialGradient id="bodyGradS" cx="42%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#6ea8fe"/>
                        <stop offset="100%" stopColor="#1A73E8"/>
                      </radialGradient>
                      <radialGradient id="cheekGradS" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ff9eb5" stopOpacity="0.7"/>
                        <stop offset="100%" stopColor="#ff9eb5" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                    <ellipse cx="28" cy="31" rx="19" ry="20" fill="url(#bodyGradS)"/>
                    <ellipse cx="22" cy="22" rx="7" ry="5" fill="white" fillOpacity="0.18" transform="rotate(-20 22 22)"/>
                    <ellipse cx="16" cy="34" rx="5" ry="3.5" fill="url(#cheekGradS)"/>
                    <ellipse cx="40" cy="34" rx="5" ry="3.5" fill="url(#cheekGradS)"/>
                    <ellipse cx="22" cy="28" rx="4.5" ry="4.5" fill="white"/>
                    <ellipse cx="22" cy="28" rx="2.2" ry="2.2" fill="#1a1a3a"/>
                    <ellipse cx="23.2" cy="26.8" rx="0.9" ry="0.9" fill="white" fillOpacity="0.9"/>
                    <ellipse cx="34" cy="28" rx="4.5" ry="4.5" fill="white"/>
                    <ellipse cx="34" cy="28" rx="2.2" ry="2.2" fill="#1a1a3a"/>
                    <ellipse cx="35.2" cy="26.8" rx="0.9" ry="0.9" fill="white" fillOpacity="0.9"/>
                    <path d="M22 37 Q28 43 34 37" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeOpacity="0.9"/>
                    <ellipse cx="9" cy="30" rx="3.5" ry="3" fill="#6ea8fe"/>
                    <ellipse cx="47" cy="30" rx="3.5" ry="3" fill="#6ea8fe"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-[#1A73E8]">
                  🎉 Project brief received!
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
                Thanks! We&apos;ve received your project brief.
              </h1>

              {/* next steps */}
              <div className="mt-10">
                <p className={`text-[11px] leading-5 font-semibold uppercase tracking-widest mb-4 ${helperClass}`}>
                  What happens next
                </p>
                <ol className="space-y-3">
                  {steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        darkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-600"
                      }`}>
                        {i + 1}
                      </span>
                      <span className={`text-sm leading-relaxed ${helperClass}`}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* submission summary */}
              <div className={`mt-10 rounded-2xl p-6 ${darkMode ? "bg-zinc-800/60" : "bg-zinc-50"}`}>
                <p className={`text-[11px] leading-5 font-semibold uppercase tracking-widest mb-4 ${helperClass}`}>
                  Your submission summary
                </p>
                <dl className="space-y-3">
                  {submittedData.projectName && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className={helperClass}>Project</dt>
                      <dd className="font-medium text-right">{submittedData.projectName}</dd>
                    </div>
                  )}
                  {submittedData.projectType && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className={helperClass}>Type</dt>
                      <dd className="font-medium text-right">{submittedData.projectType}</dd>
                    </div>
                  )}
                  {submittedData.timeline && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className={helperClass}>Timeline</dt>
                      <dd className="font-medium text-right">{submittedData.timeline}</dd>
                    </div>
                  )}
                  {submittedData.features.length > 0 && (
                    <div className="flex justify-between gap-4 text-sm">
                      <dt className={`${helperClass} shrink-0`}>Features</dt>
                      <dd className="font-medium text-right">
                        {submittedData.features.join(", ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════
     MAIN FORM
  ══════════════════════════════════ */
  const progressPct = Math.round(((activeSection + 1) / SECTIONS.length) * 100);

  return (
    <div className={`min-h-screen ${pageClass}`}>
      {/* ── Sticky progress bar ────────── */}
      <div className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        darkMode ? "bg-zinc-950/85 border-zinc-800" : "bg-white/85 border-zinc-100"
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs leading-5 font-semibold ${darkMode ? "text-zinc-300" : "text-zinc-700"}`}>
                Step {activeSection + 1} of {SECTIONS.length}
              </span>
              <span className={`text-xs leading-5 ${helperClass}`}>
                — {SECTIONS[activeSection]}
              </span>
              {companionCelebrate && (
                <span className="text-xs font-medium text-[#1A73E8] animate-[fadeSlideUp_0.25s_ease-out]">
                  ✓ {companionMsg}
                </span>
              )}
            </div>
            <span className={`text-xs leading-5 font-semibold tabular-nums ${
              progressPct === 100 ? "text-[#1A73E8]" : helperClass
            }`}>
              {progressPct}%
            </span>
          </div>
          <div className={`h-[3px] w-full rounded-full overflow-hidden ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #1A73E8 0%, #6ea8fe 100%)",
                boxShadow: progressPct > 0 ? "0 0 8px rgba(26,115,232,0.45)" : "none",
              }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 md:py-24">

        {/* ── Branding header ────────────── */}
        <div className="flex justify-between items-start gap-4 mb-16">
          <div>
            <p className="text-[15px] font-semibold tracking-tight">Kartheepan</p>
            <p className="mt-1 text-[13px] tracking-wide text-zinc-500">
              UX/UI Designer • Product Design • User Experience
            </p>
          </div>
          {themeToggle}
        </div>

        {/* ── Hero ───────────────────────── */}
        <div className="mb-12 max-w-[760px]">
          <h1 className={`text-[48px] md:text-[68px] font-bold tracking-[-1.5px] leading-[0.97] ${
            darkMode ? "text-white" : "text-[#0B3558]"
          }`}>
            Let&apos;s build something meaningful.
          </h1>
          <p className={`mt-7 text-[16px] md:text-[17px] leading-[1.75] max-w-[620px] ${
            darkMode ? "text-zinc-400" : "text-[#4A5568]"
          }`}>
            Share your goals, vision, and project requirements. This onboarding
            portal helps create a structured discovery process before design begins.
          </p>

          {/* required notice */}
          <p className={`mt-5 text-sm leading-6 ${helperClass}`}>
            Fields marked with <span className="font-semibold text-zinc-700 dark:text-zinc-300">*</span> are required.
            Most questions are optional — the more detail you share, the better we can understand your project.
          </p>

          {/* time estimate */}
          <div className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium border ${
            darkMode ? "border-zinc-800 bg-[#18181b] text-zinc-400" : "border-zinc-200 bg-white text-zinc-500 shadow-sm"
          }`}>
            <span>⏱</span>
            <span>Takes approximately 5 minutes to complete</span>
          </div>
        </div>

        {/* ── Form ───────────────────────── */}
        <form
          action="https://formspree.io/f/mqeoarnb"
          method="POST"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-12"
        >

          {/* ══ 1. Personal Information ══ */}
          <section
            id={SECTION_IDS[0]}
            ref={(el) => { sectionRefs.current[0] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Personal Information"
              subtitle="Tell me who you are and the best way to contact you."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="12" width="56" height="40" rx="6" stroke="#CBD5E1" strokeWidth="2"/>
                  <circle cx="36" cy="28" r="8" stroke="#1A73E8" strokeWidth="2"/>
                  <path d="M18 52c0-9.941 8.059-16 18-16s18 6.059 18 16" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="20" y="8" width="32" height="6" rx="3" fill="#E2E8F0"/>
                  <circle cx="60" cy="14" r="8" fill="white" stroke="#CBD5E1" strokeWidth="1.5"/>
                  <path d="M57 14l2 2 4-4" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="7" r="3.5" fill="#1A73E8"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#1A73E8" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              }
            />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={labelClass}>Full Name *</label>
                <input
                  id="name" name="name" required autoComplete="name"
                  value={name} onChange={handleNameChange}
                  aria-invalid={fieldErrors.name ? true : undefined}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`${inputBase} ${fieldErrors.name ? inputErrorBorder : inputBorder}`}
                  placeholder="John Doe"
                />
                {fieldErrors.name && <p id="name-error" className={errorTextClass}>{fieldErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Email Address *</label>
                <input
                  id="email" name="email" type="email" required autoComplete="email"
                  value={email} onChange={handleEmailChange}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                  className={`${inputBase} ${fieldErrors.email ? inputErrorBorder : inputBorder}`}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && <p id="email-error" className={errorTextClass}>{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>Company / Brand</label>
                <input id="company" name="company" autoComplete="organization" className={inputClass} placeholder="Acme Studio" />
              </div>

              <div>
                <label htmlFor="website" className={labelClass}>Website / Portfolio</label>
                <input id="website" name="website" type="url" autoComplete="url" className={inputClass} placeholder="https://example.com" />
              </div>
            </div>
          </section>

          {/* ══ 2. Project Details ══ */}
          <section
            id={SECTION_IDS[1]}
            ref={(el) => { sectionRefs.current[1] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Project Details"
              subtitle="Help me understand what you're building and your timeline."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="18" width="52" height="38" rx="5" stroke="#CBD5E1" strokeWidth="2"/>
                  <path d="M36 6L36 22M28 10L36 6L44 10" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="36" cy="6" r="4" fill="#7C3AED"/>
                  <rect x="18" y="30" width="16" height="3" rx="1.5" fill="#E2E8F0"/>
                  <rect x="18" y="38" width="24" height="3" rx="1.5" fill="#E2E8F0"/>
                  <rect x="18" y="46" width="20" height="3" rx="1.5" fill="#E2E8F0"/>
                  <circle cx="56" cy="26" r="8" fill="white" stroke="#7C3AED" strokeWidth="1.5"/>
                  <path d="M53 26l2 2 4-4" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 2C10 2 6 6 6 11h8c0-5-4-9-4-9z" fill="#7C3AED"/>
                  <rect x="7.5" y="11" width="5" height="3" rx="1" fill="#7C3AED"/>
                  <path d="M7.5 14l-1.5 3M12.5 14l1.5 3" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="10" cy="8.5" r="1.2" fill="white"/>
                </svg>
              }
            />

            {/* Row 1: Project Name + Project Type */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="project_name" className={labelClass}>Project Name *</label>
                <input
                  id="project_name" name="project_name" required
                  className={inputClass}
                  placeholder="e.g. Marketing site redesign"
                />
              </div>

              <div>
                <label htmlFor="project_type" className={labelClass}>Project Type *</label>
                <div className="relative">
                  <select
                    id="project_type" name="project_type"
                    value={projectType} onChange={handleProjectTypeChange}
                    aria-invalid={fieldErrors.project_type ? true : undefined}
                    aria-describedby={fieldErrors.project_type ? "project_type-error" : undefined}
                    className={`${inputBase} ${fieldErrors.project_type ? inputErrorBorder : inputBorder} appearance-none pr-12 cursor-pointer`}
                  >
                    <option value="">Select Project Type</option>
                    <option value="Website">Website</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="SaaS Dashboard">SaaS Dashboard</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Internal Tool">Internal Tool</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 ${helperClass}`} aria-hidden="true">
                    {chevron}
                  </span>
                </div>
                {fieldErrors.project_type && (
                  <p id="project_type-error" className={errorTextClass}>{fieldErrors.project_type}</p>
                )}
              </div>
            </div>

            {/* Row 2: Timeline */}
            <div className="mb-6">
              <label htmlFor="timeline" className={labelClass}>Expected Timeline</label>
              <input
                id="timeline" name="timeline" className={inputClass}
                placeholder="e.g. 4–6 weeks, by September 2026, flexible"
              />
            </div>

            {/* Row 3: Description + Goals */}
            <div className="space-y-5">
              <div>
                <label htmlFor="project_description" className={labelClass}>Project Description</label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>Tell us what you&apos;re building.</p>
                <textarea
                  id="project_description" name="project_description" rows={4}
                  className={inputClass}
                  placeholder="Describe what you want to build — the product, platform, or experience you have in mind."
                />
              </div>

              <div>
                <label htmlFor="project_goals" className={labelClass}>Project Goals</label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                  What outcome are you hoping to achieve? e.g. Increase sales, Get more signups, Improve usability, Launch MVP
                </p>
                <textarea
                  id="project_goals" name="project_goals" rows={4}
                  className={inputClass}
                  placeholder="What does success look like for this project?"
                />
              </div>
            </div>
          </section>

          {/* ══ 3. Target Audience ══ */}
          <section
            id={SECTION_IDS[2]}
            ref={(el) => { sectionRefs.current[2] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Target Audience"
              subtitle="Tell me who this product is designed for."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="28" cy="24" r="10" stroke="#10B981" strokeWidth="2"/>
                  <circle cx="48" cy="22" r="8" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2"/>
                  <path d="M8 52c0-11 9-18 20-18s20 7 20 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M48 30c6 1 12 6 12 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"/>
                  <circle cx="28" cy="24" r="4" fill="#10B981" fillOpacity="0.2"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7.5" cy="7" r="2.8" fill="#10B981"/>
                  <circle cx="13.5" cy="7" r="2.2" fill="#10B981" fillOpacity="0.6"/>
                  <path d="M1.5 16.5c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M13.5 11.5c1.8.4 3.5 1.9 3.5 4" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.7"/>
                </svg>
              }
            />
            <div className="space-y-5">
              <div>
                <label htmlFor="target_audience" className={labelClass}>Who are your users?</label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                  Be as specific as possible — age, role, context of use, technical ability.
                </p>
                <textarea
                  id="target_audience" name="target_audience" rows={4}
                  className={inputClass}
                  placeholder="e.g. Small business owners who book appointments online"
                />
              </div>

              <div>
                <label htmlFor="user_problems" className={labelClass}>What problems are they facing?</label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                  Describe the pain points your product will solve.
                </p>
                <textarea
                  id="user_problems" name="user_problems" rows={4}
                  className={inputClass}
                  placeholder="What problems are your users experiencing today?"
                />
              </div>
            </div>
          </section>

          {/* ══ 4. Key Features Needed ══ */}
          <section
            id={SECTION_IDS[3]}
            ref={(el) => { sectionRefs.current[3] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Key Features Needed"
              subtitle="Select the features you need. Add anything custom below."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="10" width="56" height="44" rx="6" stroke="#CBD5E1" strokeWidth="2"/>
                  <path d="M36 4L42 16L36 28L30 16Z" fill="#F59E0B"/>
                  <rect x="18" y="28" width="10" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.8"/>
                  <rect x="33" y="28" width="10" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.8"/>
                  <rect x="48" y="28" width="10" height="10" rx="2" stroke="#CBD5E1" strokeWidth="1.8"/>
                  <rect x="18" y="42" width="10" height="5" rx="1" fill="#FDE68A"/>
                  <rect x="33" y="42" width="10" height="5" rx="1" fill="#FDE68A"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 2L4 11h6.5L9 18l7-9h-6.5L11 2z" fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5" strokeLinejoin="round"/>
                </svg>
              }
            />

            {/* DESKTOP: grouped 2-col grid with category labels */}
            <div className="hidden md:block space-y-7">
              {FEATURE_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className={`text-[11px] leading-5 font-semibold uppercase tracking-widest mb-3 ${helperClass}`}>
                    {group.title}
                  </p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {group.items.map((item) => (
                      <label key={item} className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(item)}
                          onChange={() => toggleFeature(item)}
                          className="h-4 w-4"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* MOBILE: collapsible accordion */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setFeaturesOpen((o) => !o)}
                aria-expanded={featuresOpen}
                aria-controls="features-accordion"
                className={`flex w-full items-center justify-between text-left ${inputClass}`}
              >
                <span className={featuresOpen ? "" : helperClass}>
                  {featuresOpen
                    ? "Choose Features"
                    : `${selectedFeatures.length} feature${selectedFeatures.length === 1 ? "" : "s"} selected`}
                </span>
                <span className={`shrink-0 transition-transform duration-200 ${featuresOpen ? "rotate-180" : ""} ${helperClass}`}>
                  {chevron}
                </span>
              </button>

              <div
                id="features-accordion"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  featuresOpen ? "max-h-[3000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                }`}
              >
                {FEATURE_GROUPS.map((group) => (
                  <div key={group.title} className="mb-5">
                    <p className={`mb-2 text-xs font-semibold uppercase tracking-widest ${helperClass}`}>
                      {group.title}
                    </p>
                    <div className="grid gap-3">
                      {group.items.map((item) => (
                        <label key={item} className={checkboxLabelClass}>
                          <input
                            type="checkbox"
                            checked={selectedFeatures.includes(item)}
                            onChange={() => toggleFeature(item)}
                            className="h-4 w-4"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected chips */}
            {selectedFeatures.length > 0 && (
              <div className="mt-5">
                <p className={`text-[13px] leading-5 font-medium mb-2 ${helperClass}`}>
                  {selectedFeatures.length} feature{selectedFeatures.length === 1 ? "" : "s"} selected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFeatures.map((item) => (
                    <button
                      key={item} type="button"
                      onClick={() => toggleFeature(item)}
                      aria-label={`Remove ${item}`}
                      className={selectedChipClass}
                    >
                      {item}
                      <span aria-hidden="true" className="text-base leading-none">×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hidden submit inputs — single source, no duplicates */}
            {selectedFeatures.map((item) => (
              <input key={item} type="hidden" name="features" value={item} />
            ))}

            <div className="mt-6">
              <label htmlFor="other_features" className={labelClass}>
                Anything else not listed above?
              </label>
              <textarea
                id="other_features" name="other_features" rows={3}
                className={inputClass}
                placeholder="Describe any custom requirements or features unique to your project."
              />
            </div>
          </section>

          {/* ══ 5. Design Preferences ══ */}
          <section
            id={SECTION_IDS[4]}
            ref={(el) => { sectionRefs.current[4] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Design Preferences"
              subtitle="Share references and visual examples you admire."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="36" cy="32" r="22" stroke="#CBD5E1" strokeWidth="2"/>
                  <circle cx="26" cy="26" r="6" stroke="#EC4899" strokeWidth="2"/>
                  <circle cx="46" cy="26" r="6" stroke="#F472B6" strokeWidth="2"/>
                  <circle cx="36" cy="42" r="6" stroke="#EC4899" strokeWidth="2"/>
                  <path d="M30 30Q36 20 42 30" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="58" cy="12" r="7" fill="white" stroke="#EC4899" strokeWidth="1.5"/>
                  <path d="M55 12Q58 8 61 12" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7.5" stroke="#EC4899" strokeWidth="1.8"/>
                  <circle cx="7" cy="9" r="1.5" fill="#EC4899"/>
                  <circle cx="13" cy="9" r="1.5" fill="#EC4899"/>
                  <circle cx="10" cy="6.5" r="1.5" fill="#F472B6"/>
                  <path d="M7 13c0-1.657 1.343-3 3-3s3 1.343 3 3" fill="#EC4899"/>
                </svg>
              }
            />

            <div className="space-y-7">
              {/* References */}
              <div>
                <label htmlFor="references" className={labelClass}>
                  Apps or Websites You Admire
                </label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                  Tell us what you like about them — Navigation, Simplicity, Layout, Visual Style, Animations.
                </p>
                <textarea
                  id="references" name="references" rows={3}
                  className={inputClass}
                  placeholder="e.g. I love Notion's simplicity, Linear's dark aesthetic, and Stripe's clean layout."
                />
              </div>

              {/* Reference links */}
              <div>
                <label htmlFor="reference_links" className={labelClass}>
                  Paste URLs Here
                </label>
                <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                  Share links to Google Drive, Figma, Dropbox, Behance, Dribbble, Pinterest, or any relevant files.
                </p>
                <textarea
                  id="reference_links" name="reference_links" rows={3}
                  className={inputClass}
                  placeholder="https://figma.com/... or https://drive.google.com/..."
                />
              </div>

              {/* Visual style chips */}
              <div>
                <label className={labelClass}>Visual Style</label>
                <p className={`text-[13px] leading-5 mb-3 ${helperClass}`}>
                  Select all that apply. Multiple choices are fine.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {STYLE_CHIPS.map((chip) => {
                    const active = selectedStyles.includes(chip.label);
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => toggleStyle(chip.label)}
                        aria-pressed={active}
                        style={
                          active
                            ? {
                                background: `linear-gradient(135deg, ${chip.from}, ${chip.to})`,
                                borderColor: "transparent",
                                color: "#ffffff",
                                boxShadow: `0 2px 14px ${chip.glow}`,
                              }
                            : {
                                borderColor: darkMode ? "#3f3f46" : "#e4e4e7",
                                color: darkMode ? "#d4d4d8" : "#52525b",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (active) return;
                          const el = e.currentTarget;
                          el.style.borderColor = chip.hoverBorder;
                          el.style.color = darkMode ? "#e4e4e7" : chip.hoverText;
                          el.style.background = darkMode
                            ? "rgba(255,255,255,0.06)"
                            : chip.hoverBg;
                          el.style.boxShadow = `0 2px 8px ${chip.glow.replace(/[\d.]+\)$/, "0.18)")}`;
                        }}
                        onMouseLeave={(e) => {
                          if (active) return;
                          const el = e.currentTarget;
                          el.style.borderColor = darkMode ? "#3f3f46" : "#e4e4e7";
                          el.style.color = darkMode ? "#d4d4d8" : "#52525b";
                          el.style.background = "transparent";
                          el.style.boxShadow = "none";
                        }}
                        className={`${chipBase} px-3.5 py-1.5 border bg-transparent transition-all duration-200 hover:scale-[1.02] hover:-translate-y-px`}
                      >
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
                {/* Hidden inputs for style selections */}
                {selectedStyles.map((s) => (
                  <input key={s} type="hidden" name="visual_style" value={s} />
                ))}
                <textarea
                  id="design_style" name="design_style" rows={3}
                  className={inputClass}
                  placeholder="Describe any additional style preferences."
                />
              </div>
            </div>
          </section>

          {/* ══ 6. Budget & Communication ══ */}
          <section
            id={SECTION_IDS[5]}
            ref={(el) => { sectionRefs.current[5] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Budget & Communication"
              subtitle="Help me understand your budget and how we should stay in touch."
              illustration={
                <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="16" width="42" height="32" rx="5" stroke="#CBD5E1" strokeWidth="2"/>
                  <path d="M50 24L64 16L64 48L50 40Z" stroke="#0369A1" strokeWidth="2" strokeLinejoin="round"/>
                  <circle cx="29" cy="32" r="8" stroke="#0369A1" strokeWidth="2"/>
                  <text x="29" y="36" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0369A1" fontFamily="sans-serif">$</text>
                  <circle cx="60" cy="10" r="6" fill="white" stroke="#0369A1" strokeWidth="1.5"/>
                  <path d="M57.5 10l1.5 1.5 3-3" stroke="#0369A1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              icon={
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="3" width="16" height="11" rx="2.5" fill="#0369A1"/>
                  <path d="M6 17l4-3 4 3" fill="#0369A1"/>
                  <text x="10" y="11" textAnchor="middle" fontSize="7" fontWeight="700" fill="white" fontFamily="sans-serif">$</text>
                </svg>
              }
            />

            {/* Budget */}
            <div className="mb-6">
              <label htmlFor="budget" className={labelClass}>Budget</label>
              <p className={`text-[13px] leading-5 mb-2 ${helperClass}`}>
                Any range is helpful — we can work with most budgets.
              </p>
              <input
                id="budget" name="budget" className={inputClass}
                placeholder="e.g. ₹50,000–₹1,00,000 or $1,000–$5,000"
              />
            </div>

            {/* Contact method pills */}
            <div className="mb-6">
              <label className={labelClass}>Preferred Contact Method</label>
              <p className={`text-[13px] leading-5 mb-3 ${helperClass}`}>
                Select all that work for you.
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_OPTIONS.map((c) => {
                  const active = selectedContacts.includes(c);
                  return (
                    <button
                      key={c} type="button"
                      onClick={() => toggleContact(c)}
                      aria-pressed={active}
                      className={contactPillClass(active)}
                    >
                      {active && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="shrink-0">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {c}
                    </button>
                  );
                })}
              </div>
              {selectedContacts.map((c) => (
                <input key={c} type="hidden" name="contact_method" value={c} />
              ))}
            </div>

            {/* Additional notes */}
            <div>
              <label htmlFor="additional_notes" className={labelClass}>
                Anything Else?
              </label>
              <textarea
                id="additional_notes" name="additional_notes" rows={4}
                className={inputClass}
                placeholder="Anything else we should know before we start?"
              />
            </div>
          </section>

          {/* ══ Submit ══ */}
          <div ref={submitRef} className="pt-2">
            {error && (
              <p className={`mb-4 text-sm font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}>
                {error}
              </p>
            )}

            {Object.keys(fieldErrors).length > 0 && (
              <p className={`mb-3 text-sm font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}>
                Please complete all required fields before submitting.
              </p>
            )}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? "Submitting..." : "Submit Project Brief"}
            </button>

            <p className={`mt-4 text-sm ${helperClass}`}>
              We review every brief and reply within 1 to 2 business days.
            </p>
          </div>
        </form>

        {/* ── Footer ─────────────────────── */}
        <footer className={`mt-16 pt-8 text-center border-t ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}>
          <p className={`text-sm ${helperClass}`}>Questions?</p>
          <p className={`mt-1 text-sm ${helperClass}`}>
            Have a question before getting started? Feel free to reach out.
          </p>
          <a
            href="mailto:kartheepanmu6@gmail.com"
            className="mt-3 inline-block text-sm font-medium text-[#1A73E8] hover:text-[#1967D2] transition"
          >
            Send an email
          </a>
          <p className={`mt-4 text-xs ${helperClass}`}>
            Thank you for taking the time to complete this onboarding form.
          </p>
        </footer>
      </div>

      {/* ── FABs ───────────────────────── */}
      <div className="fixed right-5 bottom-5 sm:right-6 sm:bottom-6 z-50 flex flex-col gap-3">
        <button type="button" onClick={scrollToSubmit} aria-label="Scroll to submit section" className={fabClass}>
          <span aria-hidden="true">↓</span>
        </button>
        {showScrollTop && (
          <button type="button" onClick={scrollToTop} aria-label="Scroll to top" className={fabClass}>
            <span aria-hidden="true">↑</span>
          </button>
        )}
      </div>
      {/* ── Onboarding Companion ───────── */}
      {!submitted && (
        <div
          ref={companionRef}
          className="fixed bottom-44 right-5 sm:right-6 z-50 flex flex-col items-end gap-2"
          aria-live="polite"
          aria-label="Onboarding assistant"
        >
          {/* Speech bubble */}
          {companionMsg && (
            <div
              className={`
                max-w-[180px] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-5
                shadow-lg border animate-[fadeSlideUp_0.25s_ease-out]
                ${darkMode
                  ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                  : "bg-white border-zinc-200 text-zinc-700"}
                ${companionCelebrate ? "text-[#1A73E8]" : ""}
              `}
            >
              {companionCelebrate && (
                <span className="mr-1" aria-hidden="true">✓</span>
              )}
              {companionMsg}
              {/* bubble tail */}
              <span
                className={`absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-r border-b ${
                  darkMode
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-white border-zinc-200"
                }`}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Mascot */}
          <div
            className={`
              relative h-14 w-14 select-none
              ${prefersReducedMotion.current ? "" : "animate-[companionFloat_4s_ease-in-out_infinite]"}
              ${companionCelebrate && !prefersReducedMotion.current
                ? "animate-[companionBounce_0.5s_ease-in-out_2]"
                : ""}
            `}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
            >
              <defs>
                <radialGradient id="bodyGrad" cx="42%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#6ea8fe" />
                  <stop offset="100%" stopColor="#1A73E8" />
                </radialGradient>
                <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ff9eb5" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ff9eb5" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="eyeGrad" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#4a4a6a" />
                  <stop offset="100%" stopColor="#1a1a3a" />
                </radialGradient>
                <filter id="softShadow" x="-20%" y="-10%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Body */}
              <ellipse cx="28" cy="31" rx="19" ry="20" fill="url(#bodyGrad)" filter="url(#softShadow)" />

              {/* Highlight sheen */}
              <ellipse cx="22" cy="22" rx="7" ry="5" fill="white" fillOpacity="0.18" transform="rotate(-20 22 22)" />

              {/* Cheeks */}
              <ellipse cx="16" cy="34" rx="5" ry="3.5" fill="url(#cheekGrad)" />
              <ellipse cx="40" cy="34" rx="5" ry="3.5" fill="url(#cheekGrad)" />

              {/* Left eye white */}
              <ellipse cx="22" cy="28" rx="4.5" ry={blinkState ? 0.6 : 4.5} fill="white" />
              {/* Left pupil */}
              {!blinkState && (
                <ellipse
                  cx={22 + eyeOffset.x * 0.6}
                  cy={28 + eyeOffset.y * 0.6}
                  rx="2.2"
                  ry="2.2"
                  fill="url(#eyeGrad)"
                />
              )}
              {/* Left eye shine */}
              {!blinkState && (
                <ellipse
                  cx={23.2 + eyeOffset.x * 0.4}
                  cy={26.8 + eyeOffset.y * 0.4}
                  rx="0.9"
                  ry="0.9"
                  fill="white"
                  fillOpacity="0.9"
                />
              )}

              {/* Right eye white */}
              <ellipse cx="34" cy="28" rx="4.5" ry={blinkState ? 0.6 : 4.5} fill="white" />
              {/* Right pupil */}
              {!blinkState && (
                <ellipse
                  cx={34 + eyeOffset.x * 0.6}
                  cy={28 + eyeOffset.y * 0.6}
                  rx="2.2"
                  ry="2.2"
                  fill="url(#eyeGrad)"
                />
              )}
              {/* Right eye shine */}
              {!blinkState && (
                <ellipse
                  cx={35.2 + eyeOffset.x * 0.4}
                  cy={26.8 + eyeOffset.y * 0.4}
                  rx="0.9"
                  ry="0.9"
                  fill="white"
                  fillOpacity="0.9"
                />
              )}

              {/* Smile */}
              <path
                d={companionCelebrate ? "M22 37 Q28 43 34 37" : "M22 37 Q28 41 34 37"}
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                strokeOpacity="0.9"
              />

              {/* Tiny hands when celebrating */}
              {companionCelebrate && (
                <>
                  <ellipse cx="9" cy="30" rx="3.5" ry="3" fill="#6ea8fe" />
                  <ellipse cx="47" cy="30" rx="3.5" ry="3" fill="#6ea8fe" />
                </>
              )}
            </svg>
          </div>
        </div>
      )}

    </div>
  );
}
