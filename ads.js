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
  // other pages similar structure...
};

// ================= Load single ad =================
function loadSingleAd(container, ad) {
  container.innerHTML = "";
  const script = document.createElement("script");
  script.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
  script.async = true;
  container.appendChild(script);
}

// ================= Load all page banners =================
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
  setInterval(loadPageAds, 60000); // refresh every 60 sec
});

// ================= Smartlink (Adsterra) =================
if(window.location.pathname.includes("downloader.html")){
  const dlBtn = document.getElementById("downloadBtn");
  if(dlBtn){
    dlBtn.addEventListener("click", ()=>{
      if(!sessionStorage.getItem("dlSmartlink")){
        window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
        sessionStorage.setItem("dlSmartlink","1");
      }
    });
  }
}
if(window.location.pathname.includes("earn.html")){
  const earnBtn = document.getElementById("doTaskBtn");
  if(earnBtn){
    earnBtn.addEventListener("click", ()=>{
      window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
    });
  }
}

// ================= Monetag (Click-only, News page) =================
if(window.location.pathname.includes("news.html")){
  const monoBtn = document.getElementById("monetagNewsBtn");
  if(monoBtn){
    monoBtn.addEventListener("click", ()=>{
      const s1 = document.createElement("script");
      s1.dataset.zone='10519506';
      s1.src='https://nap5k.com/tag.min.js';
      document.body.appendChild(s1);

      const s2 = document.createElement("script");
      s2.dataset.zone='10519504';
      s2.src='https://gizokraijaw.net/vignette.min.js';
      document.body.appendChild(s2);
    });
  }
}
