/* =========================
   LSR MAIN JS
   ========================= */

/* --------- ADS AUTO REFRESH (60s) --------- */
function reloadAds() {
  const adBoxes = document.querySelectorAll(".ad-box");
  adBoxes.forEach(box => {
    const html = box.innerHTML;
    box.innerHTML = "";
    setTimeout(() => {
      box.innerHTML = html;
    }, 100);
  });
}

// প্রথম লোডের পর 60 সেকেন্ড পরপর রিফ্রেশ
setInterval(reloadAds, 60000);


/* --------- DOWNLOAD HISTORY SYSTEM --------- */
function getHistory() {
  return JSON.parse(localStorage.getItem("lsr_history")) || [];
}

function saveHistory(data) {
  let history = getHistory();
  history.push(data);
  localStorage.setItem("lsr_history", JSON.stringify(history));
}


/* --------- DOWNLOADER FUNCTION --------- */
function startDownload() {
  const link = document.getElementById("videoLink").value.trim();
  const quality = document.getElementById("videoQuality").value;

  if (!link) {
    alert("Please enter a video link!");
    return;
  }

  // Save to history
  saveHistory({
    link: link,
    quality: quality,
    time: new Date().toLocaleString()
  });

  alert("Download Started (Simulated)!\nQuality: " + quality);

  // Smartlink open (one session one time type behavior)
  window.open(
    "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f",
    "_blank"
  );
}


/* --------- LOAD HISTORY PAGE --------- */
function loadHistoryPage() {
  const table = document.getElementById("historyTable");
  if (!table) return;

  let history = getHistory();

  if (history.length === 0) {
    table.innerHTML = "<tr><td colspan='3'>No Download History Found</td></tr>";
    return;
  }

  let rows = "";
  history.forEach((item, index) => {
    rows += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.link}</td>
        <td>${item.quality}</td>
        <td>${item.time}</td>
      </tr>
    `;
  });

  table.innerHTML = rows;
}


/* --------- MINI BROWSER SEARCH --------- */
function browserSearch() {
  const q = document.getElementById("browserSearch").value.trim();
  if (!q) {
    alert("Type something to search");
    return;
  }
  window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank");
}


/* --------- CLICK & EARN SMARTLINK --------- */
function openSmartLink() {
  window.open(
    "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f",
    "_blank"
  );
}


/* --------- TELEGRAM LINK --------- */
function openTelegram() {
  window.open("https://t.me/bitbytee_bot", "_blank");
}


/* --------- AUTO CALL HISTORY LOADER --------- */
window.onload = function () {
  loadHistoryPage();
};
