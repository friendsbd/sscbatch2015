/* =========================================================
   ফান-জোন — মজার টুলস + ছোট্ট গেম
   সবগুলোই সম্পূর্ণ ব্রাউজারে চলে, কোনো Google Sheet বা config লাগে না
   (শুধু র‍্যান্ডম ফ্রেন্ড পিকার friends.html-এর approved বন্ধুদের লিস্ট ব্যবহার করে)
   ========================================================= */

/* ---------- ১) র‍্যান্ডম ফ্রেন্ড পিকার ---------- */
async function initFunPicker(){
  const btn = document.getElementById("funPickBtn");
  const out = document.getElementById("funPickResult");
  if (!btn || !out) return;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    out.textContent = "খোঁজা হচ্ছে...";
    try{
      const list = (typeof loadFriendsData === "function") ? await loadFriendsData() : [];
      if (!list.length){
        out.textContent = "এখনো কোনো approved বন্ধুর তথ্য পাওয়া যায়নি — Friends sheet-এ কারো Status 1 আছে কিনা দেখো।";
        return;
      }
      // ছোট্ট সাসপেন্স অ্যানিমেশন
      let i = 0;
      const spin = setInterval(() => {
        out.textContent = "🎲 " + list[Math.floor(Math.random() * list.length)].name;
        i++;
        if (i > 10){
          clearInterval(spin);
          const winner = list[Math.floor(Math.random() * list.length)];
          out.innerHTML = `🎉 আজকের বেছে নেওয়া বন্ধু: <b>${winner.name}</b>`;
        }
      }, 80);
    }catch(e){
      out.textContent = "বন্ধুদের তালিকা লোড করা যায়নি।";
    }finally{
      setTimeout(() => { btn.disabled = false; }, 900);
    }
  });
}

/* ---------- ২) মজার খেতাব জেনারেটর ---------- */
const FUN_TITLE_ADJ = [
  "অফিসিয়াল", "লিজেন্ডারি", "আন্ডারকভার", "প্রফেশনাল", "চিরন্তন",
  "ক্লাসের", "গ্রুপ চ্যাটের", "না-জাগা", "সবচেয়ে চুপচাপ", "সবচেয়ে হাসিখুশি"
];
const FUN_TITLE_ROLE = [
  "লেট-লতিফ ধ্রুবতারা", "ঘুমকাতুরে চ্যাম্পিয়ন", "ফাঁকিবাজ ইঞ্জিনিয়ার",
  "নোট-চোর কিংবদন্তি", "মিম শেয়ারিং মন্ত্রী", "টিফিন হাইজ্যাকার",
  "লাস্ট বেঞ্চের ফিলোজফার", "গ্রুপ ফটোর ব্লিংকার", "হোমওয়ার্ক ভুলে যাওয়া বিশেষজ্ঞ",
  "সারাক্ষণ ক্ষুধার্ত বন্ধু"
];

function initFunTitle(){
  const btn = document.getElementById("funTitleBtn");
  const out = document.getElementById("funTitleResult");
  if (!btn || !out) return;
  btn.addEventListener("click", () => {
    const adj = FUN_TITLE_ADJ[Math.floor(Math.random() * FUN_TITLE_ADJ.length)];
    const role = FUN_TITLE_ROLE[Math.floor(Math.random() * FUN_TITLE_ROLE.length)];
    out.innerHTML = `আজকের খেতাব: <b>"${adj} ${role}"</b> 🏅`;
  });
}

/* ---------- ৩) রক-পেপার-সিজার্স ---------- */
function initRPS(){
  const buttons = document.querySelectorAll(".rps-btn");
  const out = document.getElementById("rpsResult");
  const winEl = document.getElementById("rpsWin");
  const loseEl = document.getElementById("rpsLose");
  if (!buttons.length || !out) return;

  const emoji = { rock: "🪨", paper: "📄", scissors: "✂️" };
  const label = { rock: "পাথর", paper: "কাগজ", scissors: "কাঁচি" };
  let wins = 0, losses = 0;

  buttons.forEach(b => {
    b.addEventListener("click", () => {
      const choices = ["rock", "paper", "scissors"];
      const you = b.dataset.choice;
      const cpu = choices[Math.floor(Math.random() * 3)];
      let result;
      if (you === cpu) result = "ড্র";
      else if (
        (you === "rock" && cpu === "scissors") ||
        (you === "paper" && cpu === "rock") ||
        (you === "scissors" && cpu === "paper")
      ){ result = "তুমি জিতেছো! 🎉"; wins++; }
      else { result = "কম্পিউটার জিতেছে 😅"; losses++; }

      out.innerHTML = `তুমি: ${emoji[you]} ${label[you]} &nbsp;বনাম&nbsp; কম্পিউটার: ${emoji[cpu]} ${label[cpu]}<br><b>${result}</b>`;
      if (winEl) winEl.textContent = wins;
      if (loseEl) loseEl.textContent = losses;
    });
  });
}

/* ---------- ৪) টিক-ট্যাক-টো (লোকাল দুইজন) ---------- */
function initTicTacToe(){
  const board = document.getElementById("tttBoard");
  const status = document.getElementById("tttStatus");
  const resetBtn = document.getElementById("tttReset");
  if (!board || !status) return;

  let cells = Array(9).fill("");
  let turn = "X";
  let over = false;

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinner(){
    for (const line of WIN_LINES){
      const [a,b,c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    }
    if (cells.every(c => c)) return "draw";
    return null;
  }

  function render(){
    board.innerHTML = cells.map((c, idx) =>
      `<button class="ttt-cell" data-idx="${idx}" ${c ? "disabled" : ""}>${c}</button>`
    ).join("");
    board.querySelectorAll(".ttt-cell").forEach(cell => {
      cell.addEventListener("click", onCellClick);
    });
  }

  function onCellClick(e){
    if (over) return;
    const idx = Number(e.currentTarget.dataset.idx);
    if (cells[idx]) return;
    cells[idx] = turn;
    const winner = checkWinner();
    if (winner){
      over = true;
      status.innerHTML = winner === "draw" ? "ড্র হয়েছে! 🤝" : `🎉 <b>${winner}</b> জিতেছে!`;
    } else {
      turn = turn === "X" ? "O" : "X";
      status.textContent = `এখন ${turn}-এর পালা`;
    }
    render();
  }

  function reset(){
    cells = Array(9).fill("");
    turn = "X";
    over = false;
    status.textContent = "শুরু করো — এখন X-এর পালা";
    render();
  }

  if (resetBtn) resetBtn.addEventListener("click", reset);
  reset();
}

document.addEventListener("DOMContentLoaded", () => {
  initFunPicker();
  initFunTitle();
  initRPS();
  initTicTacToe();
});
