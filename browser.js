const view = document.getElementById("view");
const address = document.getElementById("address");
const go = document.getElementById("go");

go.onclick = ()=>{
  let url = address.value.trim();
  if(!url.startsWith("http")){
    if(url.includes(".")){
      url = "https://" + url;
    }else{
      url = "https://www.google.com/search?q=" + encodeURIComponent(url);
    }
  }
  view.src = url;
};
