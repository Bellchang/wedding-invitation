const musicButton = document.querySelector('#musicButton');
const musicText = document.querySelector('#musicText');
let audioContext;
let musicTimer;

function chime() {
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99, 659.25].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.42);
    gain.gain.exponentialRampToValueAtTime(0.07, now + index * 0.42 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.42 + 0.62);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * 0.42); oscillator.stop(now + index * 0.42 + 0.65);
  });
}

function toggleMusic() {
  if (musicTimer) {
    clearInterval(musicTimer); musicTimer = null;
    musicButton.classList.remove('playing'); musicText.textContent = '音乐';
    return;
  }
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume(); chime(); musicTimer = setInterval(chime, 2000);
  musicButton.classList.add('playing'); musicText.textContent = '暂停';
}
musicButton.addEventListener('click', toggleMusic);

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
