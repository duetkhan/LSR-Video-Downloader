const downloadBtn = document.getElementById('download-btn');
const videoURL = document.getElementById('video-url');
const resultSection = document.getElementById('result-section');
const browseBtn = document.getElementById('browse-btn');
const historyBtn = document.getElementById('history-btn');

// Browse Button
browseBtn.addEventListener('click', () => {
  window.location.href = 'browser.html';
});

// Download History Button
historyBtn.addEventListener('click', () => {
  let history = JSON.parse(localStorage.getItem('downloadHistory') || "[]");
  if(history.length === 0) return alert("No downloads yet!");
  let historyText = history.map(h => `${h.timestamp}: ${h.url} (${h.quality})`).join('\n');
  alert(historyText);
});

// Helper to trigger download in browser (auto create folder not possible in pure JS, but downloads go to default Downloads folder)
function downloadFile(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

downloadBtn.addEventListener('click', () => {
  const url = videoURL.value.trim();
  if(!url) return alert("Please enter a video link");

  resultSection.innerHTML = "<p>Processing...</p>";

  setTimeout(() => {
    let platform = "other";
    if(url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";

    resultSection.innerHTML = "";

    if(platform === "youtube") {
      resultSection.innerHTML = `
        <p>YouTube videos are watch-only. Download not supported.</p>
        <iframe width="100%" height="200" src="${url.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>
      `;
    } else {
      // Download buttons
      const qualities = ["360p","720p","1080p","mp3"];
      let html = qualities.map(q => `<button class="download-link" data-quality="${q}">${q}</button>`).join(" ");
      resultSection.innerHTML = `
        ${html}
        <div id="result-native">
          <script async="async" data-cfasync="false" src="https://pl28566745.effectivegatecpm.com/ae3f15925d8f1944704e01860015491c/invoke.js"></script>
          <div id="container-ae3f15925d8f1944704e01860015491c"></div>
        </div>
      `;

      document.querySelectorAll(".download-link").forEach(btn=>{
        btn.addEventListener('click',()=>{
          const quality = btn.dataset.quality;
          const filename = `video-${Date.now()}.mp4`;
          downloadFile(url, filename);

          // Save to localStorage history
          let history = JSON.parse(localStorage.getItem('downloadHistory') || "[]");
          history.push({url, quality, timestamp: new Date().toLocaleString()});
          localStorage.setItem('downloadHistory', JSON.stringify(history));
        });
      });
    }
  },1000);
});
