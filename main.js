function go(page){
  window.location.href = page;
}

function openSmartlink(){
  window.open(
    "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f",
    "_blank"
  );
}

function fakeDownload(){
  const url=document.getElementById("vlink").value;
  if(!url){
    alert("Enter video link");
    return;
  }
  openSmartlink();
  let history=JSON.parse(localStorage.getItem("dlHistory")||"[]");
  history.push({url:url,date:new Date().toLocaleString()});
  localStorage.setItem("dlHistory",JSON.stringify(history));
  alert("Download started (demo)");
}

function loadHistory(){
  const list=document.getElementById("history");
  let history=JSON.parse(localStorage.getItem("dlHistory")||"[]");
  list.innerHTML="";
  history.forEach(h=>{
    let li=document.createElement("li");
    li.innerText=h.url+" — "+h.date;
    list.appendChild(li);
  });
}

function searchGoogle(){
  const q=document.getElementById("search").value;
  if(q){
    window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank");
  }
}
