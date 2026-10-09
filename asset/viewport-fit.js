/* Keep the activity budget in sync with the real header, including tablet wraps. */
(() => {
  if (!document.body) return; // A chapter lock can replace the document during startup.
  const header = document.querySelector('.topbar');
  let pending = false;
  function measure() {
    pending = false;
    const box = header?.getBoundingClientRect();
    const visible = header && getComputedStyle(header).display !== 'none';
    const top = visible ? header.offsetTop + box.height + (parseFloat(getComputedStyle(header).marginBottom) || 0) : 0;
    const value = `${Math.max(0, window.innerHeight - top)}px`;
    if (document.documentElement.style.getPropertyValue('--mt-content-height') !== value)
      document.documentElement.style.setProperty('--mt-content-height', value);
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(measure); } }
  if (header) new ResizeObserver(schedule).observe(header);
  new MutationObserver(schedule).observe(document.body, {attributes:true, attributeFilter:['class']});
  addEventListener('resize', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
  measure();
})();
