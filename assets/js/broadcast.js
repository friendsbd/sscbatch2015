/* =========================================================
   BROADCAST — এক ক্লিকেই সব বন্ধুকে মেইল
   EmailJS ব্যবহার করে (কোনো নিজস্ব সার্ভার লাগে না)
   README.md এ EmailJS সেটআপের ধাপগুলো লেখা আছে
   ========================================================= */

let emailjsReady = false;

function initEmailJS(){
  if (typeof emailjs === "undefined") return;
  if (CONFIG.EMAILJS_PUBLIC_KEY.startsWith("PASTE_")) return;
  emailjs.init({ publicKey: CONFIG.EMAILJS_PUBLIC_KEY });
  emailjsReady = true;
}

function logLine(msg, type=""){
  const log = document.getElementById("broadcastLog");
  const line = document.createElement("div");
  line.textContent = msg;
  if (type === "err") line.style.color = "#e08a80";
  if (type === "ok") line.style.color = "#9fd6ac";
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

async function sendBroadcast(){
  const subject = document.getElementById("bSubject").value.trim();
  const message = document.getElementById("bMessage").value.trim();
  const btn = document.getElementById("sendBroadcastBtn");
  const log = document.getElementById("broadcastLog");
  log.innerHTML = "";

  if (!subject || !message){
    logLine("সাবজেক্ট আর মেসেজ দুটোই লিখতে হবে।", "err");
    return;
  }
  if (!emailjsReady){
    logLine("EmailJS এখনো কনফিগার করা হয়নি। assets/js/config.js এ EMAILJS_* ভ্যালুগুলো বসাও। README.md দেখো।", "err");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="spin"></span> পাঠানো হচ্ছে...`;

  try{
    logLine("বন্ধুদের তালিকা লোড হচ্ছে...");
    const rows = await loadFriendsData();
    const recipients = rows.filter(r => r.email && r.email.includes("@"));

    if (!recipients.length){
      logLine("কোনো ইমেইল পাওয়া যায়নি — Friends শিটে 'Email' কলাম চেক করো।", "err");
      btn.disabled = false; btn.innerHTML = `<i class="bi bi-send me-1"></i> সবাইকে পাঠাও`;
      return;
    }

    logLine(`মোট ${recipients.length} জনকে পাঠানো শুরু হচ্ছে...`);
    let sent = 0, failed = 0;

    for (const r of recipients){
      try{
        await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
          to_email: r.email,
          to_name: r.name || "বন্ধু",
          subject: subject,
          message: message,
        });
        sent++;
        logLine(`✓ পাঠানো হলো — ${r.name || r.email}`, "ok");
      }catch(e){
        failed++;
        logLine(`✗ ব্যর্থ — ${r.name || r.email}`, "err");
      }
    }
    logLine(`শেষ। সফল: ${sent}, ব্যর্থ: ${failed}`, sent ? "ok" : "err");
  }catch(err){
    console.error(err);
    logLine("কিছু একটা ভুল হয়েছে। কনসোল চেক করো।", "err");
  }finally{
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-send me-1"></i> সবাইকে পাঠাও`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initEmailJS();
  const btn = document.getElementById("sendBroadcastBtn");
  if (btn) btn.addEventListener("click", sendBroadcast);
});
