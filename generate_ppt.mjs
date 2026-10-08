import pptxgen from "pptxgenjs";

const pptx = new pptxgen();

// ─── Theme Colors ──────────────────────────────────────
const C = {
  bg:       "0A0F2C",
  bgCard:   "131836",
  accent1:  "6C63FF", // purple
  accent2:  "00D4AA", // teal
  accent3:  "FF6B9D", // pink
  accent4:  "FFD93D", // yellow
  white:    "F0F0FF",
  grey:     "9B9BBF",
  darkGrey: "1E2452",
};

pptx.author = "Stay-nest Team";
pptx.title = "Stay-nest: Advanced Hostel Booking Platform";
pptx.subject = "Project Presentation";
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches

// ─── Helper Functions ──────────────────────────────────
function addBgAndDecor(slide) {
  slide.background = { fill: C.bg };
  // Top gradient bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.06,
    fill: { type: "solid", color: C.accent1 },
  });
}

function addSlideNumber(slide, num, label) {
  slide.addText(`${num}  —  ${label}`, {
    x: 0.5, y: 0.3, w: 4, h: 0.3,
    fontSize: 9, fontFace: "Segoe UI",
    color: C.accent2, bold: true, letterSpacing: 3,
  });
}

function addSectionTitle(slide, tag, title, subtitle) {
  // Tag badge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 0.7, w: 1.8, h: 0.35, rectRadius: 0.15,
    fill: { type:"solid", color: C.darkGrey },
  });
  slide.addText(tag, {
    x: 0.5, y: 0.7, w: 1.8, h: 0.35,
    fontSize: 9, fontFace: "Segoe UI Semibold",
    color: C.accent2, align: "center", bold: true,
  });
  // Title
  slide.addText(title, {
    x: 0.5, y: 1.15, w: 10, h: 0.6,
    fontSize: 30, fontFace: "Segoe UI",
    color: C.white, bold: true,
  });
  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 1.75, w: 10, h: 0.4,
      fontSize: 13, fontFace: "Segoe UI",
      color: C.grey,
    });
  }
}

function addCard(slide, x, y, w, h, borderColor) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12,
    fill: { type: "solid", color: C.bgCard },
    line: { color: borderColor || "1E2452", width: 1 },
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  // Decorative circle blurs (simulated with transparent shapes)
  slide.addShape(pptx.shapes.OVAL, {
    x: 8, y: -1.5, w: 6, h: 6,
    fill: { type: "solid", color: C.accent1 }, transparency: 88,
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: -1, y: 4, w: 5, h: 5,
    fill: { type: "solid", color: C.accent3 }, transparency: 90,
  });

  // Top bar
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.06,
    fill: { type: "solid", color: C.accent1 },
  });

  // Logo text
  slide.addText("STAY-NEST", {
    x: 0, y: 1.8, w: 13.33, h: 0.5,
    fontSize: 14, fontFace: "Segoe UI",
    color: C.accent2, align: "center", bold: true, letterSpacing: 8,
  });

  // Main title
  slide.addText("Advanced Hostel\nBooking Platform", {
    x: 1, y: 2.3, w: 11.33, h: 2,
    fontSize: 48, fontFace: "Segoe UI",
    color: C.white, align: "center", bold: true, lineSpacingMultiple: 1.1,
  });

  // Subtitle
  slide.addText("A Full-Stack MERN Application for Intelligent\nHostel Discovery, Booking & Management", {
    x: 2, y: 4.3, w: 9.33, h: 0.8,
    fontSize: 16, fontFace: "Segoe UI",
    color: C.grey, align: "center", lineSpacingMultiple: 1.4,
  });

  // Bottom info boxes
  const infoData = [
    ["Technology", "React · Node.js · MongoDB"],
    ["Type", "Full-Stack Web Application"],
    ["Duration", "5-Minute Overview"],
  ];
  infoData.forEach((d, i) => {
    const bx = 2.8 + i * 2.8;
    addCard(slide, bx, 5.6, 2.4, 1.0);
    slide.addText(d[0], {
      x: bx, y: 5.65, w: 2.4, h: 0.35,
      fontSize: 9, fontFace: "Segoe UI", color: C.grey, align: "center", bold: true,
    });
    slide.addText(d[1], {
      x: bx, y: 5.98, w: 2.4, h: 0.4,
      fontSize: 11, fontFace: "Segoe UI Semibold", color: C.white, align: "center",
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 2 — ABSTRACT
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "01", "ABSTRACT");
  addSectionTitle(slide, "Project Overview", "Abstract");

  // Left column text
  slide.addText([
    { text: "Stay-nest", options: { bold: true, color: C.white, fontSize: 13 } },
    { text: " is a comprehensive full-stack web application built using the ", options: { color: C.grey, fontSize: 13 } },
    { text: "MERN Stack", options: { bold: true, color: C.accent1, fontSize: 13 } },
    { text: " (MongoDB, Express, React, Node.js) designed to solve the challenges of hostel discovery, verification, and booking.", options: { color: C.grey, fontSize: 13 } },
  ], {
    x: 0.5, y: 2.2, w: 5.8, h: 1.2,
    fontFace: "Segoe UI", valign: "top", lineSpacingMultiple: 1.4,
  });

  // Key features bullet points
  const bullets = [
    "Split-screen map-based search with geocoding",
    "Admin panel with full CRUD & bulk data sync",
    "Multi-step booking flow with user dashboard",
    "Responsive glassmorphism UI design",
  ];
  bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.6, y: 3.6 + i * 0.45, w: 0.12, h: 0.12,
      fill: { type: "solid", color: C.accent1 },
    });
    slide.addText(b, {
      x: 0.9, y: 3.48 + i * 0.45, w: 5.4, h: 0.38,
      fontSize: 11, fontFace: "Segoe UI", color: C.grey, valign: "middle",
    });
  });

  // Right column — Problem card
  addCard(slide, 6.9, 2.2, 5.6, 1.2, C.accent3);
  slide.addText("🎯  Problem Solved", {
    x: 7.1, y: 2.3, w: 5.2, h: 0.35,
    fontSize: 12, fontFace: "Segoe UI Semibold", color: C.accent3,
  });
  slide.addText("Fragmented hostel listings, unreliable data, lack of location verification, and poor user experience in existing accommodation platforms.", {
    x: 7.1, y: 2.7, w: 5.2, h: 0.65,
    fontSize: 10, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.4,
  });

  // Right column — Innovation card
  addCard(slide, 6.9, 3.6, 5.6, 1.2, C.accent4);
  slide.addText("💡  Key Innovation", {
    x: 7.1, y: 3.7, w: 5.2, h: 0.35,
    fontSize: 12, fontFace: "Segoe UI Semibold", color: C.accent4,
  });
  slide.addText("Coordinate-based listings with interactive map synchronization ensuring what users see on-screen is an accurate geographic representation.", {
    x: 7.1, y: 4.1, w: 5.2, h: 0.65,
    fontSize: 10, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.4,
  });

  // Tech stack row
  const techs = [
    ["⚛️", "React 18", "Frontend"],
    ["🟢", "Node.js", "Backend"],
    ["🍃", "MongoDB", "Database"],
    ["🗺️", "Leaflet", "Maps"],
  ];
  techs.forEach((t, i) => {
    const tx = 6.9 + i * 1.4;
    addCard(slide, tx, 5.2, 1.25, 1.2);
    slide.addText(t[0], { x: tx, y: 5.3, w: 1.25, h: 0.45, fontSize: 22, align: "center" });
    slide.addText(t[1], {
      x: tx, y: 5.75, w: 1.25, h: 0.3,
      fontSize: 9, fontFace: "Segoe UI Semibold", color: C.white, align: "center",
    });
    slide.addText(t[2], {
      x: tx, y: 6.0, w: 1.25, h: 0.25,
      fontSize: 8, fontFace: "Segoe UI", color: C.grey, align: "center",
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 3 — SYSTEM ARCHITECTURE
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "02", "ARCHITECTURE");
  addSectionTitle(slide, "System Design", "System Architecture", "Decoupled MERN Stack with three-tier design");

  const layers = [
    {
      title: "🎨  Presentation Layer", color: C.accent1,
      desc: "React 18 with Vite 6.0 build engine. Handles UI rendering, routing (React Router 6), global state (Context API), and interactive maps (Leaflet.js).",
      tags: "React  ·  Vite  ·  Tailwind  ·  Leaflet",
    },
    {
      title: "⚙️  Logic Layer", color: C.accent2,
      desc: "Node.js + Express server with RESTful API endpoints. Handles data validation, CORS, Google Places API integration, and middleware processing.",
      tags: "Express  ·  REST API  ·  Axios  ·  CORS",
    },
    {
      title: "🗄️  Data Layer", color: C.accent3,
      desc: "MongoDB with Mongoose ODM. Stores hostel documents with geospatial indexing, booking records, and user sessions. Flexible NoSQL schema.",
      tags: "MongoDB  ·  Mongoose  ·  BSON  ·  GeoIndex",
    },
  ];

  layers.forEach((l, i) => {
    const cx = 0.5 + i * 4.2;
    // Card bg
    addCard(slide, cx, 2.5, 3.9, 4.2, l.color);
    // Top border accent
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: cx, y: 2.5, w: 3.9, h: 0.06, fill: { type: "solid", color: l.color },
    });
    // Title
    slide.addText(l.title, {
      x: cx + 0.2, y: 2.7, w: 3.5, h: 0.5,
      fontSize: 14, fontFace: "Segoe UI Semibold", color: C.white,
    });
    // Description
    slide.addText(l.desc, {
      x: cx + 0.2, y: 3.3, w: 3.5, h: 1.8,
      fontSize: 10.5, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.5, valign: "top",
    });
    // Tags
    slide.addText(l.tags, {
      x: cx + 0.2, y: 5.8, w: 3.5, h: 0.35,
      fontSize: 9, fontFace: "Segoe UI Semibold", color: l.color,
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 4 — DATA FLOW DIAGRAM
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "03", "DATA FLOW DIAGRAM");
  addSectionTitle(slide, "DFD", "Data Flow Diagram", "How data moves through the system");

  // Left: Search Flow
  slide.addText("🔍  Search & Booking Flow", {
    x: 0.5, y: 2.3, w: 5.5, h: 0.4,
    fontSize: 13, fontFace: "Segoe UI Semibold", color: C.accent1,
  });

  const searchFlow = [
    ["👤 User", "Enters city name / search query"],
    ["🌐 React Frontend", "Geocoding via Nominatim API → coordinates"],
    ["📡 Axios GET /api/hostels", "HTTP request with location params"],
    ["⚙️ Express Server", "Route handler → Mongoose .find()"],
    ["🍃 MongoDB", "Geospatial query → JSON documents"],
    ["🗺️ UI Update", "Map markers + listing cards rendered"],
  ];

  searchFlow.forEach((n, i) => {
    const ny = 2.85 + i * 0.7;
    addCard(slide, 0.6, ny, 5.3, 0.5, i === 2 ? C.accent1 : C.darkGrey);
    slide.addText(n[0], {
      x: 0.8, y: ny + 0.02, w: 2.2, h: 0.25,
      fontSize: 10, fontFace: "Segoe UI Semibold", color: C.white,
    });
    slide.addText(n[1], {
      x: 0.8, y: ny + 0.24, w: 4.9, h: 0.22,
      fontSize: 8.5, fontFace: "Segoe UI", color: C.grey,
    });
    if (i < searchFlow.length - 1) {
      slide.addText("▼", {
        x: 2.8, y: ny + 0.48, w: 0.5, h: 0.22,
        fontSize: 10, color: C.accent1, align: "center", transparency: 50,
      });
    }
  });

  // Right: Admin Flow
  slide.addText("🔐  Admin Sync Flow", {
    x: 7, y: 2.3, w: 5.5, h: 0.4,
    fontSize: 13, fontFace: "Segoe UI Semibold", color: C.accent3,
  });

  const adminFlow = [
    ["👨‍💼 Admin", "Enters city for bulk sync"],
    ["📡 POST /api/sync/google", "Sync request with city name"],
    ["🌍 Google Places API", "Fetches real data (or mock fallback)"],
    ["⚙️ Data Cleaning", "Maps external data → Mongoose model"],
    ["🍃 MongoDB Insert", "Bulk upsert to Hostels collection"],
  ];

  adminFlow.forEach((n, i) => {
    const ny = 2.85 + i * 0.7;
    addCard(slide, 7.1, ny, 5.3, 0.5, i === 1 ? C.accent3 : C.darkGrey);
    slide.addText(n[0], {
      x: 7.3, y: ny + 0.02, w: 2.5, h: 0.25,
      fontSize: 10, fontFace: "Segoe UI Semibold", color: C.white,
    });
    slide.addText(n[1], {
      x: 7.3, y: ny + 0.24, w: 4.9, h: 0.22,
      fontSize: 8.5, fontFace: "Segoe UI", color: C.grey,
    });
    if (i < adminFlow.length - 1) {
      slide.addText("▼", {
        x: 9.3, y: ny + 0.48, w: 0.5, h: 0.22,
        fontSize: 10, color: C.accent3, align: "center", transparency: 50,
      });
    }
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 5 — MODULES 1 & 2
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "04", "MODULES");
  addSectionTitle(slide, "Module Description", "Core Modules (1/2)");

  // Module 1
  addCard(slide, 0.5, 2.2, 5.9, 4.8, C.accent1);
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 2.2, w: 0.08, h: 4.8, fill: { type: "solid", color: C.accent1 },
  });
  slide.addText("🏠  1. Home & Landing Module", {
    x: 0.8, y: 2.35, w: 5.4, h: 0.4,
    fontSize: 15, fontFace: "Segoe UI Semibold", color: C.white,
  });
  slide.addText("The entry point featuring a hero section with glassmorphism search widget, featured hostel carousel, and dynamic city highlights.", {
    x: 0.8, y: 2.85, w: 5.4, h: 0.7,
    fontSize: 10.5, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.5,
  });
  const m1Bullets = [
    "Multi-parameter search (City, Date, Guests)",
    "Animated hostel card grid with hover effects",
    "Featured hostels carousel with auto-scroll",
    "Responsive design from mobile to 4K",
  ];
  m1Bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.9, y: 3.85 + i * 0.42, w: 0.1, h: 0.1,
      fill: { type: "solid", color: C.accent1 },
    });
    slide.addText(b, {
      x: 1.15, y: 3.73 + i * 0.42, w: 5, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI", color: C.grey,
    });
  });
  slide.addText("HomePage.tsx  ·  Header.tsx  ·  Footer.tsx", {
    x: 0.8, y: 5.7, w: 5.4, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: C.accent1,
  });

  // Module 2
  addCard(slide, 6.9, 2.2, 5.9, 4.8, C.accent2);
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.9, y: 2.2, w: 0.08, h: 4.8, fill: { type: "solid", color: C.accent2 },
  });
  slide.addText("🔍  2. Search & Map Module", {
    x: 7.2, y: 2.35, w: 5.4, h: 0.4,
    fontSize: 15, fontFace: "Segoe UI Semibold", color: C.white,
  });
  slide.addText("Split-screen discovery engine with synchronized listing sidebar and interactive Leaflet map. Real-time filtering with geocoding.", {
    x: 7.2, y: 2.85, w: 5.4, h: 0.7,
    fontSize: 10.5, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.5,
  });
  const m2Bullets = [
    "60/40 split-screen layout (cards + map)",
    "Custom circular markers with interaction",
    "Nominatim geocoding for text → coordinates",
    "Map and cards stay in perfect sync",
  ];
  m2Bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.OVAL, {
      x: 7.3, y: 3.85 + i * 0.42, w: 0.1, h: 0.1,
      fill: { type: "solid", color: C.accent2 },
    });
    slide.addText(b, {
      x: 7.55, y: 3.73 + i * 0.42, w: 5, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI", color: C.grey,
    });
  });
  slide.addText("SearchPage.tsx  ·  MapView.tsx  ·  ComparePage.tsx", {
    x: 7.2, y: 5.7, w: 5.4, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: C.accent2,
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 6 — MODULES 3 & 4
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "05", "MODULES");
  addSectionTitle(slide, "Module Description", "Core Modules (2/2)");

  // Module 3
  addCard(slide, 0.5, 2.2, 5.9, 4.8, C.accent3);
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 2.2, w: 0.08, h: 4.8, fill: { type: "solid", color: C.accent3 },
  });
  slide.addText("📋  3. Booking & Detail Module", {
    x: 0.8, y: 2.35, w: 5.4, h: 0.4,
    fontSize: 15, fontFace: "Segoe UI Semibold", color: C.white,
  });
  slide.addText("Deep-dive property pages with image galleries, amenity grids, and a secure multi-step booking flow with date validation.", {
    x: 0.8, y: 2.85, w: 5.4, h: 0.7,
    fontSize: 10.5, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.5,
  });
  const m3Bullets = [
    "Property detail with image carousel",
    "Date-picker with check-in/out validation",
    "Automatic price calculation (nights × rate)",
    "User dashboard with booking history",
  ];
  m3Bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.9, y: 3.85 + i * 0.42, w: 0.1, h: 0.1,
      fill: { type: "solid", color: C.accent3 },
    });
    slide.addText(b, {
      x: 1.15, y: 3.73 + i * 0.42, w: 5, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI", color: C.grey,
    });
  });
  slide.addText("HostelDetailPage.tsx  ·  BookingPage.tsx  ·  DashboardPage.tsx", {
    x: 0.8, y: 5.7, w: 5.4, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: C.accent3,
  });

  // Module 4
  addCard(slide, 6.9, 2.2, 5.9, 4.8, C.accent4);
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 6.9, y: 2.2, w: 0.08, h: 4.8, fill: { type: "solid", color: C.accent4 },
  });
  slide.addText("🛡️  4. Admin Management Module", {
    x: 7.2, y: 2.35, w: 5.4, h: 0.4,
    fontSize: 15, fontFace: "Segoe UI Semibold", color: C.white,
  });
  slide.addText("Role-based admin panel with secure login, full CRUD operations, bulk Google Places data sync, and real-time inventory management.", {
    x: 7.2, y: 2.85, w: 5.4, h: 0.7,
    fontSize: 10.5, fontFace: "Segoe UI", color: C.grey, lineSpacingMultiple: 1.5,
  });
  const m4Bullets = [
    "Secure admin authentication",
    "Add / Edit / Delete hostel listings",
    "Google Places API sync with mock fallback",
    "Map-based coordinate picker for accuracy",
  ];
  m4Bullets.forEach((b, i) => {
    slide.addShape(pptx.shapes.OVAL, {
      x: 7.3, y: 3.85 + i * 0.42, w: 0.1, h: 0.1,
      fill: { type: "solid", color: C.accent4 },
    });
    slide.addText(b, {
      x: 7.55, y: 3.73 + i * 0.42, w: 5, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI", color: C.grey,
    });
  });
  slide.addText("AdminPage.tsx  ·  AdminLoginPage.tsx  ·  LoginModal.tsx", {
    x: 7.2, y: 5.7, w: 5.4, h: 0.3,
    fontSize: 9, fontFace: "Consolas", color: C.accent4,
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 7 — BACKEND & DATABASE
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "06", "BACKEND & DATABASE");
  addSectionTitle(slide, "Backend & Data", "Backend Module & Database Design");

  // Left — API Endpoints
  slide.addText("⚙️  5. RESTful API Server", {
    x: 0.5, y: 2.3, w: 5, h: 0.4,
    fontSize: 13, fontFace: "Segoe UI Semibold", color: C.accent1,
  });

  const apiRows = [
    ["GET", "/api/hostels", "Fetch all hostel listings"],
    ["POST", "/api/hostels", "Add a new hostel"],
    ["DELETE", "/api/hostels/:id", "Remove a hostel listing"],
    ["POST", "/api/bookings", "Create a new booking"],
    ["POST", "/api/sync/google", "Bulk sync from Google Places"],
  ];

  // Table header
  addCard(slide, 0.5, 2.8, 6, 0.4, C.accent2);
  slide.addText("Method", { x: 0.7, y: 2.82, w: 1.2, h: 0.35, fontSize: 9, fontFace: "Segoe UI", color: C.accent2, bold: true });
  slide.addText("Endpoint", { x: 1.9, y: 2.82, w: 2.3, h: 0.35, fontSize: 9, fontFace: "Segoe UI", color: C.accent2, bold: true });
  slide.addText("Description", { x: 4.2, y: 2.82, w: 2.3, h: 0.35, fontSize: 9, fontFace: "Segoe UI", color: C.accent2, bold: true });

  apiRows.forEach((r, i) => {
    const ry = 3.3 + i * 0.45;
    addCard(slide, 0.5, ry, 6, 0.38);
    slide.addText(r[0], { x: 0.7, y: ry, w: 1.2, h: 0.38, fontSize: 9.5, fontFace: "Consolas", color: C.accent2, bold: true });
    slide.addText(r[1], { x: 1.9, y: ry, w: 2.3, h: 0.38, fontSize: 9.5, fontFace: "Consolas", color: C.white });
    slide.addText(r[2], { x: 4.2, y: ry, w: 2.3, h: 0.38, fontSize: 9.5, fontFace: "Segoe UI", color: C.grey });
  });

  // Right — Schema
  slide.addText("📄  Database Schema", {
    x: 7, y: 2.3, w: 5, h: 0.4,
    fontSize: 13, fontFace: "Segoe UI Semibold", color: C.accent3,
  });

  // Hostel Schema
  addCard(slide, 7, 2.8, 5.8, 2.2, C.accent1);
  slide.addText("Hostel Document", {
    x: 7.2, y: 2.88, w: 5.4, h: 0.3,
    fontSize: 11, fontFace: "Segoe UI Semibold", color: C.accent1,
  });
  slide.addText(
    "name: String (indexed)\nlocation: String\ncoordinates: [Lat, Lng]\nprice: Number\nrating: Number (0-5)\namenities: [String]\nimages: [String]\nisAC: Boolean\navailableRooms: Number", {
    x: 7.2, y: 3.2, w: 5.4, h: 1.7,
    fontSize: 9, fontFace: "Consolas", color: C.grey, lineSpacingMultiple: 1.35, valign: "top",
  });

  // Booking Schema
  addCard(slide, 7, 5.15, 5.8, 1.7, C.accent3);
  slide.addText("Booking Document", {
    x: 7.2, y: 5.22, w: 5.4, h: 0.3,
    fontSize: 11, fontFace: "Segoe UI Semibold", color: C.accent3,
  });
  slide.addText(
    "userId: String\nhostelId: ObjectId (ref)\ncheckIn / checkOut: Date\ntotal: Number\nstatus: Enum (Confirmed/Pending/Cancelled)\nroomType: String\nbookingDate: Date (auto)", {
    x: 7.2, y: 5.55, w: 5.4, h: 1.2,
    fontSize: 9, fontFace: "Consolas", color: C.grey, lineSpacingMultiple: 1.3, valign: "top",
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 8 — TECHNOLOGY STACK
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "07", "TECH STACK");
  addSectionTitle(slide, "Technologies Used", "Technology Stack");

  const techs = [
    ["⚛️", "React 18", "Concurrent rendering,\nhooks, Context API"],
    ["🟢", "Node.js", "Event-driven,\nnon-blocking I/O"],
    ["🍃", "MongoDB", "NoSQL document store\nwith geospatial indexes"],
    ["⚡", "Vite 6.0", "Lightning-fast HMR,\nESM-native bundling"],
    ["🗺️", "Leaflet.js", "Interactive maps with\nOpenStreetMap tiles"],
    ["🎨", "TailwindCSS", "Utility-first CSS\nfor rapid UI dev"],
    ["📡", "Axios", "Promise-based HTTP\nwith interceptors"],
    ["🌍", "Google Places", "Real-world hostel\ndata sync"],
  ];

  techs.forEach((t, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const tx = 0.7 + col * 3.15;
    const ty = 2.3 + row * 2.5;
    addCard(slide, tx, ty, 2.8, 2.1);
    slide.addText(t[0], {
      x: tx, y: ty + 0.15, w: 2.8, h: 0.55,
      fontSize: 28, align: "center",
    });
    slide.addText(t[1], {
      x: tx, y: ty + 0.75, w: 2.8, h: 0.35,
      fontSize: 12, fontFace: "Segoe UI Semibold", color: C.white, align: "center",
    });
    slide.addText(t[2], {
      x: tx + 0.2, y: ty + 1.15, w: 2.4, h: 0.7,
      fontSize: 9, fontFace: "Segoe UI", color: C.grey, align: "center", lineSpacingMultiple: 1.4,
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 9 — TESTING & RESULTS
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "08", "TESTING");
  addSectionTitle(slide, "Quality Assurance", "Testing & Results");

  // Table header
  addCard(slide, 0.5, 2.3, 12, 0.5, C.accent2);
  const headers = [
    { t: "Test ID", x: 0.7, w: 1.2 },
    { t: "Area", x: 1.9, w: 1.8 },
    { t: "Scenario", x: 3.7, w: 5.5 },
    { t: "Result", x: 9.2, w: 1.2 },
  ];
  headers.forEach(h => {
    slide.addText(h.t, {
      x: h.x, y: 2.35, w: h.w, h: 0.4,
      fontSize: 9.5, fontFace: "Segoe UI", color: C.accent2, bold: true, letterSpacing: 1,
    });
  });

  const tests = [
    ["TS-001", "Authentication", "Valid admin login → redirects to Admin Panel", "✅ PASS"],
    ["TS-002", "Sync Engine", "Google Places sync populates DB in <2s", "✅ PASS"],
    ["TS-003", "Search", "City search filters results in <500ms", "✅ PASS"],
    ["TS-004", "Booking", "Price calculation & booking record creation", "✅ PASS"],
    ["TS-005", "CRUD", "Admin delete removes item from DB & UI", "✅ PASS"],
    ["TS-006", "Edge Case", "Invalid date range blocked by validation", "✅ PASS"],
  ];

  tests.forEach((r, i) => {
    const ry = 2.95 + i * 0.52;
    addCard(slide, 0.5, ry, 12, 0.44);
    slide.addText(r[0], { x: 0.7, y: ry, w: 1.2, h: 0.44, fontSize: 10, fontFace: "Segoe UI Semibold", color: C.white });
    slide.addText(r[1], { x: 1.9, y: ry, w: 1.8, h: 0.44, fontSize: 10, fontFace: "Segoe UI", color: C.grey });
    slide.addText(r[2], { x: 3.7, y: ry, w: 5.5, h: 0.44, fontSize: 10, fontFace: "Segoe UI", color: C.grey });
    slide.addText(r[3], { x: 9.2, y: ry, w: 1.5, h: 0.44, fontSize: 10, fontFace: "Segoe UI Semibold", color: C.accent2 });
  });

  // Summary stats
  const stats = [
    ["6/6", "Tests Passed"],
    ["100%", "Pass Rate"],
    ["4", "Testing Phases"],
  ];
  stats.forEach((s, i) => {
    const sx = 2.5 + i * 3;
    addCard(slide, sx, 6.2, 2.5, 0.9);
    slide.addText(s[0], {
      x: sx, y: 6.2, w: 2.5, h: 0.5,
      fontSize: 22, fontFace: "Segoe UI", color: C.accent2, bold: true, align: "center",
    });
    slide.addText(s[1], {
      x: sx, y: 6.7, w: 2.5, h: 0.3,
      fontSize: 9, fontFace: "Segoe UI", color: C.grey, align: "center",
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 10 — CONCLUSION
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  addBgAndDecor(slide);
  addSlideNumber(slide, "09", "CONCLUSION");
  addSectionTitle(slide, "Summary", "Conclusion");

  // Left — Achievements
  slide.addText("✅  Key Achievements", {
    x: 0.5, y: 2.2, w: 6, h: 0.4,
    fontSize: 14, fontFace: "Segoe UI Semibold", color: C.accent1,
  });

  const achievements = [
    ["Zero-Friction Search", "Geocoding + split-screen map delivers instant, location-aware hostel discovery."],
    ["Data Sustainability", "Google Places sync with intelligent mock fallback ensures reliable data."],
    ["Premium UI/UX", "Glassmorphism design, responsive layouts, and smooth animations."],
    ["Scalable Architecture", "Modular MERN stack ready for production deployment."],
  ];

  achievements.forEach((a, i) => {
    const ay = 2.7 + i * 0.9;
    slide.addShape(pptx.shapes.OVAL, {
      x: 0.6, y: ay + 0.1, w: 0.32, h: 0.32, 
      fill: { type: "solid", color: "0D2E24" },
    });
    slide.addText("✓", {
      x: 0.6, y: ay + 0.07, w: 0.32, h: 0.35,
      fontSize: 11, fontFace: "Segoe UI", color: C.accent2, align: "center", bold: true,
    });
    slide.addText(a[0], {
      x: 1.1, y: ay, w: 5.2, h: 0.3,
      fontSize: 11.5, fontFace: "Segoe UI Semibold", color: C.white,
    });
    slide.addText(a[1], {
      x: 1.1, y: ay + 0.3, w: 5.2, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI", color: C.grey,
    });
  });

  // Right — Future
  slide.addText("🚀  Future Enhancements", {
    x: 7, y: 2.2, w: 6, h: 0.4,
    fontSize: 14, fontFace: "Segoe UI Semibold", color: C.accent3,
  });

  const future = [
    ["💬", "Real-Time Chat", "Socket.io for user-owner messaging"],
    ["💳", "Payment Gateway", "Stripe Connect for live transactions"],
    ["📍", "Geofencing", "Auto check-in via proximity detection"],
    ["🌐", "Multi-Language", "i18next for international travelers"],
  ];

  future.forEach((f, i) => {
    const fy = 2.75 + i * 1.05;
    addCard(slide, 7, fy, 5.8, 0.85);
    slide.addText(f[0], {
      x: 7.15, y: fy + 0.05, w: 0.5, h: 0.35, fontSize: 16,
    });
    slide.addText(f[1], {
      x: 7.7, y: fy + 0.08, w: 4.8, h: 0.3,
      fontSize: 11, fontFace: "Segoe UI Semibold", color: C.white,
    });
    slide.addText(f[2], {
      x: 7.7, y: fy + 0.42, w: 4.8, h: 0.3,
      fontSize: 9.5, fontFace: "Segoe UI", color: C.grey,
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SLIDE 11 — THANK YOU
// ═══════════════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { fill: C.bg };

  slide.addShape(pptx.shapes.OVAL, {
    x: 7, y: -2, w: 8, h: 8,
    fill: { type: "solid", color: C.accent1 }, transparency: 90,
  });
  slide.addShape(pptx.shapes.OVAL, {
    x: -2, y: 3, w: 7, h: 7,
    fill: { type: "solid", color: C.accent3 }, transparency: 92,
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 0, w: 13.33, h: 0.06,
    fill: { type: "solid", color: C.accent1 },
  });

  slide.addText("STAY-NEST", {
    x: 0, y: 1.5, w: 13.33, h: 0.5,
    fontSize: 14, fontFace: "Segoe UI", color: C.accent2, align: "center", bold: true, letterSpacing: 8,
  });

  slide.addText("Thank You!", {
    x: 0, y: 2.2, w: 13.33, h: 1.5,
    fontSize: 56, fontFace: "Segoe UI", color: C.white, align: "center", bold: true,
  });

  slide.addText("Questions & Discussion", {
    x: 0, y: 3.8, w: 13.33, h: 0.6,
    fontSize: 18, fontFace: "Segoe UI", color: C.grey, align: "center",
  });

  const contacts = [
    ["Project", "Stay-nest: Hostel Booking Platform"],
    ["Tech Stack", "React · Node.js · MongoDB · Leaflet"],
    ["Repository", "github.com/shakthi-afk/Stay-nest"],
  ];
  contacts.forEach((c, i) => {
    const cx = 2 + i * 3.3;
    addCard(slide, cx, 5, 2.9, 1);
    slide.addText(c[0], {
      x: cx + 0.2, y: 5.1, w: 2.5, h: 0.25,
      fontSize: 8, fontFace: "Segoe UI", color: C.grey, bold: true, letterSpacing: 1,
    });
    slide.addText(c[1], {
      x: cx + 0.2, y: 5.4, w: 2.5, h: 0.35,
      fontSize: 10, fontFace: "Segoe UI Semibold", color: C.white,
    });
  });
}

// ═══════════════════════════════════════════════════════
//  SAVE
// ═══════════════════════════════════════════════════════
const outputPath = "StayNest_Presentation.pptx";
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`\n✅ PPT generated successfully: ${outputPath}`))
  .catch(err => console.error("Error:", err));
