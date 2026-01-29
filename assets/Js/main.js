// Ads auto load + refresh 60s
function loadAds(){
  document.querySelectorAll('.ad-container').forEach(c=>{
    c.innerHTML='';
    if(c.dataset.ad) c.innerHTML=c.dataset.ad;
  });
}
window.addEventListener('load', loadAds);
setInterval(loadAds,60000);

// Download history
let downloadHistory=JSON.parse(localStorage.getItem('lsr_history')||'[]');
function addHistory(item){downloadHistory.push(item);localStorage.setItem('lsr_history',JSON.stringify(downloadHistory));}

// Downloader submit
function submitDownload(){
  const link=document.getElementById('video-link').value;
  const quality=document.getElementById('video-quality').value;
  if(!link){alert('Please enter video link');return;}
  alert(`Download simulated: ${link} [${quality}]`);
  addHistory({link,quality,date:new Date().toLocaleString()});
  window.open('https://www.effectivegatecpm.com/nb3ev3ys3?key=9a54ab0abd26e3dccdcb180ad201724f','_blank');
}

// Browser search
function searchBrowser(){
  const q=document.getElementById('browser-input').value;
  if(!q)return;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`,'_blank');
}

// Click & Earn
function clickSmartlink(url){window.open(url,'_blank');}

// Load history table
function loadHistory(){
  const table=document.getElementById('history-table');
  if(!table)return;
  table.innerHTML='';
  JSON.parse(localStorage.getItem('lsr_history')||'[]').forEach(item=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${item.date}</td><td>${item.link}</td><td>${item.quality}</td>`;
    table.appendChild(tr);
  });
}
window.addEventListener('load', loadHistory);


