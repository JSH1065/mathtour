/* Place the visible tyres, rather than the transparent image box, on each location's ground. */
(() => {
  'use strict';
  const placements = {
    'station-v4': [.49, .94, .72],
    'story-bus': [.46, .90, .64],
    '858f9e557eea3c054009': [.49, .97, .78],
    'museum-exterior': [.35, .94, .64],
    'stadium-plaza': [.55, .94, .67],
    'trailhead-afternoon': [.60, .94, .62],
    'entrance-night': [.59, .94, .63],
    'park-arrival': [.44, .94, .56],
    'market-arrival': [.44, .94, .56],
    'central-arrival': [.44, .94, .56],
    'exterior-art': [.43, .94, .54],
    'pier-art': [.46, .91, .55],
    'plaza-dusk': [.46, .96, .55],
    'arrival-north-v2': [.42, .91, .54],
    'present': [.44, .96, .57],
    'courtyard': [.44, .96, .57],
    'onsen': [.45, .96, .53],
    'exterior-front': [.44, .91, .57],
    '빛을잃은홍예문배경': [.50, .95, .74],
    '홍예문차이나타운골목배경': [.50, .94, .70]
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const assetName = img => decodeURIComponent(new URL(img.currentSrc || img.src, document.baseURI).pathname).split('/').pop().replace(/\.(png|webp|jpg)$/i, '');
  let pending = false;
  function place() {
    pending = false;
    document.querySelectorAll('img').forEach(img => {
      if (!/mathtour-bus(?:-yellow)?\.(png|webp)/.test(img.getAttribute('src') || '')) return;
      const root = img.closest('.departure-art, .departure-scene, section.screen, .game-container, #game-container');
      if (!root || !root.getClientRects().length) return; // World-map markers retain their route coordinates.
      const bg = root.querySelector('img.backdrop, img.scene, img.scene-bg, img.departure-background, img.boarding-bg');
      if (!bg || !bg.complete || !bg.naturalWidth) return;
      const background = assetName(bg);
      // The station departure shares its backdrop with the opening, but also has boarding children.
      const config = img.id === 'endingBus' && background === 'station-v4'
        ? [.44, .94, .58]
        : placements[background];
      if (!config) return;
      const holder = img.parentElement.matches('.arrival-bus, .ending-bus, .bus-pass, .tour-bus') ? img.parentElement : img;
      const road = img.closest('.road');
      if (road && !road.classList.contains('mt-bus-road')) road.classList.add('mt-bus-road');
      if (!holder.classList.contains('mt-placed-bus')) holder.classList.add('mt-placed-bus');
      if (!root.classList.contains('mt-bus-scene')) root.classList.add('mt-bus-scene');
      const w = root.clientWidth, h = root.clientHeight;
      if (!w || !h) return;
      const rect = root.getBoundingClientRect(), b = bg.getBoundingClientRect();
      const style = getComputedStyle(bg), contain = style.objectFit === 'contain';
      const scale = (contain ? Math.min : Math.max)(b.width / bg.naturalWidth, b.height / bg.naturalHeight);
      const rw = bg.naturalWidth * scale, rh = bg.naturalHeight * scale;
      const pos = style.objectPosition.split(' ').map(x => parseFloat(x) / 100);
      const ox = b.left - rect.left + (b.width - rw) * (Number.isFinite(pos[0]) ? pos[0] : .5);
      const oy = b.top - rect.top + (b.height - rh) * (Number.isFinite(pos[1]) ? pos[1] : .5);
      const portrait = h > w;
      const width = Math.min(w * (portrait ? Math.max(config[2], .88) : config[2]), h * 1.42);
      const ground = clamp(oy + rh * config[1], h * .76, h * (portrait ? .84 : .96));
      const left = clamp(ox + rw * config[0] - width / 2, w * .025, w * .975 - width);
      // The approved PNG has a 2:1 canvas; visible tyre contact is at y=0.86.
      const top = ground - width * .5 * .86;
      const centred = holder.matches('.ending-bus, .tour-bus:not(img)');
      const crossing = holder.matches('.bus-pass');
      holder.style.setProperty('--mt-bus-x', `${left + (centred ? width / 2 : crossing ? -width * .2 : 0)}px`);
      holder.style.setProperty('--mt-bus-y', `${top}px`);
      holder.style.setProperty('--mt-bus-width', `${width}px`);
      root.style.setProperty('--mt-coach-width', `${width}px`);
      root.style.setProperty('--mt-ground-bottom', `${h - ground}px`);
      root.style.setProperty('--mt-door-x', `${left + width * .88}px`);
      root.style.setProperty('--mt-boarding-step', `${h - ground + width * .065}px`);
      root.dataset.busGround = `${Math.round(ground)} / ${h}`;
    });
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(place); } }
  function start() {
    document.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    new MutationObserver(schedule).observe(document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['src','hidden','class']});
    new ResizeObserver(schedule).observe(document.body);
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
