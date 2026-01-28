// ========================= Page-specific Adsterra Banners =================
const pageAds = {
  "index.html": {
    top: [
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50},
      {key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60},
      {key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90}
    ],
    bottom: Array(5).fill({key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250})
  },
  "downloader.html": {
    top: [
      {key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60},
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50},
      {key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250}
    ],
    bottom: Array(5).fill({key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90})
  },
  "browser.html": {
    top: [
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50},
      {key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90},
      {key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60}
    ],
    bottom: Array(5).fill({key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250})
  },
  "blog.html": {
    top: [
      {key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90},
      {key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250},
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50}
    ],
    bottom: Array(5).fill({key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60})
  },
  "news.html": {
    top: [
      {key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60},
      {key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90},
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50}
    ],
    bottom: Array(5).fill({key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250})
  },
  "earn.html": {
    top: [
      {key:"2a7ac0b46ca2d6ecef70fb7f768ae8cf", w:320,h:50},
      {key:"3f673e5d02626eb857acc774c36f56a6", w:468,h:60},
      {key:"d3ba86d4abd7cc73ecbfe82be6839a80", w:728,h:90}
    ],
    bottom: Array(5).fill({key:"a8ef1cab5b59d4b91a97aab897d1fec1", w:300,h:250})
  }
};

// ========================= Helper to load iframe ad =========================
function loadIframeAd(container, ad){
  container.innerHTML = ""; // Clear previous content
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
  iframe.width = ad.w;
  iframe.height = ad.h;
  iframe.frameBorder = 0;
  iframe.scrolling = "no";
  iframe.style.border = "0";
  iframe.style.overflow = "hidden";
  container.appendChild(iframe);
}

// ========================= Load all ads for page =========================
function loadAllAds(){
  const page = window.location.pathname.split("/").pop() || "index.html";
  const ads = pageAds[page];
  if(!ads) return;

  ads.top.forEach((ad,i)=>{
    const el = document.getElementById(`ad-top-${i+1}`);
    if(el) loadIframeAd(el,ad);
  });

  ads.bottom.forEach((ad,i)=>{
    const el = document.getElementById(`ad-bottom-${i+1}`);
    if(el) loadIframeAd(el,ad);
  });
}

// ========================= Auto-refresh every 60s =========================
document.addEventListener("DOMContentLoaded",()=>{
  loadAllAds();
  setInterval(loadAllAds,60000);
});

// ========================= Smartlink click-only =========================
const page = window.location.pathname.split("/").pop() || "index.html";

// Downloader smartlink
if(page==="downloader.html"){
  const dlBtn = document.getElementById("downloadBtn");
  if(dlBtn){
    dlBtn.addEventListener("click",()=>{
      if(!sessionStorage.getItem("dlSmartlink")){
        window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
        sessionStorage.setItem("dlSmartlink","1");
      }
    });
  }
}

// Click & Earn smartlink
if(page==="earn.html"){
  const taskBtn = document.getElementById("doTaskBtn");
  if(taskBtn){
    taskBtn.addEventListener("click",()=>{
      window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
    });
  }
}
