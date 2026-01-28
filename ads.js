const adSlots = [
  "ad-top-1","ad-top-2","ad-top-3",
  "ad-bottom-1","ad-bottom-2","ad-bottom-3","ad-bottom-4","ad-bottom-5"
];

const banners = [
  {
    key: "2a7ac0b46ca2d6ecef70fb7f768ae8cf",
    width: 320,
    height: 50
  },
  {
    key: "3f673e5d02626eb857acc774c36f56a6",
    width: 468,
    height: 60
  },
  {
    key: "d3ba86d4abd7cc73ecbfe82be6839a80",
    width: 728,
    height: 90
  },
  {
    key: "a8ef1cab5b59d4b91a97aab897d1fec1",
    width: 300,
    height: 250
  }
];

function loadSingleAd(container, ad) {
  container.innerHTML = "";

  const script1 = document.createElement("script");
  script1.innerHTML = `
    atOptions = {
      'key' : '${ad.key}',
      'format' : 'iframe',
      'height' : ${ad.height},
      'width' : ${ad.width},
      'params' : {}
    };
  `;

  const script2 = document.createElement("script");
  script2.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
  script2.async = true;

  container.appendChild(script1);
  container.appendChild(script2);
}

function loadAds() {
  adSlots.forEach((slot, i) => {
    const el = document.getElementById(slot);
    if (el) {
      const ad = banners[i % banners.length];
      loadSingleAd(el, ad);
    }
  });
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  loadAds();

  // Auto refresh every 60 seconds
  setInterval(() => {
    loadAds();
  }, 60000);
});
