/* Shared dialogue input. Games, photographs and modal controls keep their own input. */
(() => {
  'use strict';
  const hint = '대화창 터치·클릭 / Enter·Space: 다음 대사';
  const interactive = 'button,a,input,textarea,select,summary,video,audio,[contenteditable="true"],[role="button"],[role="slider"]';
  let dispatching = false, pointer = null, moved = false, scheduled = false;
  const visible = el => !!el?.isConnected && !el.closest('[hidden],[inert]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const blocked = () => !!document.querySelector('dialog[open]') || [...document.querySelectorAll('[aria-modal="true"],.modal.open')].some(visible);
  function entries() {
    const result = [];
    for (const nextId of ['storyNext', 'tourNext', 'millStoryNext', 'zooStoryNext']) {
      const next = document.getElementById(nextId), box = next?.closest('.dialogue,.dialogue-box,.zoo-bridge-dialogue');
      if (box) result.push({box, next, previous:document.getElementById(nextId.replace('Next','Prev'))});
    }
    for (const [id,previousId] of [['episodeAdvance','episodePrevious'],['endingDialogue','endingPrevious']]) {
      const box = document.getElementById(id);
      if (box) result.push({box, next:box, previous:document.getElementById(previousId)});
    }
    const legacy = window.MathTourDialogueScene;
    if (legacy) result.push({box:document.getElementById('dialogueBox'), legacy});
    return result;
  }
  const current = () => blocked() ? null : entries().find(e => visible(e.box) && (e.legacy ? e.legacy.active() : visible(e.next)));
  const locked = e => e.box.getAttribute('aria-disabled') === 'true' || e.next?.disabled;
  function focusBox(e) { const box = visible(e.box) ? e.box : entries().find(item => item.next?.id === e.next?.id && visible(item.box))?.box; if (box) { if (!box.classList.contains('mt-dialogue-input')) decorate(); box.focus({preventScroll:true}); } }
  function advance(e) {
    if (locked(e)) return;
    dispatching = true;
    try { if (e.legacy) e.legacy.next(); else e.next.click(); }
    finally { dispatching = false; }
    decorate(); focusBox(e);
  }
  function decorate() {
    for (const e of entries()) {
      if (!e.box) continue;
      if (!e.box.classList.contains('mt-dialogue-input')) {
        e.box.classList.add('mt-dialogue-input');
        e.box.tabIndex = 0; e.box.setAttribute('aria-description', hint); e.box.title = hint;
        if (e.legacy) {
          e.box.setAttribute('role','group');
          const previous = document.createElement('button'); previous.type = 'button';
          previous.className = 'mt-dialogue-previous'; previous.textContent = '← 이전 대사';
          previous.onclick = event => { event.stopPropagation(); if (!locked(e)) e.legacy.previous(); decorate(); focusBox(e); };
          e.box.append(previous); e.box.classList.add('mt-legacy-dialogue');
        } else if (e.next !== e.box) {
          const row = e.next.parentElement;
          const help = document.createElement('small'); help.className = 'mt-dialogue-help'; help.textContent = '터치·클릭 / Enter·Space로 다음';
          row.insertBefore(help,e.next);
        }
      }
      if (e.legacy) {
        const previous = e.box.querySelector('.mt-dialogue-previous');
        const disabled = !e.legacy.canPrevious() || locked(e);
        if (previous.disabled !== disabled) previous.disabled = disabled;
        const label = e.box.querySelector('.dialogue-hint');
        if (label && !locked(e) && e.legacy.active() && label.textContent !== '터치·클릭 / Enter·Space') label.textContent = '터치·클릭 / Enter·Space';
      }
    }
  }
  window.addEventListener('pointerdown', event => { pointer = {x:event.clientX,y:event.clientY}; moved = false; }, true);
  window.addEventListener('pointermove', event => { if (pointer && Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)>12) moved = true; }, true);
  window.addEventListener('pointercancel', () => { pointer = null; moved = true; }, true);
  window.addEventListener('click', event => {
    if (dispatching) return;
    const e = current(); if (!e) return;
    const target = event.target instanceof Element ? event.target : event.target.parentElement;
    const control = target.closest(interactive);
    if (control && control !== e.box) {
      // Pointer users can press Enter again after using either navigation button.
      if (event.detail > 0 && (control === e.next || control === e.previous)) queueMicrotask(() => focusBox(e));
      return;
    }
    if (!e.box.contains(target) || moved || (window.getSelection()?.toString() && event.detail > 0)) return;
    event.preventDefault(); event.stopImmediatePropagation(); advance(e);
  }, true);
  window.addEventListener('keydown', event => {
    if (!['Enter',' ','Spacebar'].includes(event.key) || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) return;
    const e = current(); if (!e) return;
    const control = event.target.closest?.(interactive);
    if (control && control !== e.box && control !== e.next) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!event.repeat) advance(e);
  }, true);
  // Cancel Space's native key-up activation after our key-down has advanced.
  window.addEventListener('keyup', event => {
    if (!['Enter',' ','Spacebar'].includes(event.key)) return;
    const e = current(), control = event.target.closest?.(interactive);
    if (e && (!control || control === e.box || control === e.next) && !blocked()) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  const observer = new MutationObserver(() => {
    if (scheduled) return; scheduled = true;
    queueMicrotask(() => { scheduled = false; decorate(); });
  });
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','disabled','class','aria-disabled']});
  decorate();
})();
