/* ==================================================
   LSR Video Downloader – Ads Master Controller
   Adsterra + Monetag Full Integration
   Safe, Click-Only SmartLink, Banner Ready
================================================== */

/* ========== CONFIG ========== */
const SMARTLINK_URL = "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f";
const MONETAG_ZONE = "10519506";

/* ========== MONETAG LOADER ========== */
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

// Auto load Monetag after 3s (safe)
window.addEventListener("load", () => {
  setTimeout(loadMonetag, 3000);
});

/* ========== BANNER LOAD SYSTEM ========== */
function loadAdsterra(containerId, scriptSrc) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const s = document.createElement("script");
  s.src = scriptSrc;
  s.async = true;
  container.appendChild(s);
}

/* ========== CLICK-TRIGGER SMARTLINK (SAFE) ========== */
function openSmartLinkOnClick() {
  if (!sessionStorage.getItem("lsr_smartlink_shown")) {
    sessionStorage.setItem("lsr_smartlink_shown", "1");
    window.open(SMARTLINK_URL, "_blank");
  }
}

/* ========== ATTACH CLICK EVENTS ========== */
document.addEventListener("click", function(e){
  if (e.target.classList.contains("trigger-ad")) {
    openSmartLinkOnClick();
  }
});

console.log("LSR Ads System Loaded Successfully (Safe Mode)");
