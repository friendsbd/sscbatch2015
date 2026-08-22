/* =========================================================
   গ্যালারি — দুই সোর্স থেকে ছবি আসে:
   ১) GALLERY_IMAGES — নিচের লিস্টে সরাসরি কোড এডিট করে যোগ করা যায় (ঐচ্ছিক)
   ২) Google Sheet "Gallery" ট্যাব — বন্ধুরা নিজেরাই এই পাতার ফর্ম দিয়ে
      Google Drive/imgbb/GitHub raw লিংক পেস্ট করে ছবি যোগ করতে পারে,
      কোনো কোড এডিট করা লাগে না। config.js-এ GALLERY_SHEET_ID/GID বসাতে হবে।
   src: GitHub raw লিংক দিতে পারো, অথবা শুধু ফাইলের নাম দিলে
        config.js এর GITHUB_IMAGE_BASE ফোল্ডার থেকে auto যুক্ত হবে
   caption: ছবির নিচে যা লেখা দেখাবে (ঐচ্ছিক)
   tag: ফিল্টার করার জন্য যেকোনো ক্যাটাগরি — যেমন "Farewell", "Picnic", "Reunion 2024"
   ========================================================= */

const GALLERY_IMAGES = [
  // { src: "farewell-01.jpg", caption: "বিদায় অনুষ্ঠান, ২০১৫", tag: "Farewell" },
  // { src: "picnic-2019-02.jpg", caption: "পিকনিক — গাজীপুর, ২০১৯", tag: "Picnic" },
  // { src: "https://raw.githubusercontent.com/USERNAME/REPO/main/images/reunion-05.jpg", caption: "পুনর্মিলনী ২০২৪", tag: "Reunion" },
];

let GALLERY_ALL = []; // static + sheet মিলিয়ে যা রেন্ডার হচ্ছে, ফিল্টারের জন্য মনে রাখা হয়

function galleryItem(img){
  const src = resolveImage(img.src, img.caption || "Memory");
  return `
    <div class="gal-item" data-tag="${(img.tag||"").toLowerCase()}">
      <img src="${src}" alt="${img.caption || "স্মৃতি"}" loading="lazy">
      ${img.caption ? `<div class="cap">${img.caption}</div>` : ""}
    </div>`;
}

function renderGallery(list){
  const wrap = document.getElementById("galleryGrid");
  if (!wrap) return;
  if (!list.length){
    wrap.innerHTML = `<div class="state-msg">এখনো কোনো ছবি যোগ করা হয়নি। উপরের ফর্ম দিয়ে ছবি যোগ করো ।</div>`;
    return;
  }
  wrap.innerHTML = list.map(galleryItem).join("");
}

function populateGalleryFilter(){
  const sel = document.getElementById("galleryFilter");
  if (!sel) return;
  sel.innerHTML = `<option value="">সব ছবি</option>`;
  const tags = [...new Set(GALLERY_ALL.map(g => g.tag).filter(Boolean))].sort();
  tags.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.toLowerCase(); opt.textContent = t;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", () => {
    const v = sel.value;
    renderGallery(v ? GALLERY_ALL.filter(g => (g.tag||"").toLowerCase() === v) : GALLERY_ALL);
  });
}

/* Google Sheet-এর "Gallery" ট্যাব থেকে বন্ধুদের যোগ করা ছবি লোড করা */
async function loadSheetGalleryImages(){
  try{
    const rows = await fetchSheet(GALLERY_CSV_URL);
    return rows
      .filter(r => r.photourl)
      .reverse() // সর্বশেষ যোগ করা ছবি আগে দেখাবে
      .map(r => ({
        src: resolveImageLink(r.photourl),
        caption: r.caption || r.name || "",
        tag: r.tag || "",
      }));
  }catch(e){
    console.warn("Gallery sheet এখনো লোড করা যায়নি:", e);
    return [];
  }
}

async function initGallery(){
  const wrap = document.getElementById("galleryGrid");
  if (wrap) wrap.innerHTML = `<div class="state-msg"><span class="spin"></span> ছবি লোড হচ্ছে...</div>`;
  const sheetImages = await loadSheetGalleryImages();
  GALLERY_ALL = [...sheetImages, ...GALLERY_IMAGES];
  renderGallery(GALLERY_ALL);
  populateGalleryFilter();
}

/* বন্ধুরা নিজে ছবি যোগ করার ফর্ম — wall.html-এর ফর্মের মতোই সরাসরি Sheet-এ লেখে */
function initGalleryUploadForm(){
  const form = document.getElementById("galleryUploadForm");
  if (!form) return;

  const statusEl = document.getElementById("galleryUploadStatus");
  const submitBtn = document.getElementById("galleryUploadBtn");

  function showStatus(msg, isError){
    statusEl.style.display = "block";
    statusEl.innerHTML = msg;
    statusEl.style.borderColor = isError ? "var(--red)" : "var(--line)";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.name = (data.name || "").trim();
    data.photourl = (data.photourl || data.photoUrl || "").trim();
    data.caption = (data.caption || "").trim();
    data.tag = (data.tag || "").trim();

    if (!data.name || !data.photourl){
      showStatus("নাম আর ছবির লিংক — দুটোই লাগবে।", true);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spin"></span> যোগ হচ্ছে...`;

    try{
      // Apps Script header case-insensitive ম্যাচ করে, তাই "PhotoUrl" কী নামে পাঠানো হচ্ছে
      await submitToSheet("Gallery", {
        Name: data.name,
        PhotoUrl: data.photourl,
        Caption: data.caption,
        Tag: data.tag,
      });

      // অপটিমিস্টিক আপডেট — রিফ্রেশ ছাড়াই নতুন ছবিটা সাথে সাথে গ্যালারির উপরে দেখানো হয়
      const newItem = {
        src: resolveImageLink(data.photourl),
        caption: data.caption || data.name,
        tag: data.tag,
      };
      GALLERY_ALL = [newItem, ...GALLERY_ALL];
      renderGallery(GALLERY_ALL);
      populateGalleryFilter();

      form.reset();
      showStatus(`🎉 ছবি যোগ হয়ে গেছে, ধন্যবাদ <b>${data.name}</b>!`, false);
    }catch(err){
      console.error(err);
      showStatus("দুঃখিত, ছবি যোগ করা যায়নি। একটু পর আবার চেষ্টা করো।", true);
    }finally{
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-cloud-upload me-1"></i> ছবি যোগ করো`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initGallery();
  initGalleryUploadForm();
});
