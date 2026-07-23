function initAboutVideo() {
  const video = document.getElementById('about-video');
  if (!video) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    video.removeAttribute('autoplay');
    video.removeAttribute('loop');
    video.pause();
  }
}

initAboutVideo();
