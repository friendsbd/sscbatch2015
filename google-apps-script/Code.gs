/**
 * SSC ব্যাচ ২০১৫ ওয়েবসাইট — শেয়ার্ড ফর্ম হ্যান্ডলার
 * ------------------------------------------------------------
 * এই স্ক্রিপ্টটা friends.html-এর রেজিস্ট্রেশন ফর্ম আর tools.html-এর
 * গ্রুপ পোল — দুটো থেকেই POST রিকোয়েস্ট নিয়ে সংশ্লিষ্ট Google Sheet
 * ট্যাবে একটা নতুন row হিসেবে যোগ করে দেয়।
 *
 * কীভাবে বসাবে:
 * ১) যে Google Sheet-টা Friends ডেটার জন্য ব্যবহার করছো (config.js-এর
 *    FRIENDS_SHEET_ID), সেটা খোলো।
 * ২) মেনু থেকে Extensions → Apps Script খোলো।
 * ৩) ডিফল্ট কোড মুছে এই পুরো ফাইলটা পেস্ট করো, সেভ করো।
 * ৪) Deploy → New deployment → টাইপ বেছে নাও "Web app"।
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Deploy করো, আর অনুমতি চাইলে অনুমোদন দাও।
 * ৫) যে Web app URL পাবে সেটা assets/js/config.js-এর SUBMIT_SCRIPT_URL-এ বসাও।
 * ৬) গ্রুপ পোলের জন্য একই স্প্রেডশিটে (অথবা আলাদা একটা শিটে, তাহলে
 *    config.js-এর POLL_SHEET_ID সেই আলাদা শিটের ID বসাও) — স্ক্রিপ্ট নিজে থেকেই
 *    "PollVotes" নামের ট্যাব বানিয়ে নেবে, ম্যানুয়ালি বানানোর দরকার নেই।
 *
 * নিরাপত্তা নোট: এই এন্ডপয়েন্ট পাবলিক (Anyone) — এটা normal, কারণ পাবলিক ফর্ম
 * সাবমিশনের জন্যই এটা দরকার। Friends ডেটা তবুও Status=1 না করা পর্যন্ত
 * সাইটে পাবলিকলি দেখাবে না (friends.js দেখো)।
 */

// প্রতিটা ট্যাবের জন্য প্রত্যাশিত কলাম অর্ডার — ট্যাব প্রথমবার তৈরি হওয়ার সময় হেডার বসাতে ব্যবহার হয়
const SHEET_SCHEMAS = {
  "Friends": ["Name","Photo","Position","Location","Phone","Email","Facebook","Instagram","Whatsapp","Group","Birthday","Status","Timestamp"],
  "PollVotes": ["Name","Choice","Timestamp"],
};

function doPost(e) {
  try {
    const params = e.parameter;
    const sheetName = params.sheetName;
    if (!sheetName) {
      return jsonOut({ status: "error", message: "sheetName missing" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = SHEET_SCHEMAS[sheetName] ||
        Object.keys(params).filter(k => k !== "sheetName").concat(["Timestamp"]);
      sheet.appendRow(headers);
    }

    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    const row = headerRow.map(h => {
      const key = (h || "").toString().trim();
      if (key.toLowerCase() === "timestamp") return new Date();
      const matchKey = Object.keys(params).find(k => k.toLowerCase() === key.toLowerCase());
      return matchKey ? params[matchKey] : "";
    });

    sheet.appendRow(row);
    return jsonOut({ status: "ok" });
  } catch (err) {
    return jsonOut({ status: "error", message: err.toString() });
  }
}

function doGet(e) {
  return jsonOut({ status: "ok", message: "SSC 2015 form handler is running." });
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
