// Platform card click
const platformCards = document.querySelectorAll('.platform-card');

platformCards.forEach(card => {
  card.addEventListener('click', () => {
    const site = card.dataset.site;
    alert(`Opening ${site} in in-app browser (to implement later).`);
  });
});

// Download button click
document.getElementById('download-btn').addEventListener('click', () => {
  const url = document.getElementById('video-url').value.trim();
  if (!url) return alert("Please enter a video link.");
  
  // Platform detection (basic)
  let platform = "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    platform = "youtube";
  }
  
  const resultSection = document.getElementById('result-section');
  resultSection.innerHTML = "";
  
  if (platform === "youtube") {
    resultSection.innerHTML = "<p>YouTube videos are watch-only. Download not supported.</p>";
  } else {
    resultSection.innerHTML = `
      <a href="#" download>Download 360p</a>
      <a href="#" download>Download 720p</a>
      <a href="#" download>Download MP3</a>
    `;
  }
});
