(() => {
  'use strict';
  const regions = {
    'gyeyang-bupyeong': { name: '계양·부평', progress: MathTourChapters, reset: () => MathTourChapters.resetRegion(), play: () => MathTourChapters.showEnding() },
    'michuhol-jemulpo': { name: '미추홀·제물포', progress: MathTourMichuholChapters, reset: () => MathTourMichuholChapters.reset(), play: () => MathTourMichuholEnding.show() },
    'yeongjong-ganghwa': { name: '영종·강화', progress: IslandProgress, reset: () => IslandProgress.reset(), play: () => IslandEnding.show() },
    'namdong-yeonsu': { name: '남동·연수', progress: NamdongProgress, reset: () => NamdongProgress.reset(), play: () => NamdongEnding.show() },
    'seohae-geomdan': { name: '서해·검단', progress: GeomdanProgress, reset: () => GeomdanProgress.reset(), play: () => GeomdanEnding.show() }
  };
  function clearContext() {
    IslandEnding.setContext(null);
    MathTourMichuholEnding.setContext(null);
    NamdongEnding.setContext(null);
    GeomdanEnding.setContext(null);
  }
  function confirmReset(id, afterReset) {
    if (document.querySelector('dialog[open]')) return;
    const all = id === null, region = regions[id], previous = document.activeElement;
    const modal = document.createElement('dialog');
    modal.className = 'tour-reset-dialog'; modal.setAttribute('aria-labelledby', 'tourResetTitle');
    modal.innerHTML = `<small>${all ? '전체 여행 초기화' : region.name + ' 지역 초기화'}</small><h2 id="tourResetTitle">${all ? '모든 지역의 여행을' : '이 지역의 여행을'} 처음부터 시작할까요?</h2><p>${all ? '다섯 지역의' : region.name + '의'} 미션 진행·완료 기록과 영상 감상 기록을 지웁니다. 각 여행은 챕터 1부터 다시 시작해요.${all ? ' 버스도 처음 위치로 돌아갑니다.' : ' 다른 지역의 기록은 유지됩니다.'}</p><p>지운 기록은 되돌릴 수 없어요.</p><p data-error role="alert" hidden></p><footer><button type="button" data-cancel autofocus>취소 · 계속 여행하기</button><button type="button" data-confirm>${all ? '전체 여행 초기화' : '지역 초기화'}</button></footer>`;
    modal.querySelector('[data-cancel]').onclick = () => modal.close();
    modal.querySelector('[data-confirm]').onclick = () => {
      const targets = all ? Object.values(regions) : [region];
      const results = targets.map(target => { try { return target.reset() === true; } catch { return false; } });
      if (results.some(ok => !ok)) {
        const error = modal.querySelector('[data-error]'); error.hidden = false;
        error.textContent = '일부 기록을 초기화하지 못했어요. 이 브라우저의 저장 공간 설정을 확인하고 다시 시도해 주세요.';
        return;
      }
      modal.close(); afterReset?.();
    };
    modal.addEventListener('close', () => { modal.remove(); if (previous?.isConnected) previous.focus(); });
    document.body.append(modal); modal.showModal(); modal.querySelector('[data-cancel]').focus();
  }
  function render(id, panel, travel) {
    clearContext(); panel.replaceChildren();
    const region = regions[id]; panel.hidden = !region;
    if (!region) return;
    const status = region.progress.status(), count = status.items.filter(c => c.completed).length;
    panel.setAttribute('aria-label', region.name + ' 챕터 진행');
    const bar = document.createElement('div'); bar.className = 'region-progress-bar';
    bar.innerHTML = `<div class="region-progress-copy"><strong>${region.name}의 수학의 빛 <span>${count} / ${status.items.length}</span></strong><p>${!region.play ? (status.allComplete ? '세 챕터의 빛을 모두 찾았어요! 완주 영상은 준비 중이에요.' : '세 곳을 여행하며 수학의 빛을 모아요. 완주 영상은 준비 중이에요.') : status.allComplete ? '모든 챕터의 빛을 찾았어요. 완주 영상을 감상해요!' : '챕터를 차례로 완료하면 완주 영상이 열려요.'}</p></div><div class="region-progress-actions"><button type="button" class="region-ending-button" ${status.allComplete && region.play ? '' : 'disabled'}>${region.play ? '완주 영상 보기 ▶' : '영상 준비 중'}</button><button type="button" class="region-reset-button">지역 초기화</button></div>`;
    bar.querySelector('.region-ending-button').onclick = () => { if (region.progress.status().allComplete) region.play?.(); };
    bar.querySelector('.region-reset-button').onclick = () => confirmReset(id, () => panel.querySelector('[data-chapter]')?.focus());
    const list = document.createElement('div'); list.className = 'region-chapter-list';
    list.style.setProperty('--chapter-count', status.items.length);
    status.items.forEach(chapter => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'region-chapter-card'; button.dataset.chapter = chapter.id;
      button.dataset.status = chapter.completed ? 'complete' : chapter.unlocked ? 'ready' : 'locked';
      button.disabled = !chapter.unlocked || chapter.available === false;
      button.innerHTML = `<small>CHAPTER ${chapter.number}</small><strong>${chapter.title}</strong><span>${chapter.available === false ? '제작 예정' : chapter.completed ? '✓ 완료 · 다시 여행하기' : chapter.unlocked ? '여행 시작 →' : '앞선 챕터 완료 후 해금'}</span>`;
      button.onclick = () => { const live = region.progress.status().items.find(c => c.id === chapter.id); if (live?.unlocked && live.available !== false) travel(live); };
      list.append(button);
    });
    panel.append(bar, list);
    if (id === 'yeongjong-ganghwa') IslandEnding.setContext(panel);
    if (id === 'namdong-yeonsu') NamdongEnding.setContext(panel);
    if (id === 'seohae-geomdan') GeomdanEnding.setContext(panel);
  }
  window.MathTourRegionControls = { render, clearContext, confirmAllReset: callback => confirmReset(null, callback) };
})();
