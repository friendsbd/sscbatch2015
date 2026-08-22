/* =========================================================
   FUND ট্র্যাকার টুল
   Fund Google Sheet কলাম: Name | Amount | Note | Date | Status
   শুধু Status = 1 (approved) থাকা রো-গুলোই টাকা সংগ্রহের অগ্রগতি +
   কন্ট্রিবিউটর লিস্টে দেখানো হয় — Status ফাঁকা বা অন্য কিছু হলে বাদ যায়।
   (এটা read-only — কেউ সরাসরি টাকা পাঠাতে পারবে না, শুধু হিসাব দেখা যাবে)
   ========================================================= */

function taka(n){
  return "৳" + Number(n).toLocaleString("bn-BD");
}

function contribRow(c){
  return `
    <div class="contrib-row">
      <span>${c.name || "অজ্ঞাত"}${c.note ? ` <span class="text-secondary small">— ${c.note}</span>` : ""}</span>
      <span class="amt mono">${taka(c.amount || 0)}</span>
    </div>`;
}

async function initFundTracker(){
  const wrap = document.getElementById("fundTracker");
  if (!wrap) return;

  const infoBox = document.getElementById("fundInfo");
  if (infoBox && CONFIG.FUND_INFO) infoBox.textContent = CONFIG.FUND_INFO;

  try{
    const rows = await fetchSheet(FUND_CSV_URL);
    const contribs = rows.filter(r => r.name && r.amount && String(r.status || "").trim() === "1");
    const total = contribs.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const goal = CONFIG.FUND_GOAL || 0;
    const pct = goal ? Math.min(100, Math.round((total / goal) * 100)) : 0;

    document.getElementById("fundTotal").textContent = taka(total);
    document.getElementById("fundGoal").textContent = goal ? taka(goal) : "—";
    document.getElementById("fundBar").style.width = pct + "%";
    document.getElementById("fundPct").textContent = pct + "%";
    document.getElementById("fundCount").textContent = contribs.length;

    const list = document.getElementById("fundList");
    if (!contribs.length){
      list.innerHTML = `<div class="state-msg">এখনো কোনো কন্ট্রিবিউশন যোগ হয়নি।</div>`;
    } else {
      contribs.sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
      list.innerHTML = contribs.map(contribRow).join("");
    }
  }catch(e){
    wrap.innerHTML = `<div class="state-msg">ফান্ড ট্র্যাকার কনফিগার করা হয়নি — config.js এ FUND_SHEET_ID বসাও।</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initFundTracker);
