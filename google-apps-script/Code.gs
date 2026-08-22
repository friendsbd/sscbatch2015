/**
 * SSC ব্যাচ ২০১৫ ওয়েবসাইট — শেয়ার্ড ফর্ম হ্যান্ডলার
 * ------------------------------------------------------------
 * এই স্ক্রিপ্টটা friends.html-এর রেজিস্ট্রেশন ফর্ম, tools.html-এর
 * গ্রুপ পোল, আর tools.html-এর ব্যাচ ওয়াল — তিনটা থেকেই POST রিকোয়েস্ট
 * নিয়ে সংশ্লিষ্ট Google Sheet ট্যাবে row যোগ/আপডেট করে।
 *
 * কীভাবে বসাবে:
 * ১) যে Google Sheet-টা Friends ডেটার জন্য ব্যবহার করছো (config.js-এর
 *    FRIENDS_SHEET_ID), সেটা খোলো।
 * ২) মেনু থেকে Extensions → Apps Script খোলো।
 * ৩) ডিফল্ট কোড মুছে এই পুরো ফাইলটা পেস্ট করো, সেভ করো।
 * ৪) Deploy → Manage deployments → পুরনো deployment-এর পাশে ✏️ (Edit) আইকনে
 *    ক্লিক করো → Version → "New version" সিলেক্ট করে "Deploy" করো।
 *    (এটা করলে আগের SUBMIT_SCRIPT_URL অপরিবর্তিত থাকবে, নতুন করে config.js
 *    বদলাতে হবে না। একদম নতুন deployment বানালে URL বদলে যাবে।)
 *
 * নিরাপত্তা নোট: এই এন্ডপয়েন্ট পাবলিক (Anyone) — এটা normal, কারণ পাবলিক ফর্ম
 * সাবমিশনের জন্যই এটা দরকার। Friends ডেটা তবুও Status=1 না করা পর্যন্ত
 * সাইটে পাবলিকলি দেখাবে না (friends.js দেখো)।
 */

// প্রতিটা ট্যাবের জন্য প্রত্যাশিত কলাম অর্ডার — ট্যাব প্রথমবার তৈরি হওয়ার সময় হেডার বসাতে ব্যবহার হয়
const SHEET_SCHEMAS = {
  "Friends": ["Name","Photo","Position","Location","Phone","Email","Facebook","Instagram","Whatsapp","Group","Birthday","Status","Timestamp"],
  "PollVotes": ["Name","Choice","Timestamp"],
  "Wall": ["Name","Message","Timestamp"],
  "Gallery": ["Name","PhotoUrl","Caption","Tag","Timestamp"],
};

// এই ট্যাবগুলোতে "Name" কলাম অনুযায়ী ইউনিক রাখা হবে — একই নামে দ্বিতীয়বার
// সাবমিট করলে নতুন row যোগ না হয়ে আগের row-টাই আপডেট (ওভাররাইট) হয়ে যাবে।
// এভাবে কেউ ভোট পরিবর্তন করলে Sheet-এ ডুপ্লিকেট row জমা হয় না।
const UNIQUE_BY_NAME_SHEETS = ["PollVotes"];

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

    // "Name" কলাম অনুযায়ী ইউনিক রাখতে হয় এমন শিট হলে, আগে থেকে একই নামে
    // (case-insensitive) কোনো row থাকলে সেটা খুঁজে বের করে আপডেট করি — নতুন row না।
    if (UNIQUE_BY_NAME_SHEETS.indexOf(sheetName) !== -1) {
      const nameColIdx = headerRow.findIndex(h => (h || "").toString().trim().toLowerCase() === "name");
      if (nameColIdx !== -1 && params.name) {
        const newName = params.name.toString().trim().toLowerCase();
        const lastRow = sheet.getLastRow();
        if (lastRow >= 2) {
          const existingNames = sheet.getRange(2, nameColIdx + 1, lastRow - 1, 1).getValues();
          for (let i = 0; i < existingNames.length; i++) {
            const cellName = (existingNames[i][0] || "").toString().trim().toLowerCase();
            if (cellName && cellName === newName) {
              const targetRow = i + 2; // হেডার রো ধরে অফসেট
              sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
              return jsonOut({ status: "ok", updated: true });
            }
          }
        }
      }
    }

    sheet.appendRow(row);
    return jsonOut({ status: "ok", updated: false });
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