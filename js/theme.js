/* ============================================================
   AREZ Music Player (AMP) — theme controller
   Toggles Dark/Light and persists the choice.
   ============================================================ */

(function () {
  const STORAGE_KEY = "amp-theme";
  const root = document.documentElement;

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "light" ? "#f4f5f8" : "#0f1115");
    }
  }

  // Initialise from saved preference or system setting.
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") {
    apply(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    apply("light");
  }

  window.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  });
})();
