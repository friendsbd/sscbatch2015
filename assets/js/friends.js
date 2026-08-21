/* =========================================================
   FRIENDS PAGE
   Expected Google Sheet columns (header row, নাম case-insensitive):
   Name | Roll | Photo | Position | Location | Phone | Email |
   Facebook | Instagram | Whatsapp | Group
   ( Whatsapp খালি থাকলে Phone নাম্বার দিয়ে auto wa.me লিংক বানানো হবে )
   ========================================================= */

let ALL_FRIENDS = [];

function waLink(phone){
  if(!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
  return `https://wa.me/${digits.replace(/^\+/, "")}`;
}

function smsLink(phone){
  if(!phone) return null;
  return `sms:${phone.replace(/\s/g,"")}`;
}

function friendCard(f, idx){
  const name = f.name || "নাম নেই";
  const roll = f.roll ? `রোল #${f.roll}` : `#${String(idx+1).padStart(3,"0")}`;
  const photo = resolveImage(f.photo, name);
  const wa = f.whatsapp ? waLink(f.whatsapp) : waLink(f.phone);
  const sms = f.phone ? smsLink(f.phone) : null;

  const links = [];
  if (sms) links.push(`<a href="${sms}" title="SMS পাঠাও" aria-label="SMS ${name}"><i class="bi bi-chat-dots"></i></a>`);
  if (wa) links.push(`<a href="${wa}" target="_blank" rel="noopener" title="WhatsApp" aria-label="WhatsApp ${name}"><i class="bi bi-whatsapp"></i></a>`);
  if (f.facebook) links.push(`<a href="${f.facebook}" target="_blank" rel="noopener" title="Facebook" aria-label="Facebook ${name}"><i class="bi bi-facebook"></i></a>`);
  if (f.instagram) links.push(`<a href="${f.instagram}" target="_blank" rel="noopener" title="Instagram" aria-label="Instagram ${name}"><i class="bi bi-instagram"></i></a>`);
  if (f.email) links.push(`<a href="mailto:${f.email}" title="ইমেইল" aria-label="Email ${name}"><i class="bi bi-envelope"></i></a>`);
  if (f.phone) links.push(`<a href="tel:${f.phone}" title="কল করো" aria-label="Call ${name}"><i class="bi bi-telephone"></i></a>`);

  return `
  <div class="col-sm-6 col-lg-4 col-xl-3 friend-col" data-name="${(name+" "+(f.position||"")+" "+(f.location||"")+" "+(f.group||"")).toLowerCase()}" data-group="${(f.group||"").toLowerCase()}">
    <div class="id-card">
      <div class="roll mono">${roll}${f.group ? ` <span class="badge-group ms-1">${f.group}</span>` : ""}</div>
      <div class="photo-wrap">
        <img src="${photo}" alt="${name} এর ছবি" loading="lazy"
             onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ece2c8'">
        <div class="corner"></div>
      </div>
      <h3>${name}</h3>
      ${f.position ? `<div class="role">${f.position}</div>` : ""}
      ${f.location ? `<div class="loc"><i class="bi bi-geo-alt"></i> ${f.location}</div>` : `<div class="loc">&nbsp;</div>`}
      <div class="contact-row">${links.join("") || `<span class="text-muted small">যোগাযোগের তথ্য নেই</span>`}</div>
    </div>
  </div>`;
}

function renderFriends(list){
  const grid = document.getElementById("friendsGrid");
  if (!list.length){
    grid.innerHTML = `<div class="state-msg col-12">কোনো বন্ধু পাওয়া যায়নি। খোঁজ পাল্টে দেখো।</div>`;
    return;
  }
  grid.innerHTML = list.map(friendCard).join("");
}

function applyFilters(){
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  const group = document.getElementById("groupFilter").value.toLowerCase();
  const filtered = ALL_FRIENDS.filter(f => {
    const hay = (f.name+" "+(f.position||"")+" "+(f.location||"")+" "+(f.group||"")).toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchG = !group || (f.group||"").toLowerCase() === group;
    return matchQ && matchG;
  });
  document.getElementById("resultCount").textContent = filtered.length;
  renderFriends(filtered);
}

function populateGroupFilter(list){
  const sel = document.getElementById("groupFilter");
  const groups = [...new Set(list.map(f => f.group).filter(Boolean))].sort();
  groups.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g; opt.textContent = g;
    sel.appendChild(opt);
  });
}

// শুধু ডেটা লোড করে (কোনো friends.html-specific DOM ধরে না) — অন্য পেজ থেকেও নিরাপদে কল করা যায়
async function loadFriendsData(){
  if (ALL_FRIENDS.length) return ALL_FRIENDS;
  const rows = await fetchSheet(FRIENDS_CSV_URL);
  ALL_FRIENDS = rows.filter(r => r.name);
  return ALL_FRIENDS;
}

async function initFriends(){
  const grid = document.getElementById("friendsGrid");
  if (!grid) { // এই পেজটা friends.html না — শুধু ডেটা লোড করে রাখো (যেমন events.html-এর broadcast panel-এর জন্য)
    loadFriendsData().catch(err => console.error("Friends data load failed:", err));
    return;
  }
  try{
    await loadFriendsData();
    document.getElementById("totalFriends").textContent = ALL_FRIENDS.length;
    document.getElementById("resultCount").textContent = ALL_FRIENDS.length;
    populateGroupFilter(ALL_FRIENDS);
    renderFriends(ALL_FRIENDS);
    document.getElementById("searchInput").addEventListener("input", applyFilters);
    document.getElementById("groupFilter").addEventListener("change", applyFilters);
  }catch(err){
    console.error(err);
    grid.innerHTML = `<div class="state-msg col-12">
      শিটটা এখনো লোড করা যায়নি। <br>
      ১) Google Sheet Share → "Anyone with the link" (Viewer) করা আছে কিনা দেখো।<br>
      ২) assets/js/config.js এ FRIENDS_SHEET_ID ঠিকমতো বসিয়েছো কিনা দেখো।
    </div>`;
  }
}

document.addEventListener("DOMContentLoaded", initFriends);
