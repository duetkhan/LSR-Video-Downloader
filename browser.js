const iframe = document.getElementById('browser-iframe');
const urlInput = document.getElementById('browser-url');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const homeBtn = document.getElementById('home-btn');

const downloadPanel = document.getElementById('download-panel');
const downloadBtn = document.getElementById('download-this-btn');
const qualitySelect = document.getElementById('quality-select');
const videoTitle = document.getElementById('video-title');

let historyStack = [];
let historyIndex = -1;

// Navigate iframe
function navigate(url) {
  iframe.src = url;
  urlInput.value = url;

  // Update history
  historyStack = historyStack.slice(0, historyIndex+1);
  historyStack.push(url);
  historyIndex++;
}

goBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return;
  navigate(url);
});

backBtn.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    iframe.src = historyStack[historyIndex];
    urlInput.value = historyStack[historyIndex];
  }
});

forwardBtn.addEventListener('click', () => {
  if (historyIndex < historyStack.length -1) {
    historyIndex++;
    iframe.src = historyStack[historyIndex];
    urlInput.value = historyStack[historyIndex];
  }
});

refreshBtn.addEventListener('click', () => {
  iframe.src = iframe.src;
});

homeBtn.addEventListener('click', () => {
  navigate('https://www.google.com');
});

// Simulated "Download This Video" detection
iframe.addEventListener('load', () => {
  downloadPanel.classList.remove('hidden');
  videoTitle.innerText = `Video: ${iframe.src.split('/').pop()}`;
});

// Download logic
downloadBtn.addEventListener('click', () => {
  const quality = qualitySelect.value;
  const videoURL = iframe.src;

  alert(`Downloading ${videoURL} at ${quality}`);

  let history = JSON.parse(localStorage.getItem('downloadHistory') || "[]");
  history.push({ url: videoURL, quality, timestamp: new Date().toLocaleString() });
  localStorage.setItem('downloadHistory', JSON.stringify(history));
});

// Show download history
document.getElementById('download-history-btn').addEventListener('click', () => {
  let history = JSON.parse(localStorage.getItem('downloadHistory') || "[]");
  if(history.length === 0) return alert("No downloads yet!");
  let historyText = history.map(h => `${h.timestamp}: ${h.url} (${h.quality})`).join('\n');
  alert(historyText);
});

// Optional SmartLink integration
// You can redirect once on new tab or exit intent using provided SmartLink
// Example:
// window.location.href = "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f";
