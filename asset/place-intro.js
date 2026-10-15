/* Guided sightseeing, shared by the mall and the embedded Gulpo chapter. */
(() => {
  'use strict';
  window.MathTourPlaceIntro = function ({title, slides, onOpen, onClose}) {
    const dialog = document.createElement('dialog');
    dialog.id = 'placeIntro';
    dialog.className = 'mt-place-intro';
    dialog.setAttribute('aria-labelledby', 'placeIntroTitle');
    dialog.innerHTML = `<header class="mt-intro-heading"><div><span>도착한 곳 살펴보기 · 관광지 소개</span><h2 id="placeIntroTitle" tabindex="-1"></h2></div><button type="button" data-intro="close">소개 닫기 ×</button></header>
      <div class="mt-intro-body"><figure><div class="mt-intro-photo"><img alt=""></div><figcaption><small data-intro="credit"></small><button type="button" data-intro="zoom" aria-pressed="false">사진 확대 ＋</button></figcaption></figure>
      <article><div class="mt-intro-copy" aria-live="polite" aria-atomic="true"><span data-intro="count"></span><h3></h3><p data-intro="description"></p><aside><b>함께 살펴봐요</b><p data-intro="look"></p></aside></div><a data-intro="source" target="_blank" rel="noopener">관광 안내 출처 ↗</a></article></div>
      <footer><button type="button" data-intro="prev">← 이전 사진</button><span data-intro="position" aria-hidden="true"></span><button type="button" data-intro="next">다음 사진 →</button></footer>`;
    document.body.append(dialog);
    const find = key => dialog.querySelector(`[data-intro="${key}"]`);
    const image = dialog.querySelector('img'), viewport = dialog.querySelector('.mt-intro-photo');
    let index = 0, done = null;
    dialog.querySelector('h2').textContent = title;
    function zoom(expanded) {
      viewport.classList.toggle('expanded', expanded);
      find('zoom').setAttribute('aria-pressed', String(expanded));
      find('zoom').textContent = expanded ? '사진 축소 －' : '사진 확대 ＋';
    }
    function render() {
      const slide = slides[index];
      image.src = slide.src; image.alt = slide.title;
      find('credit').textContent = slide.credit;
      find('count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      find('position').textContent = `${index + 1} / ${slides.length}`;
      dialog.querySelector('h3').textContent = slide.title;
      find('description').textContent = slide.text;
      find('look').textContent = slide.look;
      find('source').href = slide.source;
      find('source').textContent = slide.sourceLabel + ' ↗';
      find('prev').disabled = index === 0;
      find('next').textContent = index < slides.length - 1 ? '다음 사진 →' : done ? '이야기 이어가기 →' : '소개 마치기 ✓';
      zoom(false); viewport.scrollTop = 0; viewport.scrollLeft = 0;
      dialog.scrollTop = 0;
    }
    find('prev').onclick = () => { if (index > 0) { index--; render(); } };
    find('next').onclick = () => { if (index < slides.length - 1) { index++; render(); } else dialog.close(); };
    find('close').onclick = () => dialog.close();
    find('zoom').onclick = () => zoom(!viewport.classList.contains('expanded'));
    dialog.addEventListener('close', () => {
      const continueStory = done; done = null;
      onClose?.();
      continueStory?.();
    });
    return {
      open(continueStory) {
        if (dialog.open) return;
        index = 0; done = continueStory || null;
        find('close').textContent = done ? '소개 건너뛰기' : '소개 닫기 ×';
        render(); onOpen?.(); dialog.showModal(); dialog.scrollTop = 0; dialog.querySelector('h2').focus({preventScroll:true});
      }
    };
  };
})();
