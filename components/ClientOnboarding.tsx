"use client";

import {
  useEffect,
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

const STYLE_CHIPS = [
  "Minimal",
  "Modern",
  "Premium",
  "Playful",
  "Bold",
  "Corporate",
  "Luxury",
  "Dark",
  "Vibrant",
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

  const submitRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

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
  const pageClass = darkMode ? "bg-zinc-950 text-white" : "bg-[#f6f7f9] text-zinc-900";

  const cardClass = darkMode
    ? "bg-zinc-900 border border-zinc-800/80 rounded-[28px] p-7 md:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
    : "bg-white border border-zinc-200/60 rounded-[28px] p-7 md:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_24px_48px_-28px_rgba(0,0,0,0.16)]";

  const inputBase = darkMode
    ? "w-full rounded-2xl border bg-zinc-950 px-5 py-3.5 text-base text-white placeholder:text-zinc-500 transition duration-200 focus:outline-none focus:ring-4"
    : "w-full rounded-2xl border bg-white px-5 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition duration-200 focus:outline-none focus:ring-4";

  const inputBorder = darkMode
    ? "border-zinc-700/70 focus:border-zinc-500 focus:ring-white/10"
    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-900/5";

  const inputErrorBorder = "border-red-500 focus:border-red-500 focus:ring-red-500/20";
  const inputClass = `${inputBase} ${inputBorder}`;

  const labelClass = darkMode
    ? "block text-sm font-medium tracking-tight text-zinc-300 mb-2.5"
    : "block text-sm font-medium tracking-tight text-zinc-700 mb-2.5";

  const helperClass = darkMode ? "text-zinc-400" : "text-zinc-500";
  const errorTextClass = darkMode ? "mt-2 text-sm font-medium text-red-400" : "mt-2 text-sm font-medium text-red-600";
  const sectionTitleClass = "text-2xl md:text-[28px] font-semibold tracking-tight leading-tight";

  const checkboxLabelClass = darkMode
    ? "flex items-center gap-3 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm cursor-pointer transition hover:border-zinc-600 hover:bg-zinc-800/40"
    : "flex items-center gap-3 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm cursor-pointer transition hover:border-zinc-300 hover:bg-zinc-50";

  const featureChipClass = (active: boolean) =>
    active
      ? darkMode
        ? "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer transition bg-white text-zinc-900 border border-white"
        : "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer transition bg-zinc-900 text-white border border-zinc-900"
      : darkMode
      ? "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer transition border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800/40"
      : "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium cursor-pointer transition border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50";

  const selectedChipClass = darkMode
    ? "inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900 pl-3 pr-2 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
    : "inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white pl-3 pr-2 py-1.5 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50";

  const contactPillClass = (active: boolean) =>
    active
      ? "px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition border bg-[#1A73E8] text-white border-[#1A73E8]"
      : darkMode
      ? "px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition border border-zinc-700 text-zinc-300 hover:border-zinc-500"
      : "px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition border border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50";

  const buttonClass =
    "inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium rounded-full transition-all duration-200 bg-[#1A73E8] text-white shadow-sm hover:bg-[#1967D2] hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#1A73E8]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm";

  const fabClass =
    "flex h-12 w-12 items-center justify-center rounded-full bg-[#1A73E8] text-white text-xl leading-none shadow-lg transition-all duration-200 hover:bg-[#1967D2] hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#1A73E8]/30";

  const themeToggle = (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Toggle color theme"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  /* ── Section header helper ────────── */
  const SectionHeader = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <div className="mb-8">
      <h2 className={sectionTitleClass}>{title}</h2>
      <p className={`mt-1.5 text-sm ${helperClass}`}>{subtitle}</p>
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
              {/* check icon */}
              <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full text-3xl ${
                darkMode ? "bg-white text-zinc-900" : "bg-[#1A73E8] text-white"
              }`} aria-hidden="true">
                ✓
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-center">
                Thanks! We&apos;ve received your project brief.
              </h1>

              {/* next steps */}
              <div className="mt-10">
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${helperClass}`}>
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
                <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${helperClass}`}>
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
      <div className={`sticky top-0 z-40 backdrop-blur-sm border-b ${
        darkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-100"
      }`}>
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${helperClass}`}>
              Step {activeSection + 1} of {SECTIONS.length} — {SECTIONS[activeSection]}
            </span>
            <span className={`text-xs font-medium ${helperClass}`}>{progressPct}%</span>
          </div>
          <div className={`h-1 w-full rounded-full overflow-hidden ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
            <div
              className="h-full rounded-full bg-[#1A73E8] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 md:py-20">

        {/* ── Branding header ────────────── */}
        <div className="flex justify-between items-start gap-4 mb-14">
          <div>
            <p className="text-lg font-semibold tracking-tight">Kartheepan</p>
            <p className="mt-1 text-sm tracking-wide text-zinc-500">
              UX/UI Designer • Product Design • User Experience
            </p>
          </div>
          {themeToggle}
        </div>

        {/* ── Hero ───────────────────────── */}
        <div className="mb-10 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Let&apos;s build something meaningful.
          </h1>
          <p className={`mt-6 text-lg md:text-2xl leading-relaxed font-light ${helperClass}`}>
            Share your goals, vision, and project requirements. This onboarding
            portal helps create a structured discovery process before design begins.
          </p>

          {/* required notice */}
          <p className={`mt-5 text-sm ${helperClass}`}>
            Fields marked with <span className="font-semibold">*</span> are required.
            Most questions are optional, but the more details you provide, the better
            we can understand your project.
          </p>

          {/* time estimate */}
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border ${
            darkMode ? "border-zinc-700 bg-zinc-900 text-zinc-300" : "border-zinc-200 bg-white text-zinc-600"
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
          className="space-y-10"
        >

          {/* ══ 1. Personal Information ══ */}
          <section
            id={SECTION_IDS[0]}
            ref={(el) => { sectionRefs.current[0] = el; }}
            className={cardClass}
          >
            <SectionHeader
              title="Personal Information"
              subtitle="Tell us who you are and the best way to reach you."
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
              subtitle="A quick overview of what you want to build and by when."
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
                <p className={`text-xs mb-2 ${helperClass}`}>Tell us what you&apos;re building.</p>
                <textarea
                  id="project_description" name="project_description" rows={4}
                  className={inputClass}
                  placeholder="Describe what you want to build — the product, platform, or experience you have in mind."
                />
              </div>

              <div>
                <label htmlFor="project_goals" className={labelClass}>Project Goals</label>
                <p className={`text-xs mb-2 ${helperClass}`}>
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
              subtitle="The more specific you are here, the better we can design for your users."
            />
            <div className="space-y-5">
              <div>
                <label htmlFor="target_audience" className={labelClass}>Who are your users?</label>
                <p className={`text-xs mb-2 ${helperClass}`}>
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
                <p className={`text-xs mb-2 ${helperClass}`}>
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
            />

            {/* DESKTOP: grouped 2-col grid with category labels */}
            <div className="hidden md:block space-y-7">
              {FEATURE_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${helperClass}`}>
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
                <p className={`text-xs font-medium mb-2 ${helperClass}`}>
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
              subtitle="Help us understand the look and feel you are drawn to."
            />

            <div className="space-y-7">
              {/* References */}
              <div>
                <label htmlFor="references" className={labelClass}>
                  Apps or Websites You Admire
                </label>
                <p className={`text-xs mb-2 ${helperClass}`}>
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
                <p className={`text-xs mb-2 ${helperClass}`}>
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
                <p className={`text-xs mb-3 ${helperClass}`}>
                  Select all that apply. Multiple choices are fine.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {STYLE_CHIPS.map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => toggleStyle(s)}
                      aria-pressed={selectedStyles.includes(s)}
                      className={featureChipClass(selectedStyles.includes(s))}
                    >
                      {s}
                    </button>
                  ))}
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
              subtitle="Set expectations so we can plan the right approach."
            />

            {/* Budget */}
            <div className="mb-6">
              <label htmlFor="budget" className={labelClass}>Budget</label>
              <p className={`text-xs mb-2 ${helperClass}`}>
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
              <p className={`text-xs mb-3 ${helperClass}`}>
                Select all that work for you.
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_OPTIONS.map((c) => (
                  <button
                    key={c} type="button"
                    onClick={() => toggleContact(c)}
                    aria-pressed={selectedContacts.includes(c)}
                    className={contactPillClass(selectedContacts.includes(c))}
                  >
                    {c}
                  </button>
                ))}
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
    </div>
  );
}
