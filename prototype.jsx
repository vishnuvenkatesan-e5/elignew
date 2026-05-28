// WellSky — Clickable Prototype
// Flow: Top nav (Dashboard / Eligibility / Authorization) swaps whole screens.
// Each screen has sub-tabs that swap the main content. Patient rows → detail (full Auth dashboard).
const { useState: useP } = React;

// ── Shared chrome (dark navy) ────────────────────────────────
function TopNav({ section, onSection, onLogo }) {
  const items = [
  { key: "dashboard", label: "Dashboard" },
  { key: "eligibility", label: "Eligibility" },
  { key: "authorization", label: "Authorization" }];

  return (
    <div style={{ height: 72, display: "flex", alignItems: "center", padding: "0 32px", color: "#fff", gap: 28, borderBottom: "1px solid rgba(255,255,255,.1)", background: "linear-gradient(rgb(56, 71, 90) 0%, rgb(44, 60, 80) 42%, rgb(28, 45, 66) 100%) 0% 0% / cover", justifyContent: "flex-start", flexDirection: "row" }}>
      <img src="../../assets/neos-logo.png" style={{ cursor: "pointer", objectFit: "scale-down", height: "17px", width: "88px" }} alt="neos" onClick={onLogo} />
      <div style={{ display: "flex", gap: 28, marginLeft: 20 }}>
        {items.map((it) => {
          const act = section === it.key;
          return (
            <button key={it.key} onClick={() => onSection(it.key)} style={{ background: "transparent", border: "none", padding: "0 2px 6px", cursor: "pointer", color: act ? "#fff" : "rgba(255,255,255,.55)", borderBottom: act ? "2px solid #fff" : "2px solid transparent", font: `${act ? 500 : 400} 14px/18px Roboto` }}>{it.label}</button>);

        })}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,.6)", fontSize: 18, cursor: "pointer" }}>📖</span>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#C6A78F", display: "flex", alignItems: "center", justifyContent: "center", font: "500 12px Roboto" }}>JM</div>
      </div>
    </div>);

}

// ── Section header band (contains sub-tabs + review toggle + download) ─
function SectionBand({ title, subTabs, activeSub, onSub, review, onReview, showReview, breadcrumb, onBack }) {
  return (
    <div style={{ background: "linear-gradient(rgb(44,60,80) 0%, rgb(28,45,66) 100%)", padding: "18px 32px 16px", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, font: "500 20px/24px Roboto" }}>
        {breadcrumb ?
        <div style={{ display: "flex", alignItems: "center", gap: 8, font: "400 14px/20px Roboto", color: "rgba(255,255,255,.7)" }}>
              <span style={{ cursor: "pointer" }} onClick={onBack}>{breadcrumb[0]}</span>
              <span style={{ opacity: .5 }}>/</span>
              <span style={{ color: "#fff", font: "500 20px/24px Roboto" }}>{breadcrumb[1]}</span>
            </div> :
        <span>{title}</span>}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
        {subTabs.map((t, i) => {
          const act = activeSub === i;
          return (
            <button key={t.label} onClick={() => onSub(i)} style={{ background: act ? "#1677FF" : "rgba(208,217,229,0.11)", color: "#fff", border: "none", borderRadius: 4, padding: "6px 14px", font: `${act ? 500 : 400} 13px/18px Roboto`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {t.icon && <span style={{ opacity: .9, fontSize: 13 }}>{t.icon}</span>}{t.label}
            </button>);

        })}
        {showReview &&
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#fff", font: "400 13px Roboto" }}>Review Mode</span>
            <button onClick={onReview} style={{ width: 32, height: 18, borderRadius: 999, background: review ? "#1677FF" : "rgba(255,255,255,.3)", border: "none", cursor: "pointer", position: "relative", padding: 0 }}>
              <span style={{ position: "absolute", top: 2, left: review ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .15s" }}></span>
            </button>
            <button style={{ width: 36, height: 32, border: "1px solid rgba(255,255,255,.25)", borderRadius: 4, background: "transparent", color: "rgba(255,255,255,.8)", cursor: "pointer" }}>⬇</button>
          </div>
        }
      </div>
    </div>);

}

// ── Home / landing tiles ─────────────────────────────────────
function Home({ onGo }) {
  const tiles = [
  { key: "dashboard", label: "Dashboard", desc: "Eligibility overview, alerts and action items", icon: "📊" },
  { key: "eligibility", label: "Eligibility", desc: "Request status, summary and patient view", icon: "🩺" },
  { key: "authorization", label: "Authorization", desc: "Patient auth summary, requests and recert", icon: "📑" }];

  return (
    <div style={{ padding: "56px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ font: "500 28px/34px Roboto", color: "#3A424A", marginBottom: 6 }}>Welcome back, Jessica</div>
      <div style={{ font: "400 14px/20px Roboto", color: "#6A717D", marginBottom: 32 }}>Open any area to start working. Your top nav swaps here too.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {tiles.map((t) =>
        <div key={t.key} onClick={() => onGo(t.key)} style={{ border: "1px solid #E8E9EA", borderRadius: 8, padding: "22px 22px 26px", background: "#fff", cursor: "pointer", transition: "box-shadow .12s" }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 22px rgba(28,45,66,.09)"} onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
            <div style={{ font: "500 18px/22px Roboto", color: "#3A424A" }}>{t.label}</div>
            <div style={{ font: "400 13px/18px Roboto", color: "#6A717D", marginTop: 6 }}>{t.desc}</div>
            <div style={{ marginTop: 14, font: "500 13px Roboto", color: "#1677FF" }}>Open →</div>
          </div>
        )}
      </div>
    </div>);

}

// ── ELIGIBILITY SECTION ──────────────────────────────────────
function EligibilitySection({ sub, onSub, onPatient }) {
  const subTabs = [
  { label: "Eligibility Request View", icon: "☰" },
  { label: "Automation Log", icon: "" }];

  return (
    <div>
      <SectionBand title="Eligibility Center" subTabs={subTabs} activeSub={sub} onSub={onSub} showReview={true} review={false} onReview={() => {}} />
      {sub === 0 ?
      <EligibilityRequestView onPatient={onPatient} /> :
      <ERVAutomationLogView />}
    </div>);

}

// ── AUTHORIZATION SECTION ────────────────────────────────────
const chips = [
{ label: "All Patients", value: "10", color: "rgb(21,95,130)" },
{ label: "Past Due for Recert", value: "01", color: "rgb(102,96,166)" },
{ label: "Due for Recert", value: "02", color: "rgb(196,112,151)" },
{ label: "Expiring Auths", value: "01", color: "rgb(215,137,90)" },
{ label: "Expired Auths", value: "01", color: "rgb(207,19,34)" }];

function SummaryChip({ label, value, color }) {
  return (
    <div style={{ width: 93, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ height: 4, borderRadius: 4, background: color, opacity: .65 }}></div>
      <div style={{ font: "400 14px/18px Roboto", color: "#605D5D", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ font: "500 16px/20px Roboto", color: "#605D5D" }}>{value}</div>
    </div>);

}

function AuthFilterBar() {
  return (
    <div style={{ background: "rgb(240,245,255)", height: 62, display: "flex", alignItems: "center", padding: "0 40px", gap: 14, font: "400 13px Roboto", color: "#3A424A" }}>
      <span style={{ color: "#6A717D", fontSize: 14 }}>🛒</span>
      <span style={{ background: "#fff", border: "1px solid #D8D8D8", borderRadius: 4, padding: "4px 10px" }}>Auth Initiated Date : Last 7 Days ▾</span>
      <span style={{ color: "#6660A6", font: "500 13px Roboto", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}><span style={{ width: 14, height: 14, borderRadius: "50%", background: "#6660A6", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>+</span>Add More Filters</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #D8D8D8", borderRadius: 4, padding: "4px 10px", minWidth: 260 }}>
        <span style={{ color: "#6A717D" }}>🔍</span>
        <span style={{ color: "#8D949D", font: "400 13px Roboto" }}>Search Patient Records</span>
      </div>
    </div>);

}

function HeadingStatusRow({ review }) {
  return (
    <div style={{ padding: "24px 40px 24px", display: "flex", alignItems: "flex-start", gap: 32 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ font: "500 16px/20px Roboto", color: "#000" }}>Patient Auth Summary{review && <span style={{ marginLeft: 10, font: "500 11px Roboto", color: "#1677FF", border: "1px solid #1677FF", borderRadius: 2, padding: "1px 6px", verticalAlign: "middle" }}>REVIEW MODE</span>}</div>
        <div style={{ font: "400 14px/18px Roboto", color: "#3A424A", marginTop: 8 }}>Transaction status of the Auth request and response workflows</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 20, flexShrink: 0 }}>
        {chips.map((c) => <SummaryChip key={c.label} {...c} />)}
      </div>
    </div>);

}

const authRows = [
{ name: "Marvin Mckinney", mid: "B6100062245601", agency: "Agency 1", bcode: "Bcode", ep: "11521357", payor: "Aetna Medi..", type: "Mcare Adv", src: "Carelon", init: "01/15/24", sub: "01/15/24", auth: "Epi23456", recert: "Current", expiring: "", expired: "" },
{ name: "Esther Howard", mid: "B6789012345678", agency: "Agency 1", bcode: "Bcode", ep: "55493027", payor: "Humana Gold P.", type: "Mcare Adv", src: "Availity", init: "01/15/25", sub: "03/16/25", auth: "I1J2K3L4", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Wade Warren", mid: "B6789012345685", agency: "Agency 1", bcode: "Bcode", ep: "49625034", payor: "UHC - AARP M..", type: "Mcare Adv", src: "UHC", init: "01/17/25", sub: "03/30/25", auth: "TY964257", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Cameron Williamson", mid: "B6100054445634", agency: "Agency 1", bcode: "Bcode", ep: "97014890", payor: "Aetna Gold Plu..", type: "Mcare Adv", src: "Carelon", init: "01/18/25", sub: "04/04/25", auth: "K7L8M9N0", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Robert Fox", mid: "V6789012345686", agency: "Agency 1", bcode: "Bcode", ep: "69420061", payor: "HumanaChoice.", type: "Mcare Adv", src: "Availity", init: "04/18/25", sub: "04/18/25", auth: "G3H4I5J6", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Jenny Wilson", mid: "B6789012345711", agency: "Agency 1", bcode: "Bcode", ep: "43242523", payor: "Humana Gold P.", type: "Mcare Adv", src: "Availity", init: "01/21/25", sub: "04/04/25", auth: "M5N6O7P8", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Jacob Jones", mid: "B6789012345716", agency: "Agency 1", bcode: "Bcode", ep: "10434991", payor: "Humana Gold P.", type: "Mcare Adv", src: "Carelon", init: "01/15/25", sub: "03/16/25", auth: "Y7Z8A9B0", pd: "Past Due", recert: "Current", expiring: "02 Expiring", expired: "01 Expired", checked: true },
{ name: "Leslie Alexander", mid: "B6789012345697", agency: "Agency 1", bcode: "Bcode", ep: "76722340", payor: "Humana Gold P.", type: "Mcare Adv", src: "Availity", init: "01/15/25", sub: "05/12/25", auth: "S5T6U7V8", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Guy Hawkins", mid: "L700093345918", agency: "Agency 1", bcode: "Bcode", ep: "30214786", payor: "Humana Gold P.", type: "Mcare Adv", src: "Availity", init: "01/20/25", sub: "04/17/25", auth: "A3B4C5D6", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" },
{ name: "Jane Cooper", mid: "B6789012345720", agency: "Agency 1", bcode: "Bcode", ep: "42512413", payor: "Humana Gold P.", type: "Mcare Adv", src: "Availity", init: "04/01/25", sub: "04/01/25", auth: "Q9R0S1T2", recert: "Current", expiring: "2 Expiring", expired: "01 Expired" }];


function DashedTag({ text, color }) {
  return <span style={{ display: "inline-block", border: `1px dashed ${color}`, color, borderRadius: 2, padding: "1px 8px", font: "400 12px/16px Roboto" }}>{text}</span>;
}

function AuthTable({ onRow, review }) {
  const cols = [
  { key: "name", label: "Patient", w: 150, bar: true },
  { key: "mid", label: "Member ID", w: 135 },
  { key: "agency", label: "Agency", w: 78 },
  { key: "bcode", label: "Bcode", w: 60 },
  { key: "ep", label: "Ep #", w: 82 },
  { key: "payor", label: "Payor", w: 130 },
  { key: "type", label: "Payor Type", w: 82 },
  { key: "src", label: "Payor Src", w: 72 },
  { key: "init", label: "Auth Init Dt", w: 90 },
  { key: "sub", label: "Auth Sub Dt", w: 90 },
  { key: "auth", label: "Authorization#", w: 110 },
  { key: "pd", label: "", w: 90 },
  { key: "recert", label: "Recert Status", w: 82 },
  { key: "expiring", label: "Expiring", w: 100, align: "center" },
  { key: "expired", label: "Expired", w: 94, align: "center" },
  { key: "attach", label: "", w: 32, align: "center" },
  { key: "check", label: "", w: 32, align: "center" }];

  return (
    <div style={{ padding: "0 40px 32px" }}>
      <div style={{ border: "1px solid #E8E9EA", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "flex", background: "#F8FAFD", borderBottom: "1px solid #E8E9EA", padding: "12px 8px 12px 18px", alignItems: "center" }}>
          {cols.map((c, i) =>
          <div key={i} style={{ width: c.w, font: "500 12px/16px Roboto", color: "#3A424A", textAlign: c.align || "left", paddingRight: 6, display: "flex", alignItems: "center", gap: 4, justifyContent: c.align === "center" ? "center" : "flex-start" }}>
              <span>{c.label}</span>{c.label && <span style={{ color: "#C0C4CA", fontSize: 9 }}>▲▼</span>}
            </div>
          )}
        </div>
        {authRows.map((r, i) =>
        <div key={i} onClick={() => onRow && onRow(r)} style={{ display: "flex", height: 54, padding: "0 8px 0 0", borderBottom: i === authRows.length - 1 ? "none" : "1px solid #EEF0F3", cursor: "pointer", position: "relative", alignItems: "center", background: review && r.pd ? "rgba(255,244,244,.6)" : "#fff" }} onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFD"} onMouseLeave={(e) => e.currentTarget.style.background = review && r.pd ? "rgba(255,244,244,.6)" : "#fff"}>
            <div style={{ position: "absolute", left: 0, top: 10, bottom: 10, width: 3, background: "rgb(16,134,133)", borderRadius: 2 }}></div>
            {cols.map((c, j) => {
            let v = r[c.key];
            let content = v;
            if (c.key === "pd") content = v ? <DashedTag text={v} color="#C47097" /> : null;else
            if (c.key === "expiring" && v) content = <DashedTag text={v} color="#D7894A" />;else
            if (c.key === "expired" && v) content = <DashedTag text={v} color="#CF1322" />;else
            if (c.key === "attach") content = <span style={{ color: "#8D949D", fontSize: 15 }}>🔗</span>;else
            if (c.key === "check") content = <span style={{ width: 16, height: 16, border: "1px solid " + (r.checked ? "#1677FF" : "#D8D8D8"), background: r.checked ? "#1677FF" : "#fff", borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 }}>{r.checked ? "✓" : ""}</span>;else
            if (c.key === "name") content = <span style={{ font: "500 13px/16px Roboto", color: "#3A424A" }}>{v}</span>;else
            if (!v) content = <span style={{ color: "#8D949D" }}>-</span>;
            return (
              <div key={j} style={{ width: c.w, font: "400 13px/16px Roboto", color: "#3A424A", textAlign: c.align || "left", paddingLeft: j === 0 ? 18 : 0, paddingRight: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: c.align === "center" ? "flex" : "block", justifyContent: c.align === "center" ? "center" : undefined }}>{content}</div>);

          })}
          </div>
        )}
      </div>
    </div>);

}

// Full Auth Patient Summary (used both as sub-tab content AND as fullscreen detail)
function PatientAuthSummaryView({ onRow, review }) {
  return (
    <div>
      <AuthFilterBar />
      <HeadingStatusRow review={review} />
      <AuthTable onRow={onRow} review={review} />
    </div>);

}

// ── Auth Request View (rebuilt to match Figma source) ──────────
// The header zone has a single "Auth Status" card with 7 clickable
// chips (each whole card region is the click target). Below that is
// a flat list of separated row cards. Clicking a row's chevron toggles
// an "Auth Details - REF…" sub-table.

// === Auth Status chips card =====================================
const authStatusChips = [
{ key: "all", label: "Authorizations", value: "106", color: "rgb(21,95,130)" },
{ key: "pending", label: "Pending Submission", value: "02", color: "rgb(61,116,155)", icon: "user" },
{ key: "approved", label: "Approved", value: "60", color: "rgb(65,159,74)" },
{ key: "partial", label: "Partially Approved", value: "10", color: "rgb(35,113,71)" },
{ key: "denied", label: "Denied", value: "10", color: "rgb(215,65,65)", caret: true },
{ key: "pendDays", label: "Pending", value: "08", color: "rgb(61,116,155)", suffix: "(<10 Days)" },
{ key: "except", label: "Exceptions", value: "09", color: "rgb(156,119,25)", caret: true }];


function AuthStatusCard({ activeIdx, onChip }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: "1px solid rgb(232,227,227)", borderRadius: 5, background: "#fff", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
      <div style={{ width: 71, padding: "0 14px", background: "rgba(247,247,249,0.49)", borderRight: "1px solid rgb(232,227,227)", display: "flex", alignItems: "center", justifyContent: "center", font: "500 14px/18px Roboto", color: "rgb(107,102,102)", textAlign: "center" }}>Auth<br />Status</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 22, padding: "14px 18px" }}>
        {authStatusChips.map((c, i) => {
          const active = activeIdx === i;
          const dim = activeIdx != null && !active;
          const widths = { all: 93, pending: 146, approved: 93, partial: 114, denied: 78, pendDays: 106, except: 92 };
          return (
            <div key={c.key} role="button" onClick={() => onChip(i)} onMouseEnter={(e) => {if (!active) e.currentTarget.style.background = "rgba(247,247,249,0.6)";}} onMouseLeave={(e) => {e.currentTarget.style.background = "transparent";}} style={{ cursor: "pointer", position: "relative", width: widths[c.key] || 93, paddingTop: 8, paddingBottom: 6, paddingLeft: 6, paddingRight: 6, borderRadius: 4, opacity: dim ? 0.55 : 1, transition: "opacity .12s, background .12s" }}>
              <div style={{ position: "absolute", top: 0, left: 6, right: 6, height: 4, borderRadius: 4, background: c.color, opacity: active ? 1 : 0.6 }}></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, font: "400 14px/18px Roboto", color: "rgb(96,93,93)", whiteSpace: "nowrap" }}>
                {c.icon === "user" && <span style={{ width: 14, height: 14, borderRadius: "50%", background: "rgb(139,172,195)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 600 }}>↑</span>}
                <span>{c.label}</span>
                {c.suffix && <span style={{ color: "#8D949D", fontSize: 11 }}>{c.suffix}</span>}
                {c.caret && <span style={{ color: active ? "#1677FF" : "#8D949D", fontSize: 9 }}>▾</span>}
              </div>
              <div style={{ font: "500 16px/20px Roboto", color: "rgb(96,93,93)", marginTop: 4 }}>{c.value}</div>
              {active && <div onClick={(e) => {e.stopPropagation();onChip(null);}} style={{ marginTop: 4, font: "500 12px/14px Roboto", color: "rgb(22,119,255)", display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ fontSize: 11 }}>↻</span>Reset</div>}
            </div>);

        })}
      </div>
    </div>);

}

// === Automation (AT) Status sub-line =============================
function AutomationStatusLine() {
  const Dot = ({ c }) => <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", marginRight: 6 }}></span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, font: "400 13px/18px Roboto", color: "#3A424A" }}>
      <span>Automation (AT) Status :</span>
      <span style={{ display: "inline-flex", alignItems: "center" }}><Dot c="rgb(56,158,13)" />Completed <span style={{ marginLeft: 6, fontWeight: 500 }}>05</span></span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ color: "#D7894A", fontSize: 14, lineHeight: 1 }}>⚠</span>Needs Attention <span style={{ fontWeight: 500 }}>02</span> <span style={{ color: "#8D949D", fontSize: 9 }}>▾</span></span>
      <span style={{ display: "inline-flex", alignItems: "center" }}><Dot c="rgb(22,119,255)" />In Progress <span style={{ marginLeft: 6, fontWeight: 500 }}>02</span></span>
    </div>);

}

// === Title cluster (top-left) ====================================
function ARVTitleCluster({ filterLabel }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ font: "500 16px/20px Roboto", color: "#000" }}>Auth Request View -</span>
        <span style={{ font: "500 16px/20px Roboto", color: "rgb(22,119,255)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>{filterLabel} <span style={{ fontSize: 10 }}>▾</span></span>
      </div>
      <div style={{ font: "400 14px/18px Roboto", color: "rgb(58,66,74)", marginTop: 8 }}>Status Summary of Auth Requests Submitted to Payors</div>
    </div>);

}

// === Auth Details sub-table (the row expansion panel) ============
const svcLines = {
  default: [
  { svc: "SN", track: "P2114324789", reqRange: "04/28/25 - 05/19/25", auth: "B235054831", pyrResp: "04/26/25", apprRange: "04/28/25 - 05/19/25", req: "04", apprvd: 1, denied: "-", pending: "-", expire: "09", lastChk: "04/25/25", at: "Completed", status: "Approved" },
  { svc: "PT", track: "P2114324789", reqRange: "04/28/25 - 05/19/25", auth: "B235054831", pyrResp: "04/26/25", apprRange: "04/28/25 - 05/19/25", req: "04", apprvd: 1, denied: "-", pending: "-", expire: "09", lastChk: "04/25/25", at: "Completed", status: "Approved" }]

};

function AuthDetailsPanel({ row }) {
  const lines = svcLines.default;
  const refNo = "REF" + String(row.epi || "").replace(/\D/g, "").padEnd(10, "0").slice(0, 10);
  const cols = [
  { label: "SVC", w: 60 },
  { label: "Auth Tracking #", w: 130 },
  { label: "Auth Req Start & End Date", w: 200 },
  { label: "Authorization#", w: 140 },
  { label: "Pyr Resp Date", w: 110 },
  { label: "Approved Start & End Date", w: 200 },
  { label: "Req", w: 60, align: "center" },
  { label: "Apprvd", w: 70, align: "center" },
  { label: "Denied", w: 70, align: "center" },
  { label: "Pending", w: 80, align: "center" },
  { label: "Days to Expire", w: 110, align: "center" },
  { label: "Last Status Chck", w: 120 },
  { label: "AT Status", w: 120 },
  { label: "Auth Status", w: 140 },
  { label: "Reviewed?", w: 90, align: "center" }];

  return (
    <div style={{ padding: "4px 0 14px 32px", background: "#fff" }}>
      <div style={{ border: "1px solid #E8E9EA", borderRadius: 6, background: "#fff", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "12px 18px", borderBottom: "1px solid #EEF0F3" }}>
          <span style={{ font: "500 14px/18px Roboto", color: "#000" }}>Auth Details - {refNo}</span>
          <span style={{ font: "400 13px/16px Roboto", color: "rgb(22,119,255)", cursor: "pointer" }}>View Automation Log</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", background: "#F0F1FB", borderBottom: "1px solid #E8E9EA", padding: "10px 14px", minWidth: "max-content" }}>
            {cols.map((c, i) =>
            <div key={i} style={{ width: c.w, font: "500 12px/16px Roboto", color: "#3A424A", textAlign: c.align || "left", paddingRight: 6 }}>{c.label}</div>
            )}
          </div>
          {lines.map((l, i) =>
          <div key={i} style={{ display: "flex", padding: "14px 14px", borderBottom: i === lines.length - 1 ? "none" : "1px solid #EEF0F3", alignItems: "center", font: "400 13px/16px Roboto", color: "#3A424A", minWidth: "max-content" }}>
              <div style={{ width: 60, fontWeight: 500 }}>{l.svc}</div>
              <div style={{ width: 130 }}>{l.track}</div>
              <div style={{ width: 200 }}>{l.reqRange}</div>
              <div style={{ width: 140, display: "flex", alignItems: "center", gap: 6 }}>{l.auth}<span style={{ color: "#8D949D", cursor: "pointer", fontSize: 12 }}>⧉</span></div>
              <div style={{ width: 110 }}>{l.pyrResp}</div>
              <div style={{ width: 200 }}>{l.apprRange}</div>
              <div style={{ width: 60, textAlign: "center" }}>{l.req}</div>
              <div style={{ width: 70, textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "rgb(232,71,71)", color: "#fff", font: "500 12px/22px Roboto" }}>{l.apprvd}</span></div>
              <div style={{ width: 70, textAlign: "center", color: "#8D949D" }}>{l.denied}</div>
              <div style={{ width: 80, textAlign: "center", color: "#8D949D" }}>{l.pending}</div>
              <div style={{ width: 110, textAlign: "center" }}>{l.expire}</div>
              <div style={{ width: 120 }}>{l.lastChk}</div>
              <div style={{ width: 120, display: "inline-flex", alignItems: "center", gap: 6, color: "rgb(22,119,255)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(22,119,255)" }}></span>{l.at}</div>
              <div style={{ width: 140, display: "inline-flex", alignItems: "center", gap: 6, color: "rgb(56,158,13)" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgb(56,158,13)" }}></span>{l.status}</div>
              <div style={{ width: 90, textAlign: "center" }}><span style={{ display: "inline-block", width: 16, height: 16, border: "1px solid #D8D8D8", borderRadius: 2 }}></span></div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// === Auth Request rows (matches Figma sample) ===================
const arvRows = [
{ key: "r1", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 2", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "approved" },
{ key: "r2", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r3", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r4", name: "Robert Fox", mrn: "B6789012345685", mid: "69420061", agency: "E5A05.\n11245", branch: "Bcode", payor: "Humana", src: "Availity", gw: false, mode: "", epi: "G3H4I5J6", type: "Addl.", init: "04/01/25", sub: "", auth: "Multiple", pyrResp: "04/11/24", followUp: "", at: "check", status: "approved", warning: "Patient record not found in Grid" },
{ key: "r5", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r6", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r7", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r8", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r9", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" },
{ key: "r10", name: "Marvin Mckinney", mrn: "B6100062245601", mid: "11521357", agency: "Agency 1", branch: "Bcode", payor: "Aetna Me..", src: "Carelon", gw: true, mode: "", epi: "Epi964256", type: "Re-cert", init: "04/25/25", sub: "04/25/25", auth: "Multiple", pyrResp: "04/26/25", followUp: "04/26/25", at: "thumb", status: "denied" }];


const arvStatusStyles = {
  approved: { bg: "#E6F7E0", bd: "#9FCB8A", c: "#1F7A3A", label: "Approved" },
  denied: { bg: "#FBE4E4", bd: "#E8A1A1", c: "#B92D2D", label: "Denied" },
  pending: { bg: "#FFFBE6", bd: "#FFE58F", c: "#D7A718", label: "Pending" }
};
function ARVStatusBadge({ kind }) {
  const s = arvStatusStyles[kind] || arvStatusStyles.pending;
  return <span style={{ display: "inline-block", padding: "4px 18px", borderRadius: 4, background: s.bg, border: `1px solid ${s.bd}`, color: s.c, font: "400 13px/16px Roboto", textAlign: "center", minWidth: 108 }}>{s.label}</span>;
}

// === Column geometry shared by header + rows ===================
// Tweakable via window.__arvColW (set by Tweaks panel) so users can
// nudge column widths live.
const _arvColWBase = {
  chev: 36, name: 148, mrn: 140, mid: 84, agency: 76, branch: 60, src: 72, gw: 42, mode: 58,
  epi: 88, type: 64, init: 78, sub: 78, auth: 96, summary: 148,
  pyrResp: 88, followUp: 88, atStatus: 64, authStatus: 124, docs: 48, reviewed: 78
};
const arvColW = new Proxy(_arvColWBase, {
  get(t, k) {const o = typeof window !== "undefined" && window.__arvColW || {};return o[k] ?? t[k];}
});

function ARVHeader() {
  const cell = (w, content, style = {}) => <div style={{ width: w, paddingRight: 6, ...style }}>{content}</div>;
  const sortable = (label) => <div style={{ display: "flex", alignItems: "center", gap: 3, font: "400 12px/14px Roboto", color: "#3A424A" }}><span style={{ display: "inline-flex", flexDirection: "column", lineHeight: .5, color: "#C0C4CA", fontSize: 7 }}>▲▼</span>{label}</div>;
  const plain = (label, info) => <div style={{ display: "flex", alignItems: "center", gap: 3, font: "400 12px/14px Roboto", color: "#3A424A" }}>{label}{info && <span style={{ color: "#8D949D", fontSize: 11 }}>ⓘ</span>}</div>;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", padding: "10px 4px 12px 4px", borderBottom: "1px solid rgb(222,222,222)", background: "#fff" }}>
      {cell(arvColW.chev, null)}
      {cell(arvColW.name, sortable("Patient Name"))}
      {cell(arvColW.mrn, sortable("MRN"))}
      {cell(arvColW.mid, sortable("Mem ID"))}
      {cell(arvColW.agency, sortable("Agency"))}
      {cell(arvColW.branch, sortable("Branch"))}
      {cell(arvColW.src, sortable("Pyr Src"))}
      {cell(arvColW.gw, sortable("GW"), { textAlign: "center" })}
      {cell(arvColW.mode, sortable(<span>Mode <span style={{ color: "#8D949D", fontSize: 11 }}>ⓘ</span></span>), { textAlign: "center" })}
      {cell(arvColW.epi, plain("Epi ID"))}
      {cell(arvColW.type, <div style={{ font: "400 12px/14px Roboto", color: "#3A424A" }}>Auth<br />Type</div>)}
      {cell(arvColW.init, plain("Auth Init Dt", true))}
      {cell(arvColW.sub, plain("Auth Sub Dt", true))}
      {cell(arvColW.auth, plain("Authorization#"))}
      {cell(arvColW.summary, <div style={{ textAlign: "center" }}><div style={{ font: "400 12px/14px Roboto", color: "#3A424A" }}>Auth Req Summary</div><div style={{ display: "flex", justifyContent: "space-around", marginTop: 4, font: "500 11px Roboto", color: "#6A717D" }}><span>R</span><span>A</span><span>D</span><span>P</span></div></div>)}
      {cell(arvColW.pyrResp, plain("Pyr Resp Dt"))}
      {cell(arvColW.followUp, plain("Follow up Dt"))}
      {cell(arvColW.atStatus, plain("AT Status"), { textAlign: "center" })}
      {cell(arvColW.authStatus, <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, font: "400 12px/14px Roboto", color: "#3A424A" }}>Auth Status <span style={{ color: "#C0C4CA", fontSize: 9 }}>▽</span></div>)}
      {cell(arvColW.docs, plain("Docs"), { textAlign: "center" })}
      {cell(arvColW.reviewed, plain("Reviewed?"), { textAlign: "center" })}
    </div>);

}

function ARVRow({ row, expanded, onToggle, onPatient, reviewed, onReviewed, showLeftBar, density = "comfortable", showRowShadow = true, chevronStyle = "triangle", checkboxAccent = "#1677FF" }) {
  const counts = row.status === "approved" ?
  { R: "04", A: "04", D: "00", P: "00" } :
  row.status === "denied" ?
  { R: "04", A: "00", D: "04", P: "00" } :
  { R: "05", A: "02", D: "01", P: "02" };
  const Pill = ({ children }) => <span style={{ display: "inline-block", padding: "4px 10px", border: "1px solid #D8D8D8", borderRadius: 3, background: "#fff", font: "400 13px/16px Roboto", color: "#3A424A", whiteSpace: "nowrap" }}>{children}</span>;
  const rowH = density === "cozy" ? 44 : density === "roomy" ? 60 : 52;
  const rowMb = density === "cozy" ? 6 : density === "roomy" ? 12 : 8;
  const chev = chevronStyle === "plus" ? expanded ? "−" : "+" : expanded ? "▾" : "▸";
  return (
    <React.Fragment>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", height: rowH, padding: "0 4px", border: "1px solid rgb(216,215,228)", borderRadius: 5, boxShadow: showRowShadow ? "0px 4px 4px 0px rgba(0,0,0,0.04)" : "none", background: "#fff", position: "relative", cursor: "pointer", overflow: "hidden", marginBottom: rowMb }}>
        {showLeftBar && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "rgb(16,134,133)" }}></div>}
        <div style={{ width: arvColW.chev, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}><span style={{ display: "inline-block", color: "#3A424A", fontSize: chevronStyle === "plus" ? 14 : 10, lineHeight: 1, fontWeight: chevronStyle === "plus" ? 500 : 400 }}>{chev}</span></div>
        <div onClick={(e) => {e.stopPropagation();onPatient && onPatient(row);}} style={{ width: arvColW.name, paddingRight: 6, font: "400 13px/16px Roboto", color: "#000", cursor: "pointer", zIndex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div>
        <div style={{ width: arvColW.mrn, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.mrn}</div>
        <div style={{ width: arvColW.mid, paddingRight: 6, font: "500 13px/16px Roboto", color: "rgb(56,158,13)", zIndex: 1 }}>{row.mid}</div>
        <div style={{ width: arvColW.agency, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1, whiteSpace: "pre-line", lineHeight: 1.2 }}>{row.agency}</div>
        <div style={{ width: arvColW.branch, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.branch}</div>
        <div style={{ width: arvColW.src, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.src}</div>
        <div style={{ width: arvColW.gw, textAlign: "center", zIndex: 1 }}>{row.gw && <span style={{ color: "#6A717D", fontSize: 14 }}>⚙</span>}</div>
        <div style={{ width: arvColW.mode, textAlign: "center", zIndex: 1, color: "#3A424A" }}>{row.mode || "-"}</div>
        <div style={{ width: arvColW.epi, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.epi}</div>
        <div style={{ width: arvColW.type, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.type}</div>
        <div style={{ width: arvColW.init, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.init || "-"}</div>
        <div style={{ width: arvColW.sub, paddingRight: 6, font: "400 13px/16px Roboto", color: "#3A424A", zIndex: 1 }}>{row.sub || "-"}</div>
        <div style={{ width: arvColW.auth, paddingRight: 6, zIndex: 1 }}><Pill>{row.auth}</Pill></div>
        <div style={{ width: arvColW.summary, display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 1 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(74,144,226,0.18)", color: "#3A424A", font: "500 11px Roboto" }}>{counts.R}</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(56,158,13,0.18)", color: "#3A424A", font: "500 11px Roboto" }}>{counts.A}</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(232,71,71,0.18)", color: "#3A424A", font: "500 11px Roboto" }}>{counts.D}</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(156,119,25,0.18)", color: "#3A424A", font: "500 11px Roboto" }}>{counts.P}</span>
        </div>
        <div style={{ width: arvColW.pyrResp, paddingRight: 6, zIndex: 1 }}><Pill>{row.pyrResp || "-"}</Pill></div>
        <div style={{ width: arvColW.followUp, paddingRight: 6, zIndex: 1 }}>{row.followUp ? <Pill>{row.followUp}</Pill> : <span style={{ color: "#8D949D" }}>-</span>}</div>
        <div style={{ width: arvColW.atStatus, textAlign: "center", zIndex: 1 }}>{row.at === "check" ? <span style={{ color: "rgb(56,158,13)", fontSize: 16 }}>✓</span> : <span style={{ color: "#3A424A", fontSize: 16 }}>👍</span>}</div>
        <div style={{ width: arvColW.authStatus, textAlign: "center", zIndex: 1, position: "relative" }}>
          <ARVStatusBadge kind={row.status} />
          {row.warning && <div style={{ position: "absolute", top: 30, right: -4, font: "500 10px/12px Roboto", color: "#9C7719", background: "#FFFBE6", border: "1px solid #FFE58F", borderRadius: 3, padding: "3px 8px", whiteSpace: "nowrap", zIndex: 5 }}><div style={{ fontWeight: 600 }}>Needs Attention</div><div style={{ fontWeight: 400 }}>{row.warning}</div></div>}
        </div>
        <div style={{ width: arvColW.docs, textAlign: "center", zIndex: 1, color: "#8D949D", fontSize: 14 }}>📎</div>
        <div style={{ width: arvColW.reviewed, textAlign: "center", zIndex: 1 }} onClick={(e) => {e.stopPropagation();onReviewed && onReviewed();}}>
          <span role="checkbox" aria-checked={!!reviewed} tabIndex={0} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, border: `1px solid ${reviewed ? checkboxAccent : "#D8D8D8"}`, borderRadius: 3, background: reviewed ? checkboxAccent : "#fff", cursor: "pointer", transition: "background .12s, border-color .12s" }}>
            {reviewed && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1, fontWeight: 700 }}>✓</span>}
          </span>
        </div>
      </div>
      {expanded && <AuthDetailsPanel row={row} />}
    </React.Fragment>);

}

function AuthRequestView({ onPatient, showLeftBar = false, density = "comfortable", showRowShadow = true, chevronStyle = "triangle", checkboxAccent = "#1677FF" }) {
  const [activeChip, setActiveChip] = useP(null);
  const [openIdx, setOpenIdx] = useP(0);
  const [reviewedSet, setReviewedSet] = useP({});
  const toggleReviewed = (k) => setReviewedSet((s) => ({ ...s, [k]: !s[k] }));
  const filterLabel = activeChip == null ? "All Auth Requests" : authStatusChips[activeChip].label;
  return (
    <div style={{ background: "rgb(248,249,251)" }}>
      <AuthFilterBar />
      <div style={{ padding: "24px 32px 0", display: "flex", alignItems: "flex-start", gap: 32 }}>
        <ARVTitleCluster filterLabel={filterLabel} />
        <div style={{ marginLeft: "auto" }}>
          <AuthStatusCard activeIdx={activeChip} onChip={(i) => setActiveChip(activeChip === i ? null : i)} />
        </div>
      </div>
      <div style={{ padding: "8px 32px 16px", display: "flex", justifyContent: "flex-end" }}>
        <AutomationStatusLine />
      </div>
      <div style={{ padding: "0 32px 32px" }}>
        <ARVHeader />
        <div style={{ paddingTop: 8 }}>
          {arvRows.map((r, i) =>
          <ARVRow
            key={r.key}
            row={r}
            expanded={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
            onPatient={onPatient}
            reviewed={!!reviewedSet[r.key]}
            onReviewed={() => toggleReviewed(r.key)}
            showLeftBar={showLeftBar}
            density={density}
            showRowShadow={showRowShadow}
            chevronStyle={chevronStyle}
            checkboxAccent={checkboxAccent} />

          )}
        </div>
      </div>
    </div>);

}

function AutomationLog() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ border: "1px dashed #D8D8D8", borderRadius: 8, padding: "60px 24px", textAlign: "center", color: "#8D949D", font: "400 14px Roboto" }}>
        Automation Log — run-level Extraction / Parsing stages would render here.
      </div>
    </div>);

}

function AuthorizationSection({ sub, onSub, review, onReview, onRow, breadcrumb, onBack, showLeftBar, density, showRowShadow, chevronStyle, checkboxAccent }) {
  const subTabs = [
  { label: "Patient Auth Summary View", icon: "▦" },
  { label: "Auth Request View", icon: "☰" },
  { label: "Automation Log", icon: "" }];

  return (
    <div>
      <SectionBand title="Authorization Center" subTabs={subTabs} activeSub={sub} onSub={onSub} review={review} onReview={onReview} showReview={true} breadcrumb={breadcrumb} onBack={onBack} />
      {sub === 0 && <PatientAuthSummaryView onRow={onRow} review={review} />}
      {sub === 1 && <AuthRequestView onPatient={onRow} showLeftBar={showLeftBar} density={density} showRowShadow={showRowShadow} chevronStyle={chevronStyle} checkboxAccent={checkboxAccent} />}
      {sub === 2 && <AutomationLog />}
    </div>);

}

// ── Tweak defaults (persisted via host's __edit_mode_set_keys) ──
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "showLeftBar": false,
  "rowDensity": "comfortable",
  "showRowShadow": true,
  "rightHalfTint": false,
  "chevronStyle": "triangle",
  "checkboxAccent": "#1677FF",
  "colNameW": 148,
  "colMrnW": 140,
  "colAuthStatusW": 124
} /*EDITMODE-END*/;

// ── Root router ──────────────────────────────────────────────
function Prototype() {
  // Default landing = Eligibility Dashboard (no separate home tile screen)
  const [section, setSection] = useP("eligibility"); // dashboard | eligibility | authorization
  const [eligSub, setEligSub] = useP(0);
  const [authSub, setAuthSub] = useP(0);
  const [detail, setDetail] = useP(null); // null | { patient }
  const [review, setReview] = useP(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Push column-width tweaks into the live arvColW Proxy
  React.useEffect(() => {
    window.__arvColW = {
      name: tweaks.colNameW,
      mrn: tweaks.colMrnW,
      authStatus: tweaks.colAuthStatusW
    };
  }, [tweaks.colNameW, tweaks.colMrnW, tweaks.colAuthStatusW]);

  // Holds the payload key to open the drawer with, or null when closed.
  const [eligDrawer, setEligDrawer] = useP(null);

  const goHome = () => {setDetail(null);setEligDrawer(null);setSection("eligibility");setEligSub(0);};
  const goSection = (k) => {setDetail(null);setSection(k);};

  // Fullscreen detail replaces the viewport
  if (detail) {
    return (
      <React.Fragment>
      <div style={{ minHeight: "100vh", background: "#fff", font: "400 14px/18px Roboto" }} data-screen-label="03 Patient Auth Summary View">
        <TopNav section="authorization" onSection={goSection} onLogo={goHome} />
        <AuthorizationSection
            showLeftBar={tweaks.showLeftBar}
            density={tweaks.rowDensity}
            showRowShadow={tweaks.showRowShadow}
            chevronStyle={tweaks.chevronStyle}
            checkboxAccent={tweaks.checkboxAccent}
            sub={0}
            onSub={(i) => {if (i === 0) {return;}setAuthSub(i);setDetail(null);}}
            review={review}
            onReview={() => setReview((v) => !v)}
            onRow={() => {}}
            breadcrumb={["Authorization", detail.patient.name]}
            onBack={() => setDetail(null)} />
          
      </div>
      <ARVTweaks tweaks={tweaks} setTweak={setTweak} />
      </React.Fragment>);

  }

  return (
    <React.Fragment>
    <div style={{ minHeight: "100vh", background: "#fff", font: "400 14px/18px Roboto" }} data-screen-label={
      section === "dashboard" ? "01 Dashboard" :
      section === "eligibility" ? "01 Eligibility Dashboard" : "01 Authorization"
      }>
      <TopNav section={section} onSection={goSection} onLogo={goHome} />
      {section === "dashboard" &&
        <div>
          <SectionBand title="Dashboard" subTabs={[{ label: "Overview", icon: "▦" }, { label: "Alerts", icon: "!" }]} activeSub={0} onSub={() => {}} showReview={false} />
          <Dashboard onPatient={() => setDetail({ patient: authRows[0] })} />
        </div>
        }
      {section === "eligibility" &&
        <EligibilitySection
          sub={eligSub}
          onSub={setEligSub}
          onPatient={(row) => {
            // Cameron Williamson is wired to the BCBS Nevada per-patient payload.
            const isCameron = row && /cameron/i.test(row.name || "");
            setEligDrawer(isCameron ? "cameron_williamson" : "medicare_advantage");
          }} />

        }
      {section === "authorization" &&
        <AuthorizationSection
          showLeftBar={tweaks.showLeftBar}
          density={tweaks.rowDensity}
          showRowShadow={tweaks.showRowShadow}
          chevronStyle={tweaks.chevronStyle}
          checkboxAccent={tweaks.checkboxAccent}
          sub={authSub}
          onSub={setAuthSub}
          review={review}
          onReview={() => setReview((v) => !v)}
          onRow={(r) => setDetail({ patient: r })} />

        }
    </div>
    {eligDrawer && <EligibilityDetailContainer initialKey={eligDrawer} onClose={() => setEligDrawer(null)} />}
    <ARVTweaks tweaks={tweaks} setTweak={setTweak} />
    </React.Fragment>);

}

// ── Tweaks panel content for the Auth Request View ─────────────
function ARVTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Auth Request rows">
        <TweakToggle
          label="Left status bar"
          value={tweaks.showLeftBar}
          onChange={(v) => setTweak("showLeftBar", v)} />
        
        <TweakToggle
          label="Row drop-shadow"
          value={tweaks.showRowShadow}
          onChange={(v) => setTweak("showRowShadow", v)} />
        
        <TweakRadio
          label="Density"
          value={tweaks.rowDensity}
          options={[
          { label: "Cozy", value: "cozy" },
          { label: "Comfortable", value: "comfortable" },
          { label: "Roomy", value: "roomy" }]
          }
          onChange={(v) => setTweak("rowDensity", v)} />
        
        <TweakRadio
          label="Chevron"
          value={tweaks.chevronStyle}
          options={[
          { label: "▸ Triangle", value: "triangle" },
          { label: "+ Plus", value: "plus" }]
          }
          onChange={(v) => setTweak("chevronStyle", v)} />
        
      </TweakSection>

      <TweakSection label="Reviewed checkbox">
        <TweakColor
          label="Accent color"
          value={tweaks.checkboxAccent}
          onChange={(v) => setTweak("checkboxAccent", v)} />
        
      </TweakSection>

      <TweakSection label="Column widths">
        <TweakSlider
          label="Patient Name"
          value={tweaks.colNameW}
          min={120} max={220} step={2} unit="px"
          onChange={(v) => setTweak("colNameW", v)} />
        
        <TweakSlider
          label="MRN"
          value={tweaks.colMrnW}
          min={110} max={200} step={2} unit="px"
          onChange={(v) => setTweak("colMrnW", v)} />
        
        <TweakSlider
          label="Auth Status"
          value={tweaks.colAuthStatusW}
          min={100} max={180} step={2} unit="px"
          onChange={(v) => setTweak("colAuthStatusW", v)} />
        
      </TweakSection>
    </TweaksPanel>);

}

Object.assign(window, { Prototype });