const urlInput = document.getElementById('video-url');
const downloadBtn = document.getElementById('download-btn');
const qualitySelect = document.getElementById('quality-select');
const browseBtn = document.getElementById('browse-btn');
const historyBtn = document.getElementById('download-history-btn');

browseBtn.addEventListener('click', ()=>{
  window.location.href = 'browser.html';
});

// API-based download
async function getDirectVideoLink(url, quality){
  const apiURL = `https://example-free-downloader-api.com/get?url=${encodeURIComponent(url)}&quality=${quality}`;
  const response = await fetch(apiURL);
  const data = await response.json();
  return data.direct_link;
}

downloadBtn.addEventListener('click', async ()=>{
  const url = urlInput.value.trim();
  if(!url) return alert("Please paste video link");

  const quality = qualitySelect.value;
  const directLink = await getDirectVideoLink(url, quality);

  if(!directLink) return alert("Failed to fetch direct video link");

  const a = document.createElement('a');
  a.href = directLink;
  a.download = `video-${Date.now()}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  history.push({url,quality,timestamp:new Date().toLocaleString()});
  localStorage.setItem('downloadHistory',JSON.stringify(history));

  alert("Download started!");
});

historyBtn.addEventListener('click', ()=>{
  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  if(history.length===0) return alert("No downloads yet");
  alert(history.map(h=>`${h.timestamp}: ${h.url} (${h.quality})`).join("\n"));
});
