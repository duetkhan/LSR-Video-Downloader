/* ================================
   LSR Video Downloader – Ads Core
   Adsterra + Monetag Safe Manager
================================ */

// ---------- SmartLink (Only 1 time per session) ----------
(function () {
  if (!sessionStorage.getItem("lsr_smartlink")) {
    sessionStorage.setItem("lsr_smartlink", "1");

    // Delay 12 seconds after page load
    setTimeout(() => {
      window.open(
        "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f",
        "_blank"
      );
    }, 12000);
  }
})();

// ---------- Banner Auto Refresh Helper (Safe method) ----------
function reloadAd(containerId, srcUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const script = document.createElement("script");
  script.src = srcUrl;
  script.async = true;
  container.appendChild(script);
}

// ---------- Monetag Loader (Call once per page) ----------
function loadMonetag() {
  if (window.monetagLoaded) return;
  window.monetagLoaded = true;

  const script = document.createElement("script");
  script.dataset.zone = "10519506";
  script.src = "https://nap5k.com/tag.min.js";
  script.async = true;
  document.body.appendChild(script);
}

// Auto load Monetag
window.addEventListener("load", () => {
  loadMonetag();
});
