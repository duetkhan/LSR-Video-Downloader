// Browse button
document.getElementById('browse-btn').addEventListener('click', () => {
  window.location.href = 'browser.html';
});

// Downloader logic
const downloadBtn = document.getElementById('download-btn');
const videoURL = document.getElementById('video-url');
const resultSection = document.getElementById('result-section');

downloadBtn.addEventListener('click', () => {
  const url = videoURL.value.trim();
  if (!url) return alert("Please enter a video link.");

  resultSection.innerHTML = "<p>Processing...</p>";

  setTimeout(() => {
    let platform = "other";
    if (url.includes("youtube.com") || url.includes("youtu.be")) platform = "youtube";

    resultSection.innerHTML = "";
    if (platform === "youtube") {
      resultSection.innerHTML = `
        <p>YouTube videos are watch-only. Download not supported.</p>
        <iframe width="100%" height="200" src="${url.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>
      `;
    } else {
      resultSection.innerHTML = `
        <a href="${url}" download>Download 360p</a>
        <a href="${url}" download>Download 720p</a>
        <a href="${url}" download>Download 1080p</a>
        <a href="${url}" download>Download MP3</a>

        <!-- Native Ad -->
        <div id="result-native">
          <script async="async" data-cfasync="false" src="https://pl28566745.effectivegatecpm.com/ae3f15925d8f1944704e01860015491c/invoke.js"></script>
          <div id="container-ae3f15925d8f1944704e01860015491c"></div>
        </div>
      `;
    }
  }, 1000);
});
