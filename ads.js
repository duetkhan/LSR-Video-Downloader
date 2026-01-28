/* ==================================================
   LSR Video Downloader – Ads Master Controller
   Adsterra + Monetag Full Integration
   Safe SmartLink + Auto Load Banners
================================================== */

/* ========== CONFIG ========== */
const SMARTLINK_URL = "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f";
const MONETAG_ZONE = "10519506";

// ==============================
// Monetag Loader (auto load after 3s)
// ==============================
function loadMonetag() {
  if (window.monetagLoaded) return;
  window.monetagLoaded = true;

  const script = document.createElement("script");
  script.dataset.zone = MONETAG_ZONE;
  script.src = "https://nap5k.com/tag.min.js";
  script.async = true;
  document.body.appendChild(script);

  console.log("Monetag Loaded");
}

// ==============================
// Adsterra Banner Loader
// ==============================
function loadAdsterra(containerId, scriptSrc) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const s = document.createElement("script");
  s.src = scriptSrc;
  s.async = true;
  container.appendChild(s);
}

// ==============================
// SmartLink (Click-only)
// ==============================
function openSmartLinkOnClick() {
  if (!sessionStorage.getItem("lsr_smartlink_shown")) {
    sessionStorage.setItem("lsr_smartlink_shown", "1");
    window.open(SMARTLINK_URL, "_blank");
  }
}

// Attach SmartLink to click
document.addEventListener("click", function(e){
  if (e.target.classList.contains("trigger-ad")) {
    openSmartLinkOnClick();
  }
});

// ==============================
// Auto Load all Banners on Page Load
// ==============================
window.addEventListener("load", () => {
  setTimeout(() => {
    // Top Banners (3)
    loadAdsterra("ad-top-1", "https://example.com/ad1.js");
    loadAdsterra("ad-top-2", "https://example.com/ad2.js");
    loadAdsterra("ad-top-3", "https://example.com/ad3.js");

    // Bottom Banners (4-5)
    loadAdsterra("ad-bottom-1", "https://example.com/ad4.js");
    loadAdsterra("ad-bottom-2", "https://example.com/ad5.js");
    loadAdsterra("ad-bottom-3", "https://example.com/ad6.js");
    loadAdsterra("ad-bottom-4", "https://example.com/ad7.js");
    loadAdsterra("ad-bottom-5", "https://example.com/ad8.js");

    // Monetag
    loadMonetag();
  }, 1000); // 1s delay for safe load
});

console.log("LSR Ads System Loaded Successfully (Safe + Auto Banners)");
