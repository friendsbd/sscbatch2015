document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".reg-nav .nav-link").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  document.querySelectorAll(".reg-nav .nav-link").forEach(a => {
    a.addEventListener("click", (e) => {
      const nav = document.querySelector(".navbar-collapse");
      if (nav && nav.classList.contains("show")) {
        bootstrap.Collapse.getOrCreateInstance(nav).hide();
      }
      // Same page as the one we're already on: the browser won't navigate
      // (identical URL), so nothing would happen. Scroll to top instead.
      if (a.getAttribute("href") === path) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});
