// WellSky — Authorization Center · Patient Auth Summary View
// Source: /Main-Page/Patient-summary-view---main (figma node 162331:357343)
const { useState: useAS } = React;

// ── local helpers ─────────────────────────────────────────────
function AuthHeader({ activeTab, onTab, review, onReview }) {
  const tabs = [
    { key: "summary", label: "Patient Auth Summary View", icon: "▦" },
    { key: "request", label: "Auth Request View", icon: "☰" },
    { key: "log",     label: "Automation Log",      icon: ""  },
  ];
  return (
    <div style={{background:"linear-gradient(rgb(56,71,90) 0%, rgb(28,45,66) 100%)",borderRadius:"0 0 5px 5px",height:188,position:"relative"}}>
      {/* top nav bar (re-uses global header look) */}
      <div style={{height:72,display:"flex",alignItems:"center",padding:"0 32px",gap:24,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <img src="../../assets/wellsky-logo-white.svg" style={{height:28}} alt="WellSky" />
        <div style={{display:"flex",gap:28,marginLeft:20}}>
          <span style={{color:"rgba(255,255,255,.4)",font:"400 14px Roboto",cursor:"pointer"}}>Dashboard</span>
          <span style={{color:"rgba(255,255,255,.4)",font:"400 14px Roboto",cursor:"pointer"}}>Eligibility</span>
          <span style={{color:"#fff",font:"500 14px Roboto",borderBottom:"2px solid #fff",paddingBottom:4}}>Authorization</span>
        </div>
        <div style={{marginLeft:"auto",width:28,height:28,borderRadius:4,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.7)",fontSize:14}}>📋</div>
      </div>
      {/* Title + sub-tab rail */}
      <div style={{padding:"18px 32px 0",display:"flex",flexDirection:"column",gap:14}}>
        <div style={{font:"500 20px/24px Roboto",color:"#fff"}}>Authorization Center</div>
        <div style={{display:"flex",gap:12,alignItems:"center",position:"relative"}}>
          {tabs.map(t=>{
            const act=activeTab===t.key;
            return (
              <button key={t.key} onClick={()=>onTab(t.key)} style={{background:act?"#1677FF":"rgba(208,217,229,0.11)",color:"#fff",border:"none",borderRadius:4,padding:"6px 14px",font:`${act?500:400} 13px/18px Roboto`,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
                {t.icon && <span style={{opacity:.9,fontSize:14}}>{t.icon}</span>}{t.label}
              </button>
            );
          })}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:12}}>
            <span style={{color:"#fff",font:"400 13px Roboto"}}>Review Mode</span>
            <button onClick={onReview} style={{width:32,height:18,borderRadius:999,background:review?"#1677FF":"rgba(255,255,255,.3)",border:"none",cursor:"pointer",position:"relative",padding:0}}>
              <span style={{position:"absolute",top:2,left:review?16:2,width:14,height:14,borderRadius:"50%",background:"#fff",transition:"left .15s"}}></span>
            </button>
            <button style={{width:36,height:32,border:"1px solid rgba(255,255,255,.25)",borderRadius:4,background:"transparent",color:"rgba(255,255,255,.8)",cursor:"pointer"}}>⬇</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthFilterBar() {
  return (
    <div style={{background:"rgb(240,245,255)",height:62,display:"flex",alignItems:"center",padding:"0 32px",gap:14,font:"400 13px Roboto",color:"#3A424A"}}>
      <span style={{color:"#6A717D",fontSize:14}}>🛒</span>
      <span style={{background:"#fff",border:"1px solid #D8D8D8",borderRadius:4,padding:"4px 10px"}}>Auth Initiated Date : Last 7 Days ▾</span>
      <span style={{color:"#6660A6",font:"500 13px Roboto",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer"}}><span style={{width:14,height:14,borderRadius:"50%",background:"#6660A6",color:"#fff",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11}}>+</span>Add More Filters</span>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #D8D8D8",borderRadius:4,padding:"4px 10px",minWidth:260}}>
        <span style={{color:"#6A717D"}}>🔍</span>
        <span style={{color:"#8D949D",font:"400 13px Roboto"}}>Search Patient Records</span>
      </div>
    </div>
  );
}

function SummaryChip({ label, value, color }) {
  return (
    <div style={{width:95,display:"flex",flexDirection:"column",gap:8}}>
      <div style={{height:4,borderRadius:4,background:color,opacity:.65}}></div>
      <div style={{font:"400 14px/18px Roboto",color:"#605D5D"}}>{label}</div>
      <div style={{font:"500 16px/20px Roboto",color:"#605D5D"}}>{value}</div>
    </div>
  );
}

function HeadingStatusRow() {
  const chips = [
    { label: "All Patients",        value: "10", color: "rgb(21,95,130)"  },   // teal-blue
    { label: "Past Due for Recert", value: "01", color: "rgb(102,96,166)" },   // purple
    { label: "Due for Recert",      value: "02", color: "rgb(196,112,151)" },  // pink
    { label: "Expiring Auths",      value: "01", color: "rgb(215,137,90)"  },  // orange
    { label: "Expired Auths",       value: "01", color: "rgb(207,19,34)"   },  // red
  ];
  return (
    <div style={{padding:"24px 42px 28px",display:"flex",alignItems:"flex-start"}}>
      <div>
        <div style={{font:"500 16px/20px Roboto",color:"#000"}}>Patient Auth Summary</div>
        <div style={{font:"400 14px/18px Roboto",color:"#3A424A",marginTop:8}}>Transaction status of the Auth request and response workflows</div>
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:20}}>
        {chips.map(c=>(<SummaryChip key={c.label} {...c} />))}
      </div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────
const authRows = [
  { name:"Marvin Mckinney",    mid:"B6100062245601", agency:"Agency 1", bcode:"Bcode", ep:"11521357", payor:"Aetna Medi..",  type:"Mcare Adv", src:"Carelon",  init:"01/15/24", sub:"01/15/24", auth:"Epi23456", pd:"",           recert:"Current", expiring:"",     expired:"",    attach:true  },
  { name:"Esther Howard",      mid:"B6789012345678", agency:"Agency 1", bcode:"Bcode", ep:"55493027", payor:"Humana Gold P.",type:"Mcare Adv", src:"Availity", init:"01/15/25", sub:"03/16/25", auth:"I1J2K3L4", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Wade Warren",        mid:"B6789012345685", agency:"Agency 1", bcode:"Bcode", ep:"49625034", payor:"UHC - AARP M..",type:"Mcare Adv", src:"UHC",      init:"01/17/25", sub:"03/30/25", auth:"TY964257", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Cameron Williamson", mid:"B6100054445634", agency:"Agency 1", bcode:"Bcode", ep:"97014890", payor:"Aetna Gold Plu..",type:"Mcare Adv", src:"Carelon",  init:"01/18/25", sub:"04/04/25", auth:"K7L8M9N0", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Robert Fox",         mid:"V678901234 5686",agency:"Agency 1", bcode:"Bcode", ep:"69420061", payor:"HumanaChoice.",type:"Mcare Adv", src:"Availity", init:"04/18/25", sub:"04/18/25", auth:"G3H4I5J6", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Jenny Wilson",       mid:"B6789012345711", agency:"Agency 1", bcode:"Bcode", ep:"43242523", payor:"Humana Gold P.",type:"Mcare Adv", src:"Availity", init:"01/21/25", sub:"04/04/25", auth:"M5N6O7P8", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Jacob Jones",        mid:"B6789012345716", agency:"Agency 1", bcode:"Bcode", ep:"10434991", payor:"Humana Gold P.",type:"Mcare Adv", src:"Carelon",  init:"01/15/25", sub:"03/16/25", auth:"Y7Z8A9B0", pd:"Past Due",   recert:"Current", expiring:"02 Expiring", expired:"01 Expired", attach:true, checked:true },
  { name:"Leslie Alexander",   mid:"B6789012345697", agency:"Agency 1", bcode:"Bcode", ep:"76722340", payor:"Humana Gold P.",type:"Mcare Adv", src:"Availity", init:"01/15/25", sub:"05/12/25", auth:"S5T6U7V8", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Guy Hawkins",        mid:"L700093345918", agency:"Agency 1", bcode:"Bcode",  ep:"30214786", payor:"Humana Gold P.",type:"Mcare Adv", src:"Availity", init:"01/203/25",sub:"04/17/25", auth:"A3B4C5D6", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
  { name:"Jane Cooper",        mid:"B6789012345720", agency:"Agency 1", bcode:"Bcode", ep:"42512413", payor:"Humana Gold P.",type:"Mcare Adv", src:"Availity", init:"04/01/25", sub:"04/01/25", auth:"Q9R0S1T2", pd:"",           recert:"Current", expiring:"2 Expiring", expired:"01 Expired", attach:true },
];

function ExpiringBadge({ text, tone="orange" }) {
  const c = tone==="red" ? { bd:"#CF1322", c:"#CF1322" } : { bd:"#FFB27A", c:"#D7894A" };
  return <span style={{display:"inline-block",border:`1px dashed ${c.bd}`,color:c.c,borderRadius:2,padding:"1px 8px",font:"400 12px/16px Roboto"}}>{text}</span>;
}
function PastDueBadge() {
  return <span style={{display:"inline-block",border:"1px dashed #C47097",color:"#C47097",borderRadius:2,padding:"1px 8px",font:"400 12px/16px Roboto"}}>Past Due</span>;
}

function AuthTable({ onRow }) {
  const cols = [
    { label:"Patient",     w:150, bar:true },
    { label:"Member ID",   w:130 },
    { label:"Agency",      w:78 },
    { label:"Bcode",       w:60 },
    { label:"Ep #",        w:80 },
    { label:"Payor",       w:120 },
    { label:"Payor Type",  w:82 },
    { label:"Payor Src",   w:72 },
    { label:"Auth Init Dt",w:88 },
    { label:"Auth Sub Dt", w:88 },
    { label:"Authorization#", w:102 },
    { label:"",            w:80 },
    { label:"Recert Status", w:82 },
    { label:"Expiring",    w:92, align:"center" },
    { label:"Expired",     w:88, align:"center" },
    { label:"",            w:32, align:"center" },
    { label:"",            w:32, align:"center" },
  ];
  return (
    <div style={{padding:"0 32px 32px"}}>
      <div style={{border:"1px solid #E8E9EA",borderRadius:6,overflow:"hidden",background:"#fff"}}>
        {/* header */}
        <div style={{display:"flex",background:"#F8FAFD",borderBottom:"1px solid #E8E9EA",padding:"10px 8px 10px 18px"}}>
          {cols.map((c,i)=>(
            <div key={i} style={{width:c.w,font:"500 12px/16px Roboto",color:"#3A424A",textAlign:c.align||"left",paddingRight:6,display:"flex",alignItems:"center",gap:4}}>
              <span>{c.label}</span>{c.label && <span style={{color:"#C0C4CA",fontSize:9}}>▲▼</span>}
            </div>
          ))}
        </div>
        {/* rows */}
        {authRows.map((r,i)=>(
          <div key={i} onClick={()=>onRow&&onRow(r)} style={{display:"flex",padding:"16px 8px 16px 0",borderBottom:i===authRows.length-1?"none":"1px solid #EEF0F3",cursor:"pointer",position:"relative",alignItems:"center"}}>
            <div style={{position:"absolute",left:0,top:8,bottom:8,width:3,background:"rgb(16,134,133)",borderRadius:2}}></div>
            {cols.map((c,j)=>{
              const keyOrder=["name","mid","agency","bcode","ep","payor","type","src","init","sub","auth","pd","recert","expiring","expired","attach","check"];
              const k=keyOrder[j]; let v=r[k];
              let content=v;
              if(k==="pd" && v) content=<PastDueBadge />;
              else if(k==="expiring" && v) content=<ExpiringBadge text={v} tone="orange" />;
              else if(k==="expired" && v) content=<ExpiringBadge text={v} tone="red" />;
              else if(k==="attach") content=<span style={{color:"#8D949D",fontSize:15}}>🔗</span>;
              else if(k==="check") content=(<span style={{width:16,height:16,border:"1px solid "+(r.checked?"#1677FF":"#D8D8D8"),background:r.checked?"#1677FF":"#fff",borderRadius:2,display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11}}>{r.checked?"✓":""}</span>);
              else if(!v) content="-";
              return (
                <div key={j} style={{width:c.w,font:"400 13px/16px Roboto",color:"#3A424A",textAlign:c.align||"left",paddingLeft:j===0?18:0,paddingRight:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{content}</div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthDashboard({ onPatient }) {
  const [tab,setTab]=useAS("summary");
  const [review,setReview]=useAS(false);
  return (
    <div style={{minHeight:"100vh",background:"#fff",font:"400 14px/18px Roboto"}}>
      <AuthHeader activeTab={tab} onTab={setTab} review={review} onReview={()=>setReview(v=>!v)} />
      <AuthFilterBar />
      <HeadingStatusRow />
      <AuthTable onRow={onPatient} />
    </div>
  );
}

Object.assign(window,{AuthDashboard});
