// ================= Page-specific Adsterra scripts =================
const pageAdsScripts = {
  "index.html": {
    top:[
      `<script>
      atOptions = {
        'key' : '2a7ac0b46ca2d6ecef70fb7f768ae8cf',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
      </script>
      <script src="https://www.highperformanceformat.com/2a7ac0b46ca2d6ecef70fb7f768ae8cf/invoke.js"></script>`,

      `<script>
      atOptions = {
        'key' : '3f673e5d02626eb857acc774c36f56a6',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
      </script>
      <script src="https://www.highperformanceformat.com/3f673e5d02626eb857acc774c36f56a6/invoke.js"></script>`,

      `<script>
      atOptions = {
        'key' : 'd3ba86d4abd7cc73ecbfe82be6839a80',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
      </script>
      <script src="https://www.highperformanceformat.com/d3ba86d4abd7cc73ecbfe82be6839a80/invoke.js"></script>`
    ],
    bottom:Array(5).fill(`<script>
      atOptions = {
        'key' : 'a8ef1cab5b59d4b91a97aab897d1fec1',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
      </script>
      <script src="https://www.highperformanceformat.com/a8ef1cab5b59d4b91a97aab897d1fec1/invoke.js"></script>`)
  }
};

// ================= Inject scripts into container =================
function injectScripts(containerId, scripts){
  const container = document.getElementById(containerId);
  if(!container) return;
  container.innerHTML = "";
  scripts.forEach(code=>{
    const div = document.createElement("div");
    div.innerHTML = code;
    container.appendChild(div);
  });
}

// ================= Load all banners =================
function loadAllAds(){
  const page = window.location.pathname.split("/").pop() || "index.html";
  const ads = pageAdsScripts[page];
  if(!ads) return;

  ads.top.forEach((code,i)=>{
    injectScripts(`ad-top-${i+1}`, [code]);
  });
  ads.bottom.forEach((code,i)=>{
    injectScripts(`ad-bottom-${i+1}`, [code]);
  });
}

// ================= Auto-refresh every 60s =================
document.addEventListener("DOMContentLoaded",()=>{
  loadAllAds();
  setInterval(loadAllAds,60000);
});

// ================= Smartlink click-only =================
const page = window.location.pathname.split("/").pop() || "index.html";

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

if(page==="earn.html"){
  const taskBtn = document.getElementById("doTaskBtn");
  if(taskBtn){
    taskBtn.addEventListener("click",()=>{
      window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
    });
  }
});
