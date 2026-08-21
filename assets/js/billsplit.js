/* =========================================================
   বিল ভাগাভাগি ক্যালকুলেটর — সম্পূর্ণ ব্রাউজারে চলে, কোনো শিট লাগে না
   রিইউনিয়ন/পিকনিকের খরচ কয়জনের মধ্যে ভাগ হবে হিসাব করার জন্য
   ========================================================= */

function calcSplit(){
  const total = parseFloat(document.getElementById("splitTotal").value) || 0;
  const people = parseInt(document.getElementById("splitPeople").value) || 0;
  const extra = parseFloat(document.getElementById("splitExtra").value) || 0;
  const resultBox = document.getElementById("splitResult");

  if (total <= 0 || people <= 0){
    resultBox.style.display = "none";
    return;
  }

  const grand = total + extra;
  const perHead = grand / people;

  resultBox.style.display = "block";
  resultBox.innerHTML = `
    <b class="mono">৳${perHead.toLocaleString("bn-BD", {maximumFractionDigits:2})}</b>
    <span>জনপ্রতি (${people} জনের মধ্যে ৳${grand.toLocaleString("bn-BD")} ভাগ করে)</span>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("splitCalcBtn");
  if (!btn) return;
  ["splitTotal","splitPeople","splitExtra"].forEach(id => {
    document.getElementById(id).addEventListener("input", calcSplit);
  });
  btn.addEventListener("click", calcSplit);
});
