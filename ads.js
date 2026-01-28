// ================= Page-specific Adsterra Banners =================
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

// ================= Load Single Ad =================
function loadSingleAd(container, ad) {
  container.innerHTML = "";
  const s1 = document.createElement("script");
  s1.innerHTML = `
    atOptions = {
      'key':'${ad.key}',
      'format':'iframe',
      'height':${ad.h},
      'width':${ad.w},
      'params':{}
    };
  `;
  const s2 = document.createElement("script");
  s2.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
  s2.async = true;
  container.appendChild(s1);
  container.appendChild(s2);
}

// ================= Load Page Ads =================
function loadPageAds() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const ads = pageAds[page];
  if(!ads) return;

  ads.top.forEach((ad,i)=>{
    const el = document.getElementById(`ad-top-${i+1}`);
    if(el) loadSingleAd(el, ad);
  });

  ads.bottom.forEach((ad,i)=>{
    const el = document.getElementById(`ad-bottom-${i+1}`);
    if(el) loadSingleAd(el, ad);
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  loadPageAds();
  setInterval(loadPageAds,60000); // Auto refresh every 60 sec
});

// ================= Smartlink (Downloader & Click & Earn) =================
if(window.location.pathname.includes("downloader.html")){
  const dlBtn = document.getElementById("downloadBtn");
  if(dlBtn){
    dlBtn.addEvent
