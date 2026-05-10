import { useState, useEffect, useRef } from “react”;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const RULES = [
{ id: “activity1”, label: “Activity 1”, icon: “⚡” },
{ id: “activity2”, label: “Activity 2”, icon: “🔥” },
{ id: “nutrition”, label: “Hero Meal + Calories Logged”, icon: “🥩” },
{ id: “journal”, label: “Journal Entry”, icon: “📝” },
{ id: “dailywin”, label: “Daily Win Logged”, icon: “🏆” },
{ id: “coldshower”, label: “Cold Shower (2 min)”, icon: “🧊” },
];

const PENALTIES = [
{ id: “extension”, label: “The Extension”, desc: “Add 20 min to an existing activity today or tomorrow.” },
{ id: “extraset”, label: “The Extra Set”, desc: “100 reps of any exercise, broken up however you need, throughout the day.” },
{ id: “fast”, label: “The Fast”, desc: “Skip one non-hero meal the next day.” },
{ id: “doublejournal”, label: “The Double Journal”, desc: “Write two journal entries tomorrow — one on the miss, one looking forward.” },
{ id: “publicpost”, label: “The Public Post”, desc: “Post publicly about what you missed and what you’re doing about it.” },
];

const ACTIVITY_TYPES = [“Lift”, “Cardio”, “Sport”, “Walk”, “Yoga”, “Recovery”, “Cold Plunge”, “Sauna”, “Stretch”, “Other”];

const COLORS = {
bg: “#0a0a0a”,
surface1: “#141414”,
surface2: “#1e1e1e”,
surface3: “#272727”,
border: “#2a2a2a”,
textPrimary: “#ffffff”,
textSecondary: “#888888”,
textMuted: “#444444”,
green: “#22c55e”,
greenDim: “#15803d22”,
red: “#ef4444”,
redDim: “#dc262622”,
white: “#ffffff”,
};

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
const storage = {
get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split(“T”)[0];
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function getState() {
return storage.get(“zero60_state”) || null;
}

function saveState(s) {
storage.set(“zero60_state”, s);
}

function initState(name) {
return {
name,
startDate: today(),
days: {},
weeklyCheckins: {},
lastPenalty: null,
penaltyCountThisWeek: 0,
weekStartDate: today(),
};
}

function getDayNum(state) {
if (!state) return 0;
return clamp(daysBetween(state.startDate, today()) + 1, 1, 60);
}

function getDayData(state, date) {
return state.days[date] || {
checklist: {},
activities: [],
heroMealPhoto: null,
calories: “”,
journal: “”,
dailyWin: “”,
mood: null,
physical: null,
weight: “”,
penalty: null,
missedRules: [],
complete: false,
};
}

// ─── SPEEDOMETER ──────────────────────────────────────────────────────────────
function Speedometer({ day }) {
const pct = clamp((day - 1) / 59, 0, 1);
const startAngle = -210;
const endAngle = 30;
const angle = startAngle + pct * (endAngle - startAngle);
const toRad = (d) => (d * Math.PI) / 180;
const cx = 120, cy = 120, r = 90;

const arcPath = (from, to, radius) => {
const s = { x: cx + radius * Math.cos(toRad(from)), y: cy + radius * Math.sin(toRad(from)) };
const e = { x: cx + radius * Math.cos(toRad(to)), y: cy + radius * Math.sin(toRad(to)) };
const large = to - from > 180 ? 1 : 0;
return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
};

const needle = {
x: cx + (r - 10) * Math.cos(toRad(angle)),
y: cy + (r - 10) * Math.sin(toRad(angle)),
};

const ticks = Array.from({ length: 13 }, (_, i) => {
const a = startAngle + (i / 12) * (endAngle - startAngle);
const inner = r - 14;
const outer = r - 4;
return {
x1: cx + inner * Math.cos(toRad(a)),
y1: cy + inner * Math.sin(toRad(a)),
x2: cx + outer * Math.cos(toRad(a)),
y2: cy + outer * Math.sin(toRad(a)),
major: i % 3 === 0,
};
});

return (
<div style={{ display: “flex”, flexDirection: “column”, alignItems: “center”, gap: 8 }}>
<svg width={240} height={160} viewBox="0 0 240 160">
<defs>
<linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
<stop offset="0%" stopColor="#ef4444" />
<stop offset="50%" stopColor="#eab308" />
<stop offset="100%" stopColor="#22c55e" />
</linearGradient>
<filter id="glow">
<feGaussianBlur stdDeviation="3" result="blur" />
<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
</filter>
</defs>

```
    {/* Track */}
    <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="#2a2a2a" strokeWidth={8} strokeLinecap="round" />
    {/* Progress */}
    {pct > 0 && (
      <path d={arcPath(startAngle, angle, r)} fill="none" stroke="url(#arcGrad)" strokeWidth={8} strokeLinecap="round" filter="url(#glow)" />
    )}

    {/* Ticks */}
    {ticks.map((t, i) => (
      <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
        stroke={t.major ? "#555" : "#333"} strokeWidth={t.major ? 2 : 1} />
    ))}

    {/* Needle */}
    <line x1={cx} y1={cy} x2={needle.x} y2={needle.y}
      stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" filter="url(#glow)" />
    <circle cx={cx} cy={cy} r={5} fill="#ffffff" />
    <circle cx={cx} cy={cy} r={2} fill="#0a0a0a" />

    {/* Labels */}
    <text x={cx - r + 4} y={cy + 20} fill="#555" fontSize={10} textAnchor="middle">0</text>
    <text x={cx + r - 4} y={cy + 20} fill="#555" fontSize={10} textAnchor="middle">60</text>

    {/* Day number */}
    <text x={cx} y={cy + 38} fill="#ffffff" fontSize={28} fontWeight="800" textAnchor="middle" fontFamily="monospace">{day}</text>
    <text x={cx} y={cy + 52} fill="#888" fontSize={10} textAnchor="middle" fontFamily="monospace">OF 60 DAYS</text>
  </svg>
</div>
```

);
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function Screen({ children, style }) {
return (
<div style={{
minHeight: “100vh”, background: COLORS.bg, color: COLORS.textPrimary,
fontFamily: “‘DM Mono’, ‘Courier New’, monospace”, padding: “0 0 100px 0”,
maxWidth: 480, margin: “0 auto”, …style
}}>
{children}
</div>
);
}

function Card({ children, style }) {
return (
<div style={{
background: COLORS.surface1, border: `1px solid ${COLORS.border}`,
borderRadius: 12, padding: 16, …style
}}>
{children}
</div>
);
}

function Button({ children, onClick, variant = “primary”, style, disabled }) {
const variants = {
primary: { background: COLORS.white, color: COLORS.bg },
ghost: { background: “transparent”, color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` },
danger: { background: COLORS.redDim, color: COLORS.red, border: `1px solid ${COLORS.red}33` },
green: { background: COLORS.greenDim, color: COLORS.green, border: `1px solid ${COLORS.green}33` },
};
return (
<button onClick={onClick} disabled={disabled} style={{
…variants[variant], borderRadius: 10, padding: “12px 20px”,
fontSize: 13, fontWeight: 700, cursor: disabled ? “not-allowed” : “pointer”,
fontFamily: “inherit”, width: “100%”, border: “none”, opacity: disabled ? 0.5 : 1,
transition: “opacity 0.2s”, …style
}}>
{children}
</button>
);
}

function Label({ children, style }) {
return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: “0.12em”, color: COLORS.textSecondary, textTransform: “uppercase”, marginBottom: 8, …style }}>{children}</div>;
}

function Input({ value, onChange, placeholder, multiline, style }) {
const props = {
value, onChange: e => onChange(e.target.value), placeholder,
style: {
background: COLORS.surface2, border: `1px solid ${COLORS.border}`,
borderRadius: 8, padding: “10px 12px”, color: COLORS.textPrimary,
fontSize: 13, fontFamily: “inherit”, width: “100%”, boxSizing: “border-box”,
outline: “none”, resize: “vertical”, …style
}
};
return multiline ? <textarea rows={4} {…props} /> : <input {…props} />;
}

function Toggle({ checked, onChange, color }) {
return (
<div onClick={() => onChange(!checked)} style={{
width: 44, height: 24, borderRadius: 12, cursor: “pointer”, flexShrink: 0,
background: checked ? (color || COLORS.green) : COLORS.surface3,
position: “relative”, transition: “background 0.2s”
}}>
<div style={{
position: “absolute”, top: 3, left: checked ? 22 : 3,
width: 18, height: 18, borderRadius: 9, background: “#fff”,
transition: “left 0.2s”, boxShadow: “0 1px 4px #0008”
}} />
</div>
);
}

function NavBar({ active, setPage }) {
const tabs = [
{ id: “home”, icon: “◎”, label: “Home” },
{ id: “log”, icon: “✦”, label: “Log” },
{ id: “weekly”, icon: “◈”, label: “Weekly” },
{ id: “progress”, icon: “▲”, label: “Progress” },
{ id: “settings”, icon: “◉”, label: “Settings” },
];
return (
<div style={{
position: “fixed”, bottom: 0, left: “50%”, transform: “translateX(-50%)”,
width: “100%”, maxWidth: 480, background: COLORS.surface1,
borderTop: `1px solid ${COLORS.border}`, display: “flex”,
zIndex: 100, padding: “8px 0 12px”
}}>
{tabs.map(t => (
<div key={t.id} onClick={() => setPage(t.id)} style={{
flex: 1, display: “flex”, flexDirection: “column”, alignItems: “center”,
gap: 3, cursor: “pointer”, padding: “4px 0”
}}>
<span style={{ fontSize: 18, color: active === t.id ? COLORS.white : COLORS.textMuted }}>{t.icon}</span>
<span style={{ fontSize: 9, letterSpacing: “0.08em”, color: active === t.id ? COLORS.white : COLORS.textMuted, fontWeight: active === t.id ? 700 : 400 }}>{t.label}</span>
</div>
))}
</div>
);
}

// ─── WELCOME SCREEN ───────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
const [name, setName] = useState(””);
const [showRules, setShowRules] = useState(false);

const rules = [
{ icon: “⚡”, title: “Two Activities Daily”, desc: “Any combo of lift, cardio, sport, walk, yoga, or recovery. At least one must make you sweat.” },
{ icon: “🥩”, title: “Eat With Intention”, desc: “Whole foods only. No fast food. No alcohol. One hero meal per day. Log your calories.” },
{ icon: “📝”, title: “Daily Journal”, desc: “Write an honest, intentional entry about the challenge and your life. Your format, your words.” },
{ icon: “🏆”, title: “Daily Win”, desc: “Log one thing you’re proud of every single day. Big or small.” },
{ icon: “🧊”, title: “Cold Shower”, desc: “2 minutes minimum. No easing in. Every day.” },
];

return (
<Screen style={{ display: “flex”, flexDirection: “column”, padding: 24, justifyContent: “center”, minHeight: “100vh” }}>
<div style={{ textAlign: “center”, marginBottom: 40 }}>
<div style={{ fontSize: 64, fontWeight: 900, letterSpacing: “-0.04em”, lineHeight: 1, color: COLORS.white }}>0→60</div>
<div style={{ fontSize: 11, letterSpacing: “0.2em”, color: COLORS.textSecondary, marginTop: 8 }}>THE 60 DAY CHALLENGE</div>
<div style={{ width: 40, height: 1, background: COLORS.border, margin: “16px auto” }} />
<div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.6 }}>
Stay active. Eat right.<br />Enjoy the grind.
</div>
</div>

```
  <Card style={{ marginBottom: 16 }}>
    <Label>Your Name</Label>
    <Input value={name} onChange={setName} placeholder="Enter your name..." />
  </Card>

  <div onClick={() => setShowRules(!showRules)} style={{ cursor: "pointer", textAlign: "center", color: COLORS.textSecondary, fontSize: 12, marginBottom: 16, letterSpacing: "0.08em" }}>
    {showRules ? "▲ HIDE RULES" : "▼ VIEW THE 5 RULES"}
  </div>

  {showRules && (
    <Card style={{ marginBottom: 16 }}>
      {rules.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < rules.length - 1 ? 16 : 0 }}>
          <span style={{ fontSize: 20 }}>{r.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, marginBottom: 2 }}>{r.title}</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5 }}>{r.desc}</div>
          </div>
        </div>
      ))}
    </Card>
  )}

  <Button onClick={() => name.trim() && onStart(name.trim())} disabled={!name.trim()}>
    START MY 60 DAYS →
  </Button>

  <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.06em" }}>
    0-60 IS BUILT TO BE FINISHED
  </div>
</Screen>
```

);
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ state, onUpdate }) {
const dayNum = getDayNum(state);
const todayStr = today();
const dayData = getDayData(state, todayStr);

const completedCount = RULES.filter(r => dayData.checklist[r.id]).length;
const allDone = completedCount === RULES.length;

const toggleRule = (id) => {
const updated = { …state };
if (!updated.days[todayStr]) updated.days[todayStr] = getDayData(state, todayStr);
updated.days[todayStr].checklist[id] = !updated.days[todayStr].checklist[id];
onUpdate(updated);
};

// Check penalty count this week
const weekPenalties = state.penaltyCountThisWeek || 0;

return (
<Screen>
<div style={{ padding: “48px 20px 20px” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, marginBottom: 24 }}>
<div>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, color: COLORS.textSecondary }}>WELCOME BACK</div>
<div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{state.name}</div>
</div>
<div style={{ textAlign: “right” }}>
<div style={{ fontSize: 10, color: COLORS.textSecondary, letterSpacing: “0.1em” }}>PENALTIES</div>
<div style={{ fontSize: 20, fontWeight: 800, color: weekPenalties >= 3 ? COLORS.red : COLORS.white }}>{weekPenalties}/3</div>
<div style={{ fontSize: 9, color: COLORS.textMuted }}>THIS WEEK</div>
</div>
</div>

```
    {/* Speedometer */}
    <Card style={{ marginBottom: 16, alignItems: "center", display: "flex", flexDirection: "column" }}>
      <Speedometer day={dayNum} />
      <div style={{ width: "100%", background: COLORS.surface2, borderRadius: 6, height: 4, marginTop: 8 }}>
        <div style={{ height: 4, borderRadius: 6, background: COLORS.green, width: `${(completedCount / RULES.length) * 100}%`, transition: "width 0.3s" }} />
      </div>
      <div style={{ fontSize: 10, color: COLORS.textSecondary, marginTop: 6, letterSpacing: "0.08em" }}>
        {completedCount}/{RULES.length} RULES COMPLETE TODAY
      </div>
    </Card>

    {/* Daily Checklist */}
    <Label>TODAY'S CHECKLIST</Label>
    <Card>
      {RULES.map((rule, i) => {
        const done = !!dayData.checklist[rule.id];
        return (
          <div key={rule.id} onClick={() => toggleRule(rule.id)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 0", borderBottom: i < RULES.length - 1 ? `1px solid ${COLORS.border}` : "none",
            cursor: "pointer"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{rule.icon}</span>
              <span style={{ fontSize: 13, color: done ? COLORS.green : COLORS.textPrimary, textDecoration: done ? "line-through" : "none", transition: "color 0.2s" }}>
                {rule.label}
              </span>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? COLORS.green : COLORS.border}`,
              background: done ? COLORS.greenDim : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s", flexShrink: 0
            }}>
              {done && <span style={{ color: COLORS.green, fontSize: 12 }}>✓</span>}
            </div>
          </div>
        );
      })}
    </Card>

    {allDone && (
      <div style={{ marginTop: 16, padding: 16, background: COLORS.greenDim, border: `1px solid ${COLORS.green}33`, borderRadius: 12, textAlign: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 4 }}>🏁</div>
        <div style={{ fontSize: 13, color: COLORS.green, fontWeight: 700 }}>DAY {dayNum} COMPLETE</div>
        <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>{60 - dayNum} days remaining</div>
      </div>
    )}

    {weekPenalties >= 3 && (
      <div style={{ marginTop: 16, padding: 16, background: COLORS.redDim, border: `1px solid ${COLORS.red}33`, borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: COLORS.red, fontWeight: 700, marginBottom: 4 }}>⚠ 3 PENALTIES THIS WEEK</div>
        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>One more miss triggers a repeat week. Lock in.</div>
      </div>
    )}
  </div>
</Screen>
```

);
}

// ─── LOG SCREEN ───────────────────────────────────────────────────────────────
function LogScreen({ state, onUpdate }) {
const todayStr = today();
const dayData = getDayData(state, todayStr);
const [activity1, setActivity1] = useState(dayData.activities[0] || { type: “”, duration: “”, notes: “” });
const [activity2, setActivity2] = useState(dayData.activities[1] || { type: “”, duration: “”, notes: “” });
const [calories, setCalories] = useState(dayData.calories || “”);
const [journal, setJournal] = useState(dayData.journal || “”);
const [dailyWin, setDailyWin] = useState(dayData.dailyWin || “”);
const [mood, setMood] = useState(dayData.mood || null);
const [physical, setPhysical] = useState(dayData.physical || null);
const [weight, setWeight] = useState(dayData.weight || “”);
const [saved, setSaved] = useState(false);
const [showPenalty, setShowPenalty] = useState(false);
const [selectedPenalty, setSelectedPenalty] = useState(null);

const save = () => {
const updated = { …state };
if (!updated.days[todayStr]) updated.days[todayStr] = getDayData(state, todayStr);
updated.days[todayStr] = {
…updated.days[todayStr],
activities: [activity1, activity2],
calories, journal, dailyWin, mood, physical, weight,
};
onUpdate(updated);
setSaved(true);
setTimeout(() => setSaved(false), 2000);
};

const logPenalty = () => {
if (!selectedPenalty) return;
if (state.lastPenalty === selectedPenalty) {
alert(“You can’t use the same penalty twice in a row. Choose a different one.”);
return;
}
const updated = { …state };
if (!updated.days[todayStr]) updated.days[todayStr] = getDayData(state, todayStr);
updated.days[todayStr].penalty = selectedPenalty;
updated.lastPenalty = selectedPenalty;
updated.penaltyCountThisWeek = (updated.penaltyCountThisWeek || 0) + 1;

```
if (updated.penaltyCountThisWeek >= 4) {
  alert("You've hit 4 penalties this week. This triggers a repeat week. Stay locked in.");
}

onUpdate(updated);
setShowPenalty(false);
setSelectedPenalty(null);
```

};

const ActivityBlock = ({ label, activity, setActivity }) => (
<Card style={{ marginBottom: 12 }}>
<Label>{label}</Label>
<div style={{ display: “flex”, gap: 8, marginBottom: 8 }}>
<select value={activity.type} onChange={e => setActivity({ …activity, type: e.target.value })}
style={{ flex: 2, background: COLORS.surface2, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: “10px 12px”, color: activity.type ? COLORS.textPrimary : COLORS.textSecondary, fontSize: 13, fontFamily: “inherit”, outline: “none” }}>
<option value="">Type…</option>
{ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
</select>
<Input value={activity.duration} onChange={v => setActivity({ …activity, duration: v })} placeholder=“Min” style={{ flex: 1 }} />
</div>
<Input value={activity.notes} onChange={v => setActivity({ …activity, notes: v })} placeholder=“Notes (optional)…” />
</Card>
);

const RatingRow = ({ label, value, onChange }) => (
<div style={{ marginBottom: 12 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 6 }}>
<Label style={{ marginBottom: 0 }}>{label}</Label>
{value && <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>{value}/10</span>}
</div>
<div style={{ display: “flex”, gap: 4 }}>
{Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
<div key={n} onClick={() => onChange(n)} style={{
flex: 1, height: 28, borderRadius: 4, cursor: “pointer”,
background: n <= (value || 0) ? COLORS.green : COLORS.surface2,
border: `1px solid ${n <= (value || 0) ? COLORS.green : COLORS.border}`,
transition: “all 0.15s”
}} />
))}
</div>
</div>
);

return (
<Screen>
<div style={{ padding: “48px 20px 20px” }}>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, color: COLORS.textSecondary, marginBottom: 4 }}>TODAY’S LOG</div>
<div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Day {getDayNum(state)}</div>

```
    <ActivityBlock label="ACTIVITY 1" activity={activity1} setActivity={setActivity1} />
    <ActivityBlock label="ACTIVITY 2" activity={activity2} setActivity={setActivity2} />

    {/* Nutrition */}
    <Card style={{ marginBottom: 12 }}>
      <Label>HERO MEAL + NUTRITION</Label>
      <div style={{ background: COLORS.surface2, border: `2px dashed ${COLORS.border}`, borderRadius: 8, padding: 20, textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Hero meal photo</div>
        <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>Whole food · Quality protein · Something you're proud of</div>
      </div>
      <Input value={calories} onChange={setCalories} placeholder="Daily calories (e.g. 2400)" style={{ marginTop: 4 }} />
    </Card>

    {/* Journal */}
    <Card style={{ marginBottom: 12 }}>
      <Label>JOURNAL ENTRY</Label>
      <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
        Honest. Intentional. Your format, your words. Reflect on the challenge and your life.
      </div>
      <Input value={journal} onChange={setJournal} placeholder="Write your entry..." multiline style={{ minHeight: 100 }} />
    </Card>

    {/* Daily Win */}
    <Card style={{ marginBottom: 12 }}>
      <Label>DAILY WIN</Label>
      <Input value={dailyWin} onChange={setDailyWin} placeholder="One thing you're proud of today..." />
    </Card>

    {/* Daily Check-in */}
    <Card style={{ marginBottom: 12 }}>
      <Label>DAILY CHECK-IN</Label>
      <RatingRow label="MOOD" value={mood} onChange={setMood} />
      <RatingRow label="PHYSICAL FEEL" value={physical} onChange={setPhysical} />
      <div style={{ marginTop: 4 }}>
        <Label>WEIGHT (optional)</Label>
        <Input value={weight} onChange={setWeight} placeholder="lbs or kg..." />
      </div>
    </Card>

    <Button onClick={save} variant="primary" style={{ marginBottom: 12 }}>
      {saved ? "✓ SAVED" : "SAVE TODAY'S LOG"}
    </Button>

    <Button onClick={() => setShowPenalty(!showPenalty)} variant="danger">
      LOG A PENALTY
    </Button>

    {showPenalty && (
      <Card style={{ marginTop: 12 }}>
        <Label>CHOOSE YOUR PENALTY</Label>
        <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
          Max 3/week. Can't use the same one twice in a row. Choose what fits your day.
        </div>
        {PENALTIES.map(p => (
          <div key={p.id} onClick={() => setSelectedPenalty(p.id)} style={{
            padding: 12, borderRadius: 8, marginBottom: 8, cursor: "pointer",
            border: `1px solid ${selectedPenalty === p.id ? COLORS.red : COLORS.border}`,
            background: selectedPenalty === p.id ? COLORS.redDim : COLORS.surface2,
            transition: "all 0.15s"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: selectedPenalty === p.id ? COLORS.red : COLORS.white, marginBottom: 2 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{p.desc}</div>
            {state.lastPenalty === p.id && (
              <div style={{ fontSize: 10, color: COLORS.red, marginTop: 4 }}>⚠ Used last time — choose another</div>
            )}
          </div>
        ))}
        <Button onClick={logPenalty} variant="danger" disabled={!selectedPenalty || state.lastPenalty === selectedPenalty}>
          CONFIRM PENALTY
        </Button>
      </Card>
    )}
  </div>
</Screen>
```

);
}

// ─── WEEKLY CHECK-IN ──────────────────────────────────────────────────────────
function WeeklyScreen({ state, onUpdate }) {
const weekNum = Math.ceil(getDayNum(state) / 7);
const weekKey = `week${weekNum}`;
const existing = state.weeklyCheckins?.[weekKey] || {};
const [mood, setMood] = useState(existing.mood || null);
const [moodNote, setMoodNote] = useState(existing.moodNote || “”);
const [physical, setPhysical] = useState(existing.physical || null);
const [physicalNote, setPhysicalNote] = useState(existing.physicalNote || “”);
const [weight, setWeight] = useState(existing.weight || “”);
const [achievement, setAchievement] = useState(existing.achievement || “”);
const [nextGoal, setNextGoal] = useState(existing.nextGoal || “”);
const [saved, setSaved] = useState(false);

const save = () => {
const updated = { …state };
if (!updated.weeklyCheckins) updated.weeklyCheckins = {};
updated.weeklyCheckins[weekKey] = { mood, moodNote, physical, physicalNote, weight, achievement, nextGoal, date: today() };
onUpdate(updated);
setSaved(true);
setTimeout(() => setSaved(false), 2000);
};

const RatingRow = ({ label, value, onChange }) => (
<div style={{ marginBottom: 8 }}>
<div style={{ display: “flex”, justifyContent: “space-between”, marginBottom: 6 }}>
<Label style={{ marginBottom: 0 }}>{label}</Label>
{value && <span style={{ fontSize: 12, color: COLORS.green, fontWeight: 700 }}>{value}/10</span>}
</div>
<div style={{ display: “flex”, gap: 4, marginBottom: 8 }}>
{Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
<div key={n} onClick={() => onChange(n)} style={{
flex: 1, height: 28, borderRadius: 4, cursor: “pointer”,
background: n <= (value || 0) ? COLORS.green : COLORS.surface2,
border: `1px solid ${n <= (value || 0) ? COLORS.green : COLORS.border}`,
transition: “all 0.15s”
}} />
))}
</div>
</div>
);

return (
<Screen>
<div style={{ padding: “48px 20px 20px” }}>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, color: COLORS.textSecondary, marginBottom: 4 }}>WEEK {weekNum} OF 8</div>
<div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Weekly Check-In</div>

```
    <Card style={{ marginBottom: 12 }}>
      <RatingRow label="1. MOOD — HOW ARE YOU FEELING MENTALLY?" value={mood} onChange={setMood} />
      <Input value={moodNote} onChange={setMoodNote} placeholder="Reflect on your mental state this week..." multiline />
    </Card>

    <Card style={{ marginBottom: 12 }}>
      <RatingRow label="2. PHYSICAL — HOW IS YOUR BODY FEELING?" value={physical} onChange={setPhysical} />
      <Input value={physicalNote} onChange={setPhysicalNote} placeholder="Energy, soreness, strength — how does it feel?" multiline />
    </Card>

    <Card style={{ marginBottom: 12 }}>
      <Label>3. WEIGHT</Label>
      <Input value={weight} onChange={setWeight} placeholder="Current weight (lbs or kg)..." />
    </Card>

    <Card style={{ marginBottom: 12 }}>
      <Label>4. ACHIEVEMENT OF THE WEEK</Label>
      <Input value={achievement} onChange={setAchievement} placeholder="One thing you're genuinely proud of this week..." multiline />
    </Card>

    <Card style={{ marginBottom: 16 }}>
      <Label>5. NEXT WEEK'S GOAL</Label>
      <Input value={nextGoal} onChange={setNextGoal} placeholder="One specific, actionable goal for the coming week..." multiline />
    </Card>

    <Button onClick={save}>{saved ? "✓ SAVED" : "SAVE WEEK " + weekNum + " CHECK-IN"}</Button>
  </div>
</Screen>
```

);
}

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen({ state }) {
const dayNum = getDayNum(state);

// Build calendar data
const days = Array.from({ length: 60 }, (_, i) => {
const d = new Date(state.startDate);
d.setDate(d.getDate() + i);
const dateStr = d.toISOString().split(“T”)[0];
const data = state.days?.[dateStr];
const isPast = dateStr < today();
const isToday = dateStr === today();
const isFuture = dateStr > today();
const complete = data && RULES.every(r => data.checklist?.[r.id]);
const partial = data && Object.keys(data.checklist || {}).length > 0;
return { day: i + 1, dateStr, data, isPast, isToday, isFuture, complete, partial };
});

// Mood + physical trend
const trendData = Object.entries(state.days || {})
.filter(([, d]) => d.mood || d.physical)
.sort(([a], [b]) => a.localeCompare(b))
.slice(-14)
.map(([date, d]) => ({ date, mood: d.mood, physical: d.physical, weight: d.weight }));

// Weekly weight data
const weeklyData = Object.entries(state.weeklyCheckins || {})
.sort(([a], [b]) => a.localeCompare(b))
.map(([k, v]) => ({ week: k.replace(“week”, “W”), weight: parseFloat(v.weight), mood: v.mood, physical: v.physical }));

const Cell = ({ d }) => {
let bg = COLORS.surface2;
let border = COLORS.border;
let textColor = COLORS.textMuted;
if (d.complete) { bg = COLORS.greenDim; border = COLORS.green; textColor = COLORS.green; }
else if (d.partial && !d.isFuture) { bg = “#1a1200”; border = “#eab30855”; textColor = “#eab308”; }
else if (d.isPast && !d.partial) { bg = COLORS.redDim; border = COLORS.red + “44”; textColor = COLORS.red; }
if (d.isToday) { border = COLORS.white; textColor = COLORS.white; }
return (
<div style={{
width: “13%”, aspectRatio: 1, borderRadius: 4, display: “flex”, alignItems: “center”, justifyContent: “center”,
fontSize: 10, fontWeight: d.isToday ? 800 : 400, background: bg, border: `1px solid ${border}`, color: textColor, flexShrink: 0
}}>
{d.day}
</div>
);
};

return (
<Screen>
<div style={{ padding: “48px 20px 20px” }}>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, color: COLORS.textSecondary, marginBottom: 4 }}>YOUR JOURNEY</div>
<div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Progress</div>

```
    {/* Stats row */}
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {[
        { label: "DAY", value: dayNum },
        { label: "COMPLETE", value: days.filter(d => d.complete).length },
        { label: "PENALTIES", value: state.penaltyCountThisWeek || 0 },
      ].map(s => (
        <Card key={s.label} style={{ flex: 1, textAlign: "center", padding: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.white }}>{s.value}</div>
          <div style={{ fontSize: 9, color: COLORS.textSecondary, letterSpacing: "0.1em" }}>{s.label}</div>
        </Card>
      ))}
    </div>

    {/* 60 Day Calendar */}
    <Card style={{ marginBottom: 16 }}>
      <Label>60 DAY OVERVIEW</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {days.map(d => <Cell key={d.day} d={d} />)}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { color: COLORS.green, label: "Complete" },
          { color: "#eab308", label: "Partial" },
          { color: COLORS.red, label: "Missed" },
          { color: COLORS.white, label: "Today" },
          { color: COLORS.surface2, label: "Upcoming" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, border: `1px solid ${l.color}` }} />
            <span style={{ fontSize: 9, color: COLORS.textSecondary }}>{l.label}</span>
          </div>
        ))}
      </div>
    </Card>

    {/* Trend Graph */}
    {trendData.length > 0 && (
      <Card style={{ marginBottom: 16 }}>
        <Label>MOOD + PHYSICAL TREND</Label>
        <div style={{ height: 80, display: "flex", alignItems: "flex-end", gap: 3 }}>
          {trendData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
              {d.mood && <div style={{ width: "100%", background: COLORS.green, borderRadius: "2px 2px 0 0", height: `${(d.mood / 10) * 60}px`, opacity: 0.8 }} title={`Mood: ${d.mood}`} />}
              {d.physical && <div style={{ width: "100%", background: "#3b82f6", borderRadius: "2px 2px 0 0", height: `${(d.physical / 10) * 60}px`, opacity: 0.6 }} title={`Physical: ${d.physical}`} />}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: COLORS.green, borderRadius: 2 }} /><span style={{ fontSize: 9, color: COLORS.textSecondary }}>Mood</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: 2 }} /><span style={{ fontSize: 9, color: COLORS.textSecondary }}>Physical</span></div>
        </div>
      </Card>
    )}

    {/* Weekly wins */}
    {Object.keys(state.weeklyCheckins || {}).length > 0 && (
      <Card>
        <Label>WEEKLY CHECK-INS</Label>
        {Object.entries(state.weeklyCheckins).sort().map(([k, v]) => (
          <div key={k} style={{ borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.white, marginBottom: 4 }}>Week {k.replace("week", "")}</div>
            {v.achievement && <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 }}>🏆 {v.achievement}</div>}
            {v.nextGoal && <div style={{ fontSize: 11, color: COLORS.textSecondary }}>→ {v.nextGoal}</div>}
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {v.mood && <span style={{ fontSize: 10, color: COLORS.green }}>Mood {v.mood}/10</span>}
              {v.physical && <span style={{ fontSize: 10, color: "#3b82f6" }}>Physical {v.physical}/10</span>}
              {v.weight && <span style={{ fontSize: 10, color: COLORS.textSecondary }}>{v.weight}</span>}
            </div>
          </div>
        ))}
      </Card>
    )}
  </div>
</Screen>
```

);
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────
function SettingsScreen({ state, onUpdate }) {
const [showRestart, setShowRestart] = useState(false);
const [confirm1, setConfirm1] = useState(false);
const [confirm2, setConfirm2] = useState(false);

const dayNum = getDayNum(state);
const completeDays = Object.values(state.days || {}).filter(d => RULES.every(r => d.checklist?.[r.id])).length;

const doRestart = () => {
if (confirm1 && confirm2) {
const fresh = initState(state.name);
onUpdate(fresh);
setShowRestart(false);
setConfirm1(false);
setConfirm2(false);
}
};

return (
<Screen>
<div style={{ padding: “48px 20px 20px” }}>
<div style={{ fontSize: 11, letterSpacing: “0.15em”, color: COLORS.textSecondary, marginBottom: 4 }}>ACCOUNT</div>
<div style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>Settings</div>

```
    <Card style={{ marginBottom: 12 }}>
      <Label>CHALLENGER</Label>
      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white }}>{state.name}</div>
      <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>Started {state.startDate}</div>
    </Card>

    <Card style={{ marginBottom: 12 }}>
      <Label>THE 5 RULES</Label>
      {RULES.map((r, i) => (
        <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < RULES.length - 1 ? 10 : 0 }}>
          <span style={{ fontSize: 16 }}>{r.icon}</span>
          <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.5 }}>{r.label}</div>
        </div>
      ))}
    </Card>

    <Card style={{ marginBottom: 12 }}>
      <Label>PENALTY RULES</Label>
      <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.7 }}>
        • Max 3 penalties per 7 days<br />
        • Can't use the same penalty twice in a row<br />
        • 4 misses in a week = repeat that week<br />
        • Penalties carry over — they don't disappear
      </div>
    </Card>

    {/* Buried restart option */}
    <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
      <div onClick={() => setShowRestart(!showRestart)} style={{ fontSize: 11, color: COLORS.textMuted, textAlign: "center", cursor: "pointer", letterSpacing: "0.06em" }}>
        Challenge Options
      </div>

      {showRestart && (
        <div style={{ marginTop: 20 }}>
          <Card style={{ background: COLORS.redDim, border: `1px solid ${COLORS.red}33`, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.red, marginBottom: 8 }}>⚠ ARE YOU SURE?</div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
              0-60 is built to be finished, not restarted. You've completed {completeDays} days and are on day {dayNum}. Your penalties exist for a reason. Every day you've logged is real progress.
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 8 }}>Are you sure you want to walk away from that?</div>

            <div onClick={() => setConfirm1(!confirm1)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
              <Toggle checked={confirm1} onChange={setConfirm1} color={COLORS.red} />
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>I understand I will lose all my progress</span>
            </div>
            <div onClick={() => setConfirm2(!confirm2)} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer" }}>
              <Toggle checked={confirm2} onChange={setConfirm2} color={COLORS.red} />
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>I've considered using a penalty instead</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={() => setShowRestart(false)} variant="green" style={{ flex: 1 }}>Take Me Back</Button>
              <Button onClick={doRestart} variant="danger" style={{ flex: 1 }} disabled={!confirm1 || !confirm2}>Reset</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  </div>
</Screen>
```

);
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
const [state, setState] = useState(() => getState());
const [page, setPage] = useState(“home”);

const handleUpdate = (newState) => {
saveState(newState);
setState(newState);
};

const handleStart = (name) => {
const s = initState(name);
handleUpdate(s);
};

if (!state) return <WelcomeScreen onStart={handleStart} />;

const pages = {
home: <HomeScreen state={state} onUpdate={handleUpdate} />,
log: <LogScreen state={state} onUpdate={handleUpdate} />,
weekly: <WeeklyScreen state={state} onUpdate={handleUpdate} />,
progress: <ProgressScreen state={state} />,
settings: <SettingsScreen state={state} onUpdate={handleUpdate} />,
};

return (
<div style={{ background: COLORS.bg, minHeight: “100vh” }}>
{pages[page]}
<NavBar active={page} setPage={setPage} />
</div>
);
}