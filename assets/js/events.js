/* =========================================================
   EVENTS PAGE
   Expected Google Sheet columns:
   EventName | Date (YYYY-MM-DD) | Time (HH:MM, 24hr) | Venue |
   Description | CoverImage | Status

   Status কলাম = দেখানোর গেট। যে row-তে Status কলামে "1" বসাবে (ম্যানুয়ালি),
   শুধু সেই ইভেন্টটাই সাইটে দেখাবে — বাকিগুলো Sheet-এ থাকলেও লুকানো থাকবে।
   ========================================================= */

let ALL_EVENTS = [];
let countdownTimers = [];

function isEventApproved(v){
  const s = (v || "").toString().trim().toLowerCase();
  return s === "1" || s === "yes" || s === "true" || s === "approved";
}

function parseEventDate(dateStr, timeStr){
  if(!dateStr) return null;
  const t = (timeStr && timeStr.trim()) ? timeStr.trim() : "10:00";
  const iso = `${dateStr.trim()}T${t.length===5? t : "10:00"}:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function fmtDate(d){
  return d.toLocaleDateString("bn-BD", { day:"numeric", month:"long", year:"numeric" }) +
         " · " + d.toLocaleTimeString("bn-BD", { hour:"2-digit", minute:"2-digit" });
}

function startCountdown(el, target){
  function tick(){
    const now = new Date();
    let diff = target - now;
    if (diff <= 0){
      el.innerHTML = `<div class="badge-group">অনুষ্ঠান শুরু হয়ে গেছে 🎉</div>`;
      return;
    }
    const d = Math.floor(diff / 86400000); diff -= d*86400000;
    const h = Math.floor(diff / 3600000); diff -= h*3600000;
    const m = Math.floor(diff / 60000); diff -= m*60000;
    const s = Math.floor(diff / 1000);
    el.innerHTML = `
      <div class="box"><b class="mono">${d}</b><span>দিন</span></div>
      <div class="box"><b class="mono">${h}</b><span>ঘণ্টা</span></div>
      <div class="box"><b class="mono">${m}</b><span>মিনিট</span></div>
      <div class="box"><b class="mono">${s}</b><span>সেকেন্ড</span></div>`;
  }
  tick();
  const id = setInterval(tick, 1000);
  countdownTimers.push(id);
}

function eventCard(ev, idx){
  const target = parseEventDate(ev.date, ev.time);
  const isPast = target ? target < new Date() : false;
  const cover = ev.coverimage ? resolveImage(ev.coverimage, ev.eventname) : null;

  return `
  <div class="event-card ${isPast ? "past" : ""}">
    <div class="row g-4 align-items-center">
      ${cover ? `<div class="col-md-3"><img src="${cover}" class="img-fluid rounded" alt="${ev.eventname}" style="aspect-ratio:4/3;object-fit:cover;width:100%;"></div>` : ""}
      <div class="${cover ? "col-md-9" : "col-12"}">
        <div class="when mono">${target ? fmtDate(target) : "তারিখ নির্ধারিত হয়নি"} ${ev.venue ? " · "+ev.venue : ""}</div>
        <h3>${ev.eventname || "নাম নেই ইভেন্ট"}</h3>
        <p class="desc">${ev.description || ""}</p>
        ${!isPast && target ? `<div class="countdown mb-3" id="cd-${idx}"></div>` : ""}
        <button class="btn-red" onclick="prefillBroadcast('${(ev.eventname||"").replace(/'/g,"\\'")}')">
          <i class="bi bi-envelope-paper me-1"></i> এই ইভেন্ট নিয়ে সবাইকে মেইল করো
        </button>
      </div>
    </div>
  </div>`;
}

function renderEvents(list){
  const wrap = document.getElementById("eventsList");
  countdownTimers.forEach(clearInterval);
  countdownTimers = [];

  if (!list.length){
    wrap.innerHTML = `<div class="state-msg">এখনো কোনো ইভেন্ট যোগ করা হয়নি।</div>`;
    return;
  }
  // upcoming first (soonest first), then past (most recent first)
  const withDate = list.map(e => ({...e, _d: parseEventDate(e.date, e.time)}));
  const upcoming = withDate.filter(e => e._d && e._d >= new Date()).sort((a,b)=>a._d-b._d);
  const past = withDate.filter(e => !e._d || e._d < new Date()).sort((a,b)=>(b._d||0)-(a._d||0));
  const ordered = [...upcoming, ...past];

  wrap.innerHTML = ordered.map(eventCard).join("");
  ordered.forEach((ev, idx) => {
    const el = document.getElementById(`cd-${idx}`);
    if (el && ev._d && ev._d >= new Date()) startCountdown(el, ev._d);
  });

  // populate event select in broadcast panel
  const sel = document.getElementById("eventSelect");
  if (sel){
    sel.innerHTML = `<option value="">— (ঐচ্ছিক) কোন ইভেন্ট নিয়ে —</option>` +
      list.map(e => `<option value="${e.eventname}">${e.eventname}</option>`).join("");
  }
}

function prefillBroadcast(name){
  document.getElementById("bSubject").value = `📣 ${name} — আপডেট`;
  document.getElementById("eventSelect").value = name;
  document.getElementById("broadcastPanel")?.scrollIntoView({ behavior:"smooth", block:"start" });
}

async function initEvents(){
  const wrap = document.getElementById("eventsList");
  try{
    const rows = await fetchSheet(EVENTS_CSV_URL);
    ALL_EVENTS = rows.filter(r => r.eventname && isEventApproved(r.status));
    renderEvents(ALL_EVENTS);
  }catch(err){
    console.error(err);
    wrap.innerHTML = `<div class="state-msg">
      ইভেন্ট শিট লোড হয়নি। assets/js/config.js এ EVENTS_SHEET_ID চেক করো এবং শিটটা "Anyone with the link" শেয়ার করা আছে কিনা দেখো।
    </div>`;
  }
}

document.addEventListener("DOMContentLoaded", initEvents);