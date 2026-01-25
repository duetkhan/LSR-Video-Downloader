const tabList = document.getElementById('tab-list');
const newTabBtn = document.getElementById('new-tab-btn');
const iframeContainer = document.getElementById('iframe-container');

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

let tabs = [];
let activeTabIndex = -1;

function createTab(url="https://www.google.com"){
  const tabId = `tab-${Date.now()}`;
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.id = tabId;
  iframe.style.width = "100%";
  iframe.style.height = "70vh";
  iframeContainer.appendChild(iframe);

  const tabBtn = document.createElement('button');
  tabBtn.innerText = "Tab " + (tabs.length+1) + " ✖";
  tabBtn.dataset.index = tabs.length;
  tabList.appendChild(tabBtn);

  tabBtn.addEventListener('click', ()=>setActiveTab(parseInt(tabBtn.dataset.index)));
  tabBtn.addEventListener('dblclick', ()=>closeTab(parseInt(tabBtn.dataset.index)));

  tabs.push({iframe, tabBtn, historyStack:[], historyIndex:-1});
  setActiveTab(tabs.length-1);
}

function setActiveTab(index){
  if(index<0 || index>=tabs.length) return;
  tabs.forEach((t,i)=>{t.iframe.style.display=(i===index)?"block":"none";});
  activeTabIndex = index;
  urlInput.value = tabs[index].iframe.src;
  checkDownloadPanel(tabs[index].iframe.src);
}

function closeTab(index){
  const t = tabs[index];
  t.iframe.remove();
  t.tabBtn.remove();
  tabs.splice(index,1);
  if(tabs.length>0) setActiveTab(0); else createTab();
}

function navigate(url){
  if(activeTabIndex===-1) return;
  if(!url.startsWith("http")) url = "https://www.google.com/search?q="+encodeURIComponent(url);
  const tab = tabs[activeTabIndex];
  tab.iframe.src = url;
  urlInput.value = url;
  tab.historyStack = tab.historyStack.slice(0, tab.historyIndex+1);
  tab.historyStack.push(url);
  tab.historyIndex++;
  checkDownloadPanel(url);
}

goBtn.addEventListener('click', ()=>navigate(urlInput.value));
urlInput.addEventListener('keydown', e=>{if(e.key==="Enter") navigate(urlInput.value);});
backBtn.addEventListener('click', ()=>{const tab=tabs[activeTabIndex]; if(tab.historyIndex>0){tab.historyIndex--; tab.iframe.src=tab.historyStack[tab.historyIndex]; urlInput.value=tab.historyStack[tab.historyIndex]; checkDownloadPanel(tab.iframe.src);}});
forwardBtn.addEventListener('click', ()=>{const tab=tabs[activeTabIndex]; if(tab.historyIndex<tab.historyStack.length-1){tab.historyIndex++; tab.iframe.src=tab.historyStack[tab.historyIndex]; urlInput.value=tab.historyStack[tab.historyIndex]; checkDownloadPanel(tab.iframe.src);}});
refreshBtn.addEventListener('click', ()=>{const tab=tabs[activeTabIndex]; tab.iframe.src=tab.iframe.src;});
homeBtn.addEventListener('click', ()=>navigate("https://www.google.com"));
newTabBtn.addEventListener('click', ()=>createTab());
createTab();

function checkDownloadPanel(src){
  const videoPlatforms = ["facebook.com","tiktok.com","instagram.com","vimeo.com","pinterest.com","likee.com"];
  const isVideoPage = videoPlatforms.some(site=>src.includes(site));
  if(isVideoPage){
    downloadPanel.classList.remove('hidden');
    videoTitle.innerText = `Video: ${src.split('/').pop()}`;
  } else downloadPanel.classList.add('hidden');
}

async function getDirectVideoLink(url, quality="720p"){
  const apiURL = `https://example-free-downloader-api.com/get?url=${encodeURIComponent(url)}&quality=${quality}`;
  const response = await fetch(apiURL);
  const data = await response.json();
  return data.direct_link;
}

downloadBtn.addEventListener('click', async ()=>{
  if(activeTabIndex===-1) return;
  const iframeSrc = tabs[activeTabIndex].iframe.src;
  const quality = qualitySelect.value;
  const videoPlatforms = ["facebook.com","tiktok.com","instagram.com","vimeo.com","pinterest.com","likee.com"];
  const isVideoPage = videoPlatforms.some(site=>iframeSrc.includes(site));
  if(!isVideoPage) return alert("No downloadable video detected");

  const directLink = await getDirectVideoLink(iframeSrc, quality);
  if(!directLink) return alert("Failed to fetch video link");

  const a = document.createElement('a');
  a.href = directLink;
  a.download = `video-${Date.now()}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  history.push({url:iframeSrc,quality,timestamp:new Date().toLocaleString()});
  localStorage.setItem('downloadHistory',JSON.stringify(history));

  alert("Download started!");
});

historyBtn.addEventListener('click', ()=>{
  let history = JSON.parse(localStorage.getItem('downloadHistory')||"[]");
  if(history.length===0) return alert("No downloads yet");
  alert(history.map(h=>`${h.timestamp}: ${h.url} (${h.quality})`).join("\n"));
});
