/* =========================================================
   গ্যালারির ছবি এখানে যোগ করো
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
  if (!list.length){
    wrap.innerHTML = `<div class="state-msg">এখনো কোনো ছবি যোগ করা হয়নি। assets/js/gallery.js এ GALLERY_IMAGES লিস্টে ছবি যোগ করো।</div>`;
    return;
  }
  wrap.innerHTML = list.map(galleryItem).join("");
}

function populateGalleryFilter(){
  const sel = document.getElementById("galleryFilter");
  if (!sel) return;
  const tags = [...new Set(GALLERY_IMAGES.map(g => g.tag).filter(Boolean))].sort();
  tags.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.toLowerCase(); opt.textContent = t;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", () => {
    const v = sel.value;
    renderGallery(v ? GALLERY_IMAGES.filter(g => (g.tag||"").toLowerCase() === v) : GALLERY_IMAGES);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderGallery(GALLERY_IMAGES);
  populateGalleryFilter();
});
