document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".reg-nav .nav-link").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  document.querySelectorAll(".reg-nav .nav-link").forEach(a => {
    a.addEventListener("click", () => {
      const nav = document.querySelector(".navbar-collapse");
      if (nav && nav.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
    });
  });

  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});
