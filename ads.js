// ================= Page-specific Adsterra Ads =================
const pageAds = {
  "index.html": {
    top: [
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"},
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"}
    ],
    bottom: [
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"}
    ]
  },
  "downloader.html": {
    top: [
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"}
    ],
    bottom: [
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"}
    ]
  },
  "browser.html": {
    top: [
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"3f673e5d02626eb857acc774c36f56a6"}
    ],
    bottom: [
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"}
    ]
  },
  "blog.html": {
    top: [
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"}
    ],
    bottom: [
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"3f673e5d02626eb857acc774c36f56a6"}
    ]
  },
  "news.html": {
    top: [
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"},
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"}
    ],
    bottom: [
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"}
    ]
  },
  "earn.html": {
    top: [
      {id:"2a7ac0b46ca2d6ecef70fb7f768ae8cf"},
      {id:"3f673e5d02626eb857acc774c36f56a6"},
      {id:"d3ba86d4abd7cc73ecbfe82be6839a80"}
    ],
    bottom: [
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"},
      {id:"a8ef1cab5b59d4b91a97aab897d1fec1"}
    ]
  }
};

// ========================= Load Adsterra ad in div =========================
function loadAd(container, key){
  container.innerHTML = ""; // Clear previous ad

  // Create script tag
  const s = document.createElement("script");
  s.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
  s.async = true;
  container.appendChild(s);

  // Optional: fallback message if ad fails
  const fallback = document.createElement("div");
  fallback.innerText = "Ad loading...";
  fallback.style.fontSize = "12px";
  fallback.style.color = "#666";
  container.appendChild(fallback);
}

// ========================= Load all page ads =========================
function loadAllAds(){
  const page = window.location.pathname.split("/").pop() || "index.html";
  const ads = pageAds[page];
  if(!ads) return;

  // Top banners
  ads.top.forEach((ad,i)=>{
    const el = document.getElementById(`ad-top-${i+1}`);
    if(el) loadAd(el,ad.id);
  });

  // Bottom banners
  ads.bottom.forEach((ad,i)=>{
    const el = document.getElementById(`ad-bottom-${i+1}`);
    if(el) loadAd(el,ad.id);
  });
}

// ========================= Auto-refresh every 60s =========================
document.addEventListener("DOMContentLoaded", ()=>{
  loadAllAds();
  setInterval(loadAllAds,60000);
});

// ========================= Smartlink click-only =========================
const page = window.location.pathname.split("/").pop() || "index.html";

// Downloader page
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

// Click & Earn page
if(page==="earn.html"){
  const taskBtn = document.getElementById("doTaskBtn");
  if(taskBtn){
    taskBtn.addEventListener("click",()=>{
      window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
    });
  }
}
