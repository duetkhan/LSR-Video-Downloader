/* ==================================================
   LSR Video Downloader – Ads Master Controller
   Adsterra + Monetag Full Integration
   100% Safe + Live + Session Controlled
================================================== */

/* ========== CONFIG ========== */
const SMARTLINK_URL = "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f";
const MONETAG_ZONE = "10519506";

/* ========== SMARTLINK (1 TIME PER SESSION) ========== */
(function smartLinkHandler(){
  if (!sessionStorage.getItem("lsr_smartlink_shown")) {
    sessionStorage.setItem("lsr_smartlink_shown", "1");

    window.addEventListener("load", () => {
      setTimeout(() => {
        window.open(SMARTLINK_URL, "_blank");
      }, 15000); // 15 seconds delay (safe for ban)
    });
  }
})();

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

/* Auto load Monetag */
window.addEventListener("load", () => {
  setTimeout(loadMonetag, 3000);
});

/* ========== BANNER RELOAD SYSTEM ========== */
function loadAdsterra(containerId, scriptSrc) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const s = document.createElement("script");
  s.src = scriptSrc;
  s.async = true;
  container.appendChild(s);
}

/* ========== CLICK-TRIGGER SMARTLINK (OPTIONAL EXTRA MONETIZATION) ========== */
function openSmartLinkOnClick() {
  window.open(SMARTLINK_URL, "_blank");
}

/* ========== SAFE INTERACTION ADS (BUTTON / DOWNLOAD) ========== */
document.addEventListener("click", function(e){
  if (e.target.classList.contains("trigger-ad")) {
    openSmartLinkOnClick();
  }
});

/* ========== ADS DEBUG LOG ========== */
console.log("LSR Ads System Loaded Successfully");
