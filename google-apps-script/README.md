# ফর্ম হ্যান্ডলার সেটআপ (Apps Script)

এই ফোল্ডারের `Code.gs` ফাইলটা দুটো জিনিস চালায়:

1. `friends.html` — নিজেদের বানানো রেজিস্ট্রেশন ফর্ম → **Friends** শিট ট্যাব
2. `tools.html` — গ্রুপ পোল ভোট → **PollVotes** শিট ট্যাব

## ধাপে ধাপে

1. তোমার Friends Google Sheet-টা খোলো (যেটার ID `config.js`-এ `FRIENDS_SHEET_ID`-এ বসানো আছে)।
2. মেনু থেকে **Extensions → Apps Script**।
3. খালি প্রজেক্টের কোড মুছে `Code.gs`-এর পুরো কনটেন্ট পেস্ট করো, তারপর সেভ (Ctrl/Cmd+S)।
4. উপরে ডানদিকে **Deploy → New deployment**।
   - Select type → **Web app**
   - Execute as → **Me**
   - Who has access → **Anyone**
   - **Deploy** করো, Google অনুমতি চাইলে অনুমোদন দাও।
5. যে **Web app URL** পাবে (একদম শেষে `/exec` দিয়ে শেষ হয়) — সেটা কপি করে
   `assets/js/config.js`-এর `SUBMIT_SCRIPT_URL`-এ বসাও।
6. `Friends` ট্যাবে যদি আগে থেকে হেডার রো না থাকে, প্রথম সাবমিশনেই স্ক্রিপ্ট
   নিজে থেকে হেডার বসিয়ে দেবে (Name, Photo, Position, Location, Phone,
   Email, Facebook, Instagram, Whatsapp, Group, Birthday, Status, Timestamp)।
7. গ্রুপ পোলের জন্য আলাদা কিছু বানাতে হবে না — প্রথম ভোটেই "PollVotes" ট্যাব
   অটো তৈরি হয়ে যাবে একই স্প্রেডশিটে। যদি পোলের জন্য আলাদা শিট চাও, তাহলে
   সেই শিটে আলাদাভাবে এই একই স্ক্রিপ্ট ডিপ্লয় করো আর `config.js`-এর
   `POLL_SHEET_ID` ওই শিটের ID বসাও।

## টেস্ট করবে কীভাবে

- `friends.html` পাতায় গিয়ে রেজিস্ট্রেশন ফর্মটা একবার নিজে পূরণ করে সাবমিট করো।
- Sheet-এ গিয়ে দেখো নতুন row যোগ হয়েছে কিনা।
- Status কলামে `1` বসিয়ে দাও — কিছুক্ষণের মধ্যে `friends.html`-এ প্রোফাইল কার্ড দেখা যাবে।
- একইভাবে `tools.html`-এর গ্রুপ পোলে ভোট দিয়ে "PollVotes" ট্যাবে চেক করো।

## সাধারণ সমস্যা

- **সাবমিট করলে কিছু হয় না / এরর দেখায়** → `SUBMIT_SCRIPT_URL` ঠিকমতো বসানো
  হয়েছে কিনা, আর Deploy করার সময় "Who has access: Anyone" সিলেক্ট করা হয়েছে
  কিনা চেক করো।
- **নতুন ডেটা Sheet-এ যাচ্ছে না** → Apps Script-এ Deploy → Manage deployments →
  ঠিক Web app deployment active আছে কিনা দেখো (কোড বদলালে "New version"
  বানিয়ে redeploy করতে হয়)।
