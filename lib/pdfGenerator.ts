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

/* ─────────────────────────────────────────────────────────────
 * WELCOME KIT: 2 pages, branded, personalized per client
 * (visually distinct from the plain black-and-white brief)
 * ───────────────────────────────────────────────────────────── */
type RGB = [number, number, number];

/** Prep task shown when the client selected a given feature */
const FEATURE_PREP: Record<string, string> = {
  "Login / Signup": "Decide which sign-in methods you want (email, Google, phone)",
  "User Profiles": "List what each user profile should show",
  Dashboard: "Pick the 3 numbers or actions users check most",
  Search: "Share what people will search for most often",
  Payments: "Have your payment gateway account ready (Stripe, Razorpay)",
  "Booking System": "List your services, durations and availability rules",
  Analytics: "Decide the key numbers you want to track",
  "Admin Panel": "List who manages content and what they need to edit",
  Chat: "Decide who replies to chats, and when",
  Notifications: "List the events that should notify users",
  "Email Updates": "Prepare a sender address and sample email copy",
  "AI Features": "Describe what the AI should do, with 2 or 3 example inputs",
  "Multi-language": "List the languages you need and who will translate",
  "API Integrations": "Share API docs or the services you want connected",
};

/** K logo (280x248 PNG, transparent), embedded so the PDF needs no network request */
const LOGO_PNG = "data:image/png;base64,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";
const LOGO_RATIO = 62 / 70; // height / width

/**
 * Optional: paste a shared Notion / Google Sheet link here.
 * When set, the kit shows a clickable "Follow your project live" card.
 * Leave empty to hide it.
 */
const PROJECT_TRACKER_URL = "";

export function generateWelcomeKitPDF(data: {
  name: string;
  email: string;
  projectName: string;
  projectType: string;
  timeline: string;
  features: string[];
}): { blob: Blob; filename: string } {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mx = 20;
  const cw = pageW - mx * 2;

  const NAVY: RGB = [11, 53, 88];
  const BLUE: RGB = [26, 115, 232];
  const SOFT: RGB = [239, 246, 255];
  const LINE: RGB = [229, 231, 235];
  const INK: RGB = [24, 24, 27];
  const MUTED: RGB = [113, 113, 122];
  const WHITE: RGB = [255, 255, 255];
  const SKY: RGB = [191, 219, 254];
  const SKY2: RGB = [219, 234, 254];

  const firstName = (data.name || "there").trim().split(/\s+/)[0];
  const projectName = data.projectName?.trim() || "your project";

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const ink = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const font = (style: "normal" | "bold" | "italic", size: number) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  };
  const wrap = (t: string, w: number, style: "normal" | "bold" | "italic", size: number) => {
    font(style, size);
    return doc.splitTextToSize(t, w) as string[];
  };
  const clip = (t: string, w: number, style: "normal" | "bold" | "italic", size: number) => {
    font(style, size);
    if (doc.getTextWidth(t) <= w) return t;
    let out = t;
    while (out.length > 1 && doc.getTextWidth(out + "...") > w) out = out.slice(0, -1);
    return out.trimEnd() + "...";
  };

  let y = 0;
  const ensure = (h: number) => {
    if (y + h > pageH - 22) {
      doc.addPage();
      y = 22;
    }
  };
  const section = (title: string, contentH = 0) => {
    ensure(18 + contentH);
    y += 5;
    font("bold", 9);
    ink(BLUE);
    doc.text(title, mx, y);
    y += 2.5;
    stroke(LINE);
    doc.setLineWidth(0.3);
    doc.line(mx, y, pageW - mx, y);
    y += 7;
  };

  /* ── HEADER: logo, name, tag ───────── */
  const logoW = 16;
  doc.addImage(LOGO_PNG, "PNG", mx, 13, logoW, logoW * LOGO_RATIO);
  font("bold", 14);
  ink(NAVY);
  doc.text("KARTHEEPAN", mx + logoW + 5, 19.5);
  font("normal", 9);
  ink(MUTED);
  doc.text("UX/UI Designer", mx + logoW + 5, 25.2);

  const tag = "WELCOME KIT";
  font("bold", 7.5);
  const tagW = doc.getTextWidth(tag) + 10;
  fill(SOFT);
  doc.roundedRect(pageW - mx - tagW, 14, tagW, 6.6, 3.3, 3.3, "F");
  ink(BLUE);
  doc.text(tag, pageW - mx - tagW / 2, 18.4, { align: "center" });
  font("normal", 7.5);
  ink(MUTED);
  doc.text(
    new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    pageW - mx,
    25.2,
    { align: "right" }
  );
  stroke(LINE);
  doc.setLineWidth(0.3);
  doc.line(mx, 33, pageW - mx, 33);

  /* ── WELCOME PANEL ─────────────────── */
  const panelY = 40;
  const panelH = 38;
  fill(SOFT);
  doc.roundedRect(mx, panelY, cw, panelH, 4, 4, "F");
  fill(SKY2);
  doc.circle(mx + cw - 20, panelY + 19, 15, "F");
  fill(SKY);
  doc.circle(mx + cw - 42, panelY + 28, 6, "F");
  fill(BLUE);
  doc.roundedRect(mx + 9, panelY + 8.5, 10, 1.4, 0.7, 0.7, "F");
  font("bold", 24);
  ink(NAVY);
  doc.text(clip(`Welcome, ${firstName}.`, 110, "bold", 24), mx + 9, panelY + 21);
  font("normal", 10.5);
  ink(MUTED);
  doc.text(clip(`Your starter kit for ${projectName}`, 110, "normal", 10.5), mx + 9, panelY + 29.5);

  /* ── SNAPSHOT CARDS ────────────────── */
  y = panelY + panelH + 9;
  const gap = 4;
  const cardW = (cw - gap * 2) / 3;
  const cards: [string, string][] = [
    ["PROJECT", projectName],
    ["TYPE", data.projectType || "To be confirmed"],
    ["YOUR TARGET", data.timeline?.trim() || "To be discussed"],
  ];
  cards.forEach(([label, value], i) => {
    const x = mx + i * (cardW + gap);
    fill(WHITE);
    stroke(LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardW, 20, 2.5, 2.5, "FD");
    font("bold", 7);
    ink(MUTED);
    doc.text(label, x + 4, y + 7);
    ink(NAVY);
    doc.text(clip(value, cardW - 8, "bold", 10), x + 4, y + 14);
  });
  y += 25;

  /* ── ROADMAP ───────────────────────── */
  section("HOW YOUR PROJECT WILL FLOW");
  const phases: [string, string, string][] = [
    ["Discovery", "Kickoff call, scope sign-off, first deposit", "Join the call and share your brand assets"],
    ["Design", "Wireframes, UI in Figma, 2 revision rounds", "Review each round within 3 business days"],
    ["Build", "Development, integrations, testing", "Share access and final content"],
    ["Launch", "Deploy, handover, 14 days of bug fixes", "Do a final check and approve"],
  ];
  const colW = cw / phases.length;
  const nodeY = y + 4;
  stroke(LINE);
  doc.setLineWidth(0.6);
  doc.line(mx + colW / 2, nodeY, mx + colW * (phases.length - 0.5), nodeY);
  const descMax = Math.max(...phases.map((ph) => wrap(ph[1], colW - 6, "normal", 7.5).length));
  const youMax = Math.max(...phases.map((ph) => wrap(`You: ${ph[2]}`, colW - 6, "bold", 7.5).length));
  phases.forEach(([title, desc, you], i) => {
    const cx = mx + colW * i + colW / 2;
    fill(BLUE);
    doc.circle(cx, nodeY, 4.2, "F");
    font("bold", 9);
    ink(WHITE);
    doc.text(String(i + 1), cx, nodeY + 1.3, { align: "center" });
    font("bold", 9.5);
    ink(INK);
    doc.text(title, cx, nodeY + 11, { align: "center" });
    const lines = wrap(desc, colW - 6, "normal", 7.5);
    font("normal", 7.5);
    ink(MUTED);
    doc.text(lines, cx, nodeY + 16, { align: "center" });
    const youLines = wrap(`You: ${you}`, colW - 6, "bold", 7.5);
    ink(BLUE);
    doc.text(youLines, cx, nodeY + 16 + descMax * 3.3 + 3, { align: "center" });
  });
  y = nodeY + 16 + descMax * 3.3 + 3 + youMax * 3.3 + 7;
  if (data.timeline?.trim()) {
    font("italic", 8.5);
    ink(MUTED);
    doc.text(
      clip(`You mentioned "${data.timeline.trim()}". We will confirm a schedule on the kickoff call.`, cw, "italic", 8.5),
      mx,
      y
    );
    y += 4;
  }

  /* ── PREP CHECKLIST (tailored) ─────── */
  section("GET READY FOR KICKOFF");

  const checkItem = (text: string) => {
    const lines = wrap(text, cw - 8, "normal", 9.5);
    const h = lines.length * 4.6 + 2.4;
    ensure(h);
    stroke(BLUE);
    doc.setLineWidth(0.35);
    doc.roundedRect(mx, y - 3.2, 3.6, 3.6, 0.8, 0.8, "S");
    font("normal", 9.5);
    ink(INK);
    doc.text(lines, mx + 7, y);
    y += h;
  };
  const groupLabel = (text: string) => {
    ensure(10);
    font("bold", 8);
    ink(MUTED);
    doc.text(text, mx, y);
    y += 5.5;
  };

  groupLabel("THE BASICS");
  [
    "Your logo and brand colors (SVG or PNG)",
    "2 or 3 sites or apps you admire",
    "Any existing copy and images",
    "One person who can approve decisions",
  ].forEach(checkItem);

  const tailored = (data.features || []).filter((f) => FEATURE_PREP[f]).slice(0, 5);
  if (tailored.length > 0) {
    y += 3;
    groupLabel("TAILORED TO THE FEATURES YOU PICKED");
    tailored.forEach((f) => checkItem(FEATURE_PREP[f]));
  }

  /* ── KICKOFF AGENDA ────────────────── */
  const agenda: [string, string][] = [
    ["5 min", "Your goals and what success looks like"],
    ["5 min", "Users and their biggest pain points"],
    ["10 min", "Scope, priorities and must-have features"],
    ["5 min", "Timeline, milestones and who approves"],
    ["5 min", "Next steps and the agreement"],
  ];
  const agendaH = agenda.length * 7.4 + 6;
  section("KICKOFF CALL AGENDA (30 MIN)", agendaH);
  fill(SOFT);
  doc.roundedRect(mx, y - 2, cw, agendaH, 2.5, 2.5, "F");
  let ay = y + 5;
  agenda.forEach(([mins, topic]) => {
    font("bold", 9);
    ink(BLUE);
    doc.text(mins, mx + 6, ay);
    font("normal", 9.5);
    ink(INK);
    doc.text(topic, mx + 26, ay);
    ay += 7.4;
  });
  y += agendaH;

  /* ── HOW WE WORK ───────────────────── */
  section("HOW WE WILL WORK TOGETHER", 30);
  [
    "Every Friday: a short recap of what shipped, what is next and any blockers",
    "Replies within 4 hours on weekdays (IST), urgent items on WhatsApp",
    "Designs shared in Figma, so you can comment right on the screens",
    "2 revision rounds per screen, extra rounds are quoted before work starts",
  ].forEach((t) => {
    const lines = wrap(t, cw - 7, "normal", 9.5);
    const h = lines.length * 4.6 + 2.4;
    ensure(h);
    fill(BLUE);
    doc.circle(mx + 1.2, y - 1.2, 0.9, "F");
    font("normal", 9.5);
    ink(INK);
    doc.text(lines, mx + 6, y);
    y += h;
  });

  /* ── WHERE EVERYTHING LIVES ────────── */
  const docsList: [string, string, string][] = [
    ["Your project brief", "The answers you just gave me, saved as a PDF", "Received"],
    ["Scope of Work", "Lists exactly what is included, so changes are easy to price", "After kickoff"],
    ["Agreement", "Signed by both of us before design starts", "Before design"],
    ["Invoices", "Sent by email, one for each payment below", "By email"],
  ];
  if (PROJECT_TRACKER_URL) {
    docsList.push(["Live project page", "Follow progress and leave comments any time", "Open link"]);
  }
  section("WHERE EVERYTHING LIVES", docsList.length * 10.4);
  docsList.forEach(([title, desc, status], i) => {
    ensure(10.4);
    font("bold", 9.5);
    ink(INK);
    doc.text(title, mx, y);
    font("normal", 8);
    ink(MUTED);
    doc.text(clip(desc, cw - 38, "normal", 8), mx, y + 4.4);
    font("bold", 7.5);
    const pw = doc.getTextWidth(status) + 7;
    fill(SOFT);
    doc.roundedRect(pageW - mx - pw, y - 3.4, pw, 6.2, 3.1, 3.1, "F");
    ink(BLUE);
    doc.text(status, pageW - mx - pw / 2, y + 0.7, { align: "center" });
    if (title === "Live project page") {
      doc.link(mx, y - 4, cw, 10, { url: PROJECT_TRACKER_URL });
    }
    if (i < docsList.length - 1) {
      stroke(LINE);
      doc.setLineWidth(0.2);
      doc.line(mx, y + 6.6, pageW - mx, y + 6.6);
    }
    y += 10.4;
  });

  /* ── PAYMENT ───────────────────────── */
  section("PAYMENT, SPLIT IN THREE", 30);
  const pay: [string, string][] = [
    ["50%", "Before design begins"],
    ["25%", "At design sign-off"],
    ["25%", "On delivery and launch"],
  ];
  pay.forEach(([pct, when], i) => {
    const x = mx + i * (cardW + gap);
    fill(SOFT);
    doc.roundedRect(x, y - 2, cardW, 22, 2.5, 2.5, "F");
    font("bold", 16);
    ink(NAVY);
    doc.text(pct, x + 4, y + 8);
    font("normal", 8);
    ink(MUTED);
    doc.text(clip(when, cardW - 8, "normal", 8), x + 4, y + 14.5);
  });
  y += 24;
  font("italic", 8.5);
  ink(MUTED);
  doc.text("Your total is confirmed in the agreement after our kickoff call.", mx, y + 2);
  y += 8;

  /* ── CONTACT BAND ──────────────────── */
  ensure(38);
  const bandH = 36;
  fill(NAVY);
  doc.roundedRect(mx, y, cw, bandH, 3, 3, "F");
  font("bold", 12);
  ink(WHITE);
  doc.text("Questions before we start?", mx + 8, y + 10);
  font("normal", 9);
  ink(SKY);
  doc.text("Message me anytime. I read every one.", mx + 8, y + 16);

  const contactCol = (label: string, value: string, x: number, cy: number) => {
    font("bold", 7);
    ink(SKY);
    doc.text(label, x, cy);
    font("normal", 9.5);
    ink(WHITE);
    doc.text(value, x, cy + 4.6);
  };
  contactCol("EMAIL", "kartheepanmu6@gmail.com", mx + 8, y + 24);
  contactCol("WHATSAPP", "+91 6369 222 525", mx + 72, y + 24);
  contactCol("PORTFOLIO", "kartheepanm.info", mx + 122, y + 24);
  y += bandH;

  /* ── FOOTER ON EVERY PAGE ──────────── */
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    font("normal", 7.5);
    ink(MUTED);
    doc.text(`Prepared for ${data.name?.trim() || "you"} on ${dateLabel}`, mx, pageH - 12);
    doc.text(`Page ${p} of ${pages}`, pageW - mx, pageH - 12, { align: "right" });
  }

  /* ── FILENAME ──────────────────────── */
  const dateStr = now.toISOString().slice(0, 10);
  const safeName = (data.name || "Client")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return { blob: doc.output("blob"), filename: `Welcome-Kit-${safeName}-${dateStr}.pdf` };
}
