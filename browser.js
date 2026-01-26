const iframe = document.getElementById("browser-frame");
const urlInput = document.getElementById("browser-url");
const goBtn = document.getElementById("go-btn");
const homeBtn = document.getElementById("home-btn");

const downloadPanel = document.getElementById("download-panel");
const downloadBtn = document.getElementById("download-this-btn");
const qualitySelect = document.getElementById("quality-select");
const videoTitle = document.getElementById("video-title");

function navigate(url){
  if(!url.startsWith("http")){
    url = "https://www.google.com/search?q=" + encodeURIComponent(url);
  }
  iframe.src = url;
  urlInput.value = url;
  checkDownloadPanel(url);
}

goBtn.onclick = ()=> navigate(urlInput.value);
homeBtn.onclick = ()=> navigate("https://www.google.com");

urlInput.addEventListener("keydown",(e)=>{
  if(e.key==="Enter") navigate(urlInput.value);
});

function checkDownloadPanel(url){
  const videoSites = ["facebook.com","tiktok.com","instagram.com","vimeo.com","pinterest.com","likee.com"];
  const isVideo = videoSites.some(site=>url.includes(site));

  if(isVideo){
    downloadPanel.classList.remove("hidden");
    videoTitle.innerText = "Video detected from: " + url;
  }else{
    downloadPanel.classList.add("hidden");
  }
}

downloadBtn.onclick = ()=>{
  alert("Real download will work after API connection.\nNow browser + detection is working.");
};
