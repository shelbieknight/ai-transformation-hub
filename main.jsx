import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Inbox, SlidersHorizontal, GitBranch, Bot, Users,
  Plus, X, Zap, AlertTriangle, CheckCircle2, Circle, Trash2, ArrowRight, RefreshCw,
  Trophy, Flame, Wrench, GraduationCap, Share2, Lightbulb, Award, Sparkles, Presentation,
  Link as LinkIcon, ExternalLink, Info
} from "lucide-react";

/* ---------- palette + type ---------- */
const C = {
  ink: "#16161F", inkSoft: "#23242F", railText: "#A9ABB8",
  canvas: "#F6F7F9", card: "#FFFFFF", border: "#E9EBF0",
  text: "#171821", sub: "#646573", faint: "#74757F",
  accent: "#6E49CB", accent2: "#8B5CF6", accentSoft: "#EEE9FB",
  green: "#0E9F6E", greenSoft: "#E4F5EE",
  amber: "#B26C0F", amberSoft: "#FAF0DA",
  red: "#D14343", redSoft: "#FBE9E9",
  coral: "#E2622E", coralSoft: "#FBEDE3",
  slate: "#5B6470", slateSoft: "#EDEFF3",
  shadowSm: "0 1px 2px rgba(16,17,33,0.04), 0 1px 3px rgba(16,17,33,0.05)",
  shadow: "0 4px 16px rgba(16,17,33,0.06), 0 1px 3px rgba(16,17,33,0.04)",
};
const DISPLAY = '"Space Grotesk", ui-sans-serif, system-ui, sans-serif';
const SANS = '"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const STAGES = ["Backlog", "Prototyping", "Live", "Sunset"];
const TYPES = ["Pain point", "Idea", "Tool request", "Agent request"];
const SOURCES = ["Inbound request", "Discovery interview", "Workflow audit", "Champion network", "Leadership ask", "Usage data"];
const OVERRIDES = ["Sponsor ask", "Compliance", "Security", "Unblocks others"];
const PATTERNS = ["Prompt", "Workflow", "RAG", "Agent"];
const READINESS = [["context", "Context"], ["guardrails", "Guardrails"], ["limits", "Cost/latency"], ["fallback", "Fallback"], ["hitl", "Human-in-loop"], ["monitoring", "Monitoring"]];
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);

/* persistence: window.storage in the Claude runtime, localStorage when deployed, memory as a last resort */
const STORE_KEY = "aihub:data";
const store = {
  async get() {
    try { if (typeof window !== "undefined" && window.storage) { const r = await window.storage.get(STORE_KEY); return r ? r.value : null; } } catch {}
    try { if (typeof localStorage !== "undefined") return localStorage.getItem(STORE_KEY); } catch {}
    return null;
  },
  async set(val) {
    try { if (typeof window !== "undefined" && window.storage) { await window.storage.set(STORE_KEY, val, false); return; } } catch {}
    try { if (typeof localStorage !== "undefined") localStorage.setItem(STORE_KEY, val); } catch {}
  },
};

/* ---------- seed data ---------- */
const seed = () => ({
  seeded: true,
  method: "RICE",
  assumptions: { hourlyRate: 75, weeksPerYear: 48, functionHeadcount: 60, teams: ["Integrated Marketing", "Brand and Product Marketing", "Developer Relations", "Marketing Operations and Analytics", "Sales Development", "Corporate Communications", "Enterprise Data"] },
  submissions: [
    { id: uid(), title: "Developer content gap finder across docs and blog", submitter: "Sam H.", team: "Developer Relations", type: "Tool request",
      workflow: "Developer content strategy", currentState: "Gap analysis is ad hoc and rarely refreshed", desiredOutcome: "Ranked gap list refreshed monthly",
      hundredX: false, status: "New", source: "Champion network", createdAt: today() },
    { id: uid(), title: "Webinar abstract generator from session recordings", submitter: "Ana L.", team: "Integrated Marketing", type: "Idea",
      workflow: "Webinar production", currentState: "Abstracts written by hand for each session", desiredOutcome: "Draft abstract generated from the recording, owner edits",
      hundredX: false, status: "New", source: "Inbound request", createdAt: today() },
    { id: uid(), title: "Persona-based ABM copy generator", submitter: "Dana R.", team: "Brand and Product Marketing", type: "Idea",
      workflow: "Account-based marketing", currentState: "Copy rewritten by hand per persona and segment", desiredOutcome: "Persona-tuned variants drafted from one brief",
      hundredX: false, status: "New", source: "Discovery interview", createdAt: today() },
    { id: uid(), title: "Event follow-up email drafter", submitter: "Lena K.", team: "Sales Development", type: "Tool request",
      workflow: "Field and event follow-up", currentState: "Reps write follow-ups from scratch after each event", desiredOutcome: "Draft follow-up per attendee from session and CRM data",
      hundredX: false, status: "New", source: "Inbound request", createdAt: today() },
    { id: uid(), title: "Press-release boilerplate localizer", submitter: "Marco D.", team: "Corporate Communications", type: "Idea",
      workflow: "Global communications", currentState: "Boilerplate localized manually for each region", desiredOutcome: "Region-ready boilerplate drafted, comms reviews",
      hundredX: false, status: "New", source: "Leadership ask", createdAt: today() },
    { id: uid(), title: "Data dictionary Q&A assistant", submitter: "Tom B.", team: "Enterprise Data", type: "Tool request",
      workflow: "Marketing data governance", currentState: "Teams ping data team to find field definitions", desiredOutcome: "Self-serve answers grounded in the governed dictionary",
      hundredX: false, status: "New", source: "Workflow audit", createdAt: today() },
    { id: uid(), title: "Marketing-site QA agent for style guide and broken links", submitter: "Eli T.", team: "Integrated Marketing", type: "Agent request",
      workflow: "about.gitlab.com publishing", currentState: "Style and link checks on site merge requests are manual and inconsistent", desiredOutcome: "Agent flags style-guide and link issues on every site merge request",
      hundredX: false, status: "Triaged", source: "Discovery interview", override: "Compliance", reach: 20, impact: 1, confidence: 0.8, effort: 3, costOfDelay: 3, moscow: "Should", createdAt: today() },
    { id: uid(), title: "Campaign UTM builder and validator", submitter: "Jordan P.", team: "Marketing Operations and Analytics", type: "Tool request",
      workflow: "Campaign tracking", currentState: "UTMs hand-built in spreadsheets, errors break reporting", desiredOutcome: "Validated UTMs generated from a guided form",
      hundredX: false, status: "Triaged", source: "Workflow audit", reach: 40, impact: 1, confidence: 1, effort: 0.5, costOfDelay: 3, moscow: "Should", createdAt: today() },
    { id: uid(), title: "Analyst-report summarizer", submitter: "Dana R.", team: "Brand and Product Marketing", type: "Tool request",
      workflow: "Competitive and analyst intelligence", currentState: "PMMs read full analyst reports to pull a few takeaways", desiredOutcome: "Structured summary with citations, PMM verifies",
      hundredX: true, status: "Triaged", source: "Champion network", reach: 15, impact: 2, confidence: 0.8, effort: 1, costOfDelay: 9, moscow: "Must", createdAt: today(),
      attachments: [{ id: uid(), kind: "link", name: "Analyst relations workflow", url: "https://handbook.gitlab.com/handbook/marketing/" }] },
  ],
  initiatives: [
    { id: uid(), title: "SDR email personalizer", stage: "Backlog", owner: "Unassigned", champion: "",
      kpi: "Reply rate", blocker: "", hundredX: false, scoreNum: 8, scoreLabel: "RICE 8" },
    { id: uid(), title: "Persona-based landing page assembler", stage: "Backlog", owner: "Unassigned", champion: "",
      kpi: "Conversion rate", blocker: "", hundredX: false, scoreNum: 6, scoreLabel: "RICE 6" },
    { id: uid(), title: "Knowledge-base answer drafter", stage: "Backlog", owner: "You", champion: "Sam H. (Developer Relations)",
      kpi: "Deflection rate", blocker: "", hundredX: false, scoreNum: 7, scoreLabel: "RICE 7" },
    { id: uid(), title: "Social post repurposer", stage: "Backlog", owner: "Unassigned", champion: "",
      kpi: "Posts / week", blocker: "", hundredX: false, scoreNum: 5, scoreLabel: "RICE 5" },
    { id: uid(), title: "Lead-routing assistant", stage: "Prototyping", owner: "You", champion: "Jordan P. (Marketing Operations and Analytics)",
      kpi: "Routing accuracy", blocker: "Awaiting CRM field mapping", hundredX: false, scoreNum: 14, scoreLabel: "RICE 14" },
    { id: uid(), title: "Sales deck personalizer", stage: "Prototyping", owner: "You", champion: "Lena K. (Sales Development)",
      kpi: "Deck turnaround time", blocker: "", hundredX: false, scoreNum: 11, scoreLabel: "RICE 11" },
    { id: uid(), title: "ABM account researcher", stage: "Prototyping", owner: "You", champion: "Dana R. (Brand and Product Marketing)",
      kpi: "Research hours saved", blocker: "", hundredX: false, scoreNum: 9, scoreLabel: "RICE 9" },
    { id: uid(), title: "Release-post drafter", stage: "Live", owner: "You", champion: "Priya N. (Integrated Marketing)",
      kpi: "Hours saved / release", blocker: "", hundredX: true, scoreNum: 20, scoreLabel: "RICE 20" },
    { id: uid(), title: "Competitive Intel Digest", stage: "Live", owner: "You", champion: "Dana R. (Brand and Product Marketing)",
      kpi: "PMM hours saved / week", blocker: "", hundredX: false, scoreNum: 18, scoreLabel: "RICE 18" },
    { id: uid(), title: "Blog SEO optimizer", stage: "Live", owner: "You", champion: "",
      kpi: "Organic sessions / post", blocker: "", hundredX: false, scoreNum: 16, scoreLabel: "RICE 16" },
    { id: uid(), title: "Sales call-notes summarizer", stage: "Live", owner: "You", champion: "Lena K. (Sales Development)",
      kpi: "Rep hours saved / week", blocker: "", hundredX: false, scoreNum: 15, scoreLabel: "RICE 15" },
    { id: uid(), title: "Content brief generator", stage: "Live", owner: "You", champion: "Priya N. (Integrated Marketing)",
      kpi: "Brief turnaround time", blocker: "", hundredX: false, scoreNum: 13, scoreLabel: "RICE 13" },
    { id: uid(), title: "Email subject-line tester", stage: "Live", owner: "Ana L.", champion: "",
      kpi: "Email open rate", blocker: "", hundredX: false, scoreNum: 12, scoreLabel: "RICE 12" },
    { id: uid(), title: "Legacy social scheduler", stage: "Sunset", owner: "You", champion: "",
      kpi: "Posts scheduled / week", blocker: "Replaced by native platform scheduling", hundredX: false, scoreNum: 4, scoreLabel: "RICE 4" },
    { id: uid(), title: "Old newsletter merge macro", stage: "Sunset", owner: "You", champion: "",
      kpi: "Newsletters / month", blocker: "Replaced by ESP-native templates", hundredX: false, scoreNum: 3, scoreLabel: "RICE 3" },
  ],
  agents: [
    { id: uid(), name: "Release-post drafter", purpose: "Drafts release-post copy from milestone merge requests and issue notes", owner: "You",
      platform: "Claude + skills file", pattern: "Workflow", kpi: "Hours saved / release", weeklyHours: 10, lastEval: today(), status: "Healthy",
      readiness: { context: true, guardrails: true, limits: true, fallback: true, hitl: true, monitoring: true } },
    { id: uid(), name: "Sales call-notes summarizer", purpose: "Turns call recordings into structured notes and next steps", owner: "You",
      platform: "Glean", pattern: "RAG", kpi: "Rep hours saved / week", weeklyHours: 9, lastEval: today(), status: "Healthy",
      readiness: { context: true, guardrails: true, limits: true, fallback: false, hitl: true, monitoring: true } },
    { id: uid(), name: "Competitive Intel Digest", purpose: "Summarizes competitor and analyst sources into a weekly draft", owner: "You",
      platform: "Glean", pattern: "RAG", kpi: "8 PMM hrs saved / wk", weeklyHours: 8, lastEval: today(), status: "Healthy",
      readiness: { context: true, guardrails: true, limits: true, fallback: false, hitl: true, monitoring: true } },
    { id: uid(), name: "Content brief generator", purpose: "Builds content briefs from a topic, audience, and SEO data", owner: "You",
      platform: "Claude + skills file", pattern: "Workflow", kpi: "Brief turnaround time", weeklyHours: 7, lastEval: today(), status: "Healthy",
      readiness: { context: true, guardrails: true, limits: false, fallback: true, hitl: true, monitoring: true } },
    { id: uid(), name: "Blog SEO optimizer", purpose: "Suggests on-page SEO improvements for new blog posts before publish", owner: "You",
      platform: "Claude + skills file", pattern: "Agent", kpi: "Organic sessions / post", weeklyHours: 6, lastEval: today(), status: "Healthy",
      readiness: { context: true, guardrails: true, limits: false, fallback: true, hitl: true, monitoring: true } },
    { id: uid(), name: "Email subject-line tester", purpose: "Scores and rewrites subject lines against past open-rate data", owner: "Ana L.",
      platform: "GitLab CI + LLM", pattern: "Workflow", kpi: "Email open rate", weeklyHours: 5, lastEval: "2026-04-02", status: "Needs eval",
      readiness: { context: true, guardrails: false, limits: false, fallback: false, hitl: true, monitoring: true } },
    { id: uid(), name: "Legacy social scheduler", purpose: "Auto-scheduled recurring social posts", owner: "You",
      platform: "Workato", pattern: "Workflow", kpi: "Posts / wk", weeklyHours: 0, lastEval: "2026-01-15", status: "Deprecated",
      readiness: { context: false, guardrails: false, limits: false, fallback: false, hitl: false, monitoring: false } },
    { id: uid(), name: "Old newsletter merge macro", purpose: "Merged newsletter content from a spreadsheet", owner: "You",
      platform: "Workato", pattern: "Workflow", kpi: "Newsletters / mo", weeklyHours: 0, lastEval: "2026-02-10", status: "Deprecated",
      readiness: { context: false, guardrails: false, limits: false, fallback: false, hitl: false, monitoring: false } },
  ],
  champions: [
    { id: uid(), name: "Priya N.", team: "Integrated Marketing", commitment: "10%", shipped: 3, focus: "Release + campaign automation" },
    { id: uid(), name: "Dana R.", team: "Brand and Product Marketing", commitment: "10%", shipped: 2, focus: "Competitive intel" },
    { id: uid(), name: "Sam H.", team: "Developer Relations", commitment: "5%", shipped: 1, focus: "Developer content tooling" },
    { id: uid(), name: "Jordan P.", team: "Marketing Operations and Analytics", commitment: "10%", shipped: 2, focus: "MktgOps automation" },
    { id: uid(), name: "Lena K.", team: "Sales Development", commitment: "5%", shipped: 1, focus: "Outbound personalization" },
    { id: uid(), name: "Marco D.", team: "Corporate Communications", commitment: "5%", shipped: 1, focus: "PR + comms drafting" },
    { id: uid(), name: "Tom B.", team: "Enterprise Data", commitment: "5%", shipped: 0, focus: "Governed data access for agents" },
  ],
  people: [
    { id: uid(), name: "You", team: "Marketing Operations and Analytics", activities: [...mkActs("gemini", 24), ...mkActs("build", 3), ...mkActs("share", 3), ...mkActs("demo", 2), ...mkActs("train", 2), ...mkActs("idea", 3)] },
    { id: uid(), name: "Priya N.", team: "Integrated Marketing", activities: [...mkActs("gemini", 20), ...mkActs("build", 2), ...mkActs("share", 2), ...mkActs("demo", 1), ...mkActs("idea", 2)] },
    { id: uid(), name: "Dana R.", team: "Brand and Product Marketing", activities: [...mkActs("gemini", 18), ...mkActs("demo", 1), ...mkActs("train", 1), ...mkActs("idea", 1)] },
    { id: uid(), name: "Jordan P.", team: "Marketing Operations and Analytics", activities: [...mkActs("gemini", 16), ...mkActs("build", 2), ...mkActs("share", 1)] },
    { id: uid(), name: "Ana L.", team: "Integrated Marketing", activities: [...mkActs("gemini", 14), ...mkActs("build", 1), ...mkActs("idea", 1)] },
    { id: uid(), name: "Marco D.", team: "Corporate Communications", activities: [...mkActs("gemini", 12), ...mkActs("build", 1)] },
    { id: uid(), name: "Lena K.", team: "Sales Development", activities: [...mkActs("gemini", 10), ...mkActs("train", 1), ...mkActs("share", 1)] },
    { id: uid(), name: "Sam H.", team: "Developer Relations", activities: [...mkActs("gemini", 9), ...mkActs("share", 1)] },
    { id: uid(), name: "Eli T.", team: "Integrated Marketing", activities: [...mkActs("gemini", 7), ...mkActs("idea", 1)] },
    { id: uid(), name: "Tom B.", team: "Enterprise Data", activities: [...mkActs("gemini", 5)] },
  ],
});

const IMPACT_OPTS = [["Massive", 3], ["High", 2], ["Medium", 1], ["Low", 0.5], ["Minimal", 0.25]];
const CONF_OPTS = [["High · 100%", 1], ["Medium · 80%", 0.8], ["Low · 50%", 0.5]];
const EFFORT_OPTS = [["< 1 week", 0.25], ["~2 weeks", 0.5], ["~1 month", 1], ["~1 quarter", 3], ["2+ quarters", 6]];
const COD_OPTS = [["Critical", 12], ["High", 9], ["Medium", 3], ["Low", 1]];
const MOSCOW_CATS = ["Must", "Should", "Could", "Won't"];
const MOSCOW_RANK = { Must: 4, Should: 3, Could: 2, "Won't": 1 };
const FIELD_DEFS = {
  reach: { label: "Reach", type: "num", hint: "people / qtr" },
  impact: { label: "Impact", type: "map", opts: IMPACT_OPTS },
  confidence: { label: "Confidence", type: "map", opts: CONF_OPTS },
  effort: { label: "Effort", type: "map", opts: EFFORT_OPTS },
  costOfDelay: { label: "Cost of delay", type: "map", opts: COD_OPTS },
  moscow: { label: "Category", type: "cat", opts: MOSCOW_CATS },
};
const allNums = (s, keys) => keys.every((k) => typeof s[k] === "number");
const METHODS = {
  RICE: { label: "RICE", blurb: "Reach × Impact × Confidence ÷ Effort. The default for ranking comparable items on a shared scale.",
    fields: ["reach", "impact", "confidence", "effort"],
    score: (s) => allNums(s, ["reach", "impact", "confidence", "effort"]) && s.effort ? Math.round((s.reach * s.impact * s.confidence) / s.effort) : null },
  ICE: { label: "ICE", blurb: "Impact × Confidence ÷ Effort. Faster than RICE; drops reach for quick calls with less data.",
    fields: ["impact", "confidence", "effort"],
    score: (s) => allNums(s, ["impact", "confidence", "effort"]) && s.effort ? Math.round((s.impact * s.confidence) / s.effort * 10) : null },
  "Value / Effort": { label: "Value / Effort", blurb: "Value ÷ Effort. The fastest first-cut triage. Impact stands in for value here.",
    fields: ["impact", "effort"],
    score: (s) => allNums(s, ["impact", "effort"]) && s.effort ? Math.round((s.impact / s.effort) * 10) : null },
  WSJF: { label: "WSJF", blurb: "Cost of delay ÷ job size. Use when urgency and sequencing dominate. Effort stands in for job size.",
    fields: ["costOfDelay", "effort"],
    score: (s) => allNums(s, ["costOfDelay", "effort"]) && s.effort ? Math.round(s.costOfDelay / s.effort) : null },
  MoSCoW: { label: "MoSCoW", blurb: "Must / Should / Could / Won't. Categorical rather than numeric; good for release scope.",
    fields: ["moscow"], categorical: true,
    score: (s) => MOSCOW_RANK[s.moscow] ?? null },
};

const ACTIVITY_TYPES = [
  { key: "gemini", label: "Used GitLab Duo / AI tool", points: 5, auto: true },
  { key: "build", label: "Built an automation or agent", points: 50 },
  { key: "share", label: "Shared a reusable prompt or skill", points: 20 },
  { key: "train", label: "Completed AI training", points: 30 },
  { key: "demo", label: "Ran a demo or workshop", points: 40 },
  { key: "idea", label: "Submitted an AI idea", points: 10 },
];
const ATYPE = Object.fromEntries(ACTIVITY_TYPES.map((t) => [t.key, t]));
const mkActs = (type, n) => Array.from({ length: n }, () => ({ id: uid(), type, date: today(), source: ATYPE[type]?.auto ? "auto" : "manual" }));
const pointsOf = (acts) => acts.reduce((s, a) => s + (ATYPE[a.type]?.points || 0), 0);
const LEVELS = [
  { name: "Explorer", min: 0 }, { name: "Builder", min: 100 }, { name: "Operator", min: 250 },
  { name: "Catalyst", min: 500 }, { name: "Luminary", min: 1000 },
];
const levelFor = (pts) => {
  let lvl = LEVELS[0], next = LEVELS[1] || null;
  LEVELS.forEach((L, i) => { if (pts >= L.min) { lvl = L; next = LEVELS[i + 1] || null; } });
  return { lvl, next, progress: next ? (pts - lvl.min) / (next.min - lvl.min) : 1 };
};
const BADGES = [
  { key: "first", name: "First Steps", hint: "Log your first activity", earned: (a) => a.length >= 1 },
  { key: "daily", name: "Daily Driver", hint: "15+ tool-use events", earned: (a) => a.filter((x) => x.type === "gemini").length >= 15 },
  { key: "builder", name: "Builder", hint: "Build an automation or agent", earned: (a) => a.some((x) => x.type === "build") },
  { key: "mentor", name: "Mentor", hint: "Run a demo or workshop", earned: (a) => a.some((x) => x.type === "demo") },
  { key: "sharer", name: "Sharer", hint: "Share a prompt or skill", earned: (a) => a.some((x) => x.type === "share") },
  { key: "ideas", name: "Idea Machine", hint: "Submit 2+ ideas", earned: (a) => a.filter((x) => x.type === "idea").length >= 2 },
  { key: "century", name: "Centurion", hint: "Reach 250 points", earned: (a, pts) => pts >= 250 },
];
const BADGE_ICON = { first: Sparkles, daily: Flame, builder: Wrench, mentor: Presentation, sharer: Share2, ideas: Lightbulb, century: Award };

/* ---------- small UI atoms ---------- */
const Pill = ({ label, bg, fg, icon: Icon }) => (
  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    style={{ backgroundColor: bg, color: fg }}>
    {Icon && <Icon size={12} />}{label}
  </span>
);

const statusPill = (status) => {
  const m = {
    Healthy: [C.greenSoft, C.green, CheckCircle2],
    "Needs eval": [C.amberSoft, C.amber, AlertTriangle],
    Deprecated: [C.redSoft, C.red, Circle],
    Live: [C.greenSoft, C.green, CheckCircle2],
    Prototyping: [C.accentSoft, C.accent, Circle],
    Backlog: [C.slateSoft, C.slate, Circle],
    Sunset: [C.redSoft, C.red, Circle],
    New: [C.accentSoft, C.accent, Circle],
    Triaged: [C.slateSoft, C.slate, Circle],
  }[status] || [C.slateSoft, C.slate, Circle];
  return <Pill label={status} bg={m[0]} fg={m[1]} icon={m[2]} />;
};

const Card = ({ children, style }) => (
  <div className="rounded-2xl" style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: C.shadowSm, ...style }}>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium" style={{ color: C.sub }}>{label}</span>
    {children}
  </label>
);

const inputStyle = { border: `1px solid ${C.border}`, color: C.text, backgroundColor: "#FCFCFD", fontFamily: SANS };
const Input = (p) => <input {...p} className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" style={{ ...inputStyle, ...(p.style || {}) }} />;
const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={onChange} className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" style={inputStyle}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const Btn = ({ children, onClick, variant = "primary", icon: Icon, small }) => {
  const styles = variant === "primary"
    ? { background: `linear-gradient(135deg, ${C.accent2}, ${C.accent})`, color: "#fff", border: "none", boxShadow: "0 1px 2px rgba(110,73,203,0.35)" }
    : variant === "ghost"
    ? { backgroundColor: "transparent", color: C.sub, border: `1px solid ${C.border}` }
    : { backgroundColor: "#fff", color: C.text, border: `1px solid ${C.border}` };
  return (
    <button onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-400 focus:outline-none ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}`}
      style={styles}>
      {Icon && <Icon size={small ? 13 : 15} />}{children}
    </button>
  );
};

const Modal = ({ title, onClose, children }) => {
  const ref = useRef(null);
  const titleId = useRef("m" + uid()).current;
  useEffect(() => {
    const el = ref.current;
    const prev = typeof document !== "undefined" ? document.activeElement : null;
    el?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); try { prev && prev.focus(); } catch {} };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      style={{ backgroundColor: "rgba(20,20,28,0.45)" }} onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="w-full max-w-lg rounded-t-2xl outline-none sm:rounded-2xl" style={{ backgroundColor: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 id={titleId} className="text-sm font-semibold" style={{ color: C.text }}>{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="rounded focus-visible:ring-2 focus-visible:ring-violet-300 focus:outline-none" style={{ color: C.faint }}><X size={18} /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
};

const IconBtn = ({ icon: Icon, label, onClick, color }) => (
  <button onClick={onClick} aria-label={label} title={label}
    className="rounded-md p-1.5 transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-violet-300 focus:outline-none"
    style={{ color: color || C.faint }}>
    <Icon size={15} />
  </button>
);

const Metric = ({ value, label, sublabel, accent }) => (
  <Card style={{ padding: "18px 20px", minHeight: 110, display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 32, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: accent || C.text }}>{value}</div>
    <div className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: C.sub }}>{label}</div>
    {sublabel && <div className="mt-1 text-[11px]" style={{ color: C.faint }}>{sublabel}</div>}
  </Card>
);

const MiniBar = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.k} className="flex items-center gap-3">
          <div className="w-28 shrink-0 text-xs" style={{ color: C.sub }}>{r.k}</div>
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: C.slateSoft }}>
            <div className="h-full rounded-full" style={{ width: `${(r.v / max) * 100}%`, backgroundColor: r.c || C.accent }} />
          </div>
          <div className="w-6 text-right text-xs" style={{ fontFamily: MONO, color: C.text }}>{r.v}</div>
        </div>
      ))}
    </div>
  );
};

/* ---------- main ---------- */
export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Executive summary");
  const [modal, setModal] = useState(null); // {kind, draft}
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try { const v = await store.get(); setData(v ? JSON.parse(v) : seed()); }
      catch { setData(seed()); }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const persist = async (next) => {
    setData(next);
    try { await store.set(JSON.stringify(next)); } catch {}
  };
  const flash = (m) => setToast(m);

  if (!data) {
    return <div className="flex h-screen items-center justify-center" style={{ fontFamily: SANS, color: C.faint }}>Loading the hub…</div>;
  }

  const openCount = data.submissions.filter((s) => s.status === "New" || s.status === "Triaged").length;
  const pipelineCount = data.initiatives.filter((i) => i.stage !== "Sunset").length;
  const liveAgents = data.agents.filter((a) => a.status !== "Deprecated").length;

  const NAV = [
    ["Executive summary", LayoutDashboard],
    ["Intake", Inbox],
    ["Triage", SlidersHorizontal],
    ["Pipeline", GitBranch],
    ["Agent fleet", Bot],
    ["Champions", Users],
    ["Employee leaderboard", Trophy],
  ];

  /* ----- actions ----- */
  const addSubmission = (d) => { persist({ ...data, submissions: [{ ...d, id: uid(), status: "New", createdAt: today() }, ...data.submissions] }); flash("Request submitted"); };
  const scoreSubmission = (id, patch) => persist({ ...data, submissions: data.submissions.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const removeSubmission = (id) => { persist({ ...data, submissions: data.submissions.filter((s) => s.id !== id) }); flash("Request removed"); };
  const promote = (s) => {
    const method = data.method || "RICE";
    const def = METHODS[method] || METHODS.RICE;
    const num = def.score(s);
    const label = def.categorical ? `${method} · ${s.moscow || "—"}` : (num != null ? `${method} ${num}` : `${method} —`);
    persist({
      ...data,
      submissions: data.submissions.map((x) => x.id === s.id ? { ...x, status: "Promoted" } : x),
      initiatives: [{ id: uid(), title: s.title, stage: "Backlog", owner: "Unassigned", champion: "", kpi: "", blocker: "", hundredX: !!s.hundredX, override: s.override || "", scoreNum: num, scoreLabel: label }, ...data.initiatives],
    });
    flash("Promoted to pipeline");
  };
  const setMethod = (m) => persist({ ...data, method: m });
  const decline = (id) => { persist({ ...data, submissions: data.submissions.map((s) => s.id === id ? { ...s, status: "Declined" } : s) }); flash("Request declined"); };
  const moveStage = (id, stage) => persist({ ...data, initiatives: data.initiatives.map((i) => i.id === id ? { ...i, stage } : i) });
  const runEval = (id) => { persist({ ...data, agents: data.agents.map((a) => a.id === id ? { ...a, lastEval: today(), status: "Healthy" } : a) }); flash("Eval recorded"); };
  const addAgent = (d) => { persist({ ...data, agents: [{ ...d, weeklyHours: Number(d.weeklyHours) || 0, id: uid(), lastEval: today(), status: "Healthy" }, ...data.agents] }); flash("Agent registered"); };
  const removeAgent = (id) => { persist({ ...data, agents: data.agents.filter((a) => a.id !== id) }); flash("Agent removed"); };
  const addChampion = (d) => { persist({ ...data, champions: [{ ...d, id: uid(), shipped: 0 }, ...data.champions] }); flash("Champion added"); };
  const removeChampion = (id) => { persist({ ...data, champions: data.champions.filter((c) => c.id !== id) }); flash("Champion removed"); };
  const logActivity = (personId, type) => { persist({ ...data, people: data.people.map((p) => p.id === personId ? { ...p, activities: [{ id: uid(), type, date: today(), source: "manual" }, ...p.activities] } : p) }); flash("Activity logged"); };
  const syncGemini = () => { persist({ ...data, people: data.people.map((p) => ({ ...p, activities: [...mkActs("gemini", 2), ...p.activities] })) }); flash("Synced tool usage"); };
  const reset = () => { persist(seed()); flash("Reset to sample data"); };

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ backgroundColor: C.canvas, fontFamily: SANS, color: C.text }}>
      {/* rail */}
      <aside className="flex shrink-0 flex-col md:w-60" style={{ background: "linear-gradient(180deg, #1B1C28 0%, #131320 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${C.accent2}, ${C.accent})`, boxShadow: "0 4px 12px rgba(110,73,203,0.45)" }}>
            <Sparkles size={17} color="#fff" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: "#A98BF5" }}>GitLab Marketing</div>
            <div className="text-[15px] font-semibold leading-tight" style={{ color: "#fff", fontFamily: DISPLAY, letterSpacing: "-0.01em" }}>AI Transformation Hub</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-6">
          {NAV.map(([name, Icon]) => {
            const active = tab === name;
            return (
              <button key={name} onClick={() => setTab(name)} aria-current={active ? "page" : undefined}
                className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-violet-300 focus:outline-none"
                style={{ backgroundColor: active ? "rgba(124,92,248,0.16)" : "transparent", color: active ? "#fff" : C.railText,
                  boxShadow: active ? `inset 2.5px 0 0 ${C.accent2}` : "none" }}>
                <Icon size={16} color={active ? "#A98BF5" : undefined} />{name}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto hidden px-3 pb-5 pt-2 md:block">
          <button onClick={() => setModal({ kind: "About" })}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-violet-300 focus:outline-none"
            style={{ color: C.railText }}>
            <Info size={14} /> About this project
          </button>
          <div className="px-3 pt-1 text-[10px]" style={{ color: "#6F7080" }}>Concept prototype · sample data</div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 px-5 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold" style={{ fontFamily: DISPLAY, letterSpacing: "-0.02em" }}>{tab}</h1>
              <p className="mt-1 text-sm" style={{ color: C.sub }}>{SUBTITLE[tab]}</p>
            </div>
            {ADD_BTN[tab] && <Btn icon={Plus} onClick={() => setModal({ kind: tab })}>{ADD_BTN[tab]}</Btn>}
          </div>

          {tab === "Executive summary" && (
            <ExecSummary data={data} persist={persist} openCount={openCount} pipelineCount={pipelineCount} liveAgents={liveAgents} reset={reset} />
          )}
          {tab === "Intake" && <IntakeView data={data} onDelete={removeSubmission} />}
          {tab === "Triage" && <TriageView data={data} scoreSubmission={scoreSubmission} promote={promote} decline={decline} method={data.method || "RICE"} setMethod={setMethod} />}
          {tab === "Pipeline" && <PipelineView data={data} moveStage={moveStage} />}
          {tab === "Agent fleet" && <FleetView data={data} runEval={runEval} onDelete={removeAgent} />}
          {tab === "Champions" && <ChampionsView data={data} onDelete={removeChampion} />}
          {tab === "Employee leaderboard" && <LeaderboardView data={data} syncGemini={syncGemini} />}
        </div>
      </main>

      {/* modals */}
      {modal?.kind === "Intake" && <IntakeModal teams={data.assumptions?.teams || []} onClose={() => setModal(null)} onSave={(d) => { addSubmission(d); setModal(null); }} />}
      {modal?.kind === "Agent fleet" && <AgentModal onClose={() => setModal(null)} onSave={(d) => { addAgent(d); setModal(null); }} />}
      {modal?.kind === "Champions" && <ChampionModal teams={data.assumptions?.teams || []} onClose={() => setModal(null)} onSave={(d) => { addChampion(d); setModal(null); }} />}
      {modal?.kind === "Employee leaderboard" && <LogActivityModal people={data.people} onClose={() => setModal(null)} onSave={(pid, type) => { logActivity(pid, type); setModal(null); }} />}
      {modal?.kind === "About" && <AboutModal onClose={() => setModal(null)} />}

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 rounded-full px-4 py-2 text-xs font-medium shadow-lg"
          style={{ backgroundColor: C.ink, color: "#fff" }} role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}

const SUBTITLE = {
  "Executive summary": "Marketing's AI program at a glance: value delivered, adoption, and governance.",
  Intake: "Anyone in marketing can surface a pain point, idea, or request here.",
  Triage: "Score open requests against outcomes, then promote or decline.",
  Pipeline: "Track initiatives across their lifecycle, including what gets sunset.",
  "Agent fleet": "Every agent in production, with KPIs and eval status.",
  Champions: "The peer network extending reach across teams.",
  "Employee leaderboard": "AI activity across the org, captured automatically and logged manually, turned into recognition.",
};
const ADD_BTN = { Intake: "New request", "Agent fleet": "Register agent", Champions: "Add champion", "Employee leaderboard": "Log activity" };

/* ---------- Executive summary ---------- */
function ExecSummary({ data, persist, openCount, pipelineCount, liveAgents, reset }) {
  const a = data.assumptions || { hourlyRate: 75, weeksPerYear: 48, teams: [] };
  const activeAgents = data.agents.filter((x) => x.status !== "Deprecated");
  const hoursPerWeek = activeAgents.reduce((sum, x) => sum + (Number(x.weeklyHours) || 0), 0);
  const hoursPerYear = hoursPerWeek * a.weeksPerYear;
  const annualValue = hoursPerYear * a.hourlyRate;
  const valueLabel = annualValue >= 1000 ? `$${Math.round(annualValue / 1000)}K` : `$${annualValue}`;
  const needsEval = data.agents.filter((x) => x.status === "Needs eval").length;
  const blocked = data.initiatives.filter((i) => i.blocker && i.stage !== "Sunset");
  const healthy = liveAgents - needsEval;
  const byStage = STAGES.map((s) => ({ k: s, v: data.initiatives.filter((i) => i.stage === s).length, c: s === "Live" ? C.green : s === "Sunset" ? C.red : C.accent }));
  const setRate = (v) => persist({ ...data, assumptions: { ...a, hourlyRate: Number(v) || 0 } });
  const richPattern = (p) => p === "RAG" || p === "Agent";

  return (
    <div className="space-y-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: C.faint }}>
        Q2 2026 reporting period · sample data
      </div>

      {/* KPI row: operational flow */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric value={openCount} label="Open requests" accent={C.accent} />
        <Metric value={pipelineCount} label="In pipeline" />
        <Metric value={liveAgents} label="Live agents" accent={C.green} />
        <Metric value={hoursPerYear.toLocaleString()} label="Hours saved / yr" />
      </div>

      {/* value + pipeline */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card style={{ padding: 20 }}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: C.sub }}>Value delivered / year</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 34, letterSpacing: "-0.02em", lineHeight: 1.05, marginTop: 8 }}>{valueLabel}</div>
          <div className="mt-1 text-[11px]" style={{ color: C.faint }}>Estimated, {hoursPerYear.toLocaleString()} hrs at ${a.hourlyRate}/hr</div>
          <div className="mt-4 flex gap-7">
            <div><div style={{ fontFamily: MONO, fontSize: 18, color: C.green }}>{healthy}</div><div className="text-[11px]" style={{ color: C.sub }}>healthy</div></div>
            <div><div style={{ fontFamily: MONO, fontSize: 18, color: needsEval ? C.amber : C.text }}>{needsEval}</div><div className="text-[11px]" style={{ color: C.sub }}>due review</div></div>
            <div><div style={{ fontFamily: MONO, fontSize: 18, color: blocked.length ? C.red : C.text }}>{blocked.length}</div><div className="text-[11px]" style={{ color: C.sub }}>blocked</div></div>
          </div>
        </Card>
        <Card style={{ padding: 20 }}>
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: C.sub }}>Pipeline by stage</div>
          <MiniBar rows={byStage} />
        </Card>
      </div>

      {/* agent fleet health */}
      <Card style={{ padding: 20 }}>
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: C.sub }}>Agent fleet health</div>
        <div className="space-y-2.5">
          {activeAgents.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="truncate text-sm font-medium">{x.name}</span>
                <Pill label={x.pattern} bg={richPattern(x.pattern) ? C.accentSoft : C.slateSoft} fg={richPattern(x.pattern) ? C.accent : C.slate} />
              </div>
              {statusPill(x.status)}
            </div>
          ))}
        </div>
      </Card>

      {/* assumptions footer */}
      <Card style={{ padding: "12px 16px", backgroundColor: C.canvas, boxShadow: "none" }}>
        <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: C.sub }}>
          <span>Value assumes a blended rate of</span>
          <span className="inline-flex items-center" style={{ color: C.text }}>
            $<input type="number" value={a.hourlyRate} onChange={(e) => setRate(e.target.value)}
              className="w-14 rounded border px-1.5 py-0.5 text-center outline-none focus:ring-2 focus:ring-violet-300"
              style={{ borderColor: C.border, fontFamily: MONO, color: C.text }} />/hr
          </span>
          <span>over {a.weeksPerYear} working weeks. Adjust to match your sponsor's model.</span>
        </div>
      </Card>

      <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs" style={{ color: C.faint }}>
        <RefreshCw size={12} /> Reset to sample data
      </button>
    </div>
  );
}

/* ---------- Intake ---------- */
function IntakeView({ data, onDelete }) {
  const open = data.submissions.filter((s) => s.status === "New");
  return (
    <div className="space-y-3">
      {open.length === 0 && <Card style={{ padding: 18 }}><p className="text-sm" style={{ color: C.faint }}>No untriaged requests. New submissions land here.</p></Card>}
      {open.map((s) => (
        <Card key={s.id} style={{ padding: 16 }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{s.title}</span>
                {s.override && <Pill label={s.override} bg={C.amberSoft} fg={C.amber} icon={AlertTriangle} />}
                {s.hundredX && <Pill label="100x potential" bg={C.coralSoft} fg={C.coral} icon={Zap} />}
              </div>
              <div className="mt-1 text-xs" style={{ color: C.sub }}>{s.submitter} · {s.team} · {s.workflow}</div>
              <p className="mt-2 text-sm" style={{ color: C.text }}>{s.desiredOutcome}</p>
              {s.currentState && <p className="mt-1 text-xs" style={{ color: C.faint }}>Today: {s.currentState}</p>}
              {s.source && <div className="mt-1 text-[11px]" style={{ color: C.faint }}>Surfaced via {s.source}</div>}
              {(s.attachments || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.attachments.map((at) => (
                    <a key={at.id} href={at.url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                      <ExternalLink size={11} />{at.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {statusPill(s.type)}
              {onDelete && <IconBtn icon={Trash2} label="Remove request" onClick={() => onDelete(s.id)} />}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function IntakeModal({ teams, onClose, onSave }) {
  const [d, setD] = useState({ title: "", submitter: "", team: teams[0] || "", type: "Idea", source: "Inbound request", workflow: "", currentState: "", desiredOutcome: "", hundredX: false, attachments: [] });
  const [linkUrl, setLinkUrl] = useState("");
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const ok = d.title.trim() && d.submitter.trim();
  const addLink = () => {
    const u = linkUrl.trim();
    if (!u) return;
    const name = u.replace(/^https?:\/\//, "").replace(/\/$/, "");
    setD((p) => ({ ...p, attachments: [...p.attachments, { id: uid(), kind: "link", name: name.length > 40 ? name.slice(0, 40) + "…" : name, url: u }] }));
    setLinkUrl("");
  };
  const removeAt = (id) => setD((p) => ({ ...p, attachments: p.attachments.filter((a) => a.id !== id) }));
  return (
    <Modal title="New AI request" onClose={onClose}>
      <div className="space-y-3">
        <Field label="What do you want to solve or build?"><Input value={d.title} onChange={set("title")} placeholder="Short, plain-language title" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Your name"><Input value={d.submitter} onChange={set("submitter")} /></Field>
          <Field label="Team">{teams.length ? <Select value={d.team} onChange={set("team")} options={teams} /> : <Input value={d.team} onChange={set("team")} placeholder="e.g. Developer Relations" />}</Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><Select value={d.type} onChange={set("type")} options={TYPES} /></Field>
          <Field label="How this surfaced"><Select value={d.source} onChange={set("source")} options={SOURCES} /></Field>
        </div>
        <Field label="Workflow affected"><Input value={d.workflow} onChange={set("workflow")} placeholder="e.g. Monthly release marketing" /></Field>
        <Field label="How is this handled today?"><Input value={d.currentState} onChange={set("currentState")} placeholder="Time spent, volume, frequency" /></Field>
        <Field label="Desired outcome"><Input value={d.desiredOutcome} onChange={set("desiredOutcome")} placeholder="What 'better' looks like" /></Field>

        <Field label="Links (optional)">
          <div className="flex items-center gap-2">
            <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
              placeholder="Paste a link to a file, doc, issue, or merge request" className="flex-1 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle} />
            <Btn small variant="secondary" icon={LinkIcon} onClick={addLink}>Add link</Btn>
          </div>
          {d.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.attachments.map((at) => (
                <span key={at.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                  <ExternalLink size={11} />{at.name}
                  <button onClick={() => removeAt(at.id)} style={{ opacity: 0.7 }}><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => ok && onSave(d)} icon={Plus}>Submit request</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Triage ---------- */
function TriageView({ data, scoreSubmission, promote, decline, method, setMethod }) {
  const def = METHODS[method] || METHODS.RICE;
  const rows = data.submissions.filter((s) => s.status === "New" || s.status === "Triaged")
    .map((s) => ({ ...s, p: def.score(s) }))
    .sort((a, b) => (Number(!!b.override) - Number(!!a.override)) || (b.hundredX - a.hundredX) || ((b.p || 0) - (a.p || 0)));
  const NumField = ({ s, k, label, hint }) => (
    <div>
      <div className="mb-1 text-[11px]" style={{ color: C.faint }}>{label}</div>
      <input type="number" min="0" value={typeof s[k] === "number" ? s[k] : ""} placeholder={hint}
        onChange={(e) => scoreSubmission(s.id, { [k]: e.target.value === "" ? undefined : Number(e.target.value), status: "Triaged" })}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle} />
    </div>
  );
  const MapField = ({ s, k, label, opts }) => (
    <div>
      <div className="mb-1 text-[11px]" style={{ color: C.faint }}>{label}</div>
      <select value={typeof s[k] === "number" ? String(s[k]) : ""} onChange={(e) => scoreSubmission(s.id, { [k]: Number(e.target.value), status: "Triaged" })}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle}>
        <option value="">—</option>
        {opts.map(([lbl, val]) => <option key={lbl} value={val}>{lbl}</option>)}
      </select>
    </div>
  );
  const CatField = ({ s, k, label, opts }) => (
    <div>
      <div className="mb-1 text-[11px]" style={{ color: C.faint }}>{label}</div>
      <select value={s[k] || ""} onChange={(e) => scoreSubmission(s.id, { [k]: e.target.value || undefined, status: "Triaged" })}
        className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle}>
        <option value="">—</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  const renderField = (s, k) => {
    const fd = FIELD_DEFS[k];
    if (fd.type === "num") return <NumField key={k} s={s} k={k} label={fd.label} hint={fd.hint} />;
    if (fd.type === "cat") return <CatField key={k} s={s} k={k} label={fd.label} opts={fd.opts} />;
    return <MapField key={k} s={s} k={k} label={fd.label} opts={fd.opts} />;
  };
  const gridCols = def.fields.length <= 2 ? "sm:grid-cols-2" : def.fields.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";
  return (
    <div className="space-y-3">
      <Card style={{ padding: "12px 14px", backgroundColor: C.canvas }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium" style={{ color: C.text }}>Prioritization method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="rounded-lg px-2 py-1 text-xs outline-none focus:ring-2" style={inputStyle}>
            {Object.keys(METHODS).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <p className="mt-1.5 text-xs" style={{ color: C.sub }}>{def.blurb} Strategic overrides and 100x flags pin to the top regardless of method.</p>
      </Card>
      {rows.length === 0 && <Card style={{ padding: 18 }}><p className="text-sm" style={{ color: C.faint }}>Nothing waiting. Triaged items move to the pipeline.</p></Card>}
      {rows.map((s) => {
        const display = def.categorical ? (s.moscow || "—") : (s.p ?? "—");
        const lit = def.categorical ? !!s.moscow : s.p != null;
        return (
        <Card key={s.id} style={{ padding: 16 }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{s.title}</span>
                {s.override && <Pill label={s.override} bg={C.amberSoft} fg={C.amber} icon={AlertTriangle} />}
                {s.hundredX && <Pill label="100x" bg={C.coralSoft} fg={C.coral} icon={Zap} />}
              </div>
              <div className="mt-1 text-xs" style={{ color: C.sub }}>{s.team} · {s.type}{s.source ? ` · via ${s.source}` : ""}</div>
            </div>
            <div className="text-right">
              <div style={{ fontFamily: MONO, fontSize: 22, color: lit ? C.accent : C.faint }}>{display}</div>
              <div className="text-[10px]" style={{ color: C.faint }}>{method}</div>
            </div>
          </div>
          <div className={`mt-3 grid grid-cols-2 gap-2 ${gridCols}`}>
            {def.fields.map((k) => renderField(s, k))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <select value={s.override || ""} onChange={(e) => scoreSubmission(s.id, { override: e.target.value || undefined, status: "Triaged" })}
                className="rounded-lg px-2 py-1 text-xs outline-none focus:ring-2" style={inputStyle}>
                <option value="">No strategic override</option>
                {OVERRIDES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-xs" style={{ color: s.hundredX ? C.coral : C.sub }}>
                <input type="checkbox" checked={!!s.hundredX} onChange={(e) => scoreSubmission(s.id, { hundredX: e.target.checked, status: "Triaged" })} />
                Flag as 100x
              </label>
            </div>
            <div className="flex gap-2">
              <Btn variant="ghost" small onClick={() => decline(s.id)}>Decline</Btn>
              <Btn small icon={ArrowRight} onClick={() => promote(s)} >Promote to pipeline</Btn>
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
}

/* ---------- Pipeline ---------- */
function PipelineView({ data, moveStage }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((stage) => {
        const items = data.initiatives.filter((i) => i.stage === stage)
          .sort((a, b) => (Number(!!b.override) - Number(!!a.override)) || ((b.scoreNum || 0) - (a.scoreNum || 0)));
        return (
          <div key={stage}>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.sub }}>{stage}</span>
              <span className="text-xs" style={{ fontFamily: MONO, color: C.faint }}>{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((i) => (
                <Card key={i.id} style={{ padding: 13 }}>
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm font-medium leading-snug">{i.title}</span>
                    {i.hundredX && <Zap size={13} style={{ color: C.coral, marginTop: 2, flexShrink: 0 }} />}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {i.scoreLabel && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: C.accentSoft, color: C.accent }}>
                        <span style={{ fontFamily: MONO }}>{i.scoreLabel}</span>
                      </span>
                    )}
                    {i.override && <Pill label={i.override} bg={C.amberSoft} fg={C.amber} icon={AlertTriangle} />}
                  </div>
                  {i.kpi && <div className="mt-1.5 text-[11px]" style={{ color: C.sub }}>KPI: {i.kpi}</div>}
                  {i.champion && <div className="text-[11px]" style={{ color: C.sub }}>Champion: {i.champion}</div>}
                  {i.blocker && <div className="mt-1.5 rounded px-1.5 py-1 text-[11px]" style={{ backgroundColor: C.amberSoft, color: C.amber }}>{i.blocker}</div>}
                  <div className="mt-2.5">
                    <Select value={i.stage} options={STAGES} onChange={(e) => moveStage(i.id, e.target.value)} />
                  </div>
                </Card>
              ))}
              {items.length === 0 && <div className="rounded-lg px-3 py-4 text-center text-xs" style={{ border: `1px dashed ${C.border}`, color: C.faint }}>Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Fleet ---------- */
function FleetView({ data, runEval, onDelete }) {
  return (
    <div className="space-y-3">
      <Card style={{ padding: "10px 14px", backgroundColor: C.canvas }}>
        <p className="text-xs" style={{ color: C.sub }}>
          Production readiness tracks each agent across the lifecycle, not just whether it ships: context, guardrails, cost/latency limits, fallback, human-in-the-loop, and monitoring. Running an eval records a performance check, which is a separate axis from these readiness attributes.
        </p>
      </Card>
      {data.agents.map((a) => {
        const r = a.readiness || {};
        return (
        <Card key={a.id} style={{ padding: 16 }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{a.name}</span>
                {statusPill(a.status)}
                {a.pattern && <Pill label={a.pattern} bg={C.slateSoft} fg={C.slate} />}
              </div>
              <p className="mt-1 text-sm" style={{ color: C.sub }}>{a.purpose}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: C.faint }}>
                <span>Owner: {a.owner}</span><span>Platform: {a.platform}</span>
                <span>KPI: <span style={{ color: C.text }}>{a.kpi}</span></span>
                <span>Saves: <span style={{ color: C.text }}>~{a.weeklyHours || 0} hrs/wk</span></span>
                <span>Last eval: <span style={{ fontFamily: MONO, color: a.status === "Needs eval" ? C.amber : C.text }}>{a.lastEval}</span></span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {READINESS.map(([k, label]) => {
                  const on = !!r[k];
                  return (
                    <span key={k} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                      style={{ backgroundColor: on ? C.greenSoft : "#fff", color: on ? C.green : C.faint, border: `1px solid ${on ? C.greenSoft : C.border}` }}>
                      {on ? <CheckCircle2 size={11} /> : <Circle size={11} />}{label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {a.status !== "Deprecated" && <Btn small variant="secondary" icon={RefreshCw} onClick={() => runEval(a.id)}>Run eval</Btn>}
              {onDelete && <IconBtn icon={Trash2} label="Remove agent" onClick={() => onDelete(a.id)} />}
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
}

function AgentModal({ onClose, onSave }) {
  const [d, setD] = useState({ name: "", purpose: "", owner: "You", platform: "", pattern: "Agent", kpi: "", weeklyHours: "", readiness: {} });
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const toggleR = (k) => setD((p) => ({ ...p, readiness: { ...p.readiness, [k]: !p.readiness[k] } }));
  return (
    <Modal title="Register an agent" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Agent name"><Input value={d.name} onChange={set("name")} /></Field>
        <Field label="What it does"><Input value={d.purpose} onChange={set("purpose")} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Owner"><Input value={d.owner} onChange={set("owner")} /></Field>
          <Field label="Platform"><Input value={d.platform} onChange={set("platform")} placeholder="e.g. Glean, Workato" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pattern"><Select value={d.pattern} onChange={set("pattern")} options={PATTERNS} /></Field>
          <Field label="Est. hours saved / week"><Input type="number" value={d.weeklyHours} onChange={set("weeklyHours")} placeholder="e.g. 6" /></Field>
        </div>
        <Field label="Primary KPI"><Input value={d.kpi} onChange={set("kpi")} placeholder="What it's measured on" /></Field>
        <Field label="Production readiness">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {READINESS.map(([k, label]) => (
              <label key={k} className="flex items-center gap-1.5 text-xs" style={{ color: d.readiness[k] ? C.text : C.sub }}>
                <input type="checkbox" checked={!!d.readiness[k]} onChange={() => toggleR(k)} />{label}
              </label>
            ))}
          </div>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={Plus} onClick={() => d.name.trim() && onSave(d)}>Register</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Champions ---------- */
function ChampionsView({ data, onDelete }) {
  const teams = data.assumptions?.teams || [];
  const championTeams = new Set(data.champions.map((c) => c.team));
  const covered = teams.filter((t) => championTeams.has(t)).length;
  return (
    <div className="space-y-5">
      <Card style={{ padding: 18 }}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Team coverage</h3>
          <span className="text-xs" style={{ fontFamily: MONO, color: covered === teams.length ? C.green : C.sub }}>{covered}/{teams.length} teams</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {teams.map((t) => {
            const on = championTeams.has(t);
            return (
              <div key={t} className="flex items-center gap-2 text-sm">
                {on ? <CheckCircle2 size={15} style={{ color: C.green }} /> : <Circle size={15} style={{ color: C.border }} />}
                <span style={{ color: on ? C.text : C.faint }}>{t}</span>
                {!on && <span className="text-[11px]" style={{ color: C.faint }}>· needs a champion</span>}
              </div>
            );
          })}
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.champions.map((c) => (
          <Card key={c.id} style={{ padding: 16 }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: C.sub }}>{c.team}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Pill label={`${c.commitment} time`} bg={C.accentSoft} fg={C.accent} />
                {onDelete && <IconBtn icon={Trash2} label="Remove champion" onClick={() => onDelete(c.id)} />}
              </div>
            </div>
            <p className="mt-2 text-sm" style={{ color: C.text }}>{c.focus}</p>
            <div className="mt-2 text-xs" style={{ color: C.faint }}>Shipped: <span style={{ fontFamily: MONO, color: C.text }}>{c.shipped}</span></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChampionModal({ teams, onClose, onSave }) {
  const [d, setD] = useState({ name: "", team: teams[0] || "", commitment: "5%", focus: "" });
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  return (
    <Modal title="Add a champion" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name"><Input value={d.name} onChange={set("name")} /></Field>
        <Field label="Team">{teams.length ? <Select value={d.team} onChange={set("team")} options={teams} /> : <Input value={d.team} onChange={set("team")} />}</Field>
        <Field label="Time commitment"><Select value={d.commitment} onChange={set("commitment")} options={["5%", "10%"]} /></Field>
        <Field label="Focus area"><Input value={d.focus} onChange={set("focus")} placeholder="What they champion" /></Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={Plus} onClick={() => d.name.trim() && onSave(d)}>Add champion</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Leaderboard ---------- */
function LeaderboardView({ data, syncGemini }) {
  const ranked = data.people
    .map((p) => { const pts = pointsOf(p.activities); return { ...p, pts, ...levelFor(pts), badges: BADGES.filter((b) => b.earned(p.activities, pts)) }; })
    .sort((a, b) => b.pts - a.pts);
  const totalPts = ranked.reduce((s, p) => s + p.pts, 0);
  const badgeCount = ranked.reduce((s, p) => s + p.badges.length, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Metric value={totalPts.toLocaleString()} label="Points earned this period" accent={C.accent} />
        <Metric value={ranked.length} label="People participating" />
        <Metric value={badgeCount} label="Badges earned" accent={C.coral} />
      </div>

      <Card style={{ padding: "12px 16px", backgroundColor: C.canvas }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs" style={{ color: C.sub }}>
            Tool use syncs automatically from GitLab Duo usage analytics. Everything else is logged manually or from other systems.
          </p>
          <Btn small variant="secondary" icon={RefreshCw} onClick={syncGemini}>Sync Duo usage (demo)</Btn>
        </div>
      </Card>

      <div className="space-y-2">
        {ranked.map((p, i) => (
          <Card key={p.id} style={{ padding: 14 }}>
            <div className="flex items-center gap-3">
              <div className="w-7 shrink-0 text-center" style={{ fontFamily: MONO, fontSize: 16, color: i < 3 ? C.accent : C.faint }}>{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <Pill label={p.lvl.name} bg={C.accentSoft} fg={C.accent} />
                  <span className="text-xs" style={{ color: C.faint }}>{p.team}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: C.slateSoft }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round(p.progress * 100)}%`, backgroundColor: C.green }} />
                  </div>
                  <span className="text-[11px]" style={{ color: C.faint }}>
                    {p.next ? `${p.next.min - p.pts} to ${p.next.name}` : "Max level"}
                  </span>
                </div>
                {p.badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.badges.map((b) => { const I = BADGE_ICON[b.key]; return (
                      <span key={b.key} title={b.hint} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]" style={{ backgroundColor: C.coralSoft, color: C.coral }}>
                        {I && <I size={11} />}{b.name}
                      </span>
                    ); })}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div style={{ fontFamily: MONO, fontSize: 20, color: C.text }}>{p.pts}</div>
                <div className="text-[10px]" style={{ color: C.faint }}>points</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 18 }}>
        <h3 className="mb-3 text-sm font-semibold">Badges</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BADGES.map((b) => {
            const earnedBy = ranked.filter((p) => p.badges.some((x) => x.key === b.key)).length;
            const I = BADGE_ICON[b.key];
            return (
              <div key={b.key} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ backgroundColor: C.canvas }}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: earnedBy ? C.coralSoft : "#fff", color: earnedBy ? C.coral : C.faint, border: `1px solid ${C.border}` }}>
                  {I && <I size={14} />}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-[11px]" style={{ color: C.faint }}>{b.hint} · earned by {earnedBy}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function LogActivityModal({ people, onClose, onSave }) {
  const [pid, setPid] = useState(people[0]?.id || "");
  const [type, setType] = useState(ACTIVITY_TYPES[0].key);
  return (
    <Modal title="Log AI activity" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Who">
          <select value={pid} onChange={(e) => setPid(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle}>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Activity">
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2" style={inputStyle}>
            {ACTIVITY_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label} (+{t.points})</option>)}
          </select>
        </Field>
        <p className="text-xs" style={{ color: C.faint }}>Manual entries capture activity the tool APIs can't see, like running a workshop or sharing a prompt.</p>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn icon={Plus} onClick={() => pid && onSave(pid, type)}>Log activity</Btn>
        </div>
      </div>
    </Modal>
  );
}

function AboutModal({ onClose }) {
  return (
    <Modal title="About this project" onClose={onClose}>
      <div className="space-y-3 text-sm" style={{ color: C.text }}>
        <p>
          This is a concept prototype, a working model of how I would run an AI transformation program inside a marketing org, built as a portfolio piece for the AI Transformation Owner role.
        </p>
        <p style={{ color: C.sub }}>
          It walks one workflow end to end: requests come in through Intake, get scored in Triage with a prioritization method I can switch by context, move through a delivery Pipeline, and ship into an Agent fleet that is tracked for production readiness, not just whether it launched. Champions extend reach across teams, and a leaderboard turns adoption into recognition.
        </p>
        <p style={{ color: C.sub }}>
          Everything here is illustrative sample data. Names, numbers, and agents are made up to demonstrate the system, not to report real results. The value and participation figures on the summary are driven by assumptions you can edit.
        </p>
        <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: C.canvas, color: C.sub }}>
          Built by Shelbie Knight. Your edits are saved in this browser only. Use “Reset to sample data” on the summary to start over.
        </div>
      </div>
    </Modal>
  );
}
