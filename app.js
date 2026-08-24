const musicButton = document.querySelector('#musicButton');
const musicText = document.querySelector('#musicText');
const backgroundMusic = document.querySelector('#backgroundMusic');
const entryGate = document.querySelector('#entryGate');
const enterInvitation = document.querySelector('#enterInvitation');
const entryVideo = document.querySelector('#entryVideo');
const pages = [...document.querySelectorAll('.panel')];
let currentPage = 0;
let isEnteringInvitation = false;

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

musicButton.addEventListener('click', toggleMusic);
backgroundMusic.addEventListener('play', () => showMusicState(true));
backgroundMusic.addEventListener('pause', () => showMusicState(false));

async function startInvitation() {
  if (isEnteringInvitation || entryGate.classList.contains('is-hidden')) return;
  isEnteringInvitation = true;
  enterInvitation.disabled = true;
  enterInvitation.textContent = '正在开启音乐…';
  backgroundMusic.currentTime = 0;
  const started = await playMusic();
  if (!started) {
    isEnteringInvitation = false;
    enterInvitation.disabled = false;
    enterInvitation.textContent = '请再轻触一次开启音乐';
    return;
  }
  entryGate.classList.add('is-hidden');
  entryVideo.pause();
  window.setTimeout(() => entryGate.remove(), 600);
}
function handleInvitationEntry(event) {
  if (event.type === 'touchend') event.preventDefault();
  startInvitation();
}
entryGate.addEventListener('touchend', handleInvitationEntry, { passive: false });
entryGate.addEventListener('click', handleInvitationEntry);
backgroundMusic.load();
entryVideo.play().catch(() => {});

function showPage(index) {
  if (index < 0 || index >= pages.length || index === currentPage) return;
  pages[currentPage].classList.remove('is-active');
  currentPage = index;
  pages[currentPage].classList.add('is-active');
}

pages[0].classList.add('is-active');
pages.slice(0, -1).forEach((page, index) => {
  page.addEventListener('click', event => {
    if (!event.target.closest('a, button, input, select, textarea, label')) showPage(index + 1);
  });
});

document.querySelector('[data-next]')?.addEventListener('click', () => showPage(1));

const form = document.querySelector('#rsvpForm');
const result = document.querySelector('#formResult');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = form.querySelector('.submit');
  const data = new FormData(form);
  const payload = { name: data.get('name').trim(), attendance: data.get('attendance'), guests: Number(data.get('guests')), note: data.get('note').trim() };
  submit.disabled = true; result.textContent = '正在提交…';
  try {
    const response = await fetch('/api/rsvp', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    result.textContent = data.message; form.reset();
  } catch (error) {
    result.textContent = error.message || '网络开了个小差，请稍后重试。';
  } finally { submit.disabled = false; }
});
