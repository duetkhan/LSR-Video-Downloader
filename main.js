/* =========================
   LSR MAIN JS
========================= */

/* DOWNLOAD HISTORY */
function getHistory(){ return JSON.parse(localStorage.getItem("lsr_history")) || []; }
function saveHistory(data){
  let history = getHistory();
  history.push(data);
  localStorage.setItem("lsr_history", JSON.stringify(history));
}

/* DOWNLOADER */
function startDownload(){
  const link = document.getElementById("videoLink").value.trim();
  const quality = document.getElementById("videoQuality").value;
  if(!link){ alert("Please enter video link"); return; }
  saveHistory({link, quality, time: new Date().toLocaleString()});
  alert("Download Started (Simulated)\nQuality: "+quality);

  window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank");
}

/* HISTORY PAGE */
function loadHistoryPage(){
  const table = document.getElementById("historyTable");
  if(!table) return;
  let history = getHistory();
  if(history.length===0){
    table.innerHTML="<tr><td colspan='4'>No Download History Found</td></tr>";
    return;
  }
  let rows="";
  history.forEach((item,i)=>{
    rows+=`<tr>
      <td>${i+1}</td>
      <td>${item.link}</td>
      <td>${item.quality}</td>
      <td>${item.time}</td>
    </tr>`;
  });
  table.innerHTML=rows;
}

/* MINI BROWSER */
function browserSearch(){
  const q = document.getElementById("browserSearch").value.trim();
  if(!q){ alert("Type something"); return; }
  window.open("https://www.google.com/search?q="+encodeURIComponent(q), "_blank");
}

/* CLICK & EARN */
function openSmartLink(){ window.open("https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f","_blank"); }
function openTelegram(){ window.open("https://t.me/bitbytee_bot","_blank"); }

window.onload=function(){ loadHistoryPage(); };
