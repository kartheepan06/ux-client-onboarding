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
