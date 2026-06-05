"use client";

import { useState } from "react";

export default function ClientOnboarding() {
  const [darkMode, setDarkMode] = useState(false);

  const pageClass = darkMode
    ? "bg-zinc-950 text-white"
    : "bg-[#f8f9fa] text-zinc-900";

  const cardClass = darkMode
    ? "bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-10 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
    : "bg-white border border-zinc-200/80 rounded-3xl p-8 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_32px_-14px_rgba(0,0,0,0.1)]";

  const inputClass = darkMode
    ? "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white placeholder:text-zinc-500 transition focus:outline-none focus:border-zinc-500 focus:ring-4 focus:ring-white/10"
    : "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 transition focus:outline-none focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5";

  const labelClass = darkMode
    ? "block text-sm font-medium text-zinc-300 mb-2"
    : "block text-sm font-medium text-zinc-700 mb-2";

  const helperClass = darkMode ? "text-zinc-400" : "text-zinc-500";

  const sectionTitleClass = "text-xl md:text-2xl font-semibold tracking-tight";

  const checkboxLabelClass = darkMode
    ? "flex items-center gap-3 border border-zinc-800 rounded-xl p-4 text-sm cursor-pointer transition hover:border-zinc-700"
    : "flex items-center gap-3 border border-zinc-200 rounded-xl p-4 text-sm cursor-pointer transition hover:border-zinc-300";

  const buttonClass = darkMode
    ? "inline-flex items-center justify-center w-full sm:w-auto px-10 py-4 text-base font-semibold rounded-2xl transition-all duration-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-100 hover:shadow-[0_12px_40px_-12px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white/20"
    : "inline-flex items-center justify-center w-full sm:w-auto px-10 py-4 text-base font-semibold rounded-2xl transition-all duration-200 bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-zinc-900/10";

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="flex justify-between items-center mb-14">
          <p className="text-sm font-medium tracking-wide text-zinc-500">
            UX/UI Client Onboarding
          </p>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle color theme"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
              darkMode
                ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                : "border-zinc-300 bg-white hover:bg-zinc-50"
            }`}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="mb-14 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Let&apos;s build something meaningful.
          </h1>

          <p className={`mt-5 text-lg md:text-xl leading-relaxed ${helperClass}`}>
            Share your goals, vision, and project requirements so we can create
            the best possible experience together.
          </p>
        </div>

        <form
          action="https://formspree.io/f/mqeoarnb"
          method="POST"
          className="space-y-10"
        >
          <section className={cardClass}>
            <div className="mb-7">
              <h2 className={sectionTitleClass}>Personal Information</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Tell us who you are and the best way to reach you.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  className={inputClass}
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="jane@company.com"
                />
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
            <div className="mb-7">
              <h2 className={sectionTitleClass}>Project Details</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                A quick overview of what you want to build and by when.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
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
            <div className="mb-7">
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
            <div className="mb-7">
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
            <div className="mb-7">
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
            <div className="mb-7">
              <h2 className={sectionTitleClass}>Budget &amp; Communication</h2>
              <p className={`mt-1.5 text-sm ${helperClass}`}>
                Set expectations so we can plan the right approach.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
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
            <button type="submit" className={buttonClass}>
              Submit Project Brief
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
