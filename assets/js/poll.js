/* =========================================================
   গ্রুপ পোল — সবাই একসাথে ভোট দেয়, ফলাফল Google Sheet থেকে লাইভ পড়া হয়
   ভোট লেখা হয় Apps Script দিয়ে (submitToSheet, config.js-এ দেখো)
   ফলাফল পড়া হয় সরাসরি CSV export দিয়ে (কোনো Apps Script লাগে না)
   ========================================================= */

const POLL_VOTED_KEY = "ssc2015_poll_voted_v1";

function pollHasVoted(){
  return !!localStorage.getItem(POLL_VOTED_KEY);
}
function pollMarkVoted(choice){
  localStorage.setItem(POLL_VOTED_KEY, choice);
}

let pollSelectedOption = null;

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
      updatePollSubmitState();
    });
  });
}

function updatePollSubmitState(){
  const btn = document.getElementById("pollSubmitBtn");
  const nameInput = document.getElementById("pollName");
  if (!btn) return;
  btn.disabled = !(pollSelectedOption && nameInput.value.trim());
}

async function loadPollResults(){
  const out = document.getElementById("pollResults");
  if (!out) return;
  const options = CONFIG.POLL_OPTIONS || [];
  try{
    const rows = await fetchSheet(POLL_CSV_URL);
    const counts = {};
    options.forEach(o => counts[o] = 0);
    let total = 0;
    rows.forEach(r => {
      const choice = (r.choice || "").trim();
      if (choice in counts){ counts[choice]++; total++; }
    });
    if (!total){
      out.innerHTML = `<div class="state-msg">এখনো কেউ ভোট দেয়নি — প্রথম ভোটটা তোমার হোক!</div>`;
      return;
    }
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
  loadPollResults();

  const previousVote = localStorage.getItem(POLL_VOTED_KEY);
  if (previousVote){
    statusEl.innerHTML = `✅ তুমি আগেই ভোট দিয়েছো (<b>${previousVote}</b>) — ধন্যবাদ!`;
    submitBtn.disabled = true;
    submitBtn.textContent = "ভোট দেওয়া হয়ে গেছে";
  }

  nameInput.addEventListener("input", updatePollSubmitState);

  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name || !pollSelectedOption) return;
    submitBtn.disabled = true;
    statusEl.textContent = "ভোট পাঠানো হচ্ছে...";
    try{
      await submitToSheet("PollVotes", { name, choice: pollSelectedOption });
      pollMarkVoted(pollSelectedOption);
      statusEl.innerHTML = `🎉 ভোট জমা হয়েছে — <b>${pollSelectedOption}</b>। ফলাফল একটু পর রিফ্রেশ করে দেখো (Sheet আপডেট হতে কয়েক সেকেন্ড লাগতে পারে)।`;
      submitBtn.textContent = "ভোট দেওয়া হয়ে গেছে";
      setTimeout(loadPollResults, 3000);
    }catch(err){
      console.error(err);
      statusEl.textContent = "ভোট পাঠানো যায়নি — config.js-এ SUBMIT_SCRIPT_URL ঠিক আছে কিনা দেখো।";
      submitBtn.disabled = false;
    }
  });

  if (refreshBtn) refreshBtn.addEventListener("click", loadPollResults);
}

document.addEventListener("DOMContentLoaded", initGroupPoll);
