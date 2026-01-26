/* ================= ADS.JS ================= */
/* Monetag + Adsterra SmartLink + Banner refresh + per-session control */

(function(){
  // ===== BANNER REFRESH =====
  const refreshInterval = 60000; // 60 sec
  const banners = document.querySelectorAll(".ad-box iframe");
  
  function refreshBanners(){
    banners.forEach((iframe)=>{
      let src = iframe.src;
      iframe.src = src;
    });
  }
  
  setInterval(refreshBanners, refreshInterval);

  // ===== SMARTLINK PER SESSION =====
  const smartLinkKey = 'lsr_smartlink_shown';
  const smartLinkUrl = 'https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f';

  function triggerSmartLink(){
    if(!sessionStorage.getItem(smartLinkKey)){
      sessionStorage.setItem(smartLinkKey, '1');
      window.open(smartLinkUrl, '_blank');
    }
  }

  // ===== TRIGGERS =====
  // Homepage: More button
  const moreBtn = document.querySelector('.more-box button');
  if(moreBtn) moreBtn.addEventListener('click', triggerSmartLink);

  // Download button click
  const downloadBtns = document.querySelectorAll('.btn.blue');
  downloadBtns.forEach(btn => btn.addEventListener('click', triggerSmartLink));

  // New tab in browser triggers
  const newTabBtn = document.querySelector('button[onclick="newTab()"]');
  if(newTabBtn) newTabBtn.addEventListener('click', triggerSmartLink);

  // ===== MONETAG ADDITIONAL LOGIC =====
  // Placeholder if future Monetag in-app unlock needed
  window.addEventListener('load', ()=>{
    console.log("Ads.js initialized: banners auto-refresh + SmartLink ready");
  });

})();
