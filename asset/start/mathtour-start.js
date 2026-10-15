(() => {
  'use strict';
  const flow = window.MathTourEntry;
  const dialog = document.querySelector('#prologueDialog');
  const player = document.querySelector('#prologuePlayer');
  const video = document.querySelector('#prologueVideo');
  const status = document.querySelector('#videoStatus');
  const play = document.querySelector('#videoPlay');
  const sound = document.querySelector('#videoSound');
  const start = document.querySelector('#gameStartButton');
  const skip = document.querySelector('#videoSkip');
  let returnFocus = null, autoContinue = false, leaving = false, playAttempt = 0;

  function refreshStart() {
    leaving = false;
    document.querySelector('#directMapLink').href = flow.mapURL();
  }
  function showDialog(target, opener) {
    if (document.querySelector('dialog[open]')) return false;
    returnFocus = opener;
    target.showModal();
    document.body.style.overflow = 'hidden';
    return true;
  }
  function enterMap(choice) {
    if (leaving) return;
    leaving = true;
    playAttempt++;
    video.pause();
    flow.enter(choice);
    location.replace(flow.mapURL());
  }
  function updateControls() {
    play.textContent = video.error ? '다시 불러오기' : video.paused ? '▶ 재생' : 'Ⅱ 일시정지';
    sound.textContent = video.muted ? '소리 켜기' : '소리 끄기';
    sound.setAttribute('aria-pressed', String(!video.muted));
  }
  async function playVideo() {
    const attempt = ++playAttempt;
    if (video.error) video.load();
    status.textContent = '영상을 준비하고 있어요. 바로 출발할 수도 있어요.';
    try {
      await video.play();
    } catch (_) {
      if (attempt === playAttempt && dialog.open) {
        status.textContent = video.error ? '영상을 불러오지 못했어요. 다시 불러오거나 지도에서 여행을 시작해 주세요.'
          : '재생 버튼을 누르면 영상이 시작돼요. 바로 출발해도 괜찮아요.';
      }
    }
    if (attempt === playAttempt) updateControls();
  }
  function openPrologue(opener, continueAfter) {
    if (!showDialog(dialog, opener)) return;
    autoContinue = continueAfter;
    skip.textContent = continueAfter ? '건너뛰고 출발 →' : '지도에서 이어하기 →';
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.currentTime = 0;
    try { video.muted = localStorage.getItem('incheon-bgm-muted') === 'true'; } catch (_) { video.muted = false; }
    updateControls();
    playVideo();
  }
  start.addEventListener('click', () => openPrologue(start, true));
  document.querySelector('#directMapLink').addEventListener('click', event => { event.preventDefault(); enterMap(flow.hasTravel() ? undefined : 'skipped'); });
  document.querySelectorAll('[data-guide]').forEach(button => button.addEventListener('click', () => showDialog(document.querySelector('#guideDialog'), button)));
  document.querySelectorAll('[data-notebook]').forEach(button => button.addEventListener('click', () => showDialog(document.querySelector('#notebookDialog'), button)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(target => {
    target.addEventListener('click', event => {
      if (target === dialog || event.target !== target) return;
      const r = target.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) target.close();
    });
    target.addEventListener('close', () => {
      if (target === dialog) {
        playAttempt++;
        video.pause();
        if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {});
      }
      document.body.style.overflow = '';
      returnFocus?.focus({ preventScroll: true });
    });
  });
  play.addEventListener('click', () => {
    if (video.paused || video.error) playVideo();
    else { video.pause(); status.textContent = '잠시 멈췄어요. 대사를 읽고 다시 재생해 주세요.'; }
  });
  document.querySelector('#videoRestart').addEventListener('click', () => { video.currentTime = 0; playVideo(); });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    try { localStorage.setItem('incheon-bgm-muted', String(video.muted)); } catch (_) { /* optional setting */ }
    updateControls();
  });
  document.querySelector('#videoFullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.requestFullscreen) await player.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else status.textContent = '기기를 가로로 돌리면 더 크게 볼 수 있어요.';
    } catch (_) { status.textContent = '전체 화면을 열지 못했어요. 기기를 가로로 돌려 보세요.'; }
  });
  document.addEventListener('fullscreenchange', () => {
    document.querySelector('#videoFullscreen').textContent = document.fullscreenElement ? '전체 화면 닫기' : '전체 화면';
  });
  skip.addEventListener('click', () => enterMap(video.ended ? 'seen' : 'skipped'));
  ['play', 'pause', 'volumechange'].forEach(name => video.addEventListener(name, updateControls));
  video.addEventListener('playing', () => { status.textContent = '민우·서연과 함께 빛의 수첩 이야기를 만나 보세요.'; });
  video.addEventListener('waiting', () => { status.textContent = '영상을 불러오는 중이에요. 기다리거나 바로 출발해 주세요.'; });
  video.addEventListener('error', () => {
    status.textContent = '영상을 불러오지 못했어요. 다시 불러오거나 지도에서 여행을 시작해 주세요.';
    updateControls();
  });
  video.addEventListener('ended', () => {
    if (!dialog.open) return;
    if (autoContinue) enterMap('seen');
    else {
      status.textContent = '이제 우리들의 수학 여행을 떠나 볼까요?';
      skip.textContent = '지도에서 출발 →';
      skip.focus({ preventScroll: true });
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dialog.open) video.pause(); });
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', refreshStart);
  refreshStart();
})();
