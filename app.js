const musicButton = document.querySelector('#musicButton');
const musicText = document.querySelector('#musicText');
const backgroundMusic = document.querySelector('#backgroundMusic');

async function toggleMusic() {
  if (!backgroundMusic.paused) {
    backgroundMusic.pause();
    musicButton.classList.remove('playing'); musicText.textContent = '音乐';
    return;
  }
  try {
    await backgroundMusic.play();
    musicButton.classList.add('playing'); musicText.textContent = '暂停';
  } catch {
    musicText.textContent = '播放失败';
  }
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
