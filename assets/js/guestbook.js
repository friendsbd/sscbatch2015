/* =========================================================
   গেস্টবুক / মেসেজ ওয়াল টুল
   লেখা: Google Form (config.js এ GUESTBOOK_FORM_EMBED_URL)
   পড়া: ওই Form-এর Responses শিট (Timestamp | Name | Message কলাম)
   এভাবে সবাই মেসেজ লিখতে পারবে, কিন্তু শিটে সরাসরি কেউ এডিট করতে পারবে না
   ========================================================= */

function timeAgo(dateStr){
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("bn-BD", { day:"numeric", month:"short", year:"numeric" });
}

function wallMsg(m){
  const name = m.name || "অজ্ঞাত বন্ধু";
  const ts = m.timestamp || m["timestamp "] || "";
  return `
    <div class="wall-msg">
      <span class="who">${name}</span>
      ${ts ? `<span class="when float-end">${timeAgo(ts)}</span>` : ""}
      <p>${m.message || ""}</p>
    </div>`;
}

async function initGuestbook(){
  const formWrap = document.getElementById("guestbookForm");
  const listWrap = document.getElementById("guestbookList");
  if (!formWrap && !listWrap) return;

  if (formWrap){
    if (CONFIG.GUESTBOOK_FORM_EMBED_URL && !CONFIG.GUESTBOOK_FORM_EMBED_URL.startsWith("PASTE_")){
      formWrap.innerHTML = `<iframe src="${CONFIG.GUESTBOOK_FORM_EMBED_URL}" width="100%" height="520" style="border:1px solid var(--line);border-radius:8px;" loading="lazy">লোড হচ্ছে...</iframe>`;
    } else {
      formWrap.innerHTML = `<div class="state-msg">মেসেজ লেখার ফর্ম এখনো যোগ করা হয়নি — README.md দেখো কীভাবে Google Form বানাতে হয়।</div>`;
    }
  }

  if (listWrap){
    try{
      const rows = await fetchSheet(GUESTBOOK_CSV_URL);
      const msgs = rows.filter(r => r.message).reverse();
      if (!msgs.length){
        listWrap.innerHTML = `<div class="state-msg">এখনো কেউ মেসেজ লেখেনি — প্রথম মেসেজটা তুমিই লেখো!</div>`;
        return;
      }
      listWrap.innerHTML = msgs.slice(0, 30).map(wallMsg).join("");
    }catch(e){
      listWrap.innerHTML = `<div class="state-msg">মেসেজ ওয়াল কনফিগার করা হয়নি — config.js এ GUESTBOOK_SHEET_ID বসাও।</div>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", initGuestbook);
