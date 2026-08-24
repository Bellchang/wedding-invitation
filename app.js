const musicButton = document.querySelector('#musicButton');
const musicText = document.querySelector('#musicText');
const backgroundMusic = document.querySelector('#backgroundMusic');
const entryGate = document.querySelector('#entryGate');
const pages = [...document.querySelectorAll('.panel')];
const longStoryPanel = document.querySelector('.long-story-panel');
const storyScenes = [...document.querySelectorAll('.story-scene')];
const storyStep = document.querySelector('#storyStep');
const photoSources = [
  './cover-photo.jpg',
  './gallery-photo-1.jpg',
  './gallery-photo-2.jpg',
  './gallery-photo-3.jpg',
  './gallery-photo-4.jpg'
];
let currentPage = 0;
let currentStoryScene = 0;
let isChangingStory = false;
let isEnteringInvitation = false;
let openingAnimationStarted = false;
let photoTimer;

function showMusicState(isPlaying, failed = false) {
  musicButton.classList.toggle('playing', isPlaying);
  musicText.textContent = isPlaying ? '暂停' : failed ? '点击播放' : '音乐';
  musicButton.setAttribute('aria-label', isPlaying ? '暂停背景音乐' : '播放背景音乐');
}

async function playMusic() {
  if (!backgroundMusic.paused) return true;
  try {
    await backgroundMusic.play();
    showMusicState(true);
    return true;
  } catch {
    showMusicState(false, true);
    return false;
  }
}

function toggleMusic() {
  if (backgroundMusic.paused) return playMusic();
  backgroundMusic.pause();
  showMusicState(false);
}

function renderPhoto(photo, index, immediate = false) {
  const source = photoSources[index % photoSources.length];
  const previous = photo.querySelector('.photo-cycle-layer.is-visible');
  const layer = document.createElement('span');
  layer.className = 'photo-cycle-layer';
  layer.style.backgroundImage = `url("${source}")`;
  photo.append(layer);
  if (immediate) {
    layer.classList.add('is-visible');
    previous?.remove();
    return;
  }
  requestAnimationFrame(() => layer.classList.add('is-visible'));
  window.setTimeout(() => previous?.remove(), 1250);
}

function initializePhotos() {
  document.querySelectorAll('.photo-fill[data-photo-set]').forEach(photo => {
    photo.dataset.photoIndex = photo.dataset.photoSet;
    renderPhoto(photo, Number(photo.dataset.photoIndex), true);
  });
}

function startPhotoLoop(page) {
  window.clearInterval(photoTimer);
  if (page.classList.contains('cover-panel')) return;
  const photos = [...page.querySelectorAll('.photo-fill[data-photo-set]')];
  if (!photos.length) return;
  photoTimer = window.setInterval(() => {
    photos.forEach(photo => {
      const next = (Number(photo.dataset.photoIndex) + 1) % photoSources.length;
      photo.dataset.photoIndex = String(next);
      renderPhoto(photo, next);
    });
  }, 4200);
}

function startInvitation() {
  if (isEnteringInvitation || entryGate.classList.contains('is-hidden')) return;
  isEnteringInvitation = true;
  entryGate.classList.add('is-hidden');
  window.setTimeout(() => entryGate.remove(), 600);
}

function showPage(index) {
  if (index < 0 || index >= pages.length || index === currentPage) return;
  pages[currentPage].classList.remove('is-active');
  currentPage = index;
  pages[currentPage].classList.add('is-active');
  startPhotoLoop(pages[currentPage]);
}

function showStoryScene(index) {
  if (index < 0 || index >= storyScenes.length) return;
  storyScenes[currentStoryScene].classList.remove('is-current');
  currentStoryScene = index;
  storyScenes[currentStoryScene].classList.add('is-current');
  storyStep.textContent = String(index + 1).padStart(2, '0');
}

musicButton.addEventListener('click', toggleMusic);
backgroundMusic.addEventListener('play', () => showMusicState(true));
backgroundMusic.addEventListener('pause', () => showMusicState(false));
backgroundMusic.load();
function revealEntryVideo() {
  if (entryVideo.currentTime <= 0.05) return;
  entryGate.classList.add('is-video-ready');
  entryVideo.style.opacity = '1';
  document.querySelector('.entry-fallback').style.opacity = '0';
}

function startCanvasOpening() {
  if (!entryCanvas) return;
  const context = entryCanvas.getContext('2d');
  const image = new Image();
  const particles = Array.from({ length: 34 }, (_, index) => ({
    x: (index * 79 % 997) / 997,
    y: (index * 151 % 991) / 991,
    size: 1.4 + index % 3,
    speed: 8 + index % 7
  }));
  let imageReady = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    entryCanvas.width = Math.round(window.innerWidth * ratio);
    entryCanvas.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(now) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const time = now / 1000;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#1a1011';
    context.fillRect(0, 0, width, height);
    if (imageReady) {
      const zoom = 1.06 + Math.sin(time * .42) * .025;
      const scale = Math.max(width / image.width, height / image.height) * zoom;
      const drawnWidth = image.width * scale;
      const drawnHeight = image.height * scale;
      const x = (width - drawnWidth) / 2 + Math.sin(time * .28) * 12;
      const y = (height - drawnHeight) / 2 + Math.cos(time * .24) * 10;
      context.drawImage(image, x, y, drawnWidth, drawnHeight);
    }
    const shade = context.createLinearGradient(0, 0, 0, height);
    shade.addColorStop(0, 'rgba(11, 29, 46, .08)');
    shade.addColorStop(.52, 'rgba(40, 15, 8, .20)');
    shade.addColorStop(1, 'rgba(29, 7, 7, .72)');
    context.fillStyle = shade;
    context.fillRect(0, 0, width, height);
    const sweep = ((time * 110) % (width * 2.3)) - width * .9;
    const beam = context.createLinearGradient(sweep - width * .42, 0, sweep + width * .42, height);
    beam.addColorStop(0, 'rgba(255, 214, 133, 0)');
    beam.addColorStop(.5, 'rgba(255, 220, 146, .28)');
    beam.addColorStop(1, 'rgba(255, 214, 133, 0)');
    context.fillStyle = beam;
    context.fillRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      const y = (particle.y * height - time * particle.speed * 5 + height) % height;
      const x = particle.x * width + Math.sin(time * .8 + index) * 15;
      context.beginPath();
      context.fillStyle = `rgba(255, 224, 159, ${.22 + (Math.sin(time * 1.4 + index) + 1) * .18})`;
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  }

  image.onload = () => { imageReady = true; };
  image.src = './opening-cover.jpg';
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}

function startOpeningAnimation() {
  if (openingAnimationStarted) return;
  openingAnimationStarted = true;
  window.setTimeout(startInvitation, 8200);
}

startOpeningAnimation();
document.addEventListener('WeixinJSBridgeReady', startOpeningAnimation, { once: true });

initializePhotos();
startPhotoLoop(pages[currentPage]);
pages.slice(0, -1).forEach((page, index) => {
  page.addEventListener('click', event => {
    if (page === longStoryPanel) return;
    if (!event.target.closest('a, button, input, select, textarea, label')) showPage(index + 1);
  });
});

longStoryPanel.addEventListener('click', event => {
  if (event.target.closest('a, button, input, select, textarea, label')) return;
  if (isChangingStory) return;
  isChangingStory = true;
  if (currentStoryScene < storyScenes.length - 1) {
    showStoryScene(currentStoryScene + 1);
    window.setTimeout(() => { isChangingStory = false; }, 500);
    return;
  }
  showPage(pages.indexOf(longStoryPanel) + 1);
  window.setTimeout(() => { isChangingStory = false; }, 500);
});

const form = document.querySelector('#rsvpForm');
const result = document.querySelector('#formResult');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = form.querySelector('.submit');
  const data = new FormData(form);
  const payload = { name: data.get('name').trim(), attendance: data.get('attendance'), guests: Number(data.get('guests')), note: data.get('note').trim() };
  submit.disabled = true;
  result.textContent = '正在提交…';
  try {
    const response = await fetch('/api/rsvp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message);
    result.textContent = responseData.message;
    form.reset();
  } catch (error) {
    result.textContent = error.message || '网络开了个小差，请稍后重试。';
  } finally {
    submit.disabled = false;
  }
});
