// Eligibility Request View — full-page list of eligibility requests.
// Reuses the dark-navy app shell rendered by Prototype.jsx; this file
// only renders the white content area: filter bar, title cluster +
// status summary, AT status strip, table, pagination.
const { useState: useERV, useEffect: useERVE, useRef: useERVR } = React;

// ── Mock data ─────────────────────────────────────────────────
const ERV_ROWS = [
  { id:"r1",  name:"Marvin Mckinney",   mrn:"B6100062245601", agency:"Agency 2", branch:"Bcode", memId:"11521357", payorSrc:"Aetna Medi…",     payor:"Aetna",          soc:"01/21/25", mode:"gear",   gw:"Availity", chk:"01/21/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r2",  name:"Esther Howard",     mrn:"B6789012345678", agency:"Agency 1", branch:"Bcode", memId:"11521357", payorSrc:"Star + Plus",     payor:"Texas Medicaid", soc:"01/07/25", mode:"person", gw:"",         chk:"01/21/25", at:"none",      alerts:0, cov:"pending",  docs:false, action:"edit",  followUp:""        },
  { id:"r3",  name:"Cameron William…",  mrn:"B6100054445634", agency:"Agency 1", branch:"Bcode", memId:"42512413", payorSrc:"HumanaCh…",       payor:"Humana",         soc:"01/05/25", mode:"gear",   gw:"Availity", chk:"01/21/25", at:"hourglass", alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
  { id:"r4",  name:"Leslie Alexander",  mrn:"B6789012345697", agency:"Agency 1", branch:"Bcode", memId:"69420061", payorSrc:"Medicare -…",     payor:"Medicare",       soc:"12/30/25", mode:"gear",   gw:"Inovalon", chk:"01/21/25", at:"thumb",     alerts:2, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r5",  name:"Robert Fox",        mrn:"V6789012345686", agency:"Agency 1", branch:"Bcode", memId:"97014890", payorSrc:"UHC Compl…",      payor:"UHC",            soc:"01/05/25", mode:"gear",   gw:"UHC",      chk:"01/21/25", at:"warning",   alerts:0, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r6",  name:"Jenny Wilson",      mrn:"B6789012345711", agency:"Agency 1", branch:"Bcode", memId:"97014890", payorSrc:"Humana G…",       payor:"Humana",         soc:"01/04/25", mode:"gear",   gw:"Availity", chk:"01/21/25", at:"thumb",     alerts:0, cov:"inactive", docs:true,  action:"view",  followUp:""        },
  { id:"r7",  name:"Jacob Jones",       mrn:"B6789012345716", agency:"Agency 1", branch:"Bcode", memId:"55493027", payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"12/30/25", mode:"gear",   gw:"Waystar",  chk:"01/21/25", at:"warning",   alerts:0, cov:"mixed",    docs:false, action:"view",  followUp:""        },
  { id:"r8",  name:"Guy Hawkins",       mrn:"L700093345918",  agency:"Agency 1", branch:"Bcode", memId:"55493027", payorSrc:"UHC Compl…",      payor:"UHC",            soc:"12/30/25", mode:"gear",   gw:"UHC",      chk:"01/21/25", at:"thumb",     alerts:0, cov:"active",   docs:true,  action:"view",  followUp:""        },
  { id:"r9",  name:"Telo Hetry",        mrn:"J700093345753",  agency:"Agency 1", branch:"Bcode", memId:"16628235", payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"12/30/25", mode:"gear",   gw:"Waystar",  chk:"01/21/25", at:"thumb",     alerts:0, cov:"exception",docs:false, action:"view",  followUp:""        },
  { id:"r10", name:"Utar Ganthir",      mrn:"K700093345989",  agency:"Agency 1", branch:"Bcode", memId:"",         payorSrc:"Aetna Gold…",     payor:"Aetna",          soc:"01/01/25", mode:"gear",   gw:"Waystar",  chk:"01/21/25", at:"thumb",     alerts:0, cov:"active",   docs:false, action:"view",  followUp:""        },
];

// ── Status summary chips ──────────────────────────────────────
const ERV_STATUS = [
  { id:"all",      label:"All Patients",       color:"#64748b", icon:null,     weight:1.0 },
  { id:"pending",  label:"Pending Submission", color:"#3f7ba8", icon:"person", weight:1.4 },
  { id:"active",   label:"Active",             color:"#16a34a", icon:null,     weight:0.6 },
  { id:"mixed",    label:"Mixed",              color:"#d97706", icon:null,     weight:0.5 },
  { id:"inactive", label:"Inactive",           color:"#dc2626", icon:null,     weight:0.7 },
  { id:"exception",label:"Exceptions",         color:"#f97316", icon:null,     weight:0.85 },
  { id:"alerts",   label:"Eligibility Alerts", color:"#dc2626", icon:null,     weight:1.4 },
];

// Compute live counts from rows so each chip + AT status counter
// reflects the actual dataset. When a filter is active, the chips show
// counts within the filtered subset (except All Patients which always
// shows the full total).
function filterRowsByStatus(rows, statusId) {
  if (!statusId || statusId === "all") return rows;
  if (statusId === "alerts") return rows.filter(r => r.alerts > 0);
  return rows.filter(r => r.cov === statusId);
}
function countsForRows(rows) {
  return {
    pending:    rows.filter(r => r.cov === "pending").length,
    active:     rows.filter(r => r.cov === "active").length,
    mixed:      rows.filter(r => r.cov === "mixed").length,
    inactive:   rows.filter(r => r.cov === "inactive").length,
    exception:  rows.filter(r => r.cov === "exception").length,
    alerts:     rows.filter(r => r.alerts > 0).length,
    completed:  rows.filter(r => r.at === "thumb").length,
    needsAttn:  rows.filter(r => r.at === "warning").length,
    inProgress: rows.filter(r => r.at === "hourglass").length,
  };
}
const pad2 = (n) => String(n).padStart(2, "0");
function getERVCounts(allRows, activeStatus) {
  const subset = filterRowsByStatus(allRows, activeStatus);
  const sub = countsForRows(subset);
  return {
    byChip: {
      all:        pad2(allRows.length),
      pending:    pad2(sub.pending),
      active:     pad2(sub.active),
      mixed:      pad2(sub.mixed),
      inactive:   pad2(sub.inactive),
      exception:  pad2(sub.exception),
      alerts:     pad2(sub.alerts),
    },
    at: {
      completed:  pad2(sub.completed),
      needsAttn:  pad2(sub.needsAttn),
      inProgress: pad2(sub.inProgress),
    },
  };
}

// ── Filter bar ────────────────────────────────────────────────
function ERVFilterBar() {
  return (
    <div style={{background:"#eef4fb",borderBottom:"1px solid #e2e8f0",padding:"10px 24px",display:"flex",alignItems:"center",gap:14}}>
      <button type="button" style={{background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"5px 12px",font:"400 12px/16px Roboto",color:"#0f172a",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
        Elig Initiated Date : 02/13/25 – 03/13/25
        <span style={{color:"#94a3b8",fontSize:9}}>▾</span>
      </button>
      <button type="button" style={{background:"transparent",border:"none",cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:6,padding:"5px 4px"}}>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"#2563eb",color:"#fff",fontSize:10,fontWeight:600,lineHeight:1}}>+</span>
        Add More Filters
      </button>
      <div style={{marginLeft:"auto",position:"relative"}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#94a3b8",fontSize:13}}>🔍</span>
        <input type="text" placeholder="Search Patient Records" style={{width:240,background:"#fff",border:"1px solid #d8d8d8",borderRadius:4,padding:"6px 12px 6px 32px",font:"400 12px/16px Roboto",color:"#0f172a",outline:"none"}} />
      </div>
    </div>
  );
}

// ── Title cluster (Eligibility Request View — All Elig Requests ▾) ─
const ERV_MODE_OPTIONS = [
  { id:"all",       label:"All Elig Requests" },
  { id:"manual",    label:"All Non-Automated Requests" },
  { id:"automated", label:"All Automated Requests" },
];

function ERVTitleCluster({ activeStatus, onClearStatus, modeFilter, onModeFilter }) {
  const [open, setOpen] = useERV(false);
  const ref = useERVR(null);
  useERVE(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const activeMode = ERV_MODE_OPTIONS.find(o => o.id === modeFilter) || ERV_MODE_OPTIONS[0];
  // If a status chip is active, show its label INSTEAD of the mode label.
  const statusLabel = activeStatus ? ERV_STATUS.find(s => s.id === activeStatus)?.label : null;
  const headerLabel = statusLabel || activeMode.label;
  return (
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap",position:"relative"}} ref={ref}>
        <span style={{font:"500 15px/20px Roboto",color:"#0f172a"}}>Eligibility Request View —</span>
        <button
          type="button"
          onClick={()=>setOpen(v=>!v)}
          style={{background:"transparent",border:"none",cursor:"pointer",font:"500 15px/20px Roboto",color:"#2563eb",display:"inline-flex",alignItems:"center",gap:4,padding:0}}
        >
          {headerLabel}
          <span style={{fontSize:9,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▾</span>
        </button>
        {activeStatus && (
          <button type="button" onClick={onClearStatus} style={{background:"transparent",border:"none",cursor:"pointer",color:"#64748b",font:"400 11px/16px Roboto",padding:"2px 6px"}} title="Clear filter">×</button>
        )}
        {open && (
          <div style={{
            position:"absolute",
            top:"100%",
            left:175,
            marginTop:6,
            background:"#fff",
            border:"1px solid #e2e8f0",
            borderRadius:8,
            boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
            padding:6,
            minWidth:240,
            zIndex:20,
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8",padding:"6px 10px 4px"}}>Filter by request mode</div>
            {ERV_MODE_OPTIONS.map(o => {
              const sel = o.id === modeFilter;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={()=>{ onModeFilter(o.id); setOpen(false); }}
                  style={{
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"space-between",
                    width:"100%",
                    background:sel?"#eff6ff":"transparent",
                    border:"none",
                    borderRadius:6,
                    padding:"7px 10px",
                    cursor:"pointer",
                    font:`${sel?500:400} 12px/16px Roboto`,
                    color:sel?"#1d4ed8":"#475569",
                    textAlign:"left",
                  }}
                >
                  <span>{o.label}</span>
                  {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginTop:6}}>Status Summary of Eligibility Requests Submitted to Payors</div>
      <div style={{marginTop:10,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:6,padding:"8px 12px",font:"400 12px/16px Roboto",color:"#64748b",display:"inline-block"}}>Click Patient Name to view related transactions for specific eligibility verification request</div>
    </div>
  );
}

// ── Eligibility Status summary strip (7 counters) ─────────────
function ERVStatusStrip({ counts, activeStatus, onPick }) {
  const byChip = counts.byChip;
  return (
    <div style={{display:"flex",alignItems:"stretch",border:"1px solid #e2e8f0",borderRadius:8,background:"#fff",overflow:"hidden"}}>
      <div style={{padding:"14px 16px",background:"#f8fafc",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",font:"500 13px/18px Roboto",color:"#475569",flexShrink:0,letterSpacing:"0.01em"}}>
        <span>Eligibility</span>
        <span>Status</span>
      </div>
      <div style={{display:"flex",alignItems:"flex-start",flex:1}}>
        {ERV_STATUS.map((s) => {
          const active = activeStatus === s.id;
          const dim = activeStatus && !active;
          return (
            <div
              key={s.id}
              role="button"
              onClick={()=>onPick(active ? null : s.id)}
              style={{
                flex:`${s.weight || 1} 1 0`,
                minWidth:0,
                padding:"10px 12px 12px",
                cursor:"pointer",
                opacity: dim ? 0.35 : 1,
                transition:"opacity .12s, background .12s",
                background: active ? "#f8fafc" : "transparent",
                position:"relative",
              }}
              onMouseEnter={(e)=>{ if(!active && !dim) e.currentTarget.style.background = "#fafbfc"; }}
              onMouseLeave={(e)=>{ if(!active) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{height:3,borderRadius:2,background:s.color,opacity: active ? 1 : 0.85,marginBottom:8}}></div>
              <div style={{display:"flex",alignItems:"center",gap:5,font:"400 12px/16px Roboto",color:"#475569",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={s.label}>
                {s.icon === "person" && <img src="icons/mdi-user.png" alt="" style={{width:14,height:14,objectFit:"contain",flexShrink:0}} />}
                <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</span>
              </div>
              <div style={{font:"600 18px/22px Roboto",color:"#0f172a",marginTop:4}}>{byChip[s.id]}</div>
              {activeStatus && s.id === "all" && (
                <button
                  type="button"
                  onClick={(e)=>{ e.stopPropagation(); onPick(null); }}
                  style={{marginTop:4,background:"transparent",border:"none",padding:0,cursor:"pointer",color:"#2563eb",font:"500 12px/16px Roboto",display:"inline-flex",alignItems:"center",gap:4,opacity:1}}
                >
                  <span style={{fontSize:11,lineHeight:1}}>↻</span>
                  Reset
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Automation (AT) Status strip ──────────────────────────────
function ERVAutomationStatus({ counts, atFilter, onFilter }) {
  const at = counts.at;
  return (
    <div style={{display:"flex",alignItems:"center",gap:20,font:"400 13px/16px Roboto",color:"#475569"}}>
      <span style={{color:"#94a3b8"}}>Automation (AT) Status :</span>
      <span style={{display:"inline-flex",alignItems:"center",gap:8,opacity: at.completed==="00" ? 0.45 : 1}}>
        <img src="icons/at-completed.png" alt="" style={{width:18,height:18,objectFit:"contain"}} />
        <span style={{color:"#0f172a"}}>Completed</span>
        <span style={{fontWeight:600,color:"#0f172a"}}>{at.completed}</span>
      </span>
      <span style={{width:1,height:18,background:"#e2e8f0"}}></span>
      <button
        type="button"
        onClick={()=>onFilter(atFilter==="warning" ? null : "warning")}
        style={{background:"transparent",border:"none",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,padding:"2px 6px",borderRadius:4,opacity: at.needsAttn==="00" ? 0.45 : 1,color:atFilter==="warning"?"#92400e":"#475569"}}
        title="Filter: Needs Attention"
      >
        <img src="icons/at-needs-attention.png" alt="" style={{width:18,height:18,objectFit:"contain"}} />
        <span style={{color:"#0f172a"}}>Needs Attention</span>
        <span style={{fontWeight:600,color:"#d97706"}}>{at.needsAttn}</span>
        <span style={{color:"#2563eb",fontSize:10}}>▾</span>
      </button>
      <span style={{width:1,height:18,background:"#e2e8f0"}}></span>
      <span style={{display:"inline-flex",alignItems:"center",gap:8,opacity: at.inProgress==="00" ? 0.45 : 1}}>
        <img src="icons/at-in-progress.png" alt="" style={{width:18,height:18,objectFit:"contain"}} />
        <span style={{color:"#0f172a"}}>In Progress</span>
        <span style={{fontWeight:600,color:"#0f172a"}}>{at.inProgress}</span>
      </span>
    </div>
  );
}

// ── Coverage status pill ──────────────────────────────────────
const ERV_COV = {
  active:    { bg:"#f0fdf4", bd:"#16a34a", c:"#16a34a", label:"Active" },
  inactive:  { bg:"#fef2f2", bd:"#dc2626", c:"#dc2626", label:"Inactive" },
  pending:   { bg:"#eaf2f8", bd:"#b8d3e6", c:"#3f7ba8", label:"Pending Submission", icon:true, underline:true },
  mixed:     { bg:"#fffbeb", bd:"#d97706", c:"#d97706", label:"Mixed" },
  exception: { bg:"#fff7ed", bd:"#f97316", c:"#f97316", label:"Exception" },
};
function ERVCovPill({ kind }) {
  const s = ERV_COV[kind] || ERV_COV.active;
  return (
    <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:"4px 12px",borderRadius:4,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 11px/16px Roboto",whiteSpace:"nowrap",minWidth:140,boxSizing:"border-box",textDecoration: s.underline ? "underline" : "none"}}>
      {s.icon && <img src="icons/mdi-user.png" alt="" style={{width:12,height:12,objectFit:"contain"}} />}
      {s.label}
    </span>
  );
}

// ── AT Status icon ────────────────────────────────────────────
function ERVATIcon({ kind }) {
  if (kind === "thumb")     return <img title="Completed"       src="icons/at-completed.png"       alt="Completed"      style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "warning")   return <img title="Needs Attention" src="icons/at-needs-attention.png" alt="Needs Attention" style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "hourglass") return <img title="In Progress"     src="icons/at-in-progress.png"     alt="In Progress"    style={{width:18,height:18,objectFit:"contain"}} />;
  if (kind === "person")    return <img title="Pending"         src="icons/mdi-user.png"           alt="Pending"        style={{width:16,height:16,objectFit:"contain"}} />;
  return <span style={{color:"#cbd5e1"}}>—</span>;
}

// ── Table ─────────────────────────────────────────────────────
// Columns use a CSS grid so they distribute across the available width
// (flexible columns expand, fixed-size status / icon columns stay tight).
const ERV_COLS = [
  { key:"name",     label:"Patient Name",grid:"minmax(140px, 1.3fr)",  sortable:true                  },
  { key:"mrn",      label:"MRN",         grid:"minmax(140px, 1.2fr)",  sortable:true                  },
  { key:"agency",   label:"Agency",      grid:"minmax(70px, 0.8fr)",   sortable:true                  },
  { key:"branch",   label:"Branch",      grid:"minmax(60px, 0.65fr)",  sortable:true                  },
  { key:"memId",    label:"Mem ID",      grid:"minmax(80px, 0.9fr)",   sortable:true                  },
  { key:"payorSrc", label:"Payor Src",   grid:"minmax(100px, 1.1fr)",  sortable:true                  },
  { key:"payor",    label:"Payor",       grid:"minmax(90px, 1fr)",     sortable:true                  },
  { key:"soc",      label:"SOC",         grid:"minmax(78px, 0.85fr)",  sortable:true                  },
  { key:"mode",     label:"Mode",        grid:"56px",                  sortable:false, align:"center", info:true },
  { key:"gw",       label:"GW",          grid:"minmax(72px, 0.85fr)",  sortable:true                  },
  { key:"chk",      label:"Elig Chk Dt", grid:"minmax(90px, 0.95fr)",  sortable:true                  },
  { key:"followUp", label:"Follow up Dt",grid:"minmax(100px, 1fr)",    sortable:true                  },
  { key:"at",       label:"AT Status",   grid:"72px",                  sortable:true,  align:"center" },
  { key:"alerts",   label:"Elig Alerts", grid:"80px",                  sortable:true,  align:"center" },
  { key:"cov",      label:"Cov. Status", grid:"minmax(160px, 1.3fr)",  sortable:true,  align:"center" },
  { key:"action",   label:"Action",      grid:"minmax(100px, 1fr)",    sortable:false, align:"center" },
  { key:"docs",     label:"Docs",        grid:"52px",                  sortable:false, align:"center" },
  { key:"reviewed", label:"Reviewed?",   grid:"78px",                  sortable:false, align:"center" },
];
const ERV_GRID = ERV_COLS.map(c => c.grid).join(" ");

function SortArrows({ active }) {
  return (
    <span style={{display:"inline-flex",flexDirection:"column",lineHeight:.5,fontSize:7,color: active ? "#2563eb" : "#cbd5e1",marginLeft:4}}>
      <span>▲</span>
      <span style={{marginTop:1}}>▼</span>
    </span>
  );
}

function ERVTableHeader({ sortKey, sortDir, onSort }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:ERV_GRID,alignItems:"center",background:"#f8fafc",borderBottom:"1px solid #e2e8f0",height:40,padding:"0 12px",gap:8}}>
      {ERV_COLS.map(c => (
        <div
          key={c.key}
          style={{
            font:"500 11px/14px Roboto",
            color:"#64748b",
            textAlign: c.align || "left",
            display:"flex",
            alignItems:"center",
            justifyContent: c.align === "center" ? "center" : "flex-start",
            cursor: c.sortable ? "pointer" : "default",
            userSelect:"none",
            overflow:"hidden",
            whiteSpace:"nowrap",
          }}
          onClick={c.sortable ? ()=>onSort(c.key) : undefined}
        >
          {c.label}
          {c.info && <span style={{color:"#94a3b8",marginLeft:3,fontSize:11}}>ⓘ</span>}
          {c.sortable && <SortArrows active={sortKey === c.key} />}
        </div>
      ))}
    </div>
  );
}

function ERVTableRow({ row, onPatient, reviewed, onReviewed, onFollowUp, accent="#2563eb" }) {
  const cellBase = (align) => ({
    font:"400 12px/16px Roboto",
    color:"#475569",
    textAlign: align || "left",
    display:"flex",
    alignItems:"center",
    justifyContent: align === "center" ? "center" : "flex-start",
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    minWidth:0,
  });
  return (
    <div
      className="erv-row"
      style={{
        display:"grid",
        gridTemplateColumns:ERV_GRID,
        alignItems:"center",
        height:48,
        padding:"0 16px",
        border:"1px solid #e2e8f0",
        borderRadius:6,
        marginBottom:8,
        boxShadow:"0 1px 2px rgba(15,23,42,0.03)",
        background:"#fff",
        transition:"box-shadow .12s",
        gap:8,
      }}
    >
      <div style={cellBase()}>
        <a href="#" onClick={(e)=>{e.preventDefault(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 13px/16px Roboto",textDecoration:"none",overflow:"hidden",textOverflow:"ellipsis"}}>{row.name}</a>
      </div>
      <div style={cellBase()}>{row.mrn}</div>
      <div style={cellBase()}>{row.agency}</div>
      <div style={cellBase()}>{row.branch}</div>
      <div style={cellBase()}>{row.memId || <span style={{color:"#cbd5e1"}}>—</span>}</div>
      <div style={cellBase()} title={row.payorSrc}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.payorSrc}</span></div>
      <div style={cellBase()} title={row.payor}><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{row.payor}</span></div>
      <div style={cellBase()}>{row.soc}</div>
      <div style={cellBase("center")}>
        {row.mode === "gear"
          ? <img title="Automated" src="icons/automated.png" alt="Automated" style={{width:18,height:18,objectFit:"contain"}} />
          : row.mode === "person"
            ? <img title="Manual" src="icons/mdi-user.png" alt="Manual" style={{width:16,height:16,objectFit:"contain"}} />
            : <span style={{color:"#cbd5e1"}}>—</span>}
      </div>
      <div style={cellBase()}>{row.gw || <span style={{color:"#cbd5e1"}}>—</span>}</div>
      <div style={cellBase()}>{row.chk}</div>
      <div style={cellBase()}>
        <input
          type="text"
          value={row.followUp || ""}
          placeholder="—"
          onChange={(e)=>onFollowUp&&onFollowUp(row.id, e.target.value)}
          style={{width:"100%",border:"1px solid #e2e8f0",borderRadius:4,font:"400 11px/14px Roboto",padding:"3px 6px",color:"#0f172a",outline:"none",background:"#fff",minWidth:0}}
        />
      </div>
      <div style={cellBase("center")}><ERVATIcon kind={row.at} /></div>
      <div style={cellBase("center")}>
        {row.alerts > 0
          ? <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:"50%",background:"#f97316",color:"#fff",font:"600 11px/22px Roboto"}}>{String(row.alerts).padStart(2,"0")}</span>
          : <span style={{color:"#cbd5e1"}}>—</span>}
      </div>
      <div style={cellBase("center")}><ERVCovPill kind={row.cov} /></div>
      <div style={cellBase("center")}>
        {row.action === "edit"
          ? <button type="button" onClick={()=>onPatient&&onPatient(row)} style={{background:accent,color:"#fff",border:"none",borderRadius:4,padding:"4px 10px",font:"500 11px/14px Roboto",cursor:"pointer"}}>Edit Details</button>
          : <a href="#" onClick={(e)=>{e.preventDefault(); onPatient&&onPatient(row);}} style={{color:accent,font:"500 12px/16px Roboto",textDecoration:"none"}}>View Details</a>}
      </div>
      <div style={cellBase("center")}>
        {row.docs
          ? <span style={{color:"#94a3b8",fontSize:14,lineHeight:1}}>📎</span>
          : <span style={{color:"#e2e8f0",fontSize:14,lineHeight:1}}>📎</span>}
      </div>
      <div style={cellBase("center")}>
        <span
          role="checkbox"
          aria-checked={!!reviewed}
          tabIndex={0}
          onClick={()=>onReviewed&&onReviewed(row.id)}
          style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:16,height:16,border:`1px solid ${reviewed ? accent : "#d8d8d8"}`,borderRadius:3,background: reviewed ? accent : "#fff",cursor:"pointer"}}
        >
          {reviewed && <span style={{color:"#fff",fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
        </span>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
function ERVPagination({ total, page, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const Btn = ({ children, active, disabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width:28,
        height:28,
        borderRadius:4,
        border: `1px solid ${active ? "#2563eb" : "#e2e8f0"}`,
        background: active ? "#2563eb" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#475569",
        font:"400 12px/16px Roboto",
        cursor: disabled ? "default" : "pointer",
        padding:0,
      }}
    >{children}</button>
  );
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #e2e8f0",padding:"12px 24px"}}>
      <span style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>Showing {start}–{end} of {total}</span>
      <div style={{display:"flex",gap:6}}>
        <Btn onClick={()=>onPage(page - 1)} disabled={page === 1}>‹</Btn>
        {Array.from({length: Math.min(pages, 5)}, (_, i) => i + 1).map(n => (
          <Btn key={n} active={n === page} onClick={()=>onPage(n)}>{n}</Btn>
        ))}
        <Btn onClick={()=>onPage(page + 1)} disabled={page === pages}>›</Btn>
      </div>
    </div>
  );
}

// ── Eligibility Request View — orchestrating component ────────
function EligibilityRequestView({ onPatient }) {
  const [reviewedSet, setReviewed]  = useERV({});
  const [followUp, setFollowUp]     = useERV({});
  const [sortKey, setSortKey]       = useERV(null);
  const [sortDir, setSortDir]       = useERV("asc");
  const [statusFilter, setStatusFilter] = useERV(null);
  const [atFilter, setAtFilter]     = useERV(null);
  const [modeFilter, setModeFilter] = useERV("all");
  const [page, setPage]             = useERV(1);

  const toggleReviewed = (id) => setReviewed(s => ({ ...s, [id]: !s[id] }));
  const onFollowUp = (id, v) => setFollowUp(s => ({ ...s, [id]: v }));
  const onSort = (k) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  // Compute live counts: chips + AT counts use the mode-filtered dataset
  // as a base, then narrow further by the active status chip (All Patients
  // always shows the full filtered count).
  const modeFilteredRows = modeFilter === "automated"
    ? ERV_ROWS.filter(r => r.mode === "gear")
    : modeFilter === "manual"
      ? ERV_ROWS.filter(r => r.mode === "person")
      : ERV_ROWS;
  const ervCounts = getERVCounts(modeFilteredRows, statusFilter);

  // Apply filters
  let rows = modeFilteredRows.map(r => ({ ...r, followUp: followUp[r.id] ?? r.followUp }));
  if (statusFilter) rows = rows.filter(r => r.cov === statusFilter || (statusFilter === "alerts" && r.alerts > 0) || (statusFilter === "all"));
  if (atFilter === "warning") rows = rows.filter(r => r.at === "warning");
  // Sort (simple string compare)
  if (sortKey) {
    rows = [...rows].sort((a,b) => {
      const av = (a[sortKey] ?? "").toString().toLowerCase();
      const bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div style={{background:"#fff"}}>
      <ERVFilterBar />
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"flex-start",gap:32,flexWrap:"wrap"}}>
        <div style={{flex:"1 1 380px",minWidth:0}}>
          <ERVTitleCluster activeStatus={statusFilter} onClearStatus={()=>setStatusFilter(null)} modeFilter={modeFilter} onModeFilter={setModeFilter} />
        </div>
        <div style={{flex:"1 1 520px",minWidth:0}}>
          <ERVStatusStrip counts={ervCounts} activeStatus={statusFilter} onPick={setStatusFilter} />
        </div>
      </div>
      <div style={{padding:"0 24px 8px",display:"flex",justifyContent:"flex-end"}}>
        <ERVAutomationStatus counts={ervCounts} atFilter={atFilter} onFilter={setAtFilter} />
      </div>
      <div style={{padding:"0 24px 24px"}}>
        <ERVTableHeader sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        <div style={{paddingTop:8}}>
          {rows.length === 0 ? (
            <div style={{padding:"48px 24px",textAlign:"center",font:"400 13px/18px Roboto",color:"#94a3b8",border:"1px solid #e2e8f0",borderRadius:6,background:"#fff"}}>
              No eligibility requests match the current filters.
            </div>
          ) : rows.map((r, i) => (
            <ERVTableRow
              key={r.id}
              row={r}
              index={i}
              onPatient={onPatient}
              reviewed={!!reviewedSet[r.id]}
              onReviewed={toggleReviewed}
              onFollowUp={onFollowUp}
            />
          ))}
          <div style={{padding:"16px 24px",font:"400 12px/16px Roboto",color:"#94a3b8",textAlign:"center"}}>End of list — {rows.length} of 120 patients shown</div>
        </div>
      </div>
    </div>
  );
}

// ── Automation Log placeholder ────────────────────────────────
function ERVAutomationLogView() {
  return (
    <div style={{padding:"32px 24px",background:"#fff"}}>
      <div style={{border:"1px dashed #e2e8f0",borderRadius:8,padding:"60px 24px",textAlign:"center",color:"#94a3b8",font:"400 14px/18px Roboto"}}>
        Automation Log — extraction / parsing run history would render here.
      </div>
    </div>
  );
}

Object.assign(window, { EligibilityRequestView, ERVAutomationLogView });
