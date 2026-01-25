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
const historyBtn = document.getElementById('download-history-btn');

let historyStack = [];
let historyIndex = -1;

// Navigate iframe with Google search fallback
function navigate(url){
  if(!url.includes("http")) url = "https://www.google.com/search?q="+encodeURIComponent(url);
  iframe.src = url;
  urlInput.value = url;
  historyStack = historyStack.slice(0, historyIndex+1);
  historyStack.push(url);
  historyIndex++;
}

// Controls
goBtn.addEventListener('click',()=>navigate(urlInput.value));
backBtn.addEventListener('click',()=>{
  if(historyIndex>0){historyIndex--;iframe.src=historyStack[historyIndex];urlInput.value=historyStack[historyIndex];}
});
forwardBtn.addEventListener('click',()=>{
  if(historyIndex<historyStack.length-1){historyIndex++;iframe.src=historyStack[historyIndex];urlInput.value=historyStack[historyIndex];}
});
refreshBtn.addEventListener('click',()=>iframe.src=iframe.src);
homeBtn.addEventListener('click',()=>navigate('https://www.google.com'));

// Download logic inside browser
iframe.addEventListener('load',()=>{
  const src = iframe.src;

  // Check if URL contains known video platforms (simplified)
  const videoPlatforms = ["facebook.com","tiktok.com","instagram.com","vimeo.com","pinterest.com","likee.com"];
  const isVideoPage = videoPlatforms.some(site => src.includes(site));

  if(isVideoPage){
    downloadPanel.classList.remove('hidden');
    videoTitle.innerText = `Video: ${src.split('/').pop()}`;
  } else {
    downloadPanel.classList.add('hidden');
  }
});

// Download Button Logic
downloadBtn.addEventListener('click',()=>{
  const quality = qualitySelect.value;
  const videoURL = iframe.src;
  alert(`Downloading ${videoURL} at ${quality}`);

  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  history.push({url:videoURL,quality,timestamp:new Date().toLocaleString()});
  localStorage.setItem('downloadHistory',JSON.stringify(history));

  // Trigger browser download
  const a=document.createElement('a');a.href=videoURL;a.download=`video-${Date.now()}.mp4`;document.body.appendChild(a);a.click();document.body.removeChild(a);
});

// Download History Button
historyBtn.addEventListener('click',()=>{
  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  if(history.length===0) return alert("No downloads yet!");
  let historyText = history.map(h=>`${h.timestamp}: ${h.url} (${h.quality})`).join('\n');
  alert(historyText);
});
