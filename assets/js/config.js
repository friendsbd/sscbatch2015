/* =========================================================
   CONFIG — এই ফাইলটাই একমাত্র জায়গা যেখানে তোমাকে হাত দিতে হবে।
   নিচের প্রতিটা ভ্যালু বদলে নাও, তাহলেই পুরো সাইট লাইভ হয়ে যাবে।
   ========================================================= */

const CONFIG = {

  // ---------- 1) FRIENDS GOOGLE SHEET ----------
  // Google Sheet ওপেন করো -> Share -> "Anyone with the link" -> Viewer
  // URL থেকে SHEET_ID কপি করো: https://docs.google.com/spreadsheets/d/[[এইটুকু]]/edit
  // GID = নিচের ট্যাব বার-এ ওই sheet tab এ ক্লিক করলে URL এর শেষে #gid=123456 — ওই নাম্বারটা
  FRIENDS_SHEET_ID: "PASTE_FRIENDS_SHEET_ID_HERE",
  FRIENDS_SHEET_GID: "0",

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
};

/* ---------- Helper: Google Sheet -> CSV URL (গোপন কোনো API key লাগে না) ---------- */
function sheetCsvUrl(sheetId, gid){
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

const FRIENDS_CSV_URL = sheetCsvUrl(CONFIG.FRIENDS_SHEET_ID, CONFIG.FRIENDS_SHEET_GID);
const EVENTS_CSV_URL  = sheetCsvUrl(CONFIG.EVENTS_SHEET_ID, CONFIG.EVENTS_SHEET_GID);

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
