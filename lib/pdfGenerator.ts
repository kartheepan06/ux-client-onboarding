import jsPDF from "jspdf";

interface BriefData {
  // Personal
  name: string;
  email: string;
  company: string;
  website: string;
  // Project
  projectName: string;
  projectType: string;
  timeline: string;
  description: string;
  goals: string;
  // Audience
  users: string;
  painPoints: string;
  // Features
  features: string[];
  customFeatures: string;
  // Design
  admiredWebsites: string;
  referenceUrls: string;
  visualStyles: string[];
  styleNotes: string;
  // Budget
  budget: string;
  contactMethods: string[];
  additionalNotes: string;
}

/**
 * Generate a branded client brief PDF (plain B&W, Kartheepan header).
 * Returns a Blob suitable for attaching to a FormData submission.
 */
export function generateClientBriefPDF(data: BriefData): {
  blob: Blob;
  filename: string;
} {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentW = pageW - marginX * 2;

  let y = 25;

  /* ── HEADER ─────────────────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("KARTHEEPAN", marginX, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("UX/UI Designer", marginX, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Client Onboarding Brief", marginX, y);
  y += 10;

  /* ── HELPERS ────────────────────────── */
  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 25) {
      doc.addPage();
      y = 25;
    }
  };

  const sectionTitle = (num: string, title: string) => {
    ensureSpace(14);
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${num}. ${title}`, marginX, y);
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(marginX, y, pageW - marginX, y);
    y += 6;
  };

  const field = (label: string, value: string) => {
    const display = value?.trim() ? value.trim() : "—";
    const wrapped = doc.splitTextToSize(display, contentW - 32);
    const rowHeight = Math.max(6, wrapped.length * 4.5 + 2);
    ensureSpace(rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(wrapped, marginX + 32, y);
    y += rowHeight;
  };

  /* ── SECTIONS ───────────────────────── */

  // 1. Personal
  sectionTitle("01", "Personal Information");
  field("Name", data.name);
  field("Email", data.email);
  field("Company", data.company);
  field("Website", data.website);

  // 2. Project
  sectionTitle("02", "Project Details");
  field("Project", data.projectName);
  field("Type", data.projectType);
  field("Timeline", data.timeline);
  field("Description", data.description);
  field("Goals", data.goals);

  // 3. Audience
  sectionTitle("03", "Target Audience");
  field("Users", data.users);
  field("Pain Points", data.painPoints);

  // 4. Features
  sectionTitle("04", "Key Features Needed");
  field(
    "Selected",
    data.features.length > 0 ? data.features.join(", ") : "—"
  );
  field("Custom", data.customFeatures);

  // 5. Design
  sectionTitle("05", "Design Preferences");
  field("Admired", data.admiredWebsites);
  field("References", data.referenceUrls);
  field(
    "Styles",
    data.visualStyles.length > 0 ? data.visualStyles.join(", ") : "—"
  );
  field("Notes", data.styleNotes);

  // 6. Budget
  sectionTitle("06", "Budget & Communication");
  field("Budget", data.budget);
  field(
    "Contact via",
    data.contactMethods.length > 0 ? data.contactMethods.join(", ") : "—"
  );
  field("Additional Notes", data.additionalNotes);

  /* ── FOOTER on every page ───────────── */
  const pageCount = doc.getNumberOfPages();
  const now = new Date();
  const timestamp = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Submitted: ${timestamp}`,
      marginX,
      pageH - 12
    );
    doc.text(
      "kartheepanmu6@gmail.com",
      pageW - marginX,
      pageH - 12,
      { align: "right" }
    );
    doc.text(
      `Page ${p} of ${pageCount}`,
      pageW / 2,
      pageH - 12,
      { align: "center" }
    );
  }

  /* ── FILENAME ───────────────────────── */
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const safeName = (data.name || "Client")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `Client-Brief-${safeName}-${dateStr}.pdf`;

  const blob = doc.output("blob");
  return { blob, filename };
}

/**
 * Generate a personalized Welcome Kit PDF for a new client.
 * Single-page, essentials only, with real contact details baked in.
 */
export function generateWelcomeKitPDF(data: {
  name: string;
  email: string;
  projectName: string;
  projectType: string;
}): { blob: Blob; filename: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentW = pageW - marginX * 2;

  // First name only for personal greeting
  const firstName = (data.name || "there").trim().split(" ")[0];
  const projectName = data.projectName?.trim() || "your project";

  let y = 25;

  /* ── HEADER ───────────────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("KARTHEEPAN", marginX, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("UX/UI Designer  ·  kartheepanm.info", marginX, y);
  y += 10;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageW - marginX, y);
  y += 10;

  /* ── TITLE ────────────────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Welcome Kit", marginX, y);
  y += 10;

  /* ── PERSONAL GREETING ────────────── */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  const greeting = `Hi ${firstName}, thanks for sharing your brief for ${projectName}.`;
  const greetingWrapped = doc.splitTextToSize(greeting, contentW);
  doc.text(greetingWrapped, marginX, y);
  y += greetingWrapped.length * 6 + 3;

  const intro = "Here's everything you need to work with me smoothly.";
  doc.text(intro, marginX, y);
  y += 12;

  /* ── PROJECT SNAPSHOT ─────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("PROJECT SNAPSHOT", marginX, y);
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;

  const snapshotRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(value || "—", marginX + 40, y);
    y += 7;
  };

  snapshotRow("Client", data.name || "—");
  snapshotRow("Project", projectName);
  snapshotRow("Type", data.projectType || "—");
  snapshotRow("Contact", data.email || "—");
  y += 6;

  /* ── WHAT HAPPENS NEXT ────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("WHAT HAPPENS NEXT", marginX, y);
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;

  const step = (n: string, text: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(26, 115, 232);
    doc.text(n, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const wrapped = doc.splitTextToSize(text, contentW - 10);
    doc.text(wrapped, marginX + 8, y);
    y += wrapped.length * 5 + 3;
  };

  step("1.", "I'll review your brief within 24-48 hours and send initial thoughts.");
  step("2.", "We'll hop on a 30-min kickoff call to align on scope and timeline.");
  step("3.", "I'll send the agreement + first invoice (50% deposit) to get started.");
  y += 6;

  /* ── PAYMENT STRUCTURE ────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("PAYMENT STRUCTURE", marginX, y);
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;

  const pay = (pct: string, when: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(pct, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(90, 90, 90);
    doc.text(when, marginX + 20, y);
    y += 6;
  };

  pay("50%", "Before design work begins");
  pay("25%", "At design phase sign-off");
  pay("25%", "On final delivery & deployment");
  y += 8;

  /* ── HOW TO REACH ME ──────────────── */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text("HOW TO REACH ME", marginX, y);
  y += 2;
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 6;

  const contact = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text(label, marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(value, marginX + 30, y);
    y += 6;
  };

  contact("Email", "kartheepanmu6@gmail.com");
  contact("WhatsApp", "+91 6369 222 525");
  contact("Zoom", "kartheepanmu6@gmail.com");
  contact("Portfolio", "kartheepanm.info");
  y += 3;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("Response time: within 4 hours on weekdays (IST).", marginX, y);
  y += 12;

  /* ── FOOTER ───────────────────────── */
  doc.setDrawColor(220, 220, 220);
  doc.line(marginX, y, pageW - marginX, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Looking forward to building ${projectName} with you.`, marginX, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("— Kartheepan", marginX, y);

  /* ── PAGE FOOTER ──────────────────── */
  const now = new Date();
  const timestamp = now.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`Issued: ${timestamp}`, marginX, pageH - 12);
  doc.text("kartheepanmu6@gmail.com", pageW - marginX, pageH - 12, { align: "right" });

  /* ── FILENAME ─────────────────────── */
  const dateStr = now.toISOString().slice(0, 10);
  const safeName = (data.name || "Client")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const filename = `Welcome-Kit-${safeName}-${dateStr}.pdf`;

  const blob = doc.output("blob");
  return { blob, filename };
}
