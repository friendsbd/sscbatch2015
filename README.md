# SSC ব্যাচ ২০১৫ — ওয়েবসাইট সেটআপ গাইড

সাইটটা সম্পূর্ণ রেডি। শুধু নিচের ধাপগুলো ফলো করে **`assets/js/config.js`** ফাইলে কিছু ভ্যালু বসাতে হবে — কোনো কোড লেখা লাগবে না।

---

## ধাপ ১ — Friends Google Sheet বানাও

1. একটা নতুন Google Sheet খোলো।
2. প্রথম সারিতে (header) ঠিক এই নামে কলাম বানাও (ছোট/বড় হাতের অক্ষরে সমস্যা নেই):

   | Name | Roll | Photo | Position | Location | Phone | Email | Facebook | Instagram | Whatsapp | Group |
   |---|---|---|---|---|---|---|---|---|---|---|

   - **Photo**: GitHub-এ রাখা ছবির ফাইলের নাম (যেমন `rafi.jpg`) — অথবা পুরো লিংক।
   - **Phone**: `+8801XXXXXXXXX` ফরম্যাটে দিলে SMS/Call বাটন কাজ করবে।
   - **Whatsapp**: খালি রাখলে Phone নাম্বার দিয়েই WhatsApp লিংক অটো বানিয়ে নেবে।
   - **Facebook / Instagram**: পুরো প্রোফাইল লিংক (`https://facebook.com/...`)।
   - **Group**: ঐচ্ছিক — সেকশন/শাখা (A, B, Science, Commerce...) দিলে ফিল্টার করা যাবে।
3. উপরে ডানদিকে **Share** বাটনে ক্লিক করো → **General access** কে **"Anyone with the link"** এবং role **"Viewer"** করে দাও। (এটা ছাড়া সাইট ডেটা পড়তে পারবে না)
4. শিটের URL থেকে ID কপি করো:
   `https://docs.google.com/spreadsheets/d/`**`এই লম্বা কোডটা`**`/edit`
5. নিচের ট্যাব বারে তোমার sheet-এ ক্লিক করে URL-এর শেষে `#gid=123456` — এই নাম্বারটাও কপি করো (একটামাত্র ট্যাব হলে `0` থাকবে)।

## ধাপ ২ — Events Google Sheet বানাও

আরেকটা নতুন Google Sheet বানাও, কলাম:

| EventName | Date | Time | Venue | Description | CoverImage |
|---|---|---|---|---|---|

- **Date**: অবশ্যই `YYYY-MM-DD` ফরম্যাটে (যেমন `2026-12-25`)
- **Time**: `HH:MM` (24 ঘণ্টা ফরম্যাট, যেমন `18:30`), খালি রাখলে ডিফল্ট `10:00` ধরবে
- একই নিয়মে Share → "Anyone with the link" (Viewer) করে দাও এবং Sheet ID + gid কপি করো।

## ধাপ ৩ — GitHub-এ ছবি রাখো

1. একটা GitHub repository বানাও (public হতে হবে)।
2. তার ভেতরে একটা `images` ফোল্ডার বানিয়ে সব বন্ধুর ছবি + ইভেন্টের ছবি আপলোড করো।
3. Raw base URL হবে এইরকম:
   `https://raw.githubusercontent.com/তোমার-ইউজারনেম/রিপোর-নাম/main/images/`

## ধাপ ৪ — মেমোরি গ্যালারির ছবি যোগ করো

`assets/js/gallery.js` ফাইল খোলো, `GALLERY_IMAGES` লিস্টে একেকটা ছবির জন্য একটা লাইন যোগ করো:

```js
{ src: "farewell-01.jpg", caption: "বিদায় অনুষ্ঠান, ২০১৫", tag: "Farewell" },
```

## ধাপ ৫ — EmailJS দিয়ে "সবাইকে মেইল" ফিচার চালু করো

1. [emailjs.com](https://www.emailjs.com) এ ফ্রি অ্যাকাউন্ট খোলো।
2. **Email Services** → নিজের Gmail/Outlook যোগ করে একটা **Service ID** পাবে।
3. **Email Templates** → নতুন টেমপ্লেট বানাও, ভেতরে এই ভ্যারিয়েবলগুলো ব্যবহার করো:
   - `{{to_name}}`, `{{to_email}}`, `{{subject}}`, `{{message}}`
   - Template-এর "To Email" ফিল্ডে `{{to_email}}` বসাও।
4. **Account → General** থেকে তোমার **Public Key** কপি করো।
5. এই তিনটা জিনিস — Service ID, Template ID, Public Key — বসাও `config.js` তে।

⚠️ ফ্রি EmailJS প্ল্যানে মাসে একটা লিমিট আছে (আপডেট জানতে emailjs.com-এর pricing পেজ দেখো)। ব্যাচ বড় হলে লিমিট বাড়াতে পেইড প্ল্যান লাগতে পারে।

## ধাপ ৬ — `config.js` এ সব বসাও

`assets/js/config.js` খুলে এই লাইনগুলো নিজের ভ্যালু দিয়ে বদলাও:

```js
FRIENDS_SHEET_ID: "...",
FRIENDS_SHEET_GID: "0",
EVENTS_SHEET_ID: "...",
EVENTS_SHEET_GID: "0",
GITHUB_IMAGE_BASE: "https://raw.githubusercontent.com/username/repo/main/images/",
EMAILJS_PUBLIC_KEY: "...",
EMAILJS_SERVICE_ID: "...",
EMAILJS_TEMPLATE_ID: "...",
```

## ধাপ ৭ — GitHub Pages-এ হোস্ট করো (ফ্রি)

1. পুরো ফোল্ডারটা (এই README সহ) তোমার GitHub repo-তে push করো।
2. Repo Settings → Pages → Branch: `main` → Save।
3. কিছুক্ষণ পর সাইট লাইভ হবে: `https://username.github.io/repo-name/`

---

## ফাইল স্ট্রাকচার

```
├── index.html          → হোম পেজ
├── friends.html         → বন্ধুদের ডিরেক্টরি
├── gallery.html          → স্মৃতির গ্যালারি
├── events.html            → ইভেন্ট + কাউন্টডাউন + মেইল ব্রডকাস্ট
├── assets/
│   ├── css/style.css     → পুরো ডিজাইন সিস্টেম
│   ├── js/config.js       → ⭐ এখানেই সব সেটিংস বসাও
│   ├── js/csv.js            → Google Sheet রিড করার লজিক
│   ├── js/friends.js         → বন্ধুদের প্রোফাইল রেন্ডার
│   ├── js/gallery.js          → গ্যালারি রেন্ডার (এখানে ছবি যোগ করবে)
│   ├── js/events.js            → ইভেন্ট + কাউন্টডাউন
│   ├── js/broadcast.js          → মেইল পাঠানোর লজিক
│   └── js/main.js                → নেভিগেশন হেল্পার
└── README.md
```

## সাধারণ সমস্যার সমাধান

- **"বন্ধুদের তালিকা লোড হয়নি" দেখাচ্ছে** → Sheet Share সেটিং "Anyone with the link" করা হয়েছে কিনা, আর Sheet ID/gid ঠিক আছে কিনা চেক করো।
- **ছবি দেখাচ্ছে না** → GitHub repo public কিনা, ফাইলের নাম আর সিটের Photo কলামের নাম হুবহু মিলছে কিনা (বড়/ছোট হাতের অক্ষরসহ) দেখো।
- **মেইল যাচ্ছে না** → config.js এ EmailJS-এর তিনটা key ঠিকমতো বসানো আছে কিনা, আর Friends সিটের Email কলাম ভরা আছে কিনা দেখো। ব্রাউজার Console (F12) খুললে exact এরর দেখা যাবে।
