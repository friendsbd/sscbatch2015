/* =========================================================
   MORE TOOLS — নতুন ২০+ টা টুল/গেম
   সবগুলোই সম্পূর্ণ ব্রাউজারে চলে, কোনো Google Sheet বা config লাগে না
   ========================================================= */

/* ---------- ছোট্ট হেল্পার ---------- */
function $(sel){ return document.querySelector(sel); }
function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr){ return arr[randInt(0, arr.length - 1)]; }

/* ================= GAMES ================= */

/* ---------- মেমোরি ম্যাচ ---------- */
function initMemoryGame(){
  const board = $("#memoryBoard");
  const status = $("#memoryStatus");
  const resetBtn = $("#memoryReset");
  if (!board || !status) return;

  const ICONS = ["🎓","⚽","📚","🎸","🎨","🏆","🎮","☕"];
  let cards = [], flipped = [], matched = 0, moves = 0, busy = false;

  function build(){
    cards = [...ICONS, ...ICONS]
      .map(icon => ({ icon, matched:false }))
      .sort(() => Math.random() - 0.5);
    flipped = []; matched = 0; moves = 0; busy = false;
    status.textContent = `চাল: ০ · জোড়া: ০/${ICONS.length}`;
    render();
  }

  function render(){
    board.innerHTML = cards.map((c, idx) => `
      <button class="memory-card ${c.matched ? 'is-matched' : ''} ${flipped.includes(idx) ? 'is-flipped' : ''}" data-idx="${idx}">
        <span>${(c.matched || flipped.includes(idx)) ? c.icon : '❔'}</span>
      </button>`).join("");
    board.querySelectorAll(".memory-card").forEach(btn => btn.addEventListener("click", onFlip));
  }

  function onFlip(e){
    if (busy) return;
    const idx = Number(e.currentTarget.dataset.idx);
    if (flipped.includes(idx) || cards[idx].matched) return;
    flipped.push(idx);
    render();
    if (flipped.length === 2){
      moves++;
      busy = true;
      const [a, b] = flipped;
      if (cards[a].icon === cards[b].icon){
        cards[a].matched = true; cards[b].matched = true;
        matched++;
        flipped = [];
        busy = false;
        status.textContent = `চাল: ${moves} · জোড়া: ${matched}/${ICONS.length}`;
        render();
        if (matched === ICONS.length) status.innerHTML = `🎉 শেষ! মোট চাল: <b>${moves}</b>`;
      } else {
        status.textContent = `চাল: ${moves} · জোড়া: ${matched}/${ICONS.length}`;
        setTimeout(() => { flipped = []; busy = false; render(); }, 700);
      }
    }
  }

  if (resetBtn) resetBtn.addEventListener("click", build);
  build();
}

/* ---------- শব্দ সাজাও ---------- */
const SCRAMBLE_WORDS = [
  "বন্ধু","স্কুল","ক্লাসরুম","পরীক্ষা","জ্যামিতি","টিফিন","রিইউনিয়ন","হাসি","স্মৃতি","শিক্ষক",
  "খেলাঘর","বেঞ্চ","হোমওয়ার্ক","মাঠ","ব্যাচ","ছুটি","গল্প","আড্ডা","ছবি","বৃষ্টি"
];
function scrambleText(word){
  let arr = word.split("");
  do { arr.sort(() => Math.random() - 0.5); } while (arr.join("") === word && word.length > 1);
  return arr.join(" ");
}
function initWordScramble(){
  const wordEl = $("#scrambleWord");
  const input = $("#scrambleInput");
  const checkBtn = $("#scrambleCheck");
  const newBtn = $("#scrambleNew");
  const scoreEl = $("#scrambleScore");
  if (!wordEl || !input) return;

  let current = "", score = 0;
  function newWord(){
    current = pick(SCRAMBLE_WORDS);
    wordEl.textContent = scrambleText(current);
    input.value = "";
    input.focus();
  }
  checkBtn.addEventListener("click", () => {
    if (!current) return;
    if (input.value.trim() === current){
      score++;
      scoreEl.textContent = `স্কোর: ${score}`;
      wordEl.innerHTML = `✅ ঠিক আছে! উত্তর ছিল <b>${current}</b>`;
      setTimeout(newWord, 900);
    } else {
      wordEl.innerHTML = `❌ আরেকবার চেষ্টা করো`;
    }
  });
  newBtn.addEventListener("click", newWord);
  input.addEventListener("keydown", e => { if (e.key === "Enter") checkBtn.click(); });
  newWord();
}

/* ---------- ডাইস রোলার ---------- */
function initDiceRoller(){
  const btn = $("#diceRollBtn");
  const out = $("#diceResult");
  const countSel = $("#diceCount");
  if (!btn || !out) return;
  const FACES = ["⚀","⚁","⚂","⚃","⚄","⚅"];
  btn.addEventListener("click", () => {
    const n = Number(countSel.value);
    const rolls = Array.from({length:n}, () => randInt(1,6));
    out.innerHTML = rolls.map(r => FACES[r-1]).join(" ") + `<div class="mono small text-secondary mt-1">মোট: ${rolls.reduce((a,b)=>a+b,0)}</div>`;
  });
}

/* ---------- কয়েন টস ---------- */
function initCoinFlip(){
  const btn = $("#coinFlipBtn");
  const out = $("#coinResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    out.textContent = "🪙 ঘুরছে...";
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "হেড 👑" : "টেইল 🔵";
      out.innerHTML = `ফলাফল: <b>${result}</b>`;
    }, 500);
  });
}

/* ---------- রিয়েকশন টাইম টেস্ট ---------- */
function initReactionTest(){
  const box = $("#reactionBox");
  const out = $("#reactionResult");
  if (!box || !out) return;
  let state = "idle", timer = null, startTime = 0;

  function toIdle(){
    state = "idle";
    box.className = "reaction-box";
    box.textContent = "ক্লিক করে শুরু করো";
  }
  function toWaiting(){
    state = "waiting";
    box.className = "reaction-box is-waiting";
    box.textContent = "অপেক্ষা করো...";
    const delay = randInt(1500, 4000);
    timer = setTimeout(toGo, delay);
  }
  function toGo(){
    state = "go";
    box.className = "reaction-box is-go";
    box.textContent = "এখনই ক্লিক করো!";
    startTime = Date.now();
  }
  box.addEventListener("click", () => {
    if (state === "idle"){ toWaiting(); return; }
    if (state === "waiting"){
      clearTimeout(timer);
      out.textContent = "😅 খুব তাড়াতাড়ি! আবার চেষ্টা করো";
      toIdle();
      return;
    }
    if (state === "go"){
      const ms = Date.now() - startTime;
      out.innerHTML = `⚡ তোমার রিয়েকশন টাইম: <b>${ms} ms</b>`;
      toIdle();
    }
  });
}

/* ---------- টাইপিং স্পিড টেস্ট ---------- */
const TYPING_LINES = [
  "আমরা সবাই মিলে একসাথে অনেক পথ পাড়ি দিয়েছি।",
  "স্কুলের সেই দিনগুলো আজও মনে পড়ে হাসি নিয়ে আসে।",
  "বন্ধুত্ব মানে পাশে থাকা, ভালো সময়ে আর খারাপ সময়ে।",
  "আমাদের ব্যাচের প্রতিটা স্মৃতি এক একটা গল্প।",
  "আজকের ছোট্ট আড্ডাটাই একদিন বড় স্মৃতি হয়ে থাকবে।"
];
function initTypingTest(){
  const promptEl = $("#typingPrompt");
  const input = $("#typingInput");
  const wpmEl = $("#typingWpm");
  const accEl = $("#typingAcc");
  const resetBtn = $("#typingReset");
  if (!promptEl || !input) return;

  let target = "", startTime = null, finished = false;

  function newRound(){
    target = pick(TYPING_LINES);
    promptEl.textContent = target;
    input.value = "";
    input.disabled = false;
    input.focus();
    startTime = null;
    finished = false;
    wpmEl.textContent = "০";
    accEl.textContent = "১০০%";
  }

  input.addEventListener("input", () => {
    if (finished) return;
    if (startTime === null) startTime = Date.now();
    const typed = input.value;

    let correct = 0;
    for (let i = 0; i < typed.length; i++){
      if (typed[i] === target[i]) correct++;
    }
    const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    accEl.textContent = acc + "%";

    if (typed === target){
      finished = true;
      const minutes = Math.max((Date.now() - startTime) / 60000, 0.01);
      const words = target.split(" ").length;
      wpmEl.textContent = Math.round(words / minutes);
      input.disabled = true;
      promptEl.innerHTML = "🎉 শেষ! নিচে ফলাফল দেখো।";
    }
  });

  if (resetBtn) resetBtn.addEventListener("click", newRound);
  newRound();
}

/* ---------- ব্যাচ ট্রিভিয়া কুইজ ---------- */
const QUIZ_QUESTIONS = [
  { q: "সাধারণত SSC পরীক্ষা কোন ক্লাসের পর দেওয়া হয়?", options: ["ক্লাস ৮", "ক্লাস ৯-১০", "ক্লাস ১২"], correct: 1 },
  { q: "স্কুল জীবনের সবচেয়ে প্রিয় সময় কোনটা বলে বেশিরভাগ মানুষ মনে করে?", options: ["টিফিন পিরিয়ড", "পরীক্ষার সময়", "হোমওয়ার্ক করার সময়"], correct: 0 },
  { q: "রিইউনিয়নে সাধারণত সবচেয়ে বেশি কী নিয়ে কথা হয়?", options: ["পুরনো স্মৃতি", "আজকের আবহাওয়া", "শেয়ার বাজার"], correct: 0 },
  { q: "ক্লাসের 'ব্যাক বেঞ্চার'-দের সাধারণত কী পরিচিতি থাকে?", options: ["সবচেয়ে চুপচাপ", "মজার ও দুষ্টু", "সবসময় সিরিয়াস"], correct: 1 },
  { q: "বন্ধুদের গ্রুপ ছবিতে সবচেয়ে কমন সমস্যা কোনটা?", options: ["সবাই চোখ বন্ধ করে ফেলা", "সবাই সময়মতো হাজির হওয়া", "ছবি খুব পরিষ্কার হওয়া"], correct: 0 },
];
function initQuiz(){
  const qEl = $("#quizQuestion");
  const optsEl = $("#quizOptions");
  const scoreEl = $("#quizScore");
  const totalEl = $("#quizTotal");
  const startBtn = $("#quizStart");
  if (!qEl || !optsEl) return;

  let order = [], idx = 0, score = 0, answered = false;

  function start(){
    order = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
    idx = 0; score = 0; answered = false;
    scoreEl.textContent = "০"; totalEl.textContent = order.length;
    renderQ();
  }

  function renderQ(){
    if (idx >= order.length){
      qEl.innerHTML = `🎉 কুইজ শেষ! স্কোর: <b>${score}/${order.length}</b>`;
      optsEl.innerHTML = "";
      return;
    }
    const item = order[idx];
    answered = false;
    qEl.textContent = item.q;
    optsEl.innerHTML = item.options.map((opt, i) =>
      `<button class="quiz-opt-btn" data-i="${i}">${opt}</button>`
    ).join("");
    optsEl.querySelectorAll(".quiz-opt-btn").forEach(b => b.addEventListener("click", onAnswer));
  }

  function onAnswer(e){
    if (answered) return;
    answered = true;
    const chosen = Number(e.currentTarget.dataset.i);
    const item = order[idx];
    optsEl.querySelectorAll(".quiz-opt-btn").forEach((b, i) => {
      if (i === item.correct) b.classList.add("is-correct");
      else if (i === chosen) b.classList.add("is-wrong");
      b.disabled = true;
    });
    if (chosen === item.correct){ score++; scoreEl.textContent = score; }
    setTimeout(() => { idx++; renderQ(); }, 1000);
  }

  if (startBtn) startBtn.addEventListener("click", start);
  qEl.textContent = "শুরু করতে নিচে ক্লিক করো";
}

/* ================= FRIENDS FUN ================= */

/* ---------- গিফট এক্সচেঞ্জ পেয়ারিং (সিক্রেট স্যান্টা স্টাইল) ---------- */
function initGiftPairing(){
  const textarea = $("#pairNames");
  const btn = $("#pairBtn");
  const out = $("#pairResult");
  if (!textarea || !btn) return;

  btn.addEventListener("click", () => {
    const names = textarea.value.split("\n").map(s => s.trim()).filter(Boolean);
    if (names.length < 3){
      out.textContent = "কমপক্ষে ৩ জনের নাম দাও, প্রতি লাইনে একটা করে।";
      return;
    }
    let givers = [...names];
    let receivers = [...names];
    let valid = false, attempt = 0;
    while (!valid && attempt < 200){
      receivers = [...names].sort(() => Math.random() - 0.5);
      valid = givers.every((g, i) => g !== receivers[i]);
      attempt++;
    }
    if (!valid){
      out.textContent = "জোড়া বানানো যায়নি, আবার চেষ্টা করো।";
      return;
    }
    out.textContent = givers.map((g, i) => `${g} → ${receivers[i]}`).join("\n");
  });
}

/* ---------- এটা নাকি ওটা ---------- */
const WYR_QUESTIONS = [
  "সারাজীবন শুধু ভাত খাওয়া নাকি সারাজীবন শুধু রুটি খাওয়া?",
  "এক মাস ইন্টারনেট ছাড়া থাকা নাকি এক মাস বন্ধু ছাড়া থাকা?",
  "সারাক্ষণ ফিসফিস করে কথা বলা নাকি সারাক্ষণ চিৎকার করে কথা বলা?",
  "অতীতে ফিরে যাওয়ার ক্ষমতা নাকি ভবিষ্যৎ দেখার ক্ষমতা?",
  "প্রতিদিন পরীক্ষা দেওয়া নাকি কখনো ছুটি না পাওয়া?",
  "সবসময় ১ ঘণ্টা আগে পৌঁছানো নাকি সবসময় ১ ঘণ্টা দেরি করা?",
  "উড়তে পারা নাকি অদৃশ্য হতে পারা?",
];
function initWYR(){
  const btn = $("#wyrBtn"); const out = $("#wyrResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => { out.innerHTML = `<b>${pick(WYR_QUESTIONS)}</b>`; });
}

/* ---------- সত্যি নাকি সাহস ---------- */
const TRUTHS = [
  "স্কুলে করা সবচেয়ে বিব্রতকর কাজটা কী ছিল?",
  "কখনো কারো ওপর গোপনে ক্রাশ ছিল কিনা বলো।",
  "সবচেয়ে বড় মিথ্যা কথা কবে বলেছিলে?",
  "সবচেয়ে লজ্জাজনক নিকনেম কী ছিল তোমার?",
];
const DARES = [
  "পরবর্তী ৩ মিনিট শুধু গান গেয়ে কথা বলো।",
  "গ্রুপের একজনকে ফোন করে গান শুনিয়ে দাও।",
  "নিজের একটা ফানি ভয়েস মেসেজ পাঠাও গ্রুপে।",
  "৩০ সেকেন্ড কোনো একটা প্রাণীর মতো নাচ দেখাও।",
];
function initTruthOrDare(){
  const btn = $("#totdBtn"); const out = $("#totdResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    if (Math.random() < 0.5) out.innerHTML = `🗣️ <b>সত্যি:</b> ${pick(TRUTHS)}`;
    else out.innerHTML = `🔥 <b>সাহস:</b> ${pick(DARES)}`;
  });
}

/* ---------- বন্ধুত্বের শতাংশ (consistent hash-based, শুধু মজার জন্য) ---------- */
function initFriendshipMatch(){
  const n1 = $("#matchName1"), n2 = $("#matchName2");
  const btn = $("#matchBtn"), out = $("#matchResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const a = (n1.value || "").trim(), b = (n2.value || "").trim();
    if (!a || !b){ out.textContent = "দুইজনের নামই বসাও।"; return; }
    const combo = [a.toLowerCase(), b.toLowerCase()].sort().join("+");
    let hash = 0;
    for (let i = 0; i < combo.length; i++){ hash = (hash * 31 + combo.charCodeAt(i)) >>> 0; }
    const pct = 40 + (hash % 61); // ৪০–১০০%
    let note = "মোটামুটি! 🙂";
    if (pct >= 90) note = "অসাধারণ জুটি! 🎉";
    else if (pct >= 70) note = "দারুণ মিল! 😄";
    else if (pct < 55) note = "চেষ্টা চালিয়ে যাও! 😅";
    out.innerHTML = `<b>${a}</b> ও <b>${b}</b> — মিল/লাভ <b>${pct}%</b> ❤️<br>${note}`;
  });
}

/* ---------- আইসব্রেকার প্রশ্ন ---------- */
const ICEBREAKERS = [
  "যদি হুট করে একদিনের ছুটি পাও, কী করবে?",
  "স্কুলজীবনের সবচেয়ে প্রিয় শিক্ষকের নাম বলো।",
  "একটা জিনিস বলো যা এখনো পর্যন্ত কাউকে বলোনি।",
  "যদি আবার ক্লাস ৯-এ ফিরে যেতে পারতে, কী বদলাতে?",
  "তোমার প্রিয় ব্যাচমেটের সবচেয়ে মজার স্মৃতিটা বলো।",
  "কোন গান শুনলে স্কুলের কথা মনে পড়ে?",
];
function initIcebreaker(){
  const btn = $("#icebreakerBtn"); const out = $("#icebreakerResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => { out.innerHTML = `<b>${pick(ICEBREAKERS)}</b>`; });
}

/* ---------- চাকা ঘোরাও (স্পিন হুইল, টেক্সট ভিত্তিক) ---------- */
function initSpinWheel(){
  const input = $("#wheelInput"); const btn = $("#wheelSpinBtn"); const out = $("#wheelResult");
  if (!input || !btn || !out) return;
  btn.addEventListener("click", () => {
    const names = input.value.split(",").map(s => s.trim()).filter(Boolean);
    if (names.length < 2){ out.textContent = "কমপক্ষে ২টা নাম/অপশন কমা দিয়ে আলাদা করে বসাও।"; return; }
    out.textContent = "🎡 ঘুরছে...";
    let i = 0;
    const spin = setInterval(() => {
      out.textContent = "🎡 " + pick(names);
      i++;
      if (i > 14){
        clearInterval(spin);
        out.innerHTML = `🎯 চাকা থামলো: <b>${pick(names)}</b>`;
      }
    }, 90);
  });
}

/* ================= REAL LIFE TOOLS ================= */

/* ---------- বয়স ক্যালকুলেটর ---------- */
function initAgeCalculator(){
  const input = $("#ageInput"); const btn = $("#ageCalcBtn"); const out = $("#ageResult");
  if (!input || !btn) return;
  btn.addEventListener("click", () => {
    if (!input.value){ out.textContent = "জন্ম তারিখ বসাও।"; return; }
    const dob = new Date(input.value);
    const now = new Date();
    if (dob > now){ out.textContent = "ভবিষ্যতের তারিখ বসানো যাবে না।"; return; }
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();
    if (days < 0){
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0){ years--; months += 12; }
    out.innerHTML = `তোমার বয়স: <b>${years} বছর ${months} মাস ${days} দিন</b>`;
  });
}

/* ---------- BMI ক্যালকুলেটর ---------- */
function initBMI(){
  const h = $("#bmiHeight"), w = $("#bmiWeight");
  const btn = $("#bmiCalcBtn"), out = $("#bmiResult");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const height = parseFloat(h.value) / 100;
    const weight = parseFloat(w.value);
    if (!height || !weight){ out.textContent = "উচ্চতা আর ওজন ঠিকমতো বসাও।"; return; }
    const bmi = weight / (height * height);
    let cat = "স্বাভাবিক";
    if (bmi < 18.5) cat = "কম ওজন";
    else if (bmi >= 25 && bmi < 30) cat = "বেশি ওজন";
    else if (bmi >= 30) cat = "স্থূলতা";
    out.innerHTML = `BMI: <b>${bmi.toFixed(1)}</b> — ${cat}`;
  });
}

/* ---------- একক রূপান্তরকারী ---------- */
function initConverter(){
  const type = $("#convType"), input = $("#convInput");
  const btn = $("#convBtn"), out = $("#convResult");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const val = parseFloat(input.value);
    if (isNaN(val)){ out.textContent = "একটা সংখ্যা বসাও।"; return; }
    let result, label;
    switch(type.value){
      case "km_mile": result = val * 0.621371; label = "মাইল"; break;
      case "kg_lb": result = val * 2.20462; label = "পাউন্ড"; break;
      case "c_f": result = (val * 9/5) + 32; label = "°F"; break;
    }
    out.innerHTML = `ফলাফল: <b>${result.toFixed(2)} ${label}</b>`;
  });
}

/* ---------- পাসওয়ার্ড জেনারেটর ---------- */
function initPasswordGen(){
  const lenSel = $("#pwLength"); const btn = $("#pwGenBtn"); const out = $("#pwResult");
  if (!btn) return;
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
  btn.addEventListener("click", () => {
    const len = Number(lenSel.value);
    let pw = "";
    const arr = new Uint32Array(len);
    (window.crypto || window.msCrypto).getRandomValues(arr);
    for (let i = 0; i < len; i++) pw += CHARS[arr[i] % CHARS.length];
    out.textContent = pw;
  });
}

/* ---------- স্টপওয়াচ ---------- */
function initStopwatch(){
  const display = $("#stopwatchDisplay");
  const startBtn = $("#stopwatchStart"), stopBtn = $("#stopwatchStop"), resetBtn = $("#stopwatchResetBtn");
  if (!display) return;
  let elapsed = 0, interval = null, running = false, last = 0;

  function fmt(ms){
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const t = Math.floor((ms % 1000) / 100);
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${t}`;
  }
  function tick(){
    elapsed += Date.now() - last;
    last = Date.now();
    display.textContent = fmt(elapsed);
  }
  startBtn.addEventListener("click", () => {
    if (running) return;
    running = true; last = Date.now();
    interval = setInterval(tick, 100);
  });
  stopBtn.addEventListener("click", () => {
    running = false; clearInterval(interval);
  });
  resetBtn.addEventListener("click", () => {
    running = false; clearInterval(interval);
    elapsed = 0; display.textContent = fmt(0);
  });
}

/* ---------- শব্দ ও অক্ষর গণনা ---------- */
function initWordCounter(){
  const input = $("#wordCountInput");
  const wordsEl = $("#wcWords"), charsEl = $("#wcChars");
  if (!input) return;
  input.addEventListener("input", () => {
    const text = input.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordsEl.textContent = words;
    charsEl.textContent = text.length;
  });
}

/* ---------- QR কোড জেনারেটর ---------- */
function initQRGenerator(){
  const input = $("#qrInput"); const btn = $("#qrGenBtn"); const out = $("#qrOutput");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const val = input.value.trim();
    if (!val){ out.innerHTML = `<div class="state-msg">একটা লিংক বা টেক্সট বসাও।</div>`; return; }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(val)}`;
    out.innerHTML = `<img src="${url}" alt="QR কোড" style="border:1px solid var(--line); border-radius:8px; background:#fff; padding:8px;">`;
  });
}

/* ---------- রিইউনিয়ন কাউন্টডাউন ---------- */
function initCountdown(){
  const input = $("#countdownDate"); const btn = $("#countdownSetBtn"); const out = $("#countdownResult");
  if (!btn) return;
  let timer = null;
  function update(target){
    const diff = target - Date.now();
    if (diff <= 0){ out.innerHTML = "🎉 আজই সেই দিন!"; clearInterval(timer); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    out.innerHTML = `<b>${d}</b> দিন <b>${h}</b> ঘণ্টা <b>${m}</b> মিনিট বাকি`;
  }
  btn.addEventListener("click", () => {
    if (!input.value){ out.textContent = "একটা তারিখ বসাও।"; return; }
    const target = new Date(input.value).getTime();
    clearInterval(timer);
    update(target);
    timer = setInterval(() => update(target), 60000);
  });
}

/* ---------- কখনো করিনি ---------- */
const NHIE_LINES = [
  "কখনো ক্লাস ফাঁকি দিয়ে সিনেমা দেখতে যাইনি।",
  "কখনো হোমওয়ার্ক না করে টিচারকে মিথ্যা বলিনি।",
  "কখনো কারো ওপর গোপনে ক্রাশ খাইনি।",
  "কখনো এক্সাম হলে বন্ধুর খাতা দেখিনি।",
  "কখনো ক্লাসে ঘুমিয়ে ধরা খাইনি।",
  "কখনো টিফিনের টাকা দিয়ে অন্য কিছু কিনিনি।",
  "কখনো গ্রুপ ফটোতে সবার আগে পোজ দিতে ছুটে যাইনি।",
  "কখনো বন্ধুর নামে টিচারের কাছে নালিশ করিনি।",
  "কখনো স্কুল ড্রেস ছাড়া স্কুলে গিয়ে ধরা খাইনি।",
  "কখনো ক্লাস টেস্টের আগের রাতে সব পড়া শেষ করার প্ল্যান করে ঘুমিয়ে পড়িনি।",
];
function initNeverHaveIEver(){
  const btn = $("#nhieBtn"); const out = $("#nhieResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => { out.innerHTML = `<b>${pick(NHIE_LINES)}</b>`; });
}

/* ---------- ব্যাচমেট প্রশংসা জেনারেটর ---------- */
const COMPLIMENT_LINES = [
  "সবচেয়ে বেশি ভরসা করা যায় এমন একজন বন্ধু",
  "গ্রুপ চ্যাটকে সবসময় প্রাণবন্ত রাখে",
  "যেকোনো বিপদে সবার আগে পাশে দাঁড়ায়",
  "স্কুলজীবনের সেরা হাসির স্মৃতিগুলোর একটা বড় অংশ জুড়ে আছে",
  "নিজের কাজ দিয়ে পুরো ব্যাচের নাম উজ্জ্বল করছে",
  "যত বছরই যাক, বন্ধুত্বে কোনো পরিবর্তন আসেনি এমন একজন",
  "সবার খোঁজখবর সবচেয়ে বেশি রাখে",
  "নিঃস্বার্থভাবে সবাইকে সাহায্য করার জন্য পরিচিত",
];
function initComplimentGenerator(){
  const input = $("#complimentName"); const btn = $("#complimentBtn"); const out = $("#complimentResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const name = (input.value || "").trim();
    if (!name){ out.textContent = "আগে বন্ধুর নাম বসাও।"; return; }
    out.innerHTML = `🌟 <b>${name}</b> — ${pick(COMPLIMENT_LINES)}!`;
  });
}

/* ---------- মজার গল্প / কবিতা জেনারেটর (মৌলিক, নিজেদের লেখা) ---------- */
const FUNNY_POEMS = [
  "{name} গেলো ক্লাসে দেরি করে,\nটিচার বলে, \"বসো গিয়ে ওই কোণে!\"\nবেঞ্চে বসেই ঘুমের ঘোরে,\nস্বপ্নে দেখে টিফিন খাচ্ছে মনে মনে।",
  "{name}-র ব্যাগে বই নেই একটাও,\nআছে শুধু চিপস্ আর ক্রিকেট বল।\nটিচার শুধায়, \"পড়া কই করলে তুমি?\"\n{name} হাসে, \"স্যার, কাল করব — এই তো বললো দল!\"",
  "সাত সকালে {name} ওঠে দেরি করে,\nস্কুল বাস ছোটে, ও ছোটে পেছনে।\nহাঁপাতে হাঁপাতে গেটে পৌঁছে বলে,\n\"স্যার, ঘড়িটাই স্লো — বিশ্বাস করেন আমারে!\"",
  "পরীক্ষার হলে {name} বসেছে চুপচাপ,\nখাতায় লিখছে শুধু নিজের নাম।\nবাকি সময়টা তাকিয়ে জানালায়,\nভাবছে আজ টিফিনে হবে কী কী দাম।",
  "{name} একদিন হোমওয়ার্ক আনলো না,\nবললো, \"স্যার, ছাগলে খেয়ে ফেলেছে!\"\nক্লাসসুদ্ধ সবাই হাসিতে লুটোপুটি,\nটিচারও হাসি চেপে বললেন, \"বেশ বেশ!\"",
  "গল্পটা এক ব্যাচের বন্ধুদের নিয়ে,\n{name} ছিল সবচেয়ে হইচইয়ের রাজা।\nআজও যখন পুরোনো ছবি খুলি,\nমনে পড়ে সেই বেঞ্চ, সেই মজা।",
];
function initStoryPoem(){
  const nameEl = $("#storyName"); const btn = $("#storyBtn"); const out = $("#storyResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const name = (nameEl.value || "").trim() || "বন্ধু";
    const poem = pick(FUNNY_POEMS).replaceAll("{name}", name);
    out.textContent = poem;
  });
}

/* ---------- স্কুলজীবনের মুহূর্ত জেনারেটর ---------- */
const SCHOOL_MOMENTS = [
  "সেই বেঞ্চ, সেই মাঠ, সেই টিফিনের ঘণ্টা — সব যেন এখনো চোখ বুজলেই দেখতে পাই। তোমরা ছিলে বলেই দিনগুলো এত রঙিন ছিল। 💛",
  "ক্লাসের শেষ বেঞ্চে বসে হাসাহাসি, পরীক্ষার আগের রাতের ফোন কল, আর একসাথে হেঁটে ফেরা বাড়ি — এই মুহূর্তগুলোই আজও সবচেয়ে দামি স্মৃতি। 🥹",
  "যত দিন যাচ্ছে, তত বুঝছি — স্কুলজীবনের সেই সরল হাসিগুলোর কোনো বিকল্প নেই। ভালোবাসি তোমাদের সবাইকে, আজও ঠিক আগের মতোই। ❤️",
  "একসাথে ফাঁকি দেওয়া ক্লাস, একসাথে ভাগ করা টিফিন, একসাথে কাটানো ছুটির দিন — বন্ধু মানে তো এটাই। তোমরা সবাই থেকো এভাবেই, পাশে পাশে। 🌿",
  "কখনো কখনো পুরোনো গ্রুপ ফটোর দিকে তাকিয়ে থাকি অনেকক্ষণ — সময় বদলেছে, কিন্তু সেই আড্ডার আওয়াজটা কানে এখনো বাজে। মিস করি সেই দিনগুলো। 🎒",
  "স্কুলড্রেস পরা সকালগুলো, বৃষ্টিতে ভিজে স্কুলে যাওয়া, আর ক্লাসের ফাঁকে চুপিচুপি গল্প করা — এই ছোট ছোট মুহূর্তগুলোই এখন সবচেয়ে বড় সম্পদ। 🌧️",
];
function initSchoolMoment(){
  const btn = $("#momentBtn"); const out = $("#momentResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => { out.textContent = pick(SCHOOL_MOMENTS); });
}

/* ---------- জন্মদিনের শুভেচ্ছা SMS জেনারেটর ---------- */
const BIRTHDAY_WISHES = [
  "শুভ জন্মদিন, {name}! তোমার জীবনের প্রতিটা দিন হাসি আর ভালোবাসায় ভরে থাকুক। আমরা সবসময় তোমার পাশে আছি। 🎂🎉",
  "{name}, জন্মদিনের অনেক অনেক শুভেচ্ছা! ব্যাচের সবার পক্ষ থেকে দোয়া রইলো — তোমার সব স্বপ্ন পূরণ হোক। 🎈",
  "আরেকটা বছর, আরেকটা নতুন গল্পের শুরু — শুভ জন্মদিন {name}! সবসময় এভাবেই হাসিখুশি থেকো। ❤️",
  "{name}, তোমাকে ছাড়া ব্যাচটা অসম্পূর্ণ! জন্মদিনে অনেক ভালোবাসা আর শুভকামনা রইলো। শুভ জন্মদিন! 🥳",
  "শুভ জন্মদিন {name}! তোমার আজকের দিনটা হোক কেকের মতোই মিষ্টি আর স্মরণীয়। অনেক ভালোবাসা তোমার জন্য। 🎂",
  "নতুন বছরের শুরুতে {name}-এর জন্য অনেক অনেক দোয়া আর ভালোবাসা — সুস্থ থাকো, ভালো থাকো, আনন্দে থাকো। শুভ জন্মদিন! 🎁",
];
function initBirthdayWish(){
  const nameEl = $("#birthdayWishName"); const btn = $("#birthdayWishBtn"); const out = $("#birthdayWishResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const name = (nameEl.value || "").trim();
    if (!name){ out.textContent = "আগে বন্ধুর নাম বসাও।"; return; }
    out.textContent = pick(BIRTHDAY_WISHES).replaceAll("{name}", name);
  });
}

/* ---------- শতাংশ ক্যালকুলেটর ---------- */
function initPercentageCalc(){
  const valEl = $("#pctValue"), ofEl = $("#pctOf"), btn = $("#pctCalcBtn"), out = $("#pctResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const pct = parseFloat(valEl.value), of = parseFloat(ofEl.value);
    if (isNaN(pct) || isNaN(of)){ out.textContent = "দুইটা মানই বসাও।"; return; }
    const result = (pct / 100) * of;
    out.innerHTML = `<b>${of}</b>-এর <b>${pct}%</b> হলো <b>${result.toLocaleString("bn-BD", {maximumFractionDigits:2})}</b>`;
  });
}

/* ---------- তারিখের ব্যবধান ক্যালকুলেটর ---------- */
function initDateDiff(){
  const fromEl = $("#dateDiffFrom"), toEl = $("#dateDiffTo"), btn = $("#dateDiffBtn"), out = $("#dateDiffResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    if (!fromEl.value || !toEl.value){ out.textContent = "দুইটা তারিখই বসাও।"; return; }
    const from = new Date(fromEl.value), to = new Date(toEl.value);
    let diffDays = Math.round((to - from) / 86400000);
    const dir = diffDays < 0 ? "আগে ছিল" : "পরে আছে";
    diffDays = Math.abs(diffDays);
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    out.innerHTML = `মোট <b>${diffDays}</b> দিন (প্রায় ${years} বছর ${months} মাস ${days} দিন) — দ্বিতীয় তারিখটা প্রথমটার ${dir}`;
  });
}

/* ---------- মেসেঞ্জারে শেয়ার করো (জেনারিক) ---------- */
function initShareButtons(){
  const shareBtns = document.querySelectorAll(".share-btn");
  if (!shareBtns.length) return;

  // পেজ লোড হওয়ার সময় প্রতিটা টার্গেটের "খালি" স্টেট মনে রাখি, পরে তুলনা করার জন্য
  shareBtns.forEach(btn => {
    const target = document.getElementById(btn.dataset.shareTarget);
    if (target && target.dataset.emptyText === undefined){
      target.dataset.emptyText = target.textContent.trim();
    }
  });

  shareBtns.forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.shareTarget);
      if (!target) return;
      const text = (target.innerText || target.textContent || "").trim();
      if (!text || text === target.dataset.emptyText){
        alert("আগে টুলটা একবার ব্যবহার করে একটা রেজাল্ট বানাও, তারপর শেয়ার করো।");
        return;
      }
      const label = btn.dataset.shareLabel || "SSC ব্যাচ ২০১৫ টুলস";
      const shareText = `🎉 ${label} (SSC ব্যাচ ২০১৫):\n${text}\n\nতুমিও ট্রাই করো: ${location.origin}${location.pathname}#funzone`;

      let copied = false;
      try{ await navigator.clipboard.writeText(shareText); copied = true; }catch(e){ /* clipboard permission না থাকলে চুপচাপ চলবে */ }

      if (!CONFIG.MESSENGER_GROUP_URL || CONFIG.MESSENGER_GROUP_URL.startsWith("PASTE_")){
        alert(copied ? "রেজাল্ট কপি হয়ে গেছে! মেসেঞ্জার গ্রুপ লিংক এখনো config.js-এ বসানো হয়নি।" : "মেসেঞ্জার গ্রুপ লিংক এখনো সেট করা হয়নি — config.js দেখো।");
        return;
      }

      const original = btn.innerHTML;
      btn.innerHTML = copied ? "কপি হয়েছে! গ্রুপ খুলছি..." : "গ্রুপ খুলছি...";
      window.open(CONFIG.MESSENGER_GROUP_URL, "_blank", "noopener");
      setTimeout(() => { btn.innerHTML = original; }, 1800);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMemoryGame();
  initWordScramble();
  initDiceRoller();
  initCoinFlip();
  initReactionTest();
  initTypingTest();
  initQuiz();

  initGiftPairing();
  initWYR();
  initTruthOrDare();
  initFriendshipMatch();
  initIcebreaker();
  initSpinWheel();
  initNeverHaveIEver();
  initComplimentGenerator();
  initStoryPoem();
  initSchoolMoment();
  initBirthdayWish();

  initAgeCalculator();
  initBMI();
  initConverter();
  initPasswordGen();
  initStopwatch();
  initWordCounter();
  initQRGenerator();
  initCountdown();
  initPercentageCalc();
  initDateDiff();

  initShareButtons();
});
