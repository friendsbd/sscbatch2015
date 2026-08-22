/* =========================================================
   গ্রুপ পোল — সবাই একসাথে ভোট দেয়, ফলাফল Google Sheet থেকে লাইভ পড়া হয়
   ভোট লেখা হয় Apps Script দিয়ে (submitToSheet, config.js-এ দেখো)
   ফলাফল পড়া হয় সরাসরি CSV export দিয়ে (কোনো Apps Script লাগে না)

   নোট: ভোট ডুপ্লিকেট চেক দুইভাবে হয় —
   ১) localStorage: এই ব্রাউজারে এই নাম দিয়ে আগে ভোট দেওয়া হয়েছে কিনা
   ২) Sheet-এর ডেটা: অন্য ব্রাউজার/ডিভাইস থেকেও একই নামে ভোট থাকলে ধরা পড়বে
   এটা ১০০% ফুলপ্রুফ না (কেউ চাইলে ভিন্ন নাম লিখে আবার ভোট দিতে পারবে),
   কিন্তু সাধারণ ব্যবহারের জন্য যথেষ্ট।
   ========================================================= */

const POLL_VOTED_KEY = "ssc2015_poll_voted_names_v2";

function pollNormName(name){
  return (name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function pollGetVotedMap(){
  try{ return JSON.parse(localStorage.getItem(POLL_VOTED_KEY) || "{}"); }
  catch(e){ return {}; }
}
function pollMarkVotedLocal(name, choice){
  const map = pollGetVotedMap();
  map[pollNormName(name)] = choice;
  localStorage.setItem(POLL_VOTED_KEY, JSON.stringify(map));
}

let POLL_SHEET_NAMES = {}; // { "rafi": "স্কুল ক্যাম্পাসে", ... } — Sheet থেকে লোড হওয়া ভোট
let pollSelectedOption = null;

// নাম অনুযায়ী আগের ভোট খুঁজে বের করা (local আগে চেক করি, তারপর sheet)
function pollExistingVoteFor(name){
  const key = pollNormName(name);
  if (!key) return null;
  return pollGetVotedMap()[key] || POLL_SHEET_NAMES[key] || null;
}

function renderPollOptions(){
  const wrap = document.getElementById("pollOptions");
  if (!wrap) return;
  const options = CONFIG.POLL_OPTIONS || [];
  wrap.innerHTML = options.map((opt, i) => `
    <div class="poll-opt-row" data-i="${i}">
      <i class="bi bi-circle"></i> <span>${opt}</span>
    </div>`).join("");
  wrap.querySelectorAll(".poll-opt-row").forEach(row => {
    row.addEventListener("click", () => {
      wrap.querySelectorAll(".poll-opt-row").forEach(r => {
        r.classList.remove("is-selected");
        r.querySelector("i").className = "bi bi-circle";
      });
      row.classList.add("is-selected");
      row.querySelector("i").className = "bi bi-check-circle-fill";
      pollSelectedOption = options[Number(row.dataset.i)];
      updatePollUIForName();
    });
  });
}

// নাম ফিল্ডের বর্তমান ভ্যালু অনুযায়ী স্ট্যাটাস মেসেজ আর সাবমিট বাটন আপডেট করে
function updatePollUIForName(){
  const nameInput = document.getElementById("pollName");
  const statusEl = document.getElementById("pollStatus");
  const submitBtn = document.getElementById("pollSubmitBtn");
  if (!nameInput || !statusEl || !submitBtn) return;

  const name = nameInput.value.trim();
  const existing = pollExistingVoteFor(name);

  if (existing){
    // ব্লক করি না — শুধু জানিয়ে দিই, চাইলে নতুন অপশন বেছে "ভোট পরিবর্তন করো"
    statusEl.innerHTML = `ℹ️ <b>${name}</b> নামে আগে <b>${existing}</b>-তে ভোট দেওয়া হয়েছিল। অপশন বেছে আবার সাবমিট করলে ভোট পরিবর্তন হয়ে যাবে।`;
    submitBtn.textContent = "ভোট পরিবর্তন করো";
    submitBtn.disabled = !pollSelectedOption;
  } else {
    statusEl.innerHTML = "";
    submitBtn.textContent = "ভোট দাও";
    submitBtn.disabled = !(pollSelectedOption && name);
  }
}

async function loadPollResults(){
  const out = document.getElementById("pollResults");
  if (!out) return;
  const options = CONFIG.POLL_OPTIONS || [];
  try{
    const rows = await fetchSheet(POLL_CSV_URL);

    // নাম -> সর্বশেষ চয়েস ম্যাপ আপডেট করি (ক্রস-ব্রাউজার ডুপ্লিকেট চেকের জন্য)
    const nameMap = {};
    rows.forEach(r => {
      const n = pollNormName(r.name);
      const c = (r.choice || "").trim();
      if (n && c) nameMap[n] = c;
    });
    POLL_SHEET_NAMES = nameMap;

    const counts = {};
    options.forEach(o => counts[o] = 0);
    let total = 0;
    rows.forEach(r => {
      const choice = (r.choice || "").trim();
      if (choice in counts){ counts[choice]++; total++; }
    });
    if (!total){
      out.innerHTML = `<div class="state-msg">এখনো কেউ ভোট দেয়নি — প্রথম ভোটটা তোমার হোক!</div>`;
    } else {
      out.innerHTML = options.map(opt => {
        const c = counts[opt] || 0;
        const pct = total ? Math.round((c / total) * 100) : 0;
        return `
          <div class="poll-bar-row">
            <div class="d-flex justify-content-between mono small">
              <span>${opt}</span><span>${c} ভোট (${pct}%)</span>
            </div>
            <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${pct}%"></div></div>
          </div>`;
      }).join("") + `<div class="mono small text-secondary mt-2">মোট ভোট: ${total}</div>`;
    }

    // ফলাফল রিলোড হওয়ার পর নাম ফিল্ড অনুযায়ী স্ট্যাটাসও রিফ্রেশ করি
    updatePollUIForName();
  }catch(err){
    console.error(err);
    out.innerHTML = `<div class="state-msg">ফলাফল লোড করা যায়নি — config.js-এ POLL_SHEET_ID ঠিক আছে কিনা দেখো, আর Sheet-এ "PollVotes" ট্যাবের Share অ্যাক্সেস "Anyone with the link" (Viewer) কিনা চেক করো।</div>`;
  }
}

async function initGroupPoll(){
  const qEl = document.getElementById("pollQuestion");
  const nameInput = document.getElementById("pollName");
  const submitBtn = document.getElementById("pollSubmitBtn");
  const statusEl = document.getElementById("pollStatus");
  const refreshBtn = document.getElementById("pollRefreshBtn");
  if (!qEl) return;

  qEl.textContent = CONFIG.POLL_QUESTION || "প্রশ্ন এখনো সেট করা হয়নি";
  renderPollOptions();
  await loadPollResults(); // এটাই POLL_SHEET_NAMES ভরে দেয় আর নাম-ভিত্তিক স্ট্যাটাসও দেখায়

  nameInput.addEventListener("input", updatePollUIForName);

  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name || !pollSelectedOption) return;

    const wasChange = !!pollExistingVoteFor(name);
    submitBtn.disabled = true;
    statusEl.textContent = "ভোট পাঠানো হচ্ছে...";
    try{
      await submitToSheet("PollVotes", { name, choice: pollSelectedOption });
      pollMarkVotedLocal(name, pollSelectedOption);
      POLL_SHEET_NAMES[pollNormName(name)] = pollSelectedOption;
      statusEl.innerHTML = wasChange
        ? `🎉 ভোট পরিবর্তন হয়েছে — এখন <b>${pollSelectedOption}</b>। ফলাফল একটু পর রিফ্রেশ করে দেখো।`
        : `🎉 ভোট জমা হয়েছে — <b>${pollSelectedOption}</b>। ফলাফল একটু পর রিফ্রেশ করে দেখো (Sheet আপডেট হতে কয়েক সেকেন্ড লাগতে পারে)।`;
      submitBtn.textContent = "ভোট পরিবর্তন করো";
      submitBtn.disabled = false;
      setTimeout(loadPollResults, 3000);
    }catch(err){
      console.error(err);
      statusEl.textContent = "ভোট পাঠানো যায়নি — config.js-এ SUBMIT_SCRIPT_URL ঠিক আছে কিনা দেখো।";
      submitBtn.disabled = false;
      submitBtn.textContent = "ভোট দাও";
    }
  });

  if (refreshBtn) refreshBtn.addEventListener("click", loadPollResults);
}

document.addEventListener("DOMContentLoaded", initGroupPoll);