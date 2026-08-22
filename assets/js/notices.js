/* =========================================================
   NOTICE BOARD টুল
   Notices Google Sheet কলাম: Title | Message | Date | Pinned (yes/no) | Status

   Status কলাম = দেখানোর গেট। যে row-তে Status কলামে "1" বসাবে (ম্যানুয়ালি),
   শুধু সেই নোটিশটাই সাইটে দেখাবে — বাকিগুলো Sheet-এ থাকলেও লুকানো থাকবে।
   ========================================================= */

function isNoticeApproved(v){
  const s = (v || "").toString().trim().toLowerCase();
  return s === "1" || s === "yes" || s === "true" || s === "approved";
}

function noticeItem(n){
  const pinned = (n.pinned || "").toLowerCase() === "yes" || (n.pinned || "").toLowerCase() === "y";
  let dateLabel = "";
  if (n.date){
    const d = new Date(n.date);
    if (!isNaN(d)) dateLabel = d.toLocaleDateString("bn-BD", { day:"numeric", month:"long", year:"numeric" });
  }
  return `
    <div class="notice-item ${pinned ? "pinned" : ""}">
      ${pinned ? `<i class="bi bi-pin-angle-fill pin-icon"></i>` : `<i class="bi bi-megaphone pin-icon" style="color:var(--slate)"></i>`}
      <div>
        ${dateLabel ? `<div class="date">${dateLabel}</div>` : ""}
        <h4>${n.title || "নোটিশ"}</h4>
        <p>${n.message || ""}</p>
      </div>
    </div>`;
}

async function initNotices(){
  const wrap = document.getElementById("noticeBoard");
  if (!wrap) return;
  try{
    const rows = await fetchSheet(NOTICES_CSV_URL);
    const notices = rows.filter(r => (r.title || r.message) && isNoticeApproved(r.status));
    if (!notices.length){
      wrap.innerHTML = `<div class="state-msg">এখনো কোনো নোটিশ যোগ করা হয়নি।</div>`;
      return;
    }
    notices.sort((a,b) => {
      const ap = (a.pinned||"").toLowerCase().startsWith("y") ? 1 : 0;
      const bp = (b.pinned||"").toLowerCase().startsWith("y") ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return new Date(b.date||0) - new Date(a.date||0);
    });
    wrap.innerHTML = notices.map(noticeItem).join("");
  }catch(e){
    wrap.innerHTML = `<div class="state-msg">নোটিশ বোর্ড কনফিগার করা হয়নি — config.js এ NOTICES_SHEET_ID বসাও।</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initNotices);