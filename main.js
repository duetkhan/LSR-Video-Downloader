function go(p){location.href=p}

function openSmartlink(){
  window.open(
    "https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f",
    "_blank"
  );
}

function fakeDownload(){
  const v=document.getElementById("vlink").value;
  if(!v){alert("Enter video link");return;}
  openSmartlink();
  let h=JSON.parse(localStorage.getItem("dlHistory")||"[]");
  h.push({url:v,date:new Date().toLocaleString()});
  localStorage.setItem("dlHistory",JSON.stringify(h));
  alert("Download started (demo)");
}

function loadHistory(){
  let h=JSON.parse(localStorage.getItem("dlHistory")||"[]");
  let ul=document.getElementById("history");
  ul.innerHTML="";
  h.forEach(i=>{
    let li=document.createElement("li");
    li.innerText=i.url+" — "+i.date;
    ul.appendChild(li);
  });
}

function searchGoogle(){
  const q=document.getElementById("search").value;
  if(q) window.open("https://www.google.com/search?q="+encodeURIComponent(q),"_blank");
}
