/* =========================================================
   CONFIG — এই ফাইলটাই একমাত্র জায়গা যেখানে তোমাকে হাত দিতে হবে।
   নিচের প্রতিটা ভ্যালু বদলে নাও, তাহলেই পুরো সাইট লাইভ হয়ে যাবে।
   ========================================================= */

const CONFIG = {

  // ---------- 1) FRIENDS GOOGLE SHEET ----------
  // Google Sheet ওপেন করো -> Share -> "Anyone with the link" -> Viewer
  // URL থেকে SHEET_ID কপি করো: https://docs.google.com/spreadsheets/d/[[এইটুকু]]/edit
  // GID = নিচের ট্যাব বার-এ ওই sheet tab এ ক্লিক করলে URL এর শেষে #gid=123456 — ওই নাম্বারটা
  // ⚠️ এই sheet-এ একটা "Status" কলাম থাকতে হবে — যে রো-তে Status = 1 করবে, শুধু সেই বন্ধুর প্রোফাইল সাইটে দেখাবে
  FRIENDS_SHEET_ID: "PASTE_FRIENDS_SHEET_ID_HERE",
  FRIENDS_SHEET_GID: "0",

  // FRIENDS_REGISTER_FORM_EMBED_URL: friends.html-এর রেজিস্ট্রেশন ফর্ম (Google Form embed লিংক)।
  // এই ফর্মের Response destination সেট করবে উপরের FRIENDS_SHEET_ID-এর sheet-টাকেই — README.md-এ ধাপে ধাপে লেখা আছে।
  FRIENDS_REGISTER_FORM_EMBED_URL: "PASTE_FRIENDS_REGISTER_FORM_EMBED_URL_HERE",

  // ---------- 2) EVENTS GOOGLE SHEET ----------
  EVENTS_SHEET_ID: "PASTE_EVENTS_SHEET_ID_HERE",
  EVENTS_SHEET_GID: "0",

  // ---------- 3) GITHUB IMAGE BASE ----------
  // তোমার GitHub রিপোর সব ছবি যে ফোল্ডারে রাখবে তার raw base URL।
  // যেমন: https://raw.githubusercontent.com/username/reponame/main/images/
  // এরপর Sheet এর "Photo" কলামে শুধু ফাইলের নাম দিলেই চলবে (e.g. rafi.jpg)
  // অথবা Sheet এ পুরো লিংক দিলে এটা লাগবে না, কোডে auto-detect হয়ে যাবে।
  GITHUB_IMAGE_BASE: "https://raw.githubusercontent.com/USERNAME/REPO/main/images/",

  // ---------- 4) EMAILJS (মেইল পাঠানোর জন্য) ----------
  // https://www.emailjs.com -> ফ্রি অ্যাকাউন্ট খুলে Service + Template বানাও
  // README.md এ ধাপে ধাপে লেখা আছে
  EMAILJS_PUBLIC_KEY: "PASTE_EMAILJS_PUBLIC_KEY",
  EMAILJS_SERVICE_ID: "PASTE_EMAILJS_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "PASTE_EMAILJS_TEMPLATE_ID",

  // ---------- 5) BATCH META (হোমপেজের হেডলাইন/স্ট্যাট) ----------
  BATCH_NAME: "SSC ব্যাচ ২০১৫",
  SCHOOL_NAME: "তোমার স্কুলের নাম এখানে বসাও",
  TAGLINE: "একই বেঞ্চ, একই মাঠ, একই দুষ্টুমি — আজও একই আমরা।",

  // ---------- 6) NOTICE BOARD SHEET (ঐচ্ছিক টুল) ----------
  // কলাম: Title | Message | Date | Pinned (yes/no খালি রাখলে চলবে)
  NOTICES_SHEET_ID: "PASTE_NOTICES_SHEET_ID_HERE",
  NOTICES_SHEET_GID: "0",

  // ---------- 7) ফান্ড ট্র্যাকার SHEET (ঐচ্ছিক টুল) ----------
  // কলাম: Name | Amount | Note | Date
  FUND_SHEET_ID: "PASTE_FUND_SHEET_ID_HERE",
  FUND_SHEET_GID: "0",
  FUND_GOAL: 50000, // টার্গেট এমাউন্ট (টাকা) — প্রগ্রেস বার এই সংখ্যা অনুযায়ী দেখাবে
  FUND_INFO: "ব্যাচ রিইউনিয়ন, বিপদে-আপদে বন্ধুর পাশে দাঁড়ানো আর ছোটখাটো ব্যাচ-খরচের জন্য এই ফান্ড। কে কত দিয়েছে সেটা শুধু এখানে হিসাব হিসেবে দেখানো হয় — টাকা পাঠানো হয় bKash/Nagad/হাতে হাতে, নিজেদের মধ্যে; ওয়েবসাইট শুধু স্বচ্ছতার জন্য হিসাবটা সবাইকে দেখায়।", // ফান্ড সেকশনের উপরে এই লেখাটা দেখাবে, চাইলে বদলে নাও

  // ---------- 8) গেস্টবুক / মেসেজ ওয়াল (ঐচ্ছিক টুল) ----------
  // একটা Google Form বানাও (Name + Message ফিল্ড) — Form Responses শিট থেকে পড়া হবে
  GUESTBOOK_FORM_EMBED_URL: "PASTE_GOOGLE_FORM_EMBED_URL_HERE", // Form -> Send -> <> এম্বেড লিংক
  GUESTBOOK_SHEET_ID: "PASTE_GUESTBOOK_RESPONSES_SHEET_ID_HERE", // ওই Form-এর Responses শিট
  GUESTBOOK_SHEET_GID: "0",

  // ---------- 9) কমিউনিটি লিংক (ঐচ্ছিক) ----------
  WHATSAPP_GROUP_URL: "", // যেমন: https://chat.whatsapp.com/xxxxxxx
  FACEBOOK_GROUP_URL: "", // যেমন: https://facebook.com/groups/xxxxxxx
  TELEGRAM_GROUP_URL: "", // যেমন: https://t.me/xxxxxxx

  // ---------- 10) সাইট ক্রেডিট ----------
  CREDIT_NAME: "Engr. Prothes",
  CREDIT_URL: "https://prothesbarai.github.io",
};



/* ---------- Helper: Google Sheet -> CSV URL (গোপন কোনো API key লাগে না) ---------- */
function sheetCsvUrl(sheetId, gid){
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

const FRIENDS_CSV_URL   = sheetCsvUrl(CONFIG.FRIENDS_SHEET_ID, CONFIG.FRIENDS_SHEET_GID);
const EVENTS_CSV_URL    = sheetCsvUrl(CONFIG.EVENTS_SHEET_ID, CONFIG.EVENTS_SHEET_GID);
const NOTICES_CSV_URL   = sheetCsvUrl(CONFIG.NOTICES_SHEET_ID, CONFIG.NOTICES_SHEET_GID);
const FUND_CSV_URL      = sheetCsvUrl(CONFIG.FUND_SHEET_ID, CONFIG.FUND_SHEET_GID);
const GUESTBOOK_CSV_URL = sheetCsvUrl(CONFIG.GUESTBOOK_SHEET_ID, CONFIG.GUESTBOOK_SHEET_GID);

/* ---------- Helper: resolve an image field to a real URL ---------- */
function resolveImage(value, fallbackSeed){
  if (!value || !value.trim()){
    // ছবি না থাকলে initials দিয়ে placeholder বানাই
    const seed = encodeURIComponent(fallbackSeed || "Friend");
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundType=solid&backgroundColor=ece2c8&fontFamily=Georgia`;
  }
  value = value.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return CONFIG.GITHUB_IMAGE_BASE.replace(/\/$/, "") + "/" + value.replace(/^\//, "");
}
