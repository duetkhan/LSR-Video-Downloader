// Ad container mapping
const adSlots = [
  "ad-top-1","ad-top-2","ad-top-3",
  "ad-bottom-1","ad-bottom-2","ad-bottom-3","ad-bottom-4","ad-bottom-5"
];

// Adsterra banner codes list
const banners = [
`<script>
atOptions={'key':'2a7ac0b46ca2d6ecef70fb7f768ae8cf','format':'iframe','height':50,'width':320,'params':{}};
</script><script src="https://www.highperformanceformat.com/2a7ac0b46ca2d6ecef70fb7f768ae8cf/invoke.js"></script>`,

`<script>
atOptions={'key':'3f673e5d02626eb857acc774c36f56a6','format':'iframe','height':60,'width':468,'params':{}};
</script><script src="https://www.highperformanceformat.com/3f673e5d02626eb857acc774c36f56a6/invoke.js"></script>`,

`<script>
atOptions={'key':'d3ba86d4abd7cc73ecbfe82be6839a80','format':'iframe','height':90,'width':728,'params':{}};
</script><script src="https://www.highperformanceformat.com/d3ba86d4abd7cc73ecbfe82be6839a80/invoke.js"></script>`,

`<script>
atOptions={'key':'a8ef1cab5b59d4b91a97aab897d1fec1','format':'iframe','height':250,'width':300,'params':{}};
</script><script src="https://www.highperformanceformat.com/a8ef1cab5b59d4b91a97aab897d1fec1/invoke.js"></script>`
];

// Load banners
function loadAds(){
  adSlots.forEach((slot,i)=>{
    const el = document.getElementById(slot);
    if(el){
      el.innerHTML = banners[i % banners.length];
    }
  });
}

// Initial load
loadAds();

// Auto refresh every 60 sec
setInterval(()=>{
  loadAds();
},60000);
