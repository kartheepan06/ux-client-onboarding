"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type FieldErrors = {
  name?: string;
  email?: string;
  project_type?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ClientOnboarding() {
  const [darkMode, setDarkMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");

  const pageClass = darkMode
    ? "bg-zinc-950 text-white"
    : "bg-[#f6f7f9] text-zinc-900";

  const cardClass = darkMode
    ? "bg-zinc-900 border border-zinc-800/80 rounded-[28px] p-7 md:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
    : "bg-white border border-zinc-200/60 rounded-[28px] p-7 md:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_24px_48px_-28px_rgba(0,0,0,0.16)]";

  // Input styling is split so an input shows EITHER the normal border OR the
  // error border, never two conflicting border-color utilities at once.
  const inputBase = darkMode
    ? "w-full rounded-2xl border bg-zinc-950 px-5 py-3.5 text-base text-white placeholder:text-zinc-500 transition duration-200 focus:outline-none focus:ring-4"
    : "w-full rounded-2xl border bg-white px-5 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition duration-200 focus:outline-none focus:ring-4";

  const inputBorder = darkMode
    ? "border-zinc-700/70 focus:border-zinc-500 focus:ring-white/10"
    : "border-zinc-200 focus:border-zinc-400 focus:ring-zinc-900/5";

  const inputErrorBorder =
    "border-red-500 focus:border-red-500 focus:ring-red-500/20";

  const inputClass = `${inputBase} ${inputBorder}`;

  const errorTextClass = darkMode
    ? "mt-2 text-sm font-medium text-red-400"
    : "mt-2 text-sm font-medium text-red-600";

  const labelClass = darkMode
    ? "block text-sm font-medium tracking-tight text-zinc-300 mb-2.5"
    : "block text-sm font-medium tracking-tight text-zinc-700 mb-2.5";

  const helperClass = darkMode ? "text-zinc-400" : "text-zinc-500";

  const sectionTitleClass =
    "text-2xl md:text-[28px] font-semibold tracking-tight leading-tight";

  const checkboxLabelClass = darkMode
    ? "flex items-center gap-3 border border-zinc-800 rounded-2xl px-4 py-3.5 text-sm cursor-pointer transition hover:border-zinc-600 hover:bg-zinc-800/40"
    : "flex items-center gap-3 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm cursor-pointer transition hover:border-zinc-300 hover:bg-zinc-50";

  const buttonClass = darkMode
    ? "inline-flex items-center justify-center w-full sm:w-auto px-12 py-4 text-base font-semibold rounded-full transition-all duration-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-100 hover:shadow-[0_16px_44px_-14px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm"
    : "inline-flex items-center justify-center w-full sm:w-auto px-12 py-4 text-base font-semibold rounded-full transition-all duration-200 bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-zinc-900/15 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm";

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

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim() && fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (EMAIL_PATTERN.test(value.trim()) && fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handleProjectTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setProjectType(value);
    if (value && fieldErrors.project_type) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.project_type;
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const nextErrors: FieldErrors = {};
    if (!trimmedName) {
      nextErrors.name = "* Name is required";
    }
    if (!trimmedEmail) {
      nextErrors.email = "* Email is required";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "* Please enter a valid email address";
    }
    if (!projectType) {
      nextErrors.project_type = "* Please select a project type";
    }

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
        setSubmitted(true);
      } else {
        setError(
          "Something went wrong while sending your brief. Please try again."
        );
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`min-h-screen ${pageClass}`}>
        <div className="max-w-5xl mx-auto px-6 py-14 md:py-24">
          <div className="flex justify-end mb-14">{themeToggle}</div>

          <div className="flex items-center justify-center min-h-[55vh]">
            <div className={`${cardClass} w-full max-w-xl text-center`}>
              <div
                className={`mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
                  darkMode ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"
                }`}
                aria-hidden="true"
              >
                ✓
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Thank You
              </h1>

              <p className={`mt-5 text-lg leading-relaxed ${helperClass}`}>
                I&apos;ve received your project details and will review them
                within 24–48 hours.
              </p>

              <p className={`mt-3 text-base leading-relaxed ${helperClass}`}>
                If your project is a good fit, I&apos;ll reach out using the
                contact information you provided.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <div className="max-w-5xl mx-auto px-6 py-14 md:py-24">
        <div className="flex justify-between items-center mb-14">
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            UX/UI Client Onboarding
          </p>

          {themeToggle}
        </div>

        <div className="mb-16 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Let&apos;s build something meaningful.
          </h1>

          <p
            className={`mt-6 text-lg md:text-2xl leading-relaxed font-light ${helperClass}`}
          >
            Share your goals, vision, and project requirements so we can create
            the best possible experience together.
          </p>
        </div>

        <form
          action="https://formspree.io/f/mqeoarnb"
          method="POST"
          onSubmit={handleSubmit}
          noValidate
          className="space-y-10"
        >
          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Personal Information</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Tell us who you are and the best way to reach you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={handleNameChange}
                  aria-invalid={fieldErrors.name ? true : undefined}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`${inputBase} ${
                    fieldErrors.name ? inputErrorBorder : inputBorder
                  }`}
                  placeholder="John Doe"
                />
                {fieldErrors.name && (
                  <p id="name-error" className={errorTextClass}>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  className={`${inputBase} ${
                    fieldErrors.email ? inputErrorBorder : inputBorder
                  }`}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <p id="email-error" className={errorTextClass}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  Company / brand
                </label>
                <input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  className={inputClass}
                  placeholder="Acme Studio"
                />
              </div>

              <div>
                <label htmlFor="website" className={labelClass}>
                  Website / portfolio
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  autoComplete="url"
                  className={inputClass}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Project Details</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                A quick overview of what you want to build and by when.
              </p>
            </div>

            <div className="mb-5">
              <label htmlFor="project_type" className={labelClass}>
                Project Type *
              </label>
              <div className="relative">
                <select
                  id="project_type"
                  name="project_type"
                  value={projectType}
                  onChange={handleProjectTypeChange}
                  aria-invalid={fieldErrors.project_type ? true : undefined}
                  aria-describedby={
                    fieldErrors.project_type ? "project_type-error" : undefined
                  }
                  className={`${inputBase} ${
                    fieldErrors.project_type ? inputErrorBorder : inputBorder
                  } appearance-none pr-12 cursor-pointer`}
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
                <span
                  className={`pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 ${helperClass}`}
                  aria-hidden="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.5 7.5L10 12l4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              {fieldErrors.project_type && (
                <p id="project_type-error" className={errorTextClass}>
                  {fieldErrors.project_type}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="project_name" className={labelClass}>
                  Project name
                </label>
                <input
                  id="project_name"
                  name="project_name"
                  className={inputClass}
                  placeholder="e.g. Marketing site redesign"
                />
              </div>

              <div>
                <label htmlFor="timeline" className={labelClass}>
                  Expected timeline
                </label>
                <input
                  id="timeline"
                  name="timeline"
                  className={inputClass}
                  placeholder="e.g. 6 to 8 weeks"
                />
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <label htmlFor="project_description" className={labelClass}>
                  Project description
                </label>
                <textarea
                  id="project_description"
                  name="project_description"
                  rows={4}
                  className={inputClass}
                  placeholder="Describe what you want to build"
                />
              </div>

              <div>
                <label htmlFor="project_goals" className={labelClass}>
                  Goals
                </label>
                <textarea
                  id="project_goals"
                  name="project_goals"
                  rows={4}
                  className={inputClass}
                  placeholder="What does success look like for this project?"
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Target Audience</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Who you are building for and what they struggle with.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="target_audience" className={labelClass}>
                  Who are your users?
                </label>
                <textarea
                  id="target_audience"
                  name="target_audience"
                  rows={4}
                  className={inputClass}
                  placeholder="Describe your ideal users"
                />
              </div>

              <div>
                <label htmlFor="user_problems" className={labelClass}>
                  What problems are they facing?
                </label>
                <textarea
                  id="user_problems"
                  name="user_problems"
                  rows={4}
                  className={inputClass}
                  placeholder="The pain points you want to solve"
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Features Required</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Select everything that applies, then add anything missing below.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Login / Signup",
                "Dashboard",
                "Payments",
                "Booking System",
                "Analytics",
                "Admin Panel",
                "Chat",
                "Notifications",
                "Dark Mode",
                "Multi Language",
              ].map((item) => (
                <label key={item} className={checkboxLabelClass}>
                  <input type="checkbox" name="features" value={item} className="h-4 w-4" />
                  {item}
                </label>
              ))}
            </div>

            <div className="mt-6">
              <label htmlFor="other_features" className={labelClass}>
                Other features / requirements
              </label>
              <textarea
                id="other_features"
                name="other_features"
                rows={4}
                className={inputClass}
                placeholder="Other features or requirements not listed above"
              />
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Design Preferences</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Show us the look and feel you are drawn to.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="references" className={labelClass}>
                  References you like
                </label>
                <textarea
                  id="references"
                  name="references"
                  rows={4}
                  className={inputClass}
                  placeholder="Reference websites, apps, Behance, Dribbble, Pinterest, or examples you like"
                />
              </div>

              <div>
                <label htmlFor="reference_links" className={labelClass}>
                  Reference links
                </label>
                <p className={`text-sm mb-2 ${helperClass}`}>
                  Share links to any files, folders, references, inspiration,
                  logos, wireframes, screenshots, requirement documents, or
                  existing products.
                </p>
                <textarea
                  id="reference_links"
                  name="reference_links"
                  rows={4}
                  className={inputClass}
                  placeholder="Paste links to Google Drive, Figma, Dropbox, Behance, Dribbble, Pinterest, screenshots, requirement documents, logos, wireframes, or inspiration"
                />
              </div>

              <div>
                <label htmlFor="design_style" className={labelClass}>
                  Preferred visual style
                </label>
                <textarea
                  id="design_style"
                  name="design_style"
                  rows={4}
                  className={inputClass}
                  placeholder="Describe the look and feel you want"
                />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-8">
              <h2 className={sectionTitleClass}>Budget &amp; Communication</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Set expectations so we can plan the right approach.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="budget" className={labelClass}>
                  Budget
                </label>
                <input
                  id="budget"
                  name="budget"
                  className={inputClass}
                  placeholder="e.g. $5,000 to $10,000"
                />
              </div>

              <div>
                <label htmlFor="contact_method" className={labelClass}>
                  Preferred contact method
                </label>
                <input
                  id="contact_method"
                  name="contact_method"
                  className={inputClass}
                  placeholder="Email, WhatsApp, or call"
                />
              </div>
            </div>

            <div className="mt-5">
              <label htmlFor="additional_notes" className={labelClass}>
                Anything else?
              </label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                rows={4}
                className={inputClass}
                placeholder="Anything else we should know?"
              />
            </div>
          </section>

          <div className="pt-2">
            {error && (
              <p
                className={`mb-4 text-sm font-medium ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </p>
            )}

            <p className={`mb-3 text-sm ${helperClass}`}>
              Fields marked with * are required.
            </p>

            {Object.keys(fieldErrors).length > 0 && (
              <p
                className={`mb-3 text-sm font-medium ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
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
      </div>
    </div>
  );
}
