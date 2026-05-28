// EligibilityDetail — right-sliding overlay, fully data-driven.
// 75vw width, fixed right, internal scroll. Patient header + tab bar
// (Eligibility Info / Authorization Info) + Automation Log link.

const { useState: useED, useEffect: useEDEffect, useRef: useEDRef } = React;

const fmtMoney = (n) => (n===null || n===undefined) ? "—" : Number(n).toLocaleString("en-US", { style:"currency", currency:"USD", maximumFractionDigits: 0 });
const isPresent = (v) => v!==null && v!==undefined && v!=="";
const pctSafe = (used, total) => {
  if (!isPresent(used) || !isPresent(total) || total<=0) return null;
  return Math.min(100, Math.max(0, Math.round((used/total)*100)));
};

// ── Sample payloads ───────────────────────────────────────────
const SAMPLE_PAYLOADS = {
  medicare_advantage: {
    label: "Medicare Advantage",
    data: {
      patient: { name:"Marvin McKinney", mrn:"B6100062245601", dob:"03/14/1962", memberId:"1EG4-TE5-MK72", relationship:"Self", payorName:"Aetna Medicare Gold Advantage (PPO)", payorSource:"Carelon", planType:"Medicare Advantage", gateway:"Availity", startOfCare:"07/08/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-77881",
              refId:"REFE023948357", checkDate:"04/01/25", checkTime:"10:53 PM", checkDateOnly:"01/07/25",
              fullName:"Aetna Medicare Gold Advantage (PPO) for senior citizen",
              payorId:"77856", planTypeShort:"HMO" },
      planResponse: { patientName:"Marvin Mckinney", gender:"Male", relationship:"Self", memberId:"55493027", dob:"10/04/1956", address:"204 Spicer Dr, Gordonsville, TN –38563", mbi:"3543657457445" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"AARP Medicare Advantage",        payorId:"452674", memberId:"3543532423", coverageDate:"01/25/25 – 01/25/26" },
        { planName:"UHC Medicare For Senior Citizen", payorId:"124689", memberId:"56785426645", coverageDate:"12/04/25 – 12/04/26" },
      ],
      pcp: { physicianName:"Dr. John Naren", phoneNumber:"574-686-5453", pcpGroupNumber:"354657545", address:"204 Spicer Dr Gordonsville, TN–38563" },
      tiers: [
        { name:"Individual · In-Network",     deductible:{ total:1632, used:640,  remaining:992  }, oop:{ total:4500,  used:1200, remaining:3300 }, network:"in" },
        { name:"Individual · Out-of-Network", deductible:{ total:3000, used:0,    remaining:3000 }, oop:{ total:7500,  used:0,    remaining:7500 }, network:"out" },
        { name:"Family · In-Network",         deductible:{ total:3264, used:1480, remaining:1784 }, oop:{ total:9000,  used:2400, remaining:6600 }, network:"in" },
        { name:"Family · Out-of-Network",     deductible:{ total:6000, used:0,    remaining:6000 }, oop:{ total:15000, used:0,    remaining:15000}, network:"out" },
      ],
      alerts: [
        { kind:"warning", title:"Policy renewal upcoming", body:"Policy renews 12/31/2025 — verify continuing eligibility before SOC." },
        { kind:"info",    title:"Coordination of Benefits", body:"Secondary coverage detected — Aetna Supplement. Verify primary/secondary order." },
      ],
      benefits: [
        { name:"Home Health",     status:"Covered",       fields:{ auth_required:true,  copay:"$0 / visit",          co_insurance:"20%", service_deductible:[ { name:"Individual", remaining:2400, used:600, total:3000 }, { name:"Family", remaining:2400, used:600, total:3000 } ], visit_limit:60,  visits_used:12, prior_auth_phone:"1-800-624-0756", network_note:"In-network provider required" } },
        { name:"Skilled Nursing", status:"Covered",       fields:{ auth_required:true,  copay:"$185 (days 1–20)",      co_insurance:"0%",  days_limit:100,  days_used:24,    prior_auth_phone:"1-800-624-0756" } },
        { name:"Physical & Occupational Therapy", status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", visit_limit:30, visits_used:8 } },
        { name:"Hospice",         status:"Covered",       fields:{ auth_required:false, copay:"$0" } },
      ],
      auths: [
        { num:"AUTH-8842", status:"Approved", service:"Home Health", start:"01/15/25", end:"04/15/25", unitsTotal:60, unitsUsed:24 },
        { num:"AUTH-8851", status:"Pending",  service:"Skilled Nursing", start:"02/01/25", end:"05/01/25", unitsTotal:100, unitsUsed:0 },
        { num:"AUTH-8867", status:"Denied",   service:"Physical Therapy", start:"03/01/25", end:"06/01/25", unitsTotal:30, unitsUsed:0 },
        { num:"AUTH-8801", status:"Expired",  service:"Occupational Tx", start:"09/01/24", end:"12/01/24", unitsTotal:24, unitsUsed:24 },
      ],
    },
  },
  commercial_ppo: {
    label: "Commercial PPO",
    data: {
      patient: { name:"Esther Howard", mrn:"B6789012345678", dob:"08/22/1978", memberId:"BCBS-883-7712", relationship:"Spouse", payorName:"Blue Cross Blue Shield PPO", payorSource:"Availity", planType:"Commercial PPO", gateway:"Availity", startOfCare:"06/01/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-91024",
              refId:"REFE018822401", checkDate:"06/02/25", checkTime:"09:12 AM", checkDateOnly:"06/02/25",
              fullName:"Blue Cross Blue Shield PPO Select for Group 91024",
              payorId:"00123", planTypeShort:"PPO" },
      planResponse: { patientName:"Esther Howard", gender:"Female", relationship:"Spouse", memberId:"BCBS-883-7712", dob:"08/22/1978", address:"712 Main St, Nashville, TN –37203", mbi:"—" },
      otherPlans: [
        { id:"sec", label:"Secondary — Blue Shield Medigap" },
      ],
      additionalCoverage: [
        { planName:"Blue Shield Medigap Supplement", payorId:"00345", memberId:"BS-447-8821", coverageDate:"01/01/25 – 12/31/25" },
      ],
      pcp: { physicianName:"Dr. Sara Patel", phoneNumber:"615-555-0184", pcpGroupNumber:"212098341", address:"712 Main St, Nashville, TN–37203" },
      tiers: [
        { name:"Self · In-Network",              deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 },  network:"in"  },
        { name:"Self · Out-of-Network",          deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 }, network:"out" },
        { name:"Dependent · In-Network",         deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 },  network:"in"  },
        { name:"Domestic Partner · In-Network",  deductible:{ total:2000, used:0,    remaining:2000 }, oop:{ total:6500,  used:0,    remaining:6500 },  network:"in"  },
        { name:"Family · In-Network",            deductible:{ total:4000, used:800,  remaining:3200 }, oop:{ total:13000, used:1800, remaining:11200 }, network:"in"  },
        { name:"Family · Out-of-Network",        deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 }, network:"out" },
      ],
      alerts: [
        { kind:"error", title:"Deductible not yet met", body:"Patient owes co-insurance until deductible is met." },
      ],
      benefits: [
        { name:"Home Health",                     status:"Covered",       fields:{ auth_required:false, copay:"$25 / visit", co_insurance:"20%", service_deductible:[ { name:"Individual", remaining:2400, used:600, total:3000 }, { name:"Family", remaining:2400, used:600, total:3000 } ], visit_limit:60, visits_used:8, network_note:"In-network provider required" } },
        { name:"Physical & Occupational Therapy", status:"Covered",       fields:{ auth_required:false, copay:"$30 / visit", co_insurance:"20%", visit_limit:40, visits_used:8 } },
        { name:"Mental Health",       status:"Covered",       fields:{ auth_required:true,  copay:"$25 / visit", co_insurance:"10%", session_limit:52, sessions_used:6, prior_auth_phone:"1-888-555-0142", network_note:"Telehealth covered at parity" } },
        { name:"Durable Medical Equipment", status:"Requires Auth", fields:{ auth_required:true, co_insurance:"20%", prior_auth_phone:"1-888-555-0142", network_note:"Prior authorization required for items over $500" } },
      ],
      auths: [
        { num:"AUTH-9201", status:"Approved", service:"Physical Therapy", start:"01/15/25", end:"07/15/25", unitsTotal:60, unitsUsed:4 },
        { num:"AUTH-9221", status:"Pending",  service:"Mental Health",    start:"02/01/25", end:"08/01/25", unitsTotal:20, unitsUsed:0 },
      ],
    },
  },
  medicaid: {
    label: "Medicaid",
    data: {
      patient: { name:"Jane Cooper", mrn:"B6789012345720", dob:"11/04/1989", memberId:"MCD-552-1023", relationship:"Self", payorName:"State Medicaid", payorSource:"Direct", planType:"Medicaid", startOfCare:"04/01/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:null, network:"In-Network",
              refId:"REFE007722901", checkDate:"04/01/25", checkTime:"08:30 AM", checkDateOnly:"04/01/25",
              fullName:"State Medicaid",
              payorId:"55001", planTypeShort:"Medicaid" },
      planResponse: { patientName:"Jane Cooper", gender:"Female", relationship:"Self", memberId:"MCD-552-1023", dob:"11/04/1989", address:"45 Oak Ave, Memphis, TN –38104", mbi:"—" },
      otherPlans: [],
      additionalCoverage: [],
      pcp: { physicianName:"Dr. Marcus Lee", phoneNumber:"901-555-0107", pcpGroupNumber:"550100182", address:"45 Oak Ave, Memphis, TN–38104" },
      tiers: [
        { name:"Member", deductible:{ total:null, used:null, remaining:null }, oop:{ total:0, used:0, remaining:0 }, network:"in" },
      ],
      alerts: [],
      benefits: [
        { name:"Home Health",    status:"Covered", fields:{ auth_required:true,  copay:"$0", service_deductible:[ { name:"Individual", remaining:0, used:0, total:0 }, { name:"Family", remaining:0, used:0, total:0 } ], visit_limit:60, visits_used:4, prior_auth_phone:"1-855-555-0123", network_note:"No deductible — Medicaid covers in full" } },
        { name:"EPSDT",          status:"Covered", fields:{ auth_required:false, copay:"$0", network_note:"All medically necessary services covered" } },
        { name:"Dental",         status:"Covered", fields:{ auth_required:false, copay:"$0", visit_limit:2, visits_used:1 } },
        { name:"Transportation", status:"Covered", fields:{ auth_required:true,  copay:"$0", prior_auth_phone:"1-855-555-0123", network_note:"Non-emergency medical transport only" } },
      ],
      auths: [],
    },
  },
  sparse: {
    label: "Sparse Payload",
    data: {
      patient: { name:"Wade Warren", mrn:"B6789012345685", payorName:"Humana" },
      plan: { status:"inactive",
              refId:"REFE000000128", checkDate:"05/04/25", checkTime:"—", checkDateOnly:"05/04/25",
              fullName:"Humana Gold Plan" },
      planResponse: { patientName:"Wade Warren" },
      otherPlans: [],
      tiers: [
        { name:"Member", deductible:{ total:null, used:null, remaining:null }, oop:{ total:null, used:null, remaining:null } },
      ],
      alerts: [{ kind:"warning", title:"Coverage is inactive", body:"Patient has no active coverage at this time." }],
      benefits: [{ name:"Home Health", status:"Not Covered", fields:{ auth_required:null, copay:null } }],
      auths: [],
    },
  },
  robert_fox: {
    label: "Robert Fox — HumanaChoice (PPO)",
    hidden: true,
    data: {
      patient: { name:"Robert Fox", mrn:"V6789012345686", dob:"06/22/1958", memberId:"H1036-298-04", relationship:"Self", payorName:"HumanaChoice Medicare Advantage (PPO)", payorSource:"Availity", planType:"Medicare Advantage", gateway:"Availity", startOfCare:"04/18/25" },
      plan: { status:"active", startDate:"01/01/2025", endDate:"12/31/2025", network:"In-Network", groupNumber:"GRP-46812",
              refId:"REFE694200611", checkDate:"04/18/25", checkTime:"08:41 AM", checkDateOnly:"04/18/25",
              fullName:"HumanaChoice H1036-298 (PPO)",
              payorId:"61101", planTypeShort:"PPO" },
      planResponse: { patientName:"Robert Fox", gender:"Male", relationship:"Self", memberId:"H1036-298-04", dob:"06/22/1958", address:"3812 Hill Crest Dr, Knoxville, TN –37917", mbi:"4HG7-EE9-RF26" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"Humana Gold Plus HMO",            payorId:"61102", memberId:"H1036-298-04-A", coverageDate:"01/01/25 – 12/31/25" },
        { planName:"Humana Walmart Value Rx Plan",    payorId:"61103", memberId:"H1036-298-04-B", coverageDate:"01/01/25 – 12/31/25" },
      ],
      pcp: { physicianName:"Dr. Marisa Quintero", phoneNumber:"865-555-0163", pcpGroupNumber:"611014782", address:"3812 Hill Crest Dr, Knoxville, TN–37917" },
      tiers: [
        { name:"Individual · In-Network",     deductible:{ total:1632, used:640,  remaining:992  }, oop:{ total:4500,  used:1200, remaining:3300 }, network:"in" },
        { name:"Individual · Out-of-Network", deductible:{ total:3000, used:0,    remaining:3000 }, oop:{ total:7500,  used:0,    remaining:7500 }, network:"out" },
        { name:"Family · In-Network",         deductible:{ total:3264, used:1480, remaining:1784 }, oop:{ total:9000,  used:2400, remaining:6600 }, network:"in" },
        { name:"Family · Out-of-Network",     deductible:{ total:6000, used:0,    remaining:6000 }, oop:{ total:15000, used:0,    remaining:15000}, network:"out" },
      ],
      alerts: [
        { kind:"warning", title:"Out-of-network referral required", body:"Plan is PPO — out-of-network visits allowed but cost-share doubles. Confirm referral path before scheduling." },
        { kind:"info",    title:"Coordination of Benefits", body:"Secondary Rx plan detected — Humana Walmart Value Rx. Verify primary/secondary order at intake." },
      ],
      // Service Benefits — note the grouped service_deductible structure used here.
      // Each top-level entry is a GROUP (Individual / Family); each group has
      // `columns` for In-Network and Out-of-Network. This renders as a 6-column
      // divider-label table across all three layouts (A / B / C).
      benefits: [
        { name:"Home Health", status:"Covered", fields:{
            auth_required:true,  copay:"$0 / visit", co_insurance:"20%",
            service_deductible:[
              { name:"Individual", group:true, columns:[
                  { name:"In-Network",     remaining:992,  used:640,  total:1632 },
                  { name:"Out-of-Network", remaining:3000, used:0,    total:3000 },
              ]},
              { name:"Family", group:true, columns:[
                  { name:"In-Network",     remaining:1784, used:1480, total:3264 },
                  { name:"Out-of-Network", remaining:6000, used:0,    total:6000 },
              ]},
            ],
            visit_limit:60, visits_used:12, prior_auth_phone:"1-800-457-4708", network_note:"PPO — out-of-network allowed at higher cost share"
        } },
        { name:"Skilled Nursing", status:"Covered", fields:{
            auth_required:true, copay:"$195 (days 1–20)", co_insurance:"0%",
            service_deductible:[
              { name:"Individual", group:true, columns:[
                  { name:"In-Network",     remaining:992,  used:640,  total:1632 },
                  { name:"Out-of-Network", remaining:3000, used:0,    total:3000 },
              ]},
              { name:"Family", group:true, columns:[
                  { name:"In-Network",     remaining:1784, used:1480, total:3264 },
                  { name:"Out-of-Network", remaining:6000, used:0,    total:6000 },
              ]},
            ],
            days_limit:100, days_used:18, prior_auth_phone:"1-800-457-4708"
        } },
        { name:"Physical & Occupational Therapy", status:"Covered", fields:{
            auth_required:false, copay:"$20 / visit", co_insurance:"20%",
            service_deductible:[
              { name:"Individual", group:true, columns:[
                  { name:"In-Network",     remaining:992,  used:640,  total:1632 },
                  { name:"Out-of-Network", remaining:3000, used:0,    total:3000 },
              ]},
              { name:"Family", group:true, columns:[
                  { name:"In-Network",     remaining:1784, used:1480, total:3264 },
                  { name:"Out-of-Network", remaining:6000, used:0,    total:6000 },
              ]},
            ],
            visit_limit:30, visits_used:6
        } },
        { name:"Durable Medical Equipment", status:"Requires Auth", fields:{
            auth_required:true, co_insurance:"20%", prior_auth_phone:"1-800-457-4708",
            network_note:"Prior auth required for items over $500"
        } },
        { name:"Hospice", status:"Covered", fields:{ auth_required:false, copay:"$0" } },
      ],
      auths: [
        { num:"AUTH-G3H4", status:"Approved", service:"Home Health",     start:"04/18/25", end:"07/18/25", unitsTotal:60, unitsUsed:12 },
        { num:"AUTH-I5J6", status:"Pending",  service:"Skilled Nursing", start:"04/22/25", end:"07/22/25", unitsTotal:100, unitsUsed:0 },
        { num:"AUTH-K7L8", status:"Approved", service:"Physical Therapy",start:"04/22/25", end:"07/22/25", unitsTotal:30,  unitsUsed:6 },
      ],
    },
  },
  cameron_williamson: {
    label: "Cameron Williamson — BCBS Nevada",
    hidden: true,
    data: {
      patient: { name:"Cameron Williamson", mrn:"B6100054445634", dob:"05/12/1968", memberId:"XEO910779295", relationship:"Self", payorName:"BCBS Nevada", payorSource:"Availity", planType:"HMO", gateway:"Availity", startOfCare:"02/06/25" },
      plan: { status:"mixed", startDate:"01/01/2025", endDate:"12/31/9999", network:"In-Network", groupNumber:"X0001004",
              refId:"REF6865913232", checkDate:"02/11/25", checkTime:"07:37 AM", checkDateOnly:"02/11/25",
              fullName:"BCBS Nevada — Silver 94 Trio HMO Jan25",
              payorId:"2001ZH002660", planTypeShort:"HMO" },
      planResponse: { patientName:"Cameron Williamson", gender:"Male", relationship:"Self", memberId:"XEO910779295", dob:"05/12/1968", address:"2140 Big Buck Ln, Paso Robles, CA 93446", mbi:"—" },
      otherPlans: [],
      additionalCoverage: [
        { planName:"Silver 94 Trio HMO Jan25 (Family — Active)",  payorId:"BCBS-CA", memberId:"2001ZH002660", coverageDate:"01/01/25 – Open-ended" },
        { planName:"IFP EMB PED Dental HMO Jan17 (Inactive)",     payorId:"BCBS-CA", memberId:"2001D0000334", coverageDate:"09/01/21 – Open-ended" },
        { planName:"IFP EMB PED Vision HMO Jan17 (Inactive)",     payorId:"BCBS-CA", memberId:"2001V0000346", coverageDate:"09/01/21 – Open-ended" },
      ],
      pcp: { physicianName:"Dr. Tiffney Taylor", phoneNumber:"(888) 560-8799", pcpGroupNumber:"NPI 1003116674", address:"265 Posada Ln Ste B, Templeton, CA 93465" },
      tiers: [
        { name:"Individual · In-Network", deductible:{ total:0, used:0, remaining:0 }, oop:{ total:1150, used:710.99, remaining:439.01  }, network:"in" },
        { name:"Family · In-Network",     deductible:{ total:0, used:0, remaining:0 }, oop:{ total:2300, used:710.99, remaining:1589.01 }, network:"in" },
      ],
      alerts: [
        { kind:"warning", title:"Mixed Coverage detected", body:"Family (Silver 94 Trio HMO Jan25) is Active. Spouse & Children Dental + Vision (IFP EMB PED) are Inactive. Verify pediatric coverage before scheduling." },
        { kind:"info",    title:"Deductible already at $0", body:"$0 calendar-year deductible. Co-insurance (typically 10%) and per-visit copays apply for in-network services." },
        { kind:"info",    title:"Authorization required for inpatient", body:"Inpatient hospital + psychiatric admissions require pre-auth via Blue Shield of CA Authorization Dept — (800) 541-6652." },
      ],
      benefits: [
        { name:"Home Health", status:"Covered", fields:{ auth_required:false, copay:"$25 / visit", co_insurance:"10%", service_deductible:[ { name:"Individual", remaining:439.01, used:710.99, total:1150 }, { name:"Family", remaining:1589.01, used:710.99, total:2300 } ], visit_limit:60, visits_used:8, network_note:"In-network provider required" } },
        { name:"Emergency Room — Physician", status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Physician benefit — Emergency Room (POS: Emergency Room - Hospital)" } },
        { name:"Emergency Room — Facility",  status:"Covered", fields:{ auth_required:false, copay:"$50 / visit", network_note:"Facility benefit — Emergency Room (POS: Emergency Room - Hospital)" } },
        { name:"Ambulance — Air",            status:"Covered", fields:{ auth_required:false, copay:"$30 / visit", network_note:"Physician benefit — Air ambulance (POS: Ambulance - Air or Water)" } },
        { name:"Ambulance — Surface",        status:"Covered", fields:{ auth_required:false, copay:"$30 / visit", network_note:"Physician benefit — Surface ambulance (POS: Ambulance - Land)" } },
        { name:"Urgent Care — Facility",     status:"Covered", fields:{ auth_required:false, copay:"$5 / visit",  network_note:"Urgent Care Center (POS: Emergency Room - Hospital)" } },
        { name:"Urgent Care — Office Visit", status:"Covered", fields:{ auth_required:false, copay:"$5 / visit",  network_note:"Physician benefit — Urgent office visit (POS: Office)" } },
        { name:"Hospital — Inpatient",       status:"Requires Auth", fields:{ auth_required:true,  co_insurance:"10%", prior_auth_phone:"(800) 541-6652", network_note:"Authorization required: Blue Shield of CA Auth Dept. Fax (844) 295-4637. Includes alcohol/substance detox, mental health, maternity delivery, dental medical, transplant. Excludes maternity (auth)." } },
        { name:"Hospital — Outpatient",      status:"Covered",       fields:{ auth_required:false, co_insurance:"10%", network_note:"Outpatient hospital + ambulatory surgery center: procedures, surgeries, facility fees, newborn services." } },
        { name:"Mental Health — Inpatient",  status:"Requires Auth", fields:{ auth_required:true,  co_insurance:"10%", prior_auth_phone:"(800) 541-6652", network_note:"Inpatient psychiatric facility — sub abuse, mental health" } },
        { name:"Pharmacy",                   status:"Covered",       fields:{ auth_required:false, network_note:"Active coverage — refer to plan formulary for tier pricing" } },
        { name:"Dental Care",                status:"Covered",       fields:{ auth_required:false, network_note:"Adult dental: Active in-network. Pediatric dental (IFP EMB PED) on separate plan: Inactive." } },
        { name:"Physician — Preventive Care",       status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Preventive health care services: annual checkups, screenings (POS: Office)" } },
        { name:"Physician — Diabetes Care",          status:"Covered", fields:{ auth_required:false, copay:"$0 / visit", network_note:"Diabetic counseling + self-management training (POS: Home)" } },
        { name:"Physician — Specialist Office Visit",status:"Covered", fields:{ auth_required:false, copay:"$8 / visit", network_note:"Access Plus self-referral: lab specialist, radiology specialist, office consultation, second opinion" } },
        { name:"Podiatrist Office Visit",            status:"Covered", fields:{ auth_required:false, copay:"$5 / visit", network_note:"Physician services in office (POS: Office)" } },
      ],
      auths: [
        { num:"AUTH-9301", status:"Approved", service:"Hospital — Inpatient",      start:"02/06/25", end:"08/06/25", unitsTotal:5, unitsUsed:0 },
        { num:"AUTH-9302", status:"Pending",  service:"Mental Health — Inpatient", start:"02/06/25", end:"08/06/25", unitsTotal:7, unitsUsed:0 },
        { num:"AUTH-9303", status:"Approved", service:"Outpatient Surgery",        start:"02/06/25", end:"05/06/25", unitsTotal:1, unitsUsed:0 },
      ],
    },
  },
};

const COLORS = {
  textPri:"#1F2530", textBody:"#3A424A", textMute:"#6A717D", textFaint:"#8D949D",
  border:"#E8E9EA", divider:"#EEF0F3", blue:"#2F6FED", teal:"#276966",
  amber:"#E6A817", amberBg:"#FFFBF0", red:"#E53E3E", redBg:"#FFF5F5", green:"#1F7A3A", greenBg:"#E6F7E0", greenBd:"#9FCB8A",
  blueBg:"#F0F6FF",
};

// ── Header line builders ──────────────────────────────────────
const Inline = ({ children }) => <div style={{display:"flex",flexWrap:"wrap",gap:"2px 18px",font:"400 13px/20px Roboto",color:COLORS.textBody}}>{children}</div>;
const LabeledField = ({ label, value }) => (
  isPresent(value)
    ? <span><span style={{color:COLORS.textMute}}>{label}</span> <span style={{color:COLORS.textPri,fontWeight:500}}>{value}</span></span>
    : null
);
const Dot = () => <span style={{color:COLORS.textFaint}}>·</span>;

function StatusPill({ status }) {
  const m = {
    active:     { bg:"#E6F7E0", bd:"#9FCB8A", c:"#1F7A3A", label:"Active" },
    inactive:   { bg:"#FBE4E4", bd:"#E8A1A1", c:"#B92D2D", label:"Inactive" },
    terminated: { bg:"#FFFBE6", bd:"#FFE58F", c:"#9C7719", label:"Termed" },
  };
  const s = m[status] || m.active;
  return <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",borderRadius:999,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 12px/16px Roboto"}}>{s.label==="Active" && <span>✓</span>}{s.label}</span>;
}

function PatientHeader({ patient, plan, onClose }) {
  const nameParts = (patient.name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || "—";
  const lastName  = nameParts.slice(1).join(" ");

  const fields = [
    { key:"mrn",          label:"MRN",          value:patient.mrn },
    { key:"dob",          label:"DOB",          value:patient.dob },
    { key:"memberId",     label:"Member ID",    value:patient.memberId },
    { key:"relationship", label:"Relationship", value:patient.relationship },
    { key:"payorName",    label:"Payor",        value:patient.payorName },
    { key:"payorSource",  label:"Source",       value:patient.payorSource },
    { key:"planType",     label:"Plan Type",    value:patient.planType },
    { key:"gateway",      label:"Gateway",      value:patient.gateway },
    { key:"startOfCare",  label:"SOC",          value:patient.startOfCare },
  ].filter(f => isPresent(f.value));

  return (
    <div style={{position:"relative",padding:"22px clamp(16px, 2.4vw, 36px) 18px",background:"#fff",borderBottom:`1px solid ${COLORS.divider}`}}>
      <button onClick={onClose} aria-label="Close" style={{position:"absolute",top:14,right:14,background:"transparent",border:"none",color:COLORS.textMute,fontSize:20,cursor:"pointer",lineHeight:1,padding:6}}>✕</button>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:32,flexWrap:"wrap"}}>
        {/* Name — two lines, left-aligned, bold */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",lineHeight:"1.1",flexShrink:0}}>
          <span style={{font:"700 30px/1.1 Roboto",color:"#111827"}}>{firstName}</span>
          {isPresent(lastName) && <span style={{font:"700 30px/1.1 Roboto",color:"#111827"}}>{lastName}</span>}
        </div>
        {/* Metadata grid — bottom-aligned label-on-top fields */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"14px 28px",alignItems:"flex-end",flex:1,minWidth:0,paddingRight:32}}>
          {fields.map(f => (
            <div key={f.key} style={{display:"flex",flexDirection:"column",minWidth:0}}>
              <div style={{font:"400 11px/14px Roboto",color:"#6B7280",letterSpacing:"0.01em"}}>{f.label}</div>
              <div style={{font:"500 14px/18px Roboto",color:"#111827",marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:260}}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TierChips({ plan, alertCount }) {
  if (!plan) return null;
  const chips = [];
  if (isPresent(plan.network))     chips.push({ key:"net",   text: plan.network });
  if (isPresent(plan.groupNumber)) chips.push({ key:"grp",   text: `Group ${plan.groupNumber}` });
  if (isPresent(plan.startDate) || isPresent(plan.endDate)) chips.push({ key:"r", text: `${plan.startDate || "—"} → ${plan.endDate || "—"}` });
  if (alertCount > 0) chips.push({ key:"a", text:`${alertCount} alert${alertCount>1?"s":""}`, tone:"warn" });
  if (!chips.length) return null;
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px clamp(16px, 2.4vw, 36px) 12px",background:"#fff"}}>
      {chips.map(c=>{
        const warn = c.tone==="warn";
        return (
          <span key={c.key} style={{display:"inline-block",padding:"3px 10px",borderRadius:999,background:warn?COLORS.amberBg:"#FAFBFC",border:`1px solid ${warn?"#F1D89A":COLORS.border}`,color:warn?"#8A6A14":COLORS.textBody,font:"400 12px/16px Roboto"}}>{c.text}</span>
        );
      })}
    </div>
  );
}

function TabBar({ active, onTab }) {
  const Tab = ({ k, label }) => (
    <button onClick={()=>onTab(k)} style={{background:"transparent",border:"none",cursor:"pointer",padding:"10px 4px",font:`${active===k?500:400} 14px/18px Roboto`,color:active===k?COLORS.blue:COLORS.textBody,borderBottom:`2px solid ${active===k?COLORS.blue:"transparent"}`,marginRight:24}}>{label}</button>
  );
  return (
    <div style={{display:"flex",alignItems:"center",padding:"0 clamp(16px, 2.4vw, 36px)",background:"#fff",borderBottom:`1px solid ${COLORS.divider}`}}>
      <Tab k="elig" label="Eligibility Info" />
      <Tab k="auth" label="Authorization Info" />
      <a href="#" onClick={(e)=>e.preventDefault()} style={{marginLeft:"auto",font:"400 13px/16px Roboto",color:COLORS.blue,textDecoration:"none"}}>Automation Log</a>
    </div>
  );
}

// ── Tier card (Plan Benefit) ─────────────────────────────────
function tierAccent(name){
  const s = name || "";
  if (/Dependent|Domestic Partner/i.test(s)) return "#7c3aed";        // purple
  if (/Out[- ]of[- ]Network|OON/i.test(s))   return "#94a3b8";        // slate
  return "#2563eb";                                                    // blue
}
function tierNetworkPill(name){
  const s = name || "";
  if (/Dependent|Domestic Partner/i.test(s)) return { bg:"#f5f3ff", c:"#6d28d9", bd:"#ddd6fe", label: /Dependent/i.test(s) ? "Dependent" : "Domestic Partner" };
  if (/Out[- ]of[- ]Network|OON/i.test(s))   return { bg:"#f8fafc", c:"#64748b", bd:"#e2e8f0", label:"Out-of-Network" };
  if (/In[- ]Network/i.test(s))              return { bg:"#eff6ff", c:"#1d4ed8", bd:"#bfdbfe", label:"In-Network" };
  return null;
}
function tierBaseName(name){
  // Strip the " · <network>" suffix when present so the chip carries network info.
  const s = name || "";
  const idx = s.indexOf(" · ");
  if (idx === -1) return s;
  const head = s.slice(0, idx);
  const tail = s.slice(idx + 3);
  // If the qualifier IS the network suffix, drop it; otherwise keep entire name.
  if (/^(In[- ]Network|Out[- ]of[- ]Network|OON)$/i.test(tail)) return head;
  return s;
}

// Variant: 'default' (Medicare Advantage / Sparse Payload), 'option-b' (Commercial PPO), 'option-c' (Medicaid)
function getPlanCardVariant(payloadKey){
  if (payloadKey === "commercial_ppo") return "option-b";
  if (payloadKey === "medicaid")       return "option-c";
  return "default";
}

function TierCardDefault({ tier }) {
  const accent = tierAccent(tier.name);
  const parts = (tier.name || "").split(" · ");
  const primary = parts[0] || "";
  const secondary = parts.slice(1).join(" · ");

  const Metric = ({ label, total, used, remaining }) => {
    const hasAmount = isPresent(remaining);
    const pct = pctSafe(used, total);
    return (
      <div>
        <div style={{font:"600 10px/14px Roboto",color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5}}>{label}</div>
        {hasAmount ? (
          <React.Fragment>
            <div style={{font:"600 24px/1 Roboto",color:"#0f172a",marginBottom:3}}>{fmtMoney(remaining)}</div>
            {(isPresent(used) || isPresent(total)) && (
              <div style={{font:"400 12px/16px Roboto",color:"#94a3b8",marginBottom:8}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
            )}
            {pct!==null && (
              <div style={{height:3,background:"#f1f5f9",borderRadius:2,overflow:"hidden"}}>
                <div style={{width:`${pct}%`,height:"100%",background:accent,borderRadius:2}}></div>
              </div>
            )}
          </React.Fragment>
        ) : (
          <div style={{font:"500 20px/1 Roboto",color:"#cbd5e1"}}>—</div>
        )}
      </div>
    );
  };

  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      padding:"20px 24px",
      background:"#fff",
      boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)",
      transition:"box-shadow 0.15s ease, transform 0.15s ease",
    }}>
      <div style={{marginBottom:18,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
        <span style={{font:"500 14px/18px Roboto",color:"#0f172a"}}>{primary}</span>
        {secondary && <span style={{font:"400 13px/18px Roboto",color:"#94a3b8"}}> · {secondary}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
        <Metric label="Deductible Remaining"     total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
        <Metric label="Out-of-Pocket Remaining" total={tier.oop && tier.oop.total}                used={tier.oop && tier.oop.used}                remaining={tier.oop && tier.oop.remaining} />
      </div>
    </div>
  );
}

// Option B — Commercial PPO. Header chip carries the network type; body is
// stacked rows (label left, amount + subtext right). No progress bars.
function TierCardOptionB({ tier }) {
  const pill = tierNetworkPill(tier.name);
  const base = tierBaseName(tier.name);
  const Row = ({ label, total, used, remaining, last }) => {
    const hasAmount = isPresent(remaining);
    return (
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"10px 16px",borderBottom: last ? "none" : "1px solid #f8fafc",gap:12}}>
        <div style={{font:"400 12px/18px Roboto",color:"#94a3b8"}}>{label}</div>
        <div style={{textAlign:"right",minWidth:0}}>
          {hasAmount ? (
            <React.Fragment>
              <div style={{font:"500 14px/18px Roboto",color:"#0f172a"}}>{fmtMoney(remaining)}</div>
              {(isPresent(used) || isPresent(total)) && (
                <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:1}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
              )}
            </React.Fragment>
          ) : (
            <div style={{font:"500 14px/18px Roboto",color:"#cbd5e1"}}>—</div>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      border:"1px solid #e2e8f0",
      background:"#fff",
      overflow:"hidden",
      transition:"box-shadow 0.15s ease",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f1f5f9",gap:10}}>
        <span style={{font:"500 14px/18px Roboto",color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{base}</span>
        {pill && (
          <span style={{font:"500 11px/16px Roboto",padding:"2px 10px",borderRadius:20,background:pill.bg,color:pill.c,border:`1px solid ${pill.bd}`,whiteSpace:"nowrap"}}>{pill.label}</span>
        )}
      </div>
      <Row label="Deductible remaining" total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
      <Row label="Out-of-pocket remaining" total={tier.oop && tier.oop.total} used={tier.oop && tier.oop.used} remaining={tier.oop && tier.oop.remaining} last />
    </div>
  );
}

// Option C — Medicaid. Bordered card with a divider between tier label and
// the 2-column metric grid (Deductible / Out-of-Pocket). No progress bar.
// Labels truncate with ellipsis + tooltip when space is tight.
function TierCardOptionC({ tier }) {
  const parts = (tier.name || "").split(" · ");
  const primary = parts[0] || "";
  const secondary = parts.slice(1).join(" · ");
  const Metric = ({ label, total, used, remaining }) => {
    const hasAmount = isPresent(remaining);
    return (
      <div style={{minWidth:0}}>
        <div
          title={label}
          style={{
            font:"600 11px/14px Roboto",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            color:"#94a3b8",
            marginBottom:6,
            whiteSpace:"nowrap",
            overflow:"hidden",
            textOverflow:"ellipsis",
          }}
        >
          {label}
        </div>
        {hasAmount ? (
          <React.Fragment>
            <div style={{font:"700 22px/1 Roboto",color:"#0f172a",marginBottom:4}}>{fmtMoney(remaining)}</div>
            {(isPresent(used) || isPresent(total)) && (
              <div style={{font:"400 12px/16px Roboto",color:"#94a3b8"}}>{fmtMoney(used)} of {fmtMoney(total)}</div>
            )}
          </React.Fragment>
        ) : (
          <div style={{font:"500 20px/1 Roboto",color:"#cbd5e1"}}>—</div>
        )}
      </div>
    );
  };
  return (
    <div className="ed-tier-card" style={{
      borderRadius:12,
      border:"1px solid #e2e8f0",
      background:"#fff",
      padding:"16px 22px",
      overflow:"hidden",
      transition:"box-shadow 0.15s ease",
    }}>
      <div style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",paddingBottom:12,borderBottom:"1px solid #f1f5f9"}}>
        <span style={{font:"600 14px/18px Roboto",color:"#0f172a"}}>{primary}</span>
        {secondary && <span style={{font:"400 13px/18px Roboto",color:"#94a3b8"}}> · {secondary}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,paddingTop:14}}>
        <Metric label="Deductible Remaining"     total={tier.deductible && tier.deductible.total} used={tier.deductible && tier.deductible.used} remaining={tier.deductible && tier.deductible.remaining} />
        <Metric label="Out-of-Pocket Remaining" total={tier.oop && tier.oop.total}                used={tier.oop && tier.oop.used}                remaining={tier.oop && tier.oop.remaining} />
      </div>
    </div>
  );
}

function TierCard({ tier, variant }) {
  if (variant === "option-b") return <TierCardOptionB tier={tier} />;
  if (variant === "option-c") return <TierCardOptionC tier={tier} />;
  return <TierCardDefault tier={tier} />;
}

function TierGrid({ tiers, variant }) {
  if (!tiers || !tiers.length) return null;
  const n = tiers.length;
  const gap = variant === "default" ? 16 : 12;

  // Single tier: cap so it doesn't span the entire 85vw drawer.
  if (n===1) {
    return (
      <div style={{display:"grid",gridTemplateColumns:"minmax(280px, 520px)",gap}}>
        <TierCard tier={tiers[0]} variant={variant} />
      </div>
    );
  }

  // 5-card layout: 2 top · 3 bottom (Self tiers up top, Family + extras below).
  if (n===5) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2, minmax(0, 1fr))",gap}}>
          {tiers.slice(0,2).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(2).map((t,i)=>(<TierCard key={i+2} tier={t} variant={variant} />))}
        </div>
      </div>
    );
  }

  // 6-card layout (e.g. Commercial PPO): 3×2 with a thin rule between rows.
  if (n===6) {
    return (
      <div style={{display:"flex",flexDirection:"column",gap}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(0,3).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
        </div>
        <div style={{borderTop:"1px solid #f1f5f9"}}></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3, minmax(0, 1fr))",gap}}>
          {tiers.slice(3).map((t,i)=>(<TierCard key={i+3} tier={t} variant={variant} />))}
        </div>
      </div>
    );
  }

  // Responsive grid logic
  let cols, rows = null;
  if (n===2)       cols = "repeat(2, minmax(0, 1fr))";
  else if (n===3)  cols = "repeat(3, minmax(0, 1fr))";
  else if (n===4)  cols = "repeat(2, minmax(0, 1fr))";
  else if (n===5)  { cols = "repeat(3, minmax(0, 1fr))"; rows = [2,3]; }
  else if (n===7)  { cols = "repeat(4, minmax(0, 1fr))"; rows = [4,3]; }
  else             cols = "repeat(auto-fit, minmax(240px, 1fr))";

  if (!rows) {
    return (
      <div style={{display:"grid",gridTemplateColumns:cols,gap}}>
        {tiers.map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
      </div>
    );
  }
  const [r1, r2] = rows;
  return (
    <div style={{display:"flex",flexDirection:"column",gap}}>
      <div style={{display:"grid",gridTemplateColumns:cols,gap}}>
        {tiers.slice(0, r1).map((t,i)=>(<TierCard key={i} tier={t} variant={variant} />))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${r2}, minmax(0, ${r1 === 4 ? "calc(100%/4 - 12px)" : "calc(100%/3 - 11px)"}))`,gap,justifyContent:"center"}}>
        {tiers.slice(r1).map((t,i)=>(<TierCard key={i+r1} tier={t} variant={variant} />))}
      </div>
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────
const ALERT_TONES = {
  warning: { bd:"#E6A817", bg:"#FFFBF0", titleC:"#8A6A14" },
  info:    { bd:"#2F6FED", bg:"#F0F6FF", titleC:"#1B4FCB" },
  error:   { bd:"#E53E3E", bg:"#FFF5F5", titleC:"#9B2C2C" },
};

function AlertsAccordion({ alerts }) {
  const [open, setOpen] = useED(false);
  if (!alerts || !alerts.length) return null;
  return (
    <div>
      <div onClick={()=>setOpen(v=>!v)} style={{display:"flex",alignItems:"center",cursor:"pointer",padding:"6px 0",font:"500 14px/18px Roboto",color:COLORS.textPri,gap:10}}>
        <span style={{display:"inline-block",transform:open?"rotate(90deg)":"none",transition:"transform .15s",fontSize:10,color:COLORS.textMute}}>▸</span>
        Eligibility Alerts
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",background:COLORS.amber,color:"#fff",font:"600 11px/20px Roboto"}}>{alerts.length}</span>
      </div>
      {open && (
        <div style={{display:"flex",flexDirection:"column",marginTop:6}}>
          {alerts.map((a,i)=>{
            const t = ALERT_TONES[a.kind] || ALERT_TONES.info;
            return (
              <div key={i} style={{background:t.bg,borderLeft:`3px solid ${t.bd}`,padding:"12px 16px",borderRadius:"0 8px 8px 0",marginBottom:10}}>
                {isPresent(a.title) && <div style={{font:"500 14px/18px Roboto",color:t.titleC}}>{a.title}</div>}
                {isPresent(a.body)  && <div style={{font:"400 13px/18px Roboto",color:COLORS.textBody,marginTop:isPresent(a.title)?4:0}}>{a.body}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Service Benefits (accordion rows) ─────────────────────────
const FIELD_LABELS = {
  auth_required:"Auth Required", copay:"Copay", co_insurance:"Co-Insurance",
  visit_limit:"Visit Limit", visits_used:"Visits Used",
  days_limit:"Days Limit", days_used:"Days Used",
  session_limit:"Session Limit", sessions_used:"Sessions Used",
  service_deductible:"Service Deductibles",
  prior_auth_phone:"Prior Auth Phone", network_note:"Network Note",
  // Additional coverage + PCP info
  plan_name:"Plan Name",
  payor_id:"Payor ID",
  member_id:"Member ID",
  coverage_date:"Coverage Date",
  physician_name:"Physician Name",
  phone_number:"Phone Number",
  pcp_group_number:"PCP Group Number",
  address:"Address",
};

const STATUS_DOT = { "Covered":"#16a34a", "Requires Auth":"#d97706", "Not Covered":"#dc2626" };

function CoverageBadgeV2({ status }) {
  const m = {
    "Covered":       { bg:"#f0fdf4", c:"#166534", bd:"#bbf7d0", label:"Covered" },
    "Requires Auth": { bg:"#fffbeb", c:"#92400e", bd:"#fde68a", label:"Auth Required" },
    "Not Covered":   { bg:"#fef2f2", c:"#991b1b", bd:"#fecaca", label:"Not Covered" },
  };
  const s = m[status] || { bg:"#f8fafc", c:"#475569", bd:"#e2e8f0", label:status||"Unknown" };
  return (
    <span style={{display:"inline-block",font:"500 11px/16px Roboto",padding:"3px 12px",borderRadius:20,background:s.bg,color:s.c,border:`1px solid ${s.bd}`,whiteSpace:"nowrap"}}>{s.label}</span>
  );
}

// Detects whether a service_deductible field uses the grouped structure
// (Individual / Family → In-Network / Out-of-Network).
function isGroupedDeductible(tiers) {
  return Array.isArray(tiers) && tiers.length>0 && tiers[0] && tiers[0].group === true && Array.isArray(tiers[0].columns);
}

// Renders the 6-column "divider-label" deductible table — two top-level
// group columns (Individual / Family), each split into sub-columns
// (In-Network / Out-of-Network), with horizontal dividers between rows
// of labels and values. Reused inside every Service-Benefit layout so the
// visual stays identical regardless of layout choice (A / B / C).
function GroupedDeductibleTable({ groups, dense }) {
  const totalCols = groups.reduce((n,g)=>n + (g.columns?.length || 0), 0) || 1;
  const cellPadV = dense ? 8 : 10;
  const cellPadH = dense ? 10 : 14;
  const borderCol = "#e2e8f0";
  const innerBorderCol = "#f1f5f9";
  return (
    <div style={{
      border:`1px solid ${borderCol}`,
      borderRadius:8,
      overflow:"hidden",
      background:"#fff",
      width:"100%",
    }}>
      {/* Row 1 — Group labels (Individual / Family) */}
      <div style={{display:"grid",gridTemplateColumns:groups.map(g=>`${g.columns.length}fr`).join(" "),background:"#f8fafc",borderBottom:`1px solid ${borderCol}`}}>
        {groups.map((g,gi)=>(
          <div key={gi} style={{
            padding:`${cellPadV}px ${cellPadH}px`,
            font:"600 11px/14px Roboto",
            letterSpacing:"0.08em",
            textTransform:"uppercase",
            color:"#475569",
            borderLeft: gi>0 ? `1px solid ${borderCol}` : "none",
            textAlign:"center",
          }}>{g.name}</div>
        ))}
      </div>
      {/* Row 2 — Sub-column labels (In-Network / Out-of-Network) */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${totalCols}, 1fr)`,borderBottom:`1px solid ${borderCol}`,background:"#fcfdfe"}}>
        {groups.flatMap((g,gi)=>g.columns.map((c,ci)=>{
          const isGroupStart = ci===0 && gi>0;
          return (
            <div key={`${gi}-${ci}`} style={{
              padding:`${cellPadV-2}px ${cellPadH}px`,
              font:"500 12px/16px Roboto",
              color:"#2563eb",
              borderLeft: ci>0 || isGroupStart ? `1px solid ${isGroupStart ? borderCol : innerBorderCol}` : "none",
            }}>{c.name}</div>
          );
        }))}
      </div>
      {/* Row 3 — Values */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${totalCols}, 1fr)`}}>
        {groups.flatMap((g,gi)=>g.columns.map((c,ci)=>{
          const isGroupStart = ci===0 && gi>0;
          return (
            <div key={`v-${gi}-${ci}`} style={{
              padding:`${cellPadV}px ${cellPadH}px`,
              borderLeft: ci>0 || isGroupStart ? `1px solid ${isGroupStart ? borderCol : innerBorderCol}` : "none",
              minWidth:0,
            }}>
              <div style={{font:`600 ${dense?13:15}px/18px Roboto`,color:"#0f172a"}}>
                {fmtMoney(c.remaining)}
                <span style={{color:"#94a3b8",fontWeight:400,fontSize:11,marginLeft:5}}>remaining</span>
              </div>
              <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:3}}>{fmtMoney(c.used)} of {fmtMoney(c.total)}</div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// Shared block for the `service_deductible` field. Two render modes:
//   • Grouped (6-column divider-label table) — when data has `group:true`
//     entries with `columns` arrays. Used by Robert Fox.
//   • Flat — original side-by-side tiers. Used by Marvin McKinney etc.
// Both modes cascade unchanged through Layouts A / B / C.
function ServiceDeductibleBlock({ tiers, compact, columns }) {
  if (!Array.isArray(tiers) || !tiers.length) return null;
  if (isGroupedDeductible(tiers)) {
    return <GroupedDeductibleTable groups={tiers} dense={!!compact} />;
  }
  const renderTier = (t) => (
    <div style={{minWidth:0}}>
      <div style={{font:`500 ${compact?12:13}px/16px Roboto`,color:"#2563eb"}}>{t.name}</div>
      <div style={{font:`500 ${compact?14:16}px/20px Roboto`,color:"#0f172a",marginTop:3}}>
        {fmtMoney(t.remaining)}
        <span style={{color:"#94a3b8",fontWeight:400,fontSize:11,marginLeft:5}}>remaining</span>
      </div>
      <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:3}}>{fmtMoney(t.used)} Used of {fmtMoney(t.total)}</div>
    </div>
  );
  if (columns) {
    // Layout B: grid that matches the parent's 3-col layout. No dividers
    // between tiers — alignment alone communicates the column grouping.
    return (
      <div style={{display:"grid",gridTemplateColumns:`repeat(${columns}, 1fr)`,width:"100%"}}>
        {tiers.map((t,i)=>(<React.Fragment key={i}>{renderTier(t)}</React.Fragment>))}
      </div>
    );
  }
  // Default flex layout (Layout A / Layout C): tiers sit close together
  // with a 48px gap rather than stretching across the full row.
  return (
    <div style={{display:"flex",alignItems:"flex-start",flexWrap:"wrap",gap:48}}>
      {tiers.map((t,i)=>(<React.Fragment key={i}>{renderTier(t)}</React.Fragment>))}
    </div>
  );
}

// Format a single field value according to its key. Returns a React node.
function renderFieldValue(key, value, fields, opts={}) {
  if (key === "auth_required") {
    const yes = value === true;
    return <span style={{color:yes?"#d97706":"#16a34a",fontWeight:600}}>{yes?"Yes":"No"}</span>;
  }
  if (key === "prior_auth_phone") {
    return <span style={{color:"#2563eb"}}>{value}</span>;
  }
  if (key === "visits_used" && isPresent(fields.visit_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.visit_limit}</span></React.Fragment>;
  }
  if (key === "days_used" && isPresent(fields.days_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.days_limit}</span></React.Fragment>;
  }
  if (key === "sessions_used" && isPresent(fields.session_limit)) {
    return <React.Fragment><span style={{color:"#0f172a"}}>{value}</span><span style={{color:"#94a3b8"}}> of {fields.session_limit}</span></React.Fragment>;
  }
  if (key === "visit_limit")   return `${value} per year`;
  if (key === "session_limit") return `${value} per year`;
  if (key === "days_limit")    return `${value} days`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// Layout A — Medicare Advantage / Sparse: two-column grid (label | value)
function BenefitContentA({ fields }) {
  const keys = Object.keys(fields).filter(k => isPresent(fields[k]) || fields[k]===false);
  return (
    <div style={{borderTop:"1px solid #f1f5f9"}}>
      {keys.map((k,i)=>{
        const isSvcDed = k === "service_deductible";
        const isGrouped = isSvcDed && isGroupedDeductible(fields[k]);
        // Grouped deductible breaks out of the 40/60 grid so its 6-column
        // divider-label table has the full row to breathe.
        if (isGrouped) {
          return (
            <div key={k} style={{padding:"12px 18px 14px",borderBottom:i<keys.length-1?"1px solid #f8fafc":"none"}}>
              <div style={{font:"400 12px/18px Roboto",color:"#94a3b8",marginBottom:8}}>{FIELD_LABELS[k]||k}</div>
              <ServiceDeductibleBlock tiers={fields[k]} compact />
            </div>
          );
        }
        return (
          <div key={k} style={{display:"grid",gridTemplateColumns:"40% 60%",borderBottom:i<keys.length-1?"1px solid #f8fafc":"none",alignItems:isSvcDed?"flex-start":"stretch"}}>
            <div style={{padding:"10px 18px",font:"400 12px/18px Roboto",color:"#94a3b8",borderRight:"1px solid #f1f5f9"}}>{FIELD_LABELS[k]||k}</div>
            <div style={{padding:"10px 18px",font:"500 12px/18px Roboto",color:"#0f172a",wordBreak:"break-word"}}>
              {isSvcDed ? <ServiceDeductibleBlock tiers={fields[k]} compact /> : renderFieldValue(k, fields[k], fields)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Layout B — Commercial PPO: 3-column metric tile grid
function BenefitContentB({ fields }) {
  const all = Object.keys(fields).filter(k => isPresent(fields[k]) || fields[k]===false);
  // service_deductible always renders LAST (below network_note), separated
  // from the rest by a divider line.
  const keys = all.filter(k => k !== "service_deductible")
                  .concat(all.includes("service_deductible") ? ["service_deductible"] : []);
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",padding:"16px 18px",gap:0,borderTop:"1px solid #f1f5f9"}}>
      {keys.map(k=>{
        const isFull = k === "network_note" || k === "service_deductible";
        const isSvcDed = k === "service_deductible";
        const v = fields[k];
        const valStyle = { font:"500 14px/20px Roboto", color:"#0f172a" };
        if (k === "prior_auth_phone") { valStyle.color = "#2563eb"; valStyle.font = "500 13px/20px Roboto"; }
        return (
          <div key={k} style={{
            paddingBottom:16,
            gridColumn: isFull ? "1 / -1" : "auto",
            borderTop: isSvcDed ? "1px solid #f1f5f9" : "none",
            paddingTop: isSvcDed ? 16 : 0,
            marginTop: isSvcDed ? 4 : 0,
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.07em",textTransform:"uppercase",color:"#94a3b8",marginBottom:isSvcDed?10:5}}>{FIELD_LABELS[k]||k}</div>
            {isSvcDed
              ? <ServiceDeductibleBlock tiers={v} columns={3} />
              : <div style={valStyle}>{renderFieldValue(k, v, fields)}</div>}
          </div>
        );
      })}
    </div>
  );
}

// Layout C — Medicaid: floating pill chips
function BenefitContentC({ fields }) {
  const keys = Object.keys(fields).filter(k => isPresent(fields[k]) || fields[k]===false);
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:"14px 18px",borderTop:"1px solid #f1f5f9"}}>
      {keys.map(k=>{
        const v = fields[k];
        const isAuth   = k === "auth_required";
        const isNote   = k === "network_note";
        const isPhone  = k === "prior_auth_phone";
        const isSvcDed = k === "service_deductible";
        let chipBg = "#f8fafc";
        if (isAuth) chipBg = v===true ? "#fffbeb" : "#f0fdf4";
        const valStyle = { font:"500 13px/18px Roboto", color:"#0f172a" };
        if (isPhone) { valStyle.color = "#2563eb"; valStyle.font = "500 12px/18px Roboto"; }
        return (
          <div key={k} style={{
            background: chipBg,
            borderRadius:8,
            padding:"9px 14px",
            display:"flex",
            flexDirection:"column",
            gap:isSvcDed?6:3,
            flex: isSvcDed ? "1 1 100%" : isNote ? "1 1 200px" : "0 0 auto",
            minWidth: isSvcDed ? "100%" : isNote ? 200 : "auto",
          }}>
            <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:"#94a3b8"}}>{FIELD_LABELS[k]||k}</div>
            {isSvcDed
              ? <ServiceDeductibleBlock tiers={v} compact />
              : <div style={valStyle}>{renderFieldValue(k, v, fields)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function BenefitRow({ benefit, open, onToggle, layout }) {
  const Content = layout === "B" ? BenefitContentB : layout === "C" ? BenefitContentC : BenefitContentA;
  const hasFields = benefit.fields && Object.keys(benefit.fields).some(k => isPresent(benefit.fields[k]) || benefit.fields[k]===false);
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:12,marginBottom:10,overflow:"hidden",background:"#fff"}}>
      <div
        onClick={onToggle}
        className="ed-benefit-header"
        style={{display:"flex",alignItems:"center",padding:"14px 18px",cursor:"pointer",gap:10}}
      >
        <span style={{
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          width:12,
          color:"#94a3b8",
          fontSize:10,
          lineHeight:1,
          transition:"transform .15s ease",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          flexShrink:0,
        }}>▶</span>
        <span style={{font:"500 13px/18px Roboto",color:"#0f172a",flex:1}}>{benefit.name}</span>
        <CoverageBadgeV2 status={benefit.status} />
      </div>
      {open && hasFields && <Content fields={benefit.fields} />}
    </div>
  );
}

function BenefitsList({ benefits, layout }) {
  const [openIdx, setOpenIdx] = useED(0);
  if (!benefits || !benefits.length) return null;
  return (
    <div>
      {benefits.map((b,i)=>(
        <BenefitRow key={i} benefit={b} open={openIdx===i} onToggle={()=>setOpenIdx(openIdx===i?-1:i)} layout={layout} />
      ))}
    </div>
  );
}

// Generic accordion using the same layout vocabulary as Service Benefits
// (A/B/C), but without a coverage badge. Used by Additional Coverage and
// PCP Information sections so the visual language stays consistent.
function InfoAccordion({ title, subtitle, fields, open, onToggle, layout }) {
  const Content = layout === "B" ? BenefitContentB : layout === "C" ? BenefitContentC : BenefitContentA;
  const hasFields = fields && Object.keys(fields).some(k => isPresent(fields[k]) || fields[k]===false);
  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:12,marginBottom:10,overflow:"hidden",background:"#fff"}}>
      <div
        onClick={onToggle}
        className="ed-benefit-header"
        style={{display:"flex",alignItems:"center",padding:"14px 18px",cursor:"pointer",gap:12}}
      >
        <span style={{
          display:"inline-flex",
          alignItems:"center",
          justifyContent:"center",
          width:12,
          color:"#94a3b8",
          fontSize:10,
          lineHeight:1,
          transition:"transform .15s ease",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          flexShrink:0,
        }}>▶</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{font:"500 13px/18px Roboto",color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</div>
          {subtitle && <div style={{font:"400 11px/14px Roboto",color:"#94a3b8",marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{subtitle}</div>}
        </div>
      </div>
      {open && hasFields && <Content fields={fields} />}
    </div>
  );
}

function AdditionalCoverageList({ coverages, layout }) {
  const [openIdx, setOpenIdx] = useED(0);
  if (!coverages || !coverages.length) return null;
  return (
    <div>
      {coverages.map((c, i) => (
        <InfoAccordion
          key={i}
          title={`Additional Coverage ${String(i+1).padStart(2, "0")}`}
          subtitle={c.planName}
          fields={{
            plan_name:     c.planName,
            payor_id:      c.payorId,
            member_id:     c.memberId,
            coverage_date: c.coverageDate,
          }}
          open={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
          layout={layout}
        />
      ))}
    </div>
  );
}

function PCPInformationCard({ pcp, layout }) {
  const [open, setOpen] = useED(true);
  if (!pcp) return null;
  return (
    <InfoAccordion
      title="Primary Care Provider"
      subtitle={pcp.physicianName}
      fields={{
        physician_name:   pcp.physicianName,
        phone_number:     pcp.phoneNumber,
        pcp_group_number: pcp.pcpGroupNumber,
        address:          pcp.address,
      }}
      open={open}
      onToggle={()=>setOpen(v=>!v)}
      layout={layout}
    />
  );
}

// ── Eligibility Info tab content ──────────────────────────────
const SectionTitle = ({ children, mt="2rem", mb=16 }) => <div style={{font:"500 15px/20px Roboto",color:COLORS.textPri,marginTop:mt,marginBottom:mb}}>{children}</div>;

// Plan selector row (slim, between tabs and verification card)
// The plan tabs ARE the sample-data switcher — each tab loads a different
// plan payload under the same patient header.
function PlanSelectorRow({ plan, payloadKey, onPayloadChange }) {
  const current = SAMPLE_PAYLOADS[payloadKey];
  const isHidden = current && current.hidden;
  // When viewing a hidden (per-patient) payload, lock the tab strip to that
  // single tab — switching to a different sample tab would replace the
  // patient identity, which the demo flow doesn't support.
  const entries = isHidden
    ? [[payloadKey, current]]
    : Object.entries(SAMPLE_PAYLOADS).filter(([, p]) => !p.hidden);
  return (
    <div style={{display:"flex",alignItems:"center",padding:"6px 0 0",borderBottom:`1px solid ${COLORS.divider}`,font:"400 13px/18px Roboto",gap:18,flexWrap:"nowrap"}}>
      <div style={{display:"flex",alignItems:"stretch",gap:0,flex:1,minWidth:0,flexWrap:"nowrap",overflow:"hidden"}}>
        {entries.map(([k,p])=>{
          const sel = payloadKey===k;
          const planName = (p.data && p.data.plan && (p.data.plan.fullName || p.data.plan.payorName)) || p.label;
          return (
            <button
              key={k}
              onClick={()=>onPayloadChange && onPayloadChange(k)}
              title={`${p.label} — ${planName}`}
              style={{
                background:"transparent",
                border:"none",
                cursor:"pointer",
                padding:"8px 0 10px",
                marginRight:20,
                font:`${sel?500:400} 13px/18px Roboto`,
                color:sel?COLORS.blue:COLORS.textBody,
                borderBottom:`2px solid ${sel?COLORS.blue:"transparent"}`,
                marginBottom:-1,
                whiteSpace:"nowrap",
                display:"inline-flex",
                alignItems:"center",
                gap:6,
                minWidth:0,
              }}
            >
              <span style={{color:sel?COLORS.textMute:COLORS.textFaint,fontWeight:400,flexShrink:0}}>{p.label} —</span>
              <span style={{maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"inline-block"}}>{planName}</span>
            </button>
          );
        })}
      </div>
      <div style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:6,color:COLORS.textMute,paddingBottom:8}}>
        Eligibility Check Date :
        <span style={{color:COLORS.blue,fontWeight:600}}>{plan && plan.checkDateOnly}</span>
        <span style={{fontSize:10,color:COLORS.textMute,cursor:"pointer"}}>▾</span>
      </div>
    </div>
  );
}

// Outlined chip used inside the verification card
function OutlinedChip({ label, value, valueColor, borderColor }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 12px",border:`1px solid ${borderColor||COLORS.border}`,borderRadius:20,font:"400 12px/16px Roboto",color:COLORS.textBody,whiteSpace:"nowrap"}}>
      <span style={{color:COLORS.textMute}}>{label}:</span>
      <span style={{color:valueColor||COLORS.textPri,fontWeight:500}}>{value}</span>
    </span>
  );
}

function PlanVerificationCard({ plan, response }) {
  const status = (plan && plan.status) || "active";
  const tones = {
    active:     { border:"#1F7A3A", heading:"#1A7F4B", badgeBg:"#1F7A3A", badgeC:"#fff", badgeLabel:"Active",   icon:"✓" },
    inactive:   { border:"#C0392B", heading:"#C0392B", badgeBg:"#DC2626", badgeC:"#fff", badgeLabel:"Inactive", icon:"✕" },
    expiring:   { border:"#E6A817", heading:"#B8870F", badgeBg:"#E6A817", badgeC:"#fff", badgeLabel:"Expiring", icon:"⏱" },
    mixed:      { border:"#8a6a14", heading:"#8a6a14", badgeBg:"#8a6a14", badgeC:"#fff", badgeLabel:"Mixed",    icon:"!" },
  };
  const t = tones[status] || tones.active;
  const r = response || {};
  const detailFields = [
    { k:"patientName",  label:"Patient Name",         valueStyle:{font:"500 14px/18px Roboto",color:COLORS.textPri} },
    { k:"gender",       label:"Gender" },
    { k:"relationship", label:"Reln. to Subscriber",  info:true },
    { k:"memberId",     label:"Member Id" },
    { k:"dob",          label:"DOB" },
    { k:"address",      label:"Address" },
    { k:"mbi",          label:"MBI" },
  ];
  const providerStatusColor = "#1F7A3A";
  return (
    <div style={{border:`1px solid ${COLORS.border}`,borderLeft:`3px solid ${t.border}`,borderRadius:8,padding:"20px clamp(16px, 2vw, 28px)",marginTop:16,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,0.03)"}}>
      {/* Line 1: REF ID + Elig Check Date */}
      <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",font:"400 11px/14px Roboto",color:COLORS.textMute}}>
        {isPresent(plan && plan.refId) && <span>REF ID : <span style={{color:COLORS.textBody}}>{plan.refId}</span></span>}
        {isPresent(plan && plan.checkDate) && <span>Elig Check Date : <span style={{color:COLORS.textBody}}>{plan.checkDate}{plan.checkTime ? ` ${plan.checkTime}` : ""}</span></span>}
      </div>

      {/* Line 2: plan name + badge */}
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginTop:8}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{font:"500 18px/24px Roboto",color:t.heading}}>{(plan && plan.fullName) || "—"}</div>
          {/* Line 3: plan facts under the plan name (same meta-text style as REF ID) */}
          <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",font:"400 11px/14px Roboto",color:COLORS.textMute,marginTop:6}}>
            {isPresent(plan && plan.payorId)       && <span>Payor Id : <span style={{color:COLORS.textBody}}>{plan.payorId}</span></span>}
            {isPresent(plan && plan.planTypeShort) && <span>Plan Type : <span style={{color:COLORS.textBody}}>{plan.planTypeShort}</span></span>}
            {isPresent(plan && plan.groupNumber)   && <span>Group No : <span style={{color:COLORS.textBody}}>{plan.groupNumber}</span></span>}
            {isPresent(plan && plan.network)       && <span>Provider Status : <span style={{color:providerStatusColor,fontWeight:500}}>{plan.network}</span></span>}
          </div>
        </div>
        <div style={{display:"inline-flex",flexDirection:"column",alignItems:"stretch",flexShrink:0,gap:6}}>
          <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"5px 18px",background:t.badgeBg,color:t.badgeC,borderRadius:999,font:"500 13px/16px Roboto",width:"100%",boxSizing:"border-box"}}>
            <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:14,height:14,borderRadius:"50%",background:"rgba(255,255,255,0.25)",fontSize:10}}>{t.icon}</span>
            {t.badgeLabel}
          </span>
          {isPresent(plan && plan.startDate) && (
            <div style={{font:"500 12px/16px Roboto",color:t.heading,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,whiteSpace:"nowrap"}}>
              {plan.startDate} - {plan.endDate || "—"}
              <span style={{color:COLORS.textFaint,fontSize:11,cursor:"pointer"}}>ⓘ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Patient Details — standalone card sitting beneath the Plan Verification Card.
function PatientDetailsCard({ response }) {
  const r = response || {};
  const detailFields = [
    { k:"patientName",  label:"Patient Name",         valueStyle:{font:"500 14px/18px Roboto",color:COLORS.textPri,marginTop:2} },
    { k:"gender",       label:"Gender" },
    { k:"relationship", label:"Reln. to Subscriber",  info:true },
    { k:"memberId",     label:"Member Id" },
    { k:"dob",          label:"DOB" },
    { k:"address",      label:"Address" },
    { k:"mbi",          label:"MBI" },
  ];
  const hasAny = detailFields.some(f => isPresent(r[f.k]));
  if (!hasAny) return null;
  return (
    <div style={{marginTop:18}}>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10,padding:"0 4px"}}>
        <span style={{font:"500 14px/18px Roboto",color:COLORS.textPri}}>Patient Details</span>
        <span style={{font:"400 12px/16px Roboto",color:COLORS.textMute,fontStyle:"italic"}}>(As per Plan's Eligibility response)</span>
      </div>
      <div style={{borderRadius:8,padding:"20px clamp(16px, 2vw, 28px)",background:"#fff",boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:24}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:"12px 24px"}}>
              {detailFields.map(f => {
                const v = r[f.k];
                if (!isPresent(v)) return null;
                return (
                  <div key={f.k} style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:4,font:"400 11px/14px Roboto",color:COLORS.textMute}}>
                      {f.label}
                      {f.info && <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:12,height:12,borderRadius:"50%",background:COLORS.blue,color:"#fff",fontSize:8,fontWeight:600}}>i</span>}
                    </div>
                    <div style={f.valueStyle || {font:"500 13px/16px Roboto",color:COLORS.textPri,marginTop:2}}>{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,alignSelf:"center"}}>
            <a href="#" onClick={(e)=>e.preventDefault()} style={{display:"flex",alignItems:"center",gap:10,color:COLORS.blue,textDecoration:"none",font:"500 13px/16px Roboto",cursor:"pointer",padding:"4px 16px 4px 4px"}}>
              <img src="icons/payor-eligibility-response.png" alt="" style={{width:28,height:28,objectFit:"contain",flexShrink:0}} />
              <span style={{maxWidth:96}}>Payor Eligibility Response</span>
            </a>
            <div style={{width:1,alignSelf:"stretch",background:COLORS.divider,margin:"4px 0"}}></div>
            <a href="#" onClick={(e)=>e.preventDefault()} style={{display:"flex",alignItems:"center",gap:10,color:COLORS.blue,textDecoration:"none",font:"500 13px/16px Roboto",cursor:"pointer",padding:"4px 4px 4px 16px"}}>
              <img src="icons/member-id-card.png" alt="" style={{width:32,height:32,objectFit:"contain",flexShrink:0}} />
              <span style={{maxWidth:80}}>Member ID Card</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Plan Benefits preview tweaks (inline dropdown next to header) ─
const PLAN_BENEFITS_TWEAK_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"empty",   label:"Without data" },
  { id:"one",     label:"1 card" },
  { id:"two",     label:"2 cards" },
  { id:"three",   label:"3 cards" },
  { id:"four",    label:"4 cards" },
  { id:"five",    label:"5 cards" },
  { id:"six",     label:"6 cards" },
];

// Stand-in tier blueprints used when the preview overrides the natural payload.
const SAMPLE_TIER_BLUEPRINTS = {
  one: [
    { name:"Individual · In-Network",     deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
  ],
  two: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
  ],
  three: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
  ],
  four: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
  ],
  five: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
  ],
  six: [
    { name:"Self · In-Network",            deductible:{ total:2000, used:450,  remaining:1550 }, oop:{ total:6500,  used:900,  remaining:5600 } },
    { name:"Self · Out-of-Network",        deductible:{ total:4000, used:0,    remaining:4000 }, oop:{ total:12000, used:0,    remaining:12000 } },
    { name:"Dependent · In-Network",       deductible:{ total:2000, used:120,  remaining:1880 }, oop:{ total:6500,  used:240,  remaining:6260 } },
    { name:"Domestic Partner · In-Network",deductible:{ total:2000, used:0,    remaining:2000 }, oop:{ total:6500,  used:0,    remaining:6500 } },
    { name:"Family · In-Network",          deductible:{ total:4000, used:1200, remaining:2800 }, oop:{ total:13000, used:2400, remaining:10600 } },
    { name:"Family · Out-of-Network",      deductible:{ total:8000, used:0,    remaining:8000 }, oop:{ total:24000, used:0,    remaining:24000 } },
  ],
};

function resolveTiers(tweak, naturalTiers){
  if (tweak === "default") return naturalTiers || [];
  if (tweak === "empty")   return [];
  return SAMPLE_TIER_BLUEPRINTS[tweak] || naturalTiers || [];
}

// Service Benefits preview — lets the user force a specific layout.
const SERVICE_BENEFITS_TWEAK_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"A",       label:"Two-column grid (Layout A)" },
  { id:"B",       label:"Metric tile grid (Layout B)" },
  { id:"C",       label:"Pill chips (Layout C)" },
];

// ── Plan Benefits sectioned preview tweaks ───────────────────
// Three independent dimensions: card style, data state, card count.
const PLAN_BENEFITS_STYLE_OPTIONS = [
  { id:"default", label:"Default (from tab)" },
  { id:"A",       label:"Option A — Shadow card with progress bar" },
  { id:"B",       label:"Option B — Bordered card with header chip" },
  { id:"C",       label:"Option C — Bordered card with divider" },
];
const PLAN_BENEFITS_DATA_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"filled",  label:"With data" },
  { id:"empty",   label:"Without data" },
];
const PLAN_BENEFITS_COUNT_OPTIONS = [
  { id:"default", label:"Default (from payload)" },
  { id:"one",     label:"1 card" },
  { id:"two",     label:"2 cards" },
  { id:"three",   label:"3 cards" },
  { id:"four",    label:"4 cards" },
  { id:"five",    label:"5 cards" },
  { id:"six",     label:"6 cards" },
];

// Pretty short labels surfaced as chips in the trigger pill.
const PLAN_BENEFITS_SHORT_LABEL = {
  style:   { A:"Option A", B:"Option B", C:"Option C" },
  data:    { filled:"With data", empty:"Without data" },
  count:   { one:"1 card", two:"2 cards", three:"3 cards", four:"4 cards", five:"5 cards", six:"6 cards" },
};

function styleTweakToVariant(styleTweak, payloadKey){
  if (styleTweak === "A") return "default";
  if (styleTweak === "B") return "option-b";
  if (styleTweak === "C") return "option-c";
  return getPlanCardVariant(payloadKey);
}

function resolvePlanBenefitTiers(tweaks, naturalTiers){
  if (tweaks.data === "empty") return [];
  if (tweaks.count !== "default") return SAMPLE_TIER_BLUEPRINTS[tweaks.count] || naturalTiers || [];
  // data === "filled" or "default" → fall back to payload's natural tiers
  return naturalTiers || [];
}

function PlanBenefitsPreviewHeader({ title, tweaks, onTweaks, mt=28, mb=16 }) {
  const [open, setOpen] = useED(false);
  const ref = useEDRef(null);
  useEDEffect(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const activeChips = [
    tweaks.style !== "default" && PLAN_BENEFITS_SHORT_LABEL.style[tweaks.style],
    tweaks.data  !== "default" && PLAN_BENEFITS_SHORT_LABEL.data[tweaks.data],
    tweaks.count !== "default" && PLAN_BENEFITS_SHORT_LABEL.count[tweaks.count],
  ].filter(Boolean);
  const isCustom = activeChips.length > 0;

  const Section = ({ label, dim, options }) => (
    <div style={{padding:"4px 0"}}>
      <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:COLORS.textMute,padding:"6px 10px 4px"}}>{label}</div>
      {options.map(o => {
        const sel = o.id === tweaks[dim];
        return (
          <button
            key={o.id}
            onClick={()=>onTweaks({ ...tweaks, [dim]: o.id })}
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
              color:sel?"#1d4ed8":COLORS.textBody,
              textAlign:"left",
            }}
          >
            <span>{o.label}</span>
            {sel && <span style={{color:"#1d4ed8",fontSize:11}}>✓</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",gap:8,marginTop:mt,marginBottom:mb,position:"relative",flexWrap:"wrap"}}>
      <span style={{font:"500 15px/20px Roboto",color:COLORS.textPri}}>{title}</span>
      <button
        type="button"
        onClick={()=>setOpen(v=>!v)}
        title="Preview options"
        style={{
          display:"inline-flex",
          alignItems:"center",
          gap:6,
          padding:"2px 8px",
          background:isCustom?"#eff6ff":"transparent",
          border:`1px solid ${isCustom ? "#bfdbfe" : "transparent"}`,
          borderRadius:6,
          cursor:"pointer",
          color:isCustom?"#1d4ed8":COLORS.textMute,
          font:"500 11px/16px Roboto",
        }}
      >
        {activeChips.length > 0 && <span>{activeChips.join(" · ")}</span>}
        <span style={{fontSize:9,lineHeight:1,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▼</span>
      </button>
      {isCustom && (
        <button
          type="button"
          onClick={()=>onTweaks({ style:"default", data:"default", count:"default" })}
          style={{background:"transparent",border:"none",cursor:"pointer",color:COLORS.textMute,font:"400 11px/16px Roboto",padding:"2px 4px"}}
          title="Reset to default"
        >
          Reset
        </button>
      )}
      {open && (
        <div style={{
          position:"absolute",
          top:"100%",
          left:0,
          marginTop:6,
          background:"#fff",
          border:`1px solid ${COLORS.border}`,
          borderRadius:8,
          boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
          padding:"4px 6px",
          minWidth:300,
          zIndex:10,
        }}>
          <Section label="Card style" dim="style" options={PLAN_BENEFITS_STYLE_OPTIONS} />
          <div style={{borderTop:`1px solid ${COLORS.divider}`,margin:"4px 6px"}}></div>
          <Section label="Data" dim="data" options={PLAN_BENEFITS_DATA_OPTIONS} />
          <div style={{borderTop:`1px solid ${COLORS.divider}`,margin:"4px 6px"}}></div>
          <Section label="Number of cards" dim="count" options={PLAN_BENEFITS_COUNT_OPTIONS} />
        </div>
      )}
    </div>
  );
}

// Generic header with inline preview dropdown. Used for Service Benefits.
function PreviewHeader({ title, tweak, defaultTweak="default", options, onTweak, mt=28, mb=16 }) {
  const [open, setOpen] = useED(false);
  const ref = useEDRef(null);
  useEDEffect(()=>{
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const active = options.find(o => o.id === tweak) || options[0];
  const isCustom = tweak !== defaultTweak;
  return (
    <div ref={ref} style={{display:"flex",alignItems:"center",gap:8,marginTop:mt,marginBottom:mb,position:"relative"}}>
      <span style={{font:"500 15px/20px Roboto",color:COLORS.textPri}}>{title}</span>
      <button
        type="button"
        onClick={()=>setOpen(v=>!v)}
        title="Preview options"
        style={{
          display:"inline-flex",
          alignItems:"center",
          gap:6,
          padding:"2px 8px",
          background:isCustom?"#eff6ff":"transparent",
          border:`1px solid ${isCustom ? "#bfdbfe" : "transparent"}`,
          borderRadius:6,
          cursor:"pointer",
          color:isCustom?"#1d4ed8":COLORS.textMute,
          font:"500 11px/16px Roboto",
        }}
      >
        {isCustom && <span>{active.label}</span>}
        <span style={{fontSize:9,lineHeight:1,transition:"transform .15s",transform:open?"rotate(180deg)":"rotate(0)",display:"inline-block"}}>▼</span>
      </button>
      {open && (
        <div style={{
          position:"absolute",
          top:"100%",
          left:0,
          marginTop:6,
          background:"#fff",
          border:`1px solid ${COLORS.border}`,
          borderRadius:8,
          boxShadow:"0 8px 24px rgba(15,23,42,0.12)",
          padding:6,
          minWidth:240,
          zIndex:10,
        }}>
          <div style={{font:"600 10px/14px Roboto",letterSpacing:"0.06em",textTransform:"uppercase",color:COLORS.textMute,padding:"6px 10px 4px"}}>Preview options</div>
          {options.map(o => {
            const sel = o.id === tweak;
            return (
              <button
                key={o.id}
                onClick={()=>{ onTweak(o.id); setOpen(false); }}
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
                  color:sel?"#1d4ed8":COLORS.textBody,
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
  );
}

function PlanBenefitsEmptyState() {
  return (
    <div style={{
      borderRadius:12,
      background:"#fff",
      padding:"40px 24px",
      textAlign:"center",
      color:COLORS.textMute,
      font:"400 13px/18px Roboto",
      boxShadow:"0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.06)",
    }}>
      No plan benefits returned in this eligibility response.
    </div>
  );
}

function EligibilityInfo({ data, payloadKey, onPayloadChange }) {
  const defaultBenefitLayout = payloadKey === "commercial_ppo" ? "B"
                              : payloadKey === "medicaid"       ? "C"
                              : "A";
  const [planTweaks, setPlanTweaks] = useED({ style:"default", data:"default", count:"default" });
  const [benefitTweak, setBenefitTweak] = useED("default");
  // Reset preview tweaks when the user switches sample data tabs.
  useEDEffect(()=>{
    setPlanTweaks({ style:"default", data:"default", count:"default" });
    setBenefitTweak("default");
  }, [payloadKey]);
  const tierVariant = styleTweakToVariant(planTweaks.style, payloadKey);
  const tiersToShow = resolvePlanBenefitTiers(planTweaks, data.tiers);
  const effectiveBenefitLayout = benefitTweak === "default" ? defaultBenefitLayout : benefitTweak;
  return (
    <div style={{padding:"4px clamp(16px, 2.4vw, 36px) 32px"}}>
      <PlanSelectorRow plan={data.plan} payloadKey={payloadKey} onPayloadChange={onPayloadChange} />
      <PlanVerificationCard plan={data.plan} response={data.planResponse} />
      <PatientDetailsCard response={data.planResponse} />

      {data.alerts && data.alerts.length>0 && (
        <div style={{marginTop:24}}>
          <AlertsAccordion alerts={data.alerts} />
        </div>
      )}

      <PlanBenefitsPreviewHeader
        title="Plan Benefits"
        tweaks={planTweaks}
        onTweaks={setPlanTweaks}
      />
      {tiersToShow.length === 0
        ? <PlanBenefitsEmptyState />
        : <TierGrid tiers={tiersToShow} variant={tierVariant} />}

      {data.benefits && data.benefits.length>0 && (
        <React.Fragment>
          <PreviewHeader
            title="Service Benefits"
            tweak={benefitTweak}
            options={SERVICE_BENEFITS_TWEAK_OPTIONS}
            onTweak={setBenefitTweak}
            mt={32}
          />
          <BenefitsList benefits={data.benefits} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}

      {data.additionalCoverage && data.additionalCoverage.length>0 && (
        <React.Fragment>
          <SectionTitle mt="32px">Additional Coverage <span style={{color:COLORS.textMute,fontWeight:400}}>({String(data.additionalCoverage.length).padStart(2,"0")})</span></SectionTitle>
          <AdditionalCoverageList coverages={data.additionalCoverage} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}

      {data.pcp && (
        <React.Fragment>
          <SectionTitle mt="28px">PCP Information</SectionTitle>
          <PCPInformationCard pcp={data.pcp} layout={effectiveBenefitLayout} />
        </React.Fragment>
      )}
    </div>
  );
}

// ── Authorization Info tab content ────────────────────────────
const AUTH_STATUS = {
  Approved:{ bg:COLORS.greenBg, bd:COLORS.greenBd, c:COLORS.green },
  Pending: { bg:COLORS.amberBg, bd:"#F1D89A",      c:"#8A6A14" },
  Denied:  { bg:"#FFF1F0",      bd:"#FFA39E",      c:"#CF1322" },
  Expired: { bg:"#F5F5F5",      bd:"#D9D9D9",      c:COLORS.textMute },
};
function AuthCard({ auth }) {
  const s = AUTH_STATUS[auth.status] || AUTH_STATUS.Pending;
  const pct = pctSafe(auth.unitsUsed, auth.unitsTotal);
  return (
    <div style={{border:`1px solid ${COLORS.border}`,borderRadius:10,padding:16,background:"#fff",boxShadow:"0 1px 2px rgba(0,0,0,.03)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{font:"500 14px/18px Roboto",color:COLORS.textPri}}>{auth.num}</span>
        <span style={{display:"inline-block",padding:"2px 10px",borderRadius:999,background:s.bg,border:`1px solid ${s.bd}`,color:s.c,font:"500 12px/16px Roboto"}}>{auth.status}</span>
      </div>
      <div style={{font:"400 13px/18px Roboto",color:COLORS.textBody,marginTop:6}}>
        <span style={{fontWeight:500,color:COLORS.textPri}}>{auth.service}</span>
        <span style={{color:COLORS.textMute,marginLeft:8}}>{auth.start} → {auth.end}</span>
      </div>
      {pct!==null && (
        <div style={{marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",font:"400 12px/16px Roboto",color:COLORS.textMute}}>
            <span>Units Used</span>
            <span><span style={{color:COLORS.textPri,fontWeight:500}}>{auth.unitsUsed}</span> of {auth.unitsTotal}</span>
          </div>
          <div style={{height:3,background:"#EDF0F4",borderRadius:2,marginTop:6,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:COLORS.blue}}></div>
          </div>
        </div>
      )}
    </div>
  );
}
function AuthorizationInfo({ data }) {
  const auths = data.auths || [];
  return (
    <div style={{padding:"4px clamp(16px, 2.4vw, 36px) 32px"}}>
      <div style={{display:"flex",alignItems:"center",marginTop:"2rem",marginBottom:14}}>
        <div style={{font:"500 15px/20px Roboto",color:COLORS.textPri}}>Authorizations</div>
        <button style={{marginLeft:"auto",background:"#fff",color:COLORS.blue,border:`1px solid ${COLORS.blue}`,borderRadius:6,padding:"6px 14px",font:"500 13px/16px Roboto",cursor:"pointer"}}>+ Request New Auth</button>
      </div>
      {auths.length===0
        ? <div style={{border:`1px dashed ${COLORS.border}`,borderRadius:10,padding:"40px 16px",textAlign:"center",color:COLORS.textFaint,font:"400 14px Roboto"}}>No authorizations on file.</div>
        : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(340px, 1fr))",gap:12}}>{auths.map((a,i)=>(<AuthCard key={i} auth={a} />))}</div>}
    </div>
  );
}

// ── Payload toggle (small outlined buttons) ───────────────────
function PayloadToggle({ value, onChange }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"10px clamp(16px, 2.4vw, 36px)",borderBottom:`0.5px solid ${COLORS.divider}`,background:"#fff"}}>
      <span style={{font:"400 12px/16px Roboto",color:COLORS.textMute,marginRight:6}}>Sample data:</span>
      {Object.entries(SAMPLE_PAYLOADS).map(([k,p])=>{
        const sel = value===k;
        return (
          <button key={k} onClick={()=>onChange(k)} style={{background:sel?COLORS.blueBg:"#fff",color:sel?COLORS.blue:COLORS.textBody,border:`1px solid ${sel?COLORS.blue:COLORS.border}`,borderRadius:6,padding:"4px 10px",font:`${sel?500:400} 12px/16px Roboto`,cursor:"pointer"}}>{p.label}</button>
        );
      })}
    </div>
  );
}

// ── Drawer shell ──────────────────────────────────────────────
function EligibilityDetail({ data, onClose, showPayloadToggle, payloadKey, onPayloadChange }) {
  const [tab, setTab] = useED("elig");
  const safe = data || {};
  const patient = safe.patient || {};
  const plan = safe.plan || {};
  return (
    <div style={{position:"fixed",inset:0,zIndex:60}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.25)",animation:"edFade .14s ease-out"}}></div>
      <div style={{position:"fixed",right:0,top:0,height:"100vh",width:"85vw",background:"#fff",borderLeft:`1px solid ${COLORS.border}`,boxShadow:"-12px 0 24px rgba(28,45,66,.10)",display:"flex",flexDirection:"column",animation:"edSlide .22s ease-out"}}>
        {/* Fixed header */}
        <div style={{flexShrink:0,background:"#fff"}}>
          <PatientHeader patient={patient} plan={plan} onClose={onClose} />
          <TabBar active={tab} onTab={setTab} />
        </div>
        {/* Scroll region */}
        <div style={{flex:1,overflowY:"auto",overflowX:"hidden",background:"#fff"}}>
          {tab==="elig"
            ? <EligibilityInfo data={safe} payloadKey={payloadKey} onPayloadChange={onPayloadChange} />
            : <AuthorizationInfo data={safe} />}
        </div>
      </div>
      <style>{`
        @keyframes edFade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes edSlide { from { transform: translateX(28px); opacity: .6 } to { transform: translateX(0); opacity: 1 } }
        .ed-tier-card:hover { box-shadow: 0 4px 14px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06); transform: translateY(-1px); }
        .ed-benefit-header:hover { background: #f8fafc; }
      `}</style>
    </div>
  );
}

// Patient identity is taken from the payload the drawer is initially
// opened with (so clicking different rows shows different patients).
// Switching the sample-data tabs swaps only the plan/eligibility slice.
function EligibilityDetailContainer({ initialKey="medicare_advantage", onClose }) {
  const [key, setKey] = useED(initialKey);
  // Baseline = the payload's patient that was opened. Stays pinned across tab switches.
  const baseline = SAMPLE_PAYLOADS[initialKey] && SAMPLE_PAYLOADS[initialKey].data;
  const selected = SAMPLE_PAYLOADS[key] && SAMPLE_PAYLOADS[key].data;
  // Compose: pinned patient identity + swappable plan/eligibility slice.
  // If the initially-opened payload is a "hidden" (per-patient) payload,
  // the tabs only swap the plan/etc slice; otherwise behave as before.
  const data = selected && {
    ...selected,
    patient: (baseline && baseline.patient) || selected.patient,
  };
  return (
    <EligibilityDetail
      data={data}
      onClose={onClose}
      payloadKey={key}
      onPayloadChange={setKey}
    />
  );
}

Object.assign(window, { EligibilityDetail, EligibilityDetailContainer, SAMPLE_PAYLOADS });
