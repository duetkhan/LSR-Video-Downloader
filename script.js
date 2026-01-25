// ---------- PLATFORM CARD CLICK ----------
const platformCards = document.querySelectorAll('.platform-card');
const browserSection = document.getElementById('browser-section');
const browserIframe = document.getElementById('browser-iframe');
const tabsContainer = document.getElementById('tabs-container');
const newTabBtn = document.getElementById('new-tab-btn');
const browserURL = document.getElementById('browser-url');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const homeBtn = document.getElementById('home-btn');

let tabs = [];
let activeTab = null;

// Create New Tab
function createTab(url = 'https://www.google.com') {
  const tabId = 'tab-' + Date.now();
  const tab = { id: tabId, url: url, history: [url], historyIndex: 0 };
  tabs.push(tab);
  activeTab = tab;
  renderTabs();
  openTab(tab);
}

// Render Tabs Bar
function renderTabs() {
  tabsContainer.innerHTML = '';
  tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.classList.add('tab');
    if (tab === activeTab) tabEl.classList.add('active');
    tabEl.innerText = tab.url.replace(/^https?:\/\//, '').split('/')[0];
    tabEl.onclick = () => switchTab(tab.id);
    tabsContainer.appendChild(tabEl);
  });
}

// Switch Tab
function switchTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  activeTab = tab;
  openTab(tab);
  renderTabs();
}

// Open Tab in iframe
function openTab(tab) {
  browserIframe.src = tab.url;
  browserURL.value = tab.url;
}

// Buttons
newTabBtn.addEventListener('click', () => createTab());
goBtn.addEventListener('click', () => {
  if (!activeTab) return;
  const url = browserURL.value.trim();
  if (!url) return;
  activeTab.url = url;
  activeTab.history.push(url);
  activeTab.historyIndex = activeTab.history.length - 1;
  openTab(activeTab);
  renderTabs();
});
backBtn.addEventListener('click', () => {
  if (!activeTab) return;
  if (activeTab.historyIndex > 0) {
    activeTab.historyIndex--;
    activeTab.url = activeTab.history[activeTab.historyIndex];
    openTab(activeTab);
    renderTabs();
  }
});
forwardBtn.addEventListener('click', () => {
  if (!activeTab) return;
  if (activeTab.historyIndex < activeTab.history.length - 1) {
    activeTab.historyIndex++;
    activeTab.url = activeTab.history[activeTab.historyIndex];
    openTab(activeTab);
    renderTabs();
  }
});
refreshBtn.addEventListener('click', () => {
  if (!activeTab) return;
  browserIframe.src = activeTab.url;
});
homeBtn.addEventListener('click', () => {
  if (!activeTab) return;
  activeTab.url = 'https://www.google.com';
  activeTab.history.push(activeTab.url);
  activeTab.historyIndex = activeTab.history.length - 1;
  openTab(activeTab);
  renderTabs();
});

// Platform card click opens browser
platformCards.forEach(card => {
  card.addEventListener('click', () => {
    const site = card.dataset.site;
    let url = '';
    switch (site) {
      case 'facebook': url = 'https://www.facebook.com'; break;
      case 'tiktok': url = 'https://www.tiktok.com'; break;
      case 'youtube': url = 'https://www.youtube.com'; break;
      case 'instagram': url = 'https://www.instagram.com'; break;
      case 'twitter': url = 'https://twitter.com'; break;
      case 'likee': url = 'https://www.likee.video'; break;
      case 'pinterest': url = 'https://www.pinterest.com'; break;
      case 'vimeo': url = 'https://vimeo.com'; break;
    }
    browserSection.classList.remove('hidden');
    createTab(url);
  });
});

// ---------- DOWNLOADER LOGIC ----------
document.getElementById('download-btn').addEventListener('click', () => {
  const url = document.getElementById('video-url').value.trim();
  if (!url) return alert("Please enter a video link.");

  const resultSection = document.getElementById('result-section');
  resultSection.innerHTML = "<p>Processing...</p>";

  setTimeout(() => {
    let platform = "other";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      platform = "youtube";
    }

    resultSection.innerHTML = "";
    if (platform === "youtube") {
      resultSection.innerHTML = `
        <p>YouTube videos are watch-only. Download not supported.</p>
        <iframe width="100%" height="200" src="${url.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>
      `;
    } else {
      resultSection.innerHTML = `
        <a href="${url}" download>Download 360p</a>
        <a href="${url}" download>Download 720p</a>
        <a href="${url}" download>Download MP3</a>
      `;
    }
  }, 1000);
});

// ---------- AD PLACEHOLDER REFRESH ----------
function refreshBanner(id) {
  const banner = document.getElementById(id);
  if (!banner) return;
  banner.innerHTML = `<p style="color:#0f0;">Banner refreshed at ${new Date().toLocaleTimeString()}</p>`;
}

refreshBanner('top-banner');
refreshBanner('bottom-banner');
setInterval(() => {
  refreshBanner('top-banner');
  refreshBanner('bottom-banner');
}, 60000);
