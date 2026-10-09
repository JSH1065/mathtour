(() => {

  'use strict';

  const base = new URL('../../', document.currentScript.src), progress = window.NamdongProgress;

  let context = null, dialog = null, pending = 0, openedRun = '', autoRun = '', previousFocus = null;

  const visibleContext = () => context?.element?.isConnected && !context.element.closest('[hidden]');

  const statusText = '인천대공원의 관찰, 소래포구의 나눔, 센트럴파크의 물길에서 찾은 빛이 모여요.';

  function play() {

    const video = dialog.querySelector('video'), button = dialog.querySelector('[data-play]');

    if (video.error) video.load();

    video.muted = false; video.volume = 1; button.hidden = true;

    dialog.querySelector('[data-replay]').hidden = true;

    const blocked = () => {

      if (!dialog.open) return;

      button.hidden = false;

      dialog.querySelector('[data-status]').textContent = '소리와 함께 재생 버튼을 눌러 음악과 함께 영상을 감상해 주세요.';

    };

    try { video.play()?.catch(blocked); } catch { blocked(); }

  }

  function ensureDialog() {

    if (dialog) return;

    dialog = document.createElement('dialog'); dialog.id = 'namdongEnding'; dialog.className = 'yg-ending';

    dialog.setAttribute('aria-labelledby', 'ndEndingTitle');

    dialog.innerHTML = '<header><div><small>CHAPTER 1 · 2 · 3 COMPLETE</small><h2 id="ndEndingTitle">남동·연수에 모인 수학의 빛</h2></div><button type="button" data-close>닫기 ×</button></header><video controls playsinline preload="metadata" aria-label="남동·연수 완주 영상"></video><p data-status role="status"></p><footer><button type="button" data-play hidden>소리와 함께 재생 ▶</button><button type="button" data-replay hidden>다시 보기 ↻</button><a data-map>지역 월드맵으로 →</a></footer>';

    const video = dialog.querySelector('video');

    video.src = new URL('asset/ending/N.mp4?v=20261009-region-label', base).href;

    video.poster = new URL('asset/namdong-tour/central.webp', base).href;

    dialog.querySelector('[data-map]').href = progress.mapURL;

    dialog.querySelector('[data-close]').onclick = () => dialog.close();

    dialog.querySelector('[data-play]').onclick = play;

    dialog.querySelector('[data-replay]').onclick = () => { video.currentTime = 0; play(); };

    video.addEventListener('playing', () => {

      dialog.querySelector('[data-play]').hidden = true;

      dialog.querySelector('[data-status]').textContent = statusText;

    });

    video.addEventListener('ended', () => {

      progress.acknowledgeEnding(openedRun);

      dialog.querySelector('[data-status]').textContent = '세 챕터 완주! 여러분이 찾은 수학의 빛으로 남동·연수가 환해졌어요.';

      dialog.querySelector('[data-replay]').hidden = false;

    });

    video.addEventListener('error', () => {

      dialog.querySelector('[data-status]').textContent = '영상을 불러오지 못했어요. 완료 기록은 그대로예요. 다시 재생해 주세요.';

      dialog.querySelector('[data-play]').hidden = false;

    });

    dialog.addEventListener('close', () => {

      video.pause(); progress.acknowledgeEnding(openedRun);

      window.dispatchEvent(new CustomEvent('mathtour:ending-close', { detail: { region: 'namdong-yeonsu' } }));

      if (previousFocus?.isConnected) previousFocus.focus();

    });

    document.body.append(dialog);

  }

  function show() {

    const s = progress.status();

    if (!visibleContext() || (context.chapter && context.chapter !== 'central') || !s.allComplete || document.querySelector('dialog[open]')) return false;

    ensureDialog(); openedRun = s.run; autoRun = s.run; previousFocus = document.activeElement;

    dialog.querySelector('video').currentTime = 0;

    dialog.querySelector('[data-status]').textContent = statusText;

    dialog.showModal();

    window.dispatchEvent(new CustomEvent('mathtour:ending-open', { detail: { region: 'namdong-yeonsu' } }));

    play(); return true;

  }

  function maybeShow() {

    clearTimeout(pending);

    pending = setTimeout(() => {

      const s = progress.status();

      if (context?.chapter === 'central' && visibleContext() && s.allComplete && !s.endingSeen && autoRun !== s.run && !document.hidden) show();

    }, 350);

  }

  function setContext(element, options = {}) {

    clearTimeout(pending); context = element ? { element, chapter: options.chapter || null } : null;

    if (context) maybeShow();

  }

  window.NamdongEnding = { show, setContext };

  window.addEventListener('keydown', event => {

    if (dialog?.open) event.stopImmediatePropagation();

  }, true);

  window.addEventListener('mathtour:namdong-progress', () => {

    const s = progress.status();

    if (dialog?.open && (s.run !== openedRun || !s.allComplete)) dialog.close();

    if (s.run !== autoRun) autoRun = '';

    maybeShow();

  });

  document.addEventListener('visibilitychange', () => {

    if (document.hidden) dialog?.querySelector('video').pause(); else maybeShow();

  });

  window.addEventListener('pagehide', () => dialog?.querySelector('video').pause());

})();

