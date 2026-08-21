/* =========================================================
   ব্যাচ ওয়াল (Batch Wall) — ফেসবুক-স্টাইল পোস্ট বোর্ড
   লেখা: এই পাতার নিজস্ব ফর্ম (কোনো Google Form লাগে না) — সরাসরি
        Apps Script দিয়ে Google Sheet-এর "Wall" ট্যাবে row যোগ হয়
        (friends.html-এর রেজিস্ট্রেশন ফর্মের মতো একই পদ্ধতি)
   পড়া: ওই "Wall" ট্যাব CSV হিসেবে fetch করে reverse-chronological দেখানো হয়
   config.js-এ WALL_SHEET_ID / WALL_SHEET_GID বসাতে হবে (README দেখো)
   ========================================================= */

function wallTimeAgo(dateStr){
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "এইমাত্র";
  if (min < 60) return `${min} মিনিট আগে`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ঘণ্টা আগে`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} দিন আগে`;
  return d.toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" });
}

function wallEscapeHtml(str){
  return (str || "").toString()
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function wallAvatarUrl(name){
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "Friend")}&backgroundType=solid&backgroundColor=ece2c8&fontFamily=Georgia`;
}

function wallPostCard(m, isNew){
  const name = wallEscapeHtml(m.name || "অজ্ঞাত বন্ধু");
  const ts = m.timestamp || m["timestamp "] || "";
  const when = ts ? wallTimeAgo(ts) : "এইমাত্র";
  return `
    <div class="wall-post${isNew ? " is-new" : ""}">
      <div class="wall-post-head">
        <img class="wall-avatar" src="${wallAvatarUrl(m.name)}" alt="${name}">
        <div>
          <div class="wall-post-name">${name}</div>
          <div class="wall-post-time"><i class="bi bi-globe-asia-australia me-1"></i>${when} · ব্যাচ ওয়াল</div>
        </div>
      </div>
      <p class="wall-post-msg">${wallEscapeHtml(m.message || "")}</p>
    </div>`;
}

async function loadWallList(){
  const listWrap = document.getElementById("wallList");
  if (!listWrap) return;
  try{
    const rows = await fetchSheet(WALL_CSV_URL);
    const msgs = rows.filter(r => r.message).reverse();
    if (!msgs.length){
      listWrap.innerHTML = `<div class="state-msg">এখনো কেউ কিছু লেখেনি — প্রথম পোস্টটা তুমিই করো!</div>`;
      return;
    }
    listWrap.innerHTML = msgs.slice(0, 50).map(m => wallPostCard(m, false)).join("");
  }catch(e){
    console.error(e);
    listWrap.innerHTML = `<div class="state-msg">ব্যাচ ওয়াল এখনো কনফিগার করা হয়নি — config.js এ WALL_SHEET_ID/WALL_SHEET_GID বসাও (README দেখো)।</div>`;
  }
}

function initWallForm(){
  const form = document.getElementById("wallForm");
  if (!form) return;

  const statusEl = document.getElementById("wallStatus");
  const submitBtn = document.getElementById("wallSubmitBtn");
  const nameInput = document.getElementById("wallName");
  const avatarImg = document.getElementById("wallComposerAvatar");
  const listWrap = document.getElementById("wallList");

  nameInput.addEventListener("input", () => {
    avatarImg.src = wallAvatarUrl(nameInput.value.trim() || "Friend");
  });

  function showStatus(msg, isError){
    statusEl.style.display = "block";
    statusEl.innerHTML = msg;
    statusEl.style.borderColor = isError ? "var(--red)" : "var(--line)";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.name = (data.name || "").trim();
    data.message = (data.message || "").trim();

    if (!data.name || !data.message){
      showStatus("নাম আর মেসেজ — দুটোই লিখতে হবে।", true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spin"></span> পোস্ট হচ্ছে...`;

    try{
      await submitToSheet("Wall", data);
      // অপটিমিস্টিক আপডেট — রিফ্রেশ ছাড়াই নতুন পোস্টটা সাথে সাথে ওয়ালের উপরে দেখানো হয়
      if (listWrap){
        const emptyState = listWrap.querySelector(".state-msg");
        if (emptyState) listWrap.innerHTML = "";
        listWrap.insertAdjacentHTML("afterbegin", wallPostCard({ name: data.name, message: data.message, timestamp: new Date().toISOString() }, true));
      }
      form.reset();
      avatarImg.src = wallAvatarUrl("Friend");
      showStatus(`🎉 পোস্ট হয়ে গেছে, ধন্যবাদ <b>${wallEscapeHtml(data.name)}</b>!`, false);
    }catch(err){
      console.error(err);
      showStatus("দুঃখিত, পোস্ট করা যায়নি। একটু পর আবার চেষ্টা করো।", true);
    }finally{
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-send me-1"></i> পোস্ট করো`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadWallList();
  initWallForm();
});
