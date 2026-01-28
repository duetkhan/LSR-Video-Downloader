// ================= ADS ===================
// Auto load + refresh every 60 sec
function loadAds() {
  const adContainers = document.querySelectorAll('.ad-container');
  adContainers.forEach(container => {
    container.innerHTML = '';
    const adCode = container.dataset.ad;
    if(adCode) container.innerHTML = adCode;
  });
}
setInterval(loadAds, 60000);
window.addEventListener('load', loadAds);

// ================= Download History =================
let downloadHistory = JSON.parse(localStorage.getItem('lsr_history') || '[]');
function addHistory(item){ downloadHistory.push(item); localStorage.setItem('lsr_history', JSON.stringify(downloadHistory)); }

// ================= Downloader =================
function submitDownload() {
  const link = document.getElementById('video-link').value;
  const quality = document.getElementById('video-quality').value;
  if(!link){ alert('Please enter video link'); return; }
  alert(`Download simulated: ${link} [${quality}]`);
  addHistory({ link, quality, date: new Date().toLocaleString() });
  window.open('https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f','_blank');
}

// ================= Browser =================
function searchBrowser() {
  const query = document.getElementById('browser-input').value;
  if(!query) return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
}

// ================= Click & Earn =================
function clickSmartlink(url) { window.open(url,'_blank'); }
