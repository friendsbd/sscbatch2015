/* =========================================================
   REGISTER FORM (friends.html) — নিজেদের বানানো Bootstrap ফর্ম,
   কোনো Google Form embed লাগে না। সাবমিট করলে সরাসরি Apps Script
   দিয়ে FRIENDS Google Sheet-এ একটা নতুন row যোগ হয় (Status ফাঁকা থাকে,
   অ্যাডমিন ম্যানুয়ালি Status=1 করলে তবেই friends.html-এ দেখাবে)।
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const statusEl = document.getElementById("registerStatus");
  const submitBtn = document.getElementById("registerSubmitBtn");

  // ফর্মের সব ফিল্ড বাধ্যতামূলক — নাম ধরে ধরে বাংলা লেবেল, ভ্যালিডেশন এরর দেখানোর জন্য
  const REQUIRED_FIELDS = [
    ["name", "নাম"],
    ["birthday", "জন্ম তারিখ"],
    ["group", "গ্রুপ / শাখা"],
    ["position", "পেশা / অবস্থান"],
    ["location", "এলাকা"],
    ["photo", "ছবির ফাইলের নাম বা লিংক"],
    ["phone", "ফোন নম্বর"],
    ["email", "ইমেইল"],
    ["whatsapp", "WhatsApp নম্বর"],
    ["facebook", "Facebook লিংক"],
    ["instagram", "Instagram লিংক"],
  ];

  function showStatus(msg, isError){
    statusEl.style.display = "block";
    statusEl.innerHTML = msg;
    statusEl.style.borderColor = isError ? "var(--red)" : "var(--line)";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    const missing = REQUIRED_FIELDS.filter(([key]) => !data[key] || !data[key].trim());
    if (missing.length){
      showStatus(`এই তথ্যগুলো অবশ্যই দিতে হবে: <b>${missing.map(([,label]) => label).join(", ")}</b>`, true);
      const firstInput = form.querySelector(`[name="${missing[0][0]}"]`);
      if (firstInput) firstInput.focus();
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email.trim())){
      showStatus("সঠিক ইমেইল ঠিকানা দাও।", true);
      form.querySelector('[name="email"]').focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spin"></span> জমা হচ্ছে...`;

    try{
      await submitToSheet("Friends", data);
      form.reset();
      showStatus(`🎉 ধন্যবাদ, <b>${data.name}</b>! তোমার তথ্য জমা হয়ে গেছে। অ্যাডমিন রিভিউ করে অ্যাপ্রুভ করলে তোমার প্রোফাইল এই পাতায় দেখাবে।`, false);
    }catch(err){
      console.error(err);
      showStatus("দুঃখিত, জমা দেওয়া যায়নি। একটু পর আবার চেষ্টা করো, অথবা অ্যাডমিনকে জানাও।", true);
    }finally{
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-send me-1"></i> জমা দাও`;
    }
  });
});
