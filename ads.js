// ========================= Page-specific Adsterra Banners =========================
const pageAds = {
  "index.html": {
    top: [
      "2a7ac0b46ca2d6ecef70fb7f768ae8cf",
      "3f673e5d02626eb857acc774c36f56a6",
      "d3ba86d4abd7cc73ecbfe82be6839a80"
    ],
    bottom: [
      "a8ef1cab5b59d4b91a97aab897d1fec1",
      "a8ef1cab5b59d4b91a97aab897d1fec1",
      "a8ef1cab5b59d4b91a97aab897d1fec1",
      "a8ef1cab5b59d4b91a97aab897d1fec1",
      "a8ef1cab5b59d4b91a97aab897d1fec1"
    ]
  },
  "downloader.html": {
    top: ["3f673e5d02626eb857acc774c36f56a6","2a7ac0b46ca2d6ecef70fb7f768ae8cf","a8ef1cab5b59d4b91a97aab897d1fec1"],
    bottom: ["d3ba86d4abd7cc73ecbfe82be6839a80","d3ba86d4abd7cc73ecbfe82be6839a80","d3ba86d4abd7cc73ecbfe82be6839a80","d3ba86d4abd7cc73ecbfe82be6839a80","d3ba86d4abd7cc73ecbfe82be6839a80"]
  },
  "browser.html": {
    top: ["2a7ac0b46ca2d6ecef70fb7f768ae8cf","d3ba86d4abd7cc73ecbfe82be6839a80","3f673e5d02626eb857acc774c36f56a6"],
    bottom: ["a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1"]
  },
  "blog.html": {
    top: ["d3ba86d4abd7cc73ecbfe82be6839a80","a8ef1cab5b59d4b91a97aab897d1fec1","2a7ac0b46ca2d6ecef70fb7f768ae8cf"],
    bottom: ["3f673e5d02626eb857acc774c36f56a6","3f673e5d02626eb857acc774c36f56a6","3f673e5d02626eb857acc774c36f56a6","3f673e5d02626eb857acc774c36f56a6","3f673e5d02626eb857acc774c36f56a6"]
  },
  "news.html": {
    top: ["3f673e5d02626eb857acc774c36f56a6","d3ba86d4abd7cc73ecbfe82be6839a80","2a7ac0b46ca2d6ecef70fb7f768ae8cf"],
    bottom: ["a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1"]
  },
  "earn.html": {
    top: ["2a7ac0b46ca2d6ecef70fb7f768ae8cf","3f673e5d02626eb857acc774c36f56a6","d3ba86d4abd7cc73ecbfe82be6839a80"],
    bottom: ["a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1","a8ef1cab5b59d4b91a97aab897d1fec1"]
  }
};

// ========================= Helper to load a single ad =========================
function loadAd(container, key){
  container.innerHTML = "";
  const s = document.createElement("script");
  s.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
  s.async = true;
  container.appendChild(s);
}

// ========================= Load All Ads =========================
function loadAllAds(){
  const page = window.location.pathname.split("/").pop() || "index.html";
  const ads = pageAds[page];
  if(!ads) return;

  // Top banners
  ads.top.forEach((key,i)=>{
    const el = document.getElementById(`ad-top-${i+1}`);
    if(el) loadAd(el,key);
  });

  // Bottom banners
  ads.bottom.forEach((key,i)=>{
    const el = document.getElementById(`ad-bottom-${i+1}`);
    if(el) loadAd(el,key);
  });
}

// ========================= Auto refresh every 60s =========================
document.addEventListener("DOMContentLoaded",()=>{
  loadAllAds();
  setInterval(loadAllAds,60000);
});

// ========================= Smartlink click-only =========================
const page = window.location.pathname.split("/").pop() || "index.html";

// Downloader page smartlink
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

// Click & Earn page smartlink
if(page==="earn.html"){
  const taskBtn = document.getElementById("doTaskBtn");
  if(taskBtn){
    taskBtn.addEventListener("click",()=>{
      window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
    });
  }
}
