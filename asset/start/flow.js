/* Entry state is separate from mission saves. Storage restrictions must not block travel. */
(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const key = 'mathtour-entry-v1:' + root.pathname;
  const regions = ['gyeyang-bupyeong', 'seohae-geomdan', 'namdong-yeonsu', 'yeongjong-ganghwa', 'michuhol-jemulpo'];
  let memory = {};
  const read = () => {
    try { return { ...memory, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
    catch (_) { return memory; }
  };
  const write = change => {
    memory = { ...read(), ...change };
    try { localStorage.setItem(key, JSON.stringify(memory)); } catch (_) { /* memory fallback */ }
  };
  const activate = () => {
    try { sessionStorage.setItem(key, 'active'); } catch (_) { /* explicit map URL still works */ }
  };
  window.MathTourEntry = {
    startURL: new URL('start.html', root).href,
    active() { try { return sessionStorage.getItem(key) === 'active'; } catch (_) { return false; } },
    hasTravel() {
      if (read().entered) return true;
      const legacy = ['incheon-bus-standalone-position-v1', 'mathtour.bupyeong.course-v6',
        'mathtour.bupyeong.hyanggyo-v1', 'mathtour.gyeyang.course-v1',
        'mathtour.michuhol-jemulpo.chapters-v1'];
      try { return legacy.some(name => localStorage.getItem(name) !== null); } catch (_) { return false; }
    },
    enter(choice) { activate(); write({ entered: true, ...(choice ? { prologue: choice } : {}) }); },
    rememberRegion(region) { write({ region: regions.includes(region) ? region : null }); },
    mapURL() {
      const url = new URL('index.html', root);
      url.searchParams.set('play', '1');
      const region = read().region;
      if (regions.includes(region)) url.searchParams.set('region', region);
      return url.href;
    },
    routeMap() {
      const params = new URLSearchParams(location.search);
      let fromGame = false;
      try {
        const previous = new URL(document.referrer);
        const current = new URL(location.href);
        fromGame = previous.origin === current.origin &&
          new URL('./', previous).pathname === root.pathname &&
          /\/(?:[BMNSYC]\d{2}|index)\.html$/i.test(previous.pathname);
      } catch (_) { /* direct visit */ }
      if (params.get('play') === '1' || params.has('region') || this.active() || fromGame) {
        this.enter();
        if (params.has('region')) this.rememberRegion(params.get('region'));
        return;
      }
      document.documentElement.style.visibility = 'hidden';
      location.replace(this.startURL);
    }
  };
})();
