/* Shared chapter completion for the Gyeyang–Bupyeong course. No visit-based unlocks. */
(function (root) {
  'use strict';
  const PREFIX = 'mathtour.gyeyang-bupyeong.chapters-v1.';
  const RUN_KEY = PREFIX + 'run';
  const REGION_KEYS = ['mall', 'hyanggyo', 'mountain', 'ending-seen'].map(id => PREFIX + id).concat([
    'mathtour.bupyeong.course-v6', 'mathtour.bupyeong.course-v5', 'mathtour.bupyeong.travel-v4',
    'mathtour.bupyeong.hyanggyo-v1', 'mathtour.gyeyang.course-v1', 'mathtour.summit.best.v1'
  ]);
  const chapters = [
    { id: 'mall', number: 1, title: '부평지하상가 & 굴포천', file: 'B01.html' },
    { id: 'hyanggyo', number: 2, title: '부평향교', file: 'B02.html' },
    { id: 'mountain', number: 3, title: '계양산', file: 'B03.html' }
  ];
  function validCompletion(id, value) {
    if (!value || typeof value !== 'object') return false;
    if (id === 'mall') return value.version === 6 && value.hasCamera === true && value.departed === true && value.returned === true &&
      Array.isArray(value.progress) && value.progress.length === 3 && value.progress.every(v => v === true) &&
      value.gulpo?.version === 1 && Array.isArray(value.gulpo.placed) && value.gulpo.placed.length === 6 &&
      value.gulpo.finalSeen === true && value.gulpo.tripFinished === true;
    if (id === 'hyanggyo') return value.finalCompleted === true && value.departed === true &&
      ['gate', 'myeongryun', 'west', 'east', 'daeseong'].every(key => value.progress?.[key] === true);
    if (id === 'mountain') return value.version === 1 && value.jar === true && value.camera === true && value.departed === true &&
      Number.isFinite(value.score) && value.score >= 90 && value.score <= 100;
    return false;
  }
  function createStore(storage, now = () => Date.now()) {
    const memory = new Map(), unsaved = new Set();
    function read(key) { if (!storage || unsaved.has(key)) return memory.get(key); try { const raw = storage.getItem(key); return raw ? JSON.parse(raw) : undefined; } catch (_) { return memory.get(key); } }
    function write(key, value) { memory.set(key, value); try { storage?.setItem(key, JSON.stringify(value)); unsaved.delete(key); } catch (_) { unsaved.add(key); } }
    const liveRun = () => read(RUN_KEY)?.id || '';
    let run = liveRun();
    const isCurrentRun = () => run === liveRun();
    const acceptsSave = value => !!value && (value._regionRun || '') === liveRun();
    const stampSave = value => ({ ...value, _regionRun: run });
    function recorded(id) { const item = read(PREFIX + id); return acceptsSave(item) && item.version === 1 && item.completed === true; }
    function importLegacy() {
      if (!isCurrentRun()) return;
      for (const [id, key] of [['mall', 'mathtour.bupyeong.course-v6'], ['mountain', 'mathtour.gyeyang.course-v1']]) {
        const value = read(key);
        if (!recorded(id) && acceptsSave(value) && validCompletion(id, value)) write(PREFIX + id, stampSave({ version: 1, completed: true, completedAt: now(), imported: true }));
      }
    }
    function status() {
      importLegacy();
      let previousComplete = true;
      const items = chapters.map(chapter => {
        const unlocked = previousComplete, completed = unlocked && recorded(chapter.id);
        previousComplete = completed;
        return { ...chapter, unlocked, completed };
      });
      return { items, completed: items.filter(item => item.completed).length, allComplete: previousComplete,
        endingSeen: acceptsSave(read(PREFIX + 'ending-seen')) && read(PREFIX + 'ending-seen').seen === true };
    }
    function complete(id, evidence) {
      const current = status().items.find(item => item.id === id);
      if (!isCurrentRun() || !current?.unlocked || !validCompletion(id, evidence)) return false;
      if (!recorded(id)) write(PREFIX + id, stampSave({ version: 1, completed: true, completedAt: now() }));
      return true;
    }
    function acknowledgeEnding() { if (isCurrentRun() && status().allComplete) write(PREFIX + 'ending-seen', stampSave({ seen: true, at: now() })); }
    function resetRegion() {
      // Mark the new journey first: an old open tab cannot re-import or save its old progress.
      const next = { id: String(now()) + '-' + Math.random().toString(36).slice(2) };
      try {
        storage?.setItem(RUN_KEY, JSON.stringify(next));
        memory.set(RUN_KEY, next); unsaved.delete(RUN_KEY); run = next.id;
        for (const key of REGION_KEYS) { storage?.removeItem(key); memory.delete(key); unsaved.delete(key); }
        return true;
      } catch (_) { return false; }
    }
    return { status, complete, acknowledgeEnding, resetRegion, isCurrentRun, acceptsSave, stampSave, syncRun: () => { run = liveRun(); } };
  }
  if (typeof module === 'object' && module.exports) module.exports = { PREFIX, RUN_KEY, REGION_KEYS, chapters, validCompletion, createStore };
  if (!root.document) return;
  const document = root.document;
  let storage; try { storage = root.localStorage; } catch (_) { /* unavailable in some file viewers */ }
  const store = createStore(storage);
  const assetScript = document.currentScript?.src;
  const packageRoot = assetScript ? new URL('../', assetScript) : new URL('./', root.location.href);
  const mapURL = new URL('index.html?region=gyeyang-bupyeong', packageRoot).href;
  const videoURL = new URL('asset/ending/B.mp4?v=20260929-map-bgm', packageRoot).href;
  const posterURL = new URL('asset/ending/B-poster.webp?v=20260929-map-bgm', packageRoot).href;
  const isMap = /\/index\.html$/i.test(root.location.pathname);
  let courseFinished = false, autoOpened = false, endingDialog = null, activeCourse = null;
  function style() {
    if (document.getElementById('mt-chapter-style')) return;
    const link = document.createElement('link'); link.id = 'mt-chapter-style'; link.rel = 'stylesheet';
    link.href = new URL('asset/mathtour-chapters.css', packageRoot).href; document.head.append(link);
  }
  function announce() { root.dispatchEvent(new CustomEvent('mathtour:chapters-changed')); }
  function dialog(id, contents) {
    style(); const el = document.createElement('dialog'); el.id = id; el.className = 'mt-dialog';
    el.innerHTML = contents; document.body.append(el); return el;
  }
  // Keep arrows/Space inside our modal from also moving the bus or advancing a story.
  root.addEventListener('keydown', event => {
    if (!document.querySelector('.mt-dialog[open]')) return;
    event.stopImmediatePropagation();
  }, true);
  function enterCourse(id) {
    style();
    document.querySelectorAll('a[href="index.html"]').forEach(link => { link.href = mapURL; });
    activeCourse = id;
    const toolbar = document.querySelector('.topbar .toolbar, .topbar .header-actions, .topbar nav');
    if (toolbar) {
      let link = toolbar.querySelector('a[href="' + mapURL + '"]');
      if (!link) { link = document.createElement('a'); toolbar.append(link); }
      link.href = mapURL; link.classList.add('mt-region-map-link'); link.textContent = '지역 월드맵';
      link.title = '계양·부평 챕터 지도로 돌아가기';
    }
    const item = store.status().items.find(chapter => chapter.id === id);
    if (!item) return false;
    if (item.unlocked) return true;
    const first = store.status().items.find(chapter => !chapter.completed);
    const gate = dialog('mt-chapter-lock', `<div class="mt-dialog-card"><small>계양·부평 MATH TOUR</small><h2>앞선 챕터의 빛을 먼저 찾아요</h2><p>챕터 ${item.number} · ${item.title}는<br>챕터 ${item.number - 1}을 완료하면 열립니다.</p><p>지금은 <strong>챕터 ${first.number} · ${first.title}</strong>부터 여행해 주세요.</p><a class="mt-primary" href="${mapURL}">챕터 지도로 돌아가기 →</a></div>`);
    gate.setAttribute('aria-label', '아직 잠긴 챕터'); gate.addEventListener('cancel', e => e.preventDefault()); gate.showModal();
    return false;
  }
  function goToMap() {
    root.dispatchEvent(new CustomEvent('mathtour:before-map'));
    root.location.href = mapURL;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!activeCourse || link?.href !== mapURL || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); goToMap();
  });
  function confirmRegionReset(container, onSelect) {
    let modal = document.getElementById('mt-region-reset');
    if (modal?.open) return;
    modal?.remove();
    modal = dialog('mt-region-reset', '<div class="mt-dialog-card"><small>계양·부평 지역 초기화</small><h2>이 지역 여행을 처음부터 시작할까요?</h2><p>세 챕터의 미션 진행과 완료 기록, 엔딩 감상 기록을 지웁니다.<br>챕터 1부터 다시 시작하며, 챕터 2·3은 잠깁니다.<br>다른 지역의 기록은 그대로 유지됩니다.</p><p class="mt-reset-error" role="alert" hidden></p><div class="mt-reset-actions"><button type="button" class="mt-reset-cancel" autofocus>취소 · 계속 여행하기</button><button type="button" class="mt-primary mt-reset-confirm">초기화하기</button></div></div>');
    modal.setAttribute('aria-label', '계양·부평 지역 초기화 확인');
    const close = () => { modal.close(); container.querySelector('.mt-region-reset')?.focus(); };
    modal.querySelector('.mt-reset-cancel').addEventListener('click', close);
    modal.addEventListener('cancel', event => { event.preventDefault(); close(); });
    modal.querySelector('.mt-reset-confirm').addEventListener('click', () => {
      if (!store.resetRegion()) {
        const error = modal.querySelector('.mt-reset-error'); error.hidden = false;
        error.textContent = '이 브라우저에 초기화를 저장하지 못했어요. 저장 공간 설정을 확인하고 다시 시도해 주세요.'; return;
      }
      courseFinished = false; autoOpened = false;
      if (endingDialog?.open) { endingDialog.querySelector('video').pause(); endingDialog.close(); }
      modal.close(); announce(); renderChapters(container, onSelect);
      const notice = document.createElement('p'); notice.className = 'mt-reset-notice'; notice.setAttribute('role', 'status');
      notice.textContent = '계양·부평 여행을 초기화했어요. 챕터 1부터 다시 출발해요.'; container.append(notice);
      container.querySelector('[data-chapter="mall"]')?.focus();
    });
    modal.showModal(); modal.querySelector('.mt-reset-cancel').focus();
  }
  function renderChapters(container, onSelect) {
    style(); const status = store.status(); container.hidden = false; container.replaceChildren();
    const heading = document.createElement('div'); heading.className = 'mt-chapter-heading';
    heading.innerHTML = `<strong>계양·부평 수학의 빛 <span>${status.completed} / 3</span></strong><span>${status.allComplete ? '세 챕터의 빛이 모두 모였어요!' : '챕터를 차례로 완료하면 다음 여행이 열려요.'}</span>`;
    container.append(heading);
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'mt-region-reset';
    reset.textContent = '지역 초기화'; reset.addEventListener('click', () => confirmRegionReset(container, onSelect)); heading.append(reset);
    const list = document.createElement('div'); list.className = 'mt-chapter-list';
    status.items.forEach(item => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'mt-chapter-card';
      button.dataset.chapter = item.id; button.dataset.status = item.completed ? 'complete' : item.unlocked ? 'ready' : 'locked';
      button.disabled = !item.unlocked;
      button.innerHTML = `<small>CHAPTER ${item.number}</small><strong>${item.title}</strong><span>${item.completed ? '✓ 완료 · 다시 여행하기' : item.unlocked ? '여행 시작 →' : '🔒 챕터 ' + (item.number - 1) + ' 완료 후 해금'}</span>`;
      button.addEventListener('click', () => { if (store.status().items.find(c => c.id === item.id)?.unlocked) onSelect(item.id); }); list.append(button);
    });
    container.append(list);
    if (status.allComplete) {
      const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'mt-ending-replay';
      replay.textContent = '✦ 계양·부평 엔딩 영상 다시 보기'; replay.addEventListener('click', () => showEnding()); container.append(replay);
    }
  }
  function finishCourse(id, evidence, container) {
    if (!store.complete(id, evidence)) return false;
    courseFinished = true;
    announce();
    if (container) {
      let banner = container.querySelector('.mt-unlock-banner');
      if (!banner) { banner = document.createElement('div'); banner.className = 'mt-unlock-banner'; container.append(banner); }
      const status = store.status(), next = status.items.find(item => !item.completed);
      banner.innerHTML = next ? `<strong>✦ 챕터 ${chapters.find(c => c.id === id).number} 완료!</strong><span>챕터 ${next.number} · ${next.title} 여행이 열렸어요.</span><a class="mt-primary" href="${mapURL}">다음 챕터로 출발 →</a>` : `<strong>✦ 계양·부평의 수학의 빛을 모두 찾았어요!</strong><button type="button" class="mt-primary">엔딩 영상 다시 보기</button>`;
      banner.querySelector('button')?.addEventListener('click', () => showEnding());
    }
    maybeShowEnding(); return true;
  }
  function showEnding() {
    if (!store.status().allComplete || endingDialog?.open) return false;
    autoOpened = true;
    if (!endingDialog) {
      endingDialog = dialog('mt-region-ending', `<div class="mt-ending-header"><div><small>세 챕터 완료 · 계양·부평</small><h2>수학의 빛이 하나로 모였어요</h2></div><button type="button" class="mt-ending-close">${isMap ? '지도 계속 보기' : '월드맵으로'} →</button></div><video controls playsinline preload="metadata" poster="${posterURL}" aria-label="계양·부평 수학의 빛 엔딩 영상"><source src="${videoURL}" type="video/mp4"></video><p class="mt-ending-status" role="status">여러분이 되찾은 빛이 계양·부평을 환하게 밝혀요.</p><button type="button" class="mt-primary mt-ending-play" hidden>▶ 소리와 함께 재생</button>`);
      endingDialog.setAttribute('aria-label', '계양·부평 세 챕터 완료 영상');
      const video = endingDialog.querySelector('video'), status = endingDialog.querySelector('.mt-ending-status'), play = endingDialog.querySelector('.mt-ending-play');
      const start = () => { play.hidden = true; video.muted = false; video.volume = 1; video.play().catch(() => { play.hidden = false; status.textContent = '소리와 함께 재생 버튼을 누르면 음악과 함께 영상이 시작돼요.'; }); };
      play.addEventListener('click', () => { if (video.error) video.load(); start(); });
      video.addEventListener('playing', () => { play.hidden = true; status.textContent = '여러분이 되찾은 빛이 계양·부평을 환하게 밝혀요.'; });
      video.addEventListener('ended', () => { store.acknowledgeEnding(); status.textContent = '계양·부평 여행 완료! 다음 수학 여행도 함께해요.'; announce(); });
      const mediaError = () => { status.textContent = '영상을 불러오지 못했어요. 미션 완료 기록은 그대로예요. 다시 재생해 주세요.'; play.hidden = false; play.textContent = '영상 다시 불러오기'; };
      video.addEventListener('error', mediaError); video.querySelector('source').addEventListener('error', mediaError);
      const close = () => { video.pause(); store.acknowledgeEnding(); endingDialog.close(); announce(); root.dispatchEvent(new CustomEvent('mathtour:ending-close')); if (!isMap) root.location.href = mapURL; };
      endingDialog.querySelector('.mt-ending-close').addEventListener('click', close);
      endingDialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    }
    root.dispatchEvent(new CustomEvent('mathtour:ending-open'));
    endingDialog.showModal(); const video = endingDialog.querySelector('video'); video.currentTime = 0; video.muted = false; video.volume = 1;
    endingDialog.querySelector('.mt-ending-play').hidden = true;
    video.play().catch(() => { if (!endingDialog.open) return; endingDialog.querySelector('.mt-ending-play').hidden = false; endingDialog.querySelector('.mt-ending-status').textContent = '소리와 함께 재생 버튼을 누르면 음악과 함께 영상이 시작돼요.'; });
    return true;
  }
  function maybeShowEnding() {
    const status = store.status();
    if (autoOpened || !status.allComplete || status.endingSeen || document.visibilityState === 'hidden' || document.querySelector('dialog[open]')) return false;
    return showEnding();
  }
  root.MathTourChapters = { chapters, status: store.status, enterCourse, finishCourse, renderChapters, maybeShowEnding, showEnding, mapURL, goToMap,
    resetRegion() { const ok=store.resetRegion(); if(ok){courseFinished=false;autoOpened=false;if(endingDialog?.open){endingDialog.querySelector('video').pause();endingDialog.close();}announce();}return ok; },
    canSave: store.isCurrentRun, acceptsSave: store.acceptsSave, stampSave: store.stampSave };
  function leaveStaleCourse() {
    if (activeCourse && !store.isCurrentRun()) { root.location.replace(mapURL); return true; }
    return false;
  }
  root.addEventListener('storage', event => {
    if ((!event.key || event.key === RUN_KEY) && leaveStaleCourse()) return;
    if (isMap && (!event.key || event.key === RUN_KEY)) { store.syncRun(); autoOpened = false; }
    if (!event.key || event.key.startsWith(PREFIX) || ['mathtour.bupyeong.course-v6', 'mathtour.gyeyang.course-v1'].includes(event.key)) announce();
  });
  root.addEventListener('pageshow', leaveStaleCourse);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible' || leaveStaleCourse()) return; if (isMap || courseFinished) { announce(); maybeShowEnding(); } });
})(typeof window === 'object' ? window : globalThis);
