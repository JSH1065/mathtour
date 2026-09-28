(() => {
  'use strict';
  const base = new URL('../', document.currentScript.src);
  const folder = 'asset/ending/';
  const seenKey = 'mathtour.michuhol-jemulpo.ending-v1';
  const dismissedKey = seenKey + '.dismissed';
  const keys = ['sports', 'munhak', 'subong'].map(id => 'mathtour.michuhol-jemulpo.' + id + '-v1');
  let host = null, active = false, dialog = null, autoOpened = false, pending = 0, previousFocus = null, contextChapter = null;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const getSession = () => { try { return sessionStorage.getItem(dismissedKey) === '1'; } catch { return false; } };
  function status() {
    const s=window.MathTourMichuholChapters?.status();
    const complete=s?s.items.map(c=>c.completed):[false,false,false];
    return { complete, count: complete.filter(Boolean).length, allComplete: complete.every(Boolean), seen: read(seenKey)?.watched === true };
  }
  function resetAcknowledgmentIfIncomplete(s) {
    if (s.allComplete) return;
    try { localStorage.removeItem(seenKey); sessionStorage.removeItem(dismissedKey); } catch {}
    autoOpened = false;
  }
  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.id = 'michuholEnding';
    dialog.className = 'mj-ending';
    dialog.setAttribute('aria-labelledby', 'mjEndingTitle');
    dialog.innerHTML = '<header><div><small>CHAPTER 1 · 2 · 3 COMPLETE</small><h2 id="mjEndingTitle">미추홀·제물포에 모인 수학의 빛</h2></div><button type="button" data-close>닫기 ×</button></header><video controls playsinline preload="metadata" aria-label="미추홀 제물포 완주 영상, 25초"></video><p data-status role="status">세 챕터에서 찾은 빛이 도시를 밝힙니다.</p><footer><button type="button" data-play hidden>소리와 함께 재생 ▶</button><button type="button" data-replay hidden>다시 보기 ↻</button><a data-map>지역 월드맵으로 →</a></footer>';
    const video = dialog.querySelector('video');
    video.src = new URL(folder + 'M.mp4?v=20260929-map-bgm', base).href;
    video.poster = new URL(folder + 'M-poster.webp?v=20260929-map-bgm', base).href;
    dialog.querySelector('[data-map]').href = new URL('index.html?region=michuhol-jemulpo', base).href;
    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelector('[data-play]').onclick = play;
    dialog.querySelector('[data-replay]').onclick = () => { video.currentTime = 0; play(); };
    video.addEventListener('playing', () => {
      dialog.querySelector('[data-play]').hidden = true;
      dialog.querySelector('[data-status]').textContent = '세 챕터에서 찾은 빛이 도시를 밝힙니다.';
    });
    video.addEventListener('ended', () => {
      if (status().allComplete) {
        try { localStorage.setItem(seenKey, JSON.stringify({ watched: true, version: 1, at: new Date().toISOString() })); } catch {}
      }
      dialog.querySelector('[data-status]').textContent = '세 챕터 완주! 여러분이 찾은 수학의 빛으로 미추홀·제물포가 밝아졌어요.';
      dialog.querySelector('[data-replay]').hidden = false;
      render();
    });
    video.addEventListener('error', () => {
      dialog.querySelector('[data-status]').textContent = '영상을 불러오지 못했어요. 다시 재생하거나 지역 월드맵으로 돌아갈 수 있어요.';
      dialog.querySelector('[data-play]').hidden = false;
    });
    dialog.addEventListener('close', () => {
      video.pause();
      try { sessionStorage.setItem(dismissedKey, '1'); } catch {}
      window.dispatchEvent(new CustomEvent('mathtour:ending-close', { detail: { region: 'michuhol-jemulpo' } }));
      if (previousFocus?.isConnected) previousFocus.focus();
    });
    document.body.append(dialog);
  }
  function play() {
    const video = dialog.querySelector('video');
    if (video.error) video.load();
    video.muted = false; video.volume = 1;
    dialog.querySelector('[data-replay]').hidden = true;
    const blocked = () => {
      if (!dialog.open) return;
      dialog.querySelector('[data-play]').hidden = false;
      dialog.querySelector('[data-status]').textContent = '소리와 함께 재생 버튼을 눌러 음악과 함께 도시가 밝아지는 순간을 보세요.';
    };
    try { const promise = video.play(); if (promise) promise.catch(blocked); } catch { blocked(); }
  }
  function show() {
    if ((contextChapter && contextChapter !== 'subong') || !status().allComplete || document.querySelector('dialog[open]')) return false;
    ensureDialog();
    previousFocus = document.activeElement;
    autoOpened = true;
    dialog.querySelector('video').currentTime = 0;
    dialog.showModal();
    window.dispatchEvent(new CustomEvent('mathtour:ending-open', { detail: { region: 'michuhol-jemulpo' } }));
    play();
    return true;
  }
  function render() {
    if (!host || !active) return;
    const s = status();
    resetAcknowledgmentIfIncomplete(s);
    let panel = host.querySelector('.mj-ending-panel');
    if (!panel) { panel = document.createElement('div'); panel.className = 'mj-ending-panel'; host.append(panel); }
    if(contextChapter==='sports'||contextChapter==='munhak'){
      const next=contextChapter==='sports'?'munhak':'subong',n=contextChapter==='sports'?2:3;
      const unlocked=window.MathTourMichuholChapters.status().items.find(c=>c.id===next).unlocked;
      panel.innerHTML='<div><strong>챕터 '+(n-1)+' 완료</strong><p>챕터 '+n+' · '+(next==='munhak'?'문학산':'수봉공원')+(unlocked?' 여행이 열렸어요.':'은 앞선 미션을 완료하면 열려요.')+'</p></div>'+(unlocked?'<a href="'+window.MathTourMichuholChapters.courseURL(next)+'">다음 챕터로 출발 →</a>':'');
      return;
    }
    panel.innerHTML = '<div><strong>미추홀·제물포의 수학의 빛 <span>' + s.count + ' / 3</span></strong><p>' + (s.allComplete ? '세 챕터의 빛을 모두 찾았어요.' : '스포츠 → 문학산 → 수봉공원을 마치면 완주 영상이 열려요.') + '</p></div><button type="button"' + (s.allComplete ? '' : ' disabled') + '>' + (s.allComplete ? (s.seen ? '완주 영상 다시 보기 ▶' : '완주 영상 보기 ▶') : '세 챕터를 완료해 주세요') + '</button>';
    panel.querySelector('button').onclick = show;
  }
  function maybeShow() {
    clearTimeout(pending);
    pending = setTimeout(() => {
      const s = status();
      if (contextChapter === 'subong' && active && host?.isConnected && !host.closest('[hidden]') && s.allComplete && !s.seen && !autoOpened && !getSession() && !document.hidden) show();
    }, 450);
  }
  function setContext(element, options = {}) {
    host = element || null;
    active = !!host;
    contextChapter = options.chapter || null;
    resetAcknowledgmentIfIncomplete(status());
    if (active) { host.hidden = false; render(); maybeShow(); } else clearTimeout(pending);
  }
  window.MathTourMichuholEnding = { status, show, setContext };
  window.addEventListener('mathtour:michuhol-progress', () => { resetAcknowledgmentIfIncomplete(status()); if(dialog?.open&&!status().allComplete)dialog.close(); render(); });
  window.addEventListener('storage', e => {
    if (e.key === null || keys.includes(e.key) || e.key === seenKey) {
      resetAcknowledgmentIfIncomplete(status());
      if (dialog?.open && !status().allComplete) dialog.close();
      render(); maybeShow();
    }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && active) { render(); maybeShow(); } });
})();
