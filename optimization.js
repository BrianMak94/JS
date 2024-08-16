function optimizePage() {
  try {
    // 1. Viewport meta tag
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    document.head.appendChild(viewportMeta);

    // 2. Preconnect to origins
    const origins = [
      'https://fonts.googleapis.com', 'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com', 'https://www.cloudflare.com', 'https://s3.amazonaws.com'
    ];
    origins.forEach(o => {
      const l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = o;
      l.crossOrigin = 'anonymous';
      document.head.appendChild(l);
    });

    // 3. Inline critical CSS
    const css = `
      body { margin: 0; font-family: sans-serif; max-width: 100%; overflow-x: hidden; }
      img, video, iframe { max-width: 100%; height: auto; }
      .skeleton { background: #ddd; border-radius: 4px; animation: pulse 1.5s infinite; }
      @keyframes pulse { 0%, 100% { background: #ddd; } 50% { background: #eee; } }
      .skeleton-image, .skeleton-video, .skeleton-audio { background: #ddd; border-radius: 4px; width: 100%; }
      .skeleton-text { height: 16px; margin: 8px 0; }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 4. Priority levels
    const pLevels = { high: 1, medium: 2, low: 3 };

    // 5. IntersectionObserver
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const p = el.dataset.priority || 'low';
          const pl = pLevels[p] || pLevels.low;
          if (pl <= pLevels.medium) {
            if (el.tagName === 'IMG' && el.dataset.src) {
              el.src = el.dataset.src;
              el.removeAttribute('data-src');
            }
            if ((el.tagName === 'VIDEO' || el.tagName === 'AUDIO') && el.dataset.src) {
              el.src = el.dataset.src;
              el.removeAttribute('data-src');
            }
            if (el.tagName === 'LINK' && el.dataset.lazy) {
              const l = document.createElement('link');
              l.rel = 'stylesheet';
              l.href = el.dataset.lazy;
              document.head.appendChild(l);
              el.remove();
            }
            obs.unobserve(el);
          }
        }
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    // 6. Lazy load elements
    document.querySelectorAll('img[data-src], video[data-src], audio[data-src]').forEach(m => {
      const c = m.closest('.main-content, .article, header, footer');
      m.dataset.priority = c ? (c.classList.contains('main-content') ? 'high' : 'medium') : 'low';
      const s = document.createElement('div');
      s.classList.add('skeleton', m.tagName.toLowerCase() === 'video' ? 'skeleton-video' : 'skeleton-audio');
      s.style.height = m.height + 'px';
      m.parentNode.replaceChild(s, m);
      obs.observe(s);
    });

    document.querySelectorAll('link[rel="stylesheet"][data-lazy]').forEach(l => {
      const c = l.closest('.main-content, .article, header, footer');
      l.dataset.priority = c ? (c.classList.contains('main-content') ? 'high' : 'medium') : 'low';
      const s = document.createElement('div');
      s.classList.add('skeleton');
      document.head.appendChild(s);
      obs.observe(l);
    });

    // 7. Prefetch links
    const prefetchLimit = 10;
    let prefetchCount = 0;
    const pContainers = ['.main-content', '.article', 'header', 'footer'];

    const linkObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && prefetchCount < prefetchLimit) {
          const l = e.target;
          if (l.tagName === 'A' && l.href) {
            const c = l.closest(pContainers.join(', '));
            if (c && prefetchCount < prefetchLimit) {
              const pl = document.createElement('link');
              pl.rel = 'prefetch';
              pl.href = l.href;
              document.head.appendChild(pl);
              prefetchCount++;
            }
          }
          linkObs.unobserve(l);
        }
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('a').forEach(l => linkObs.observe(l));

    // 8. Remove ad containers
    const adSel = [
      '.ad', '.ads', '.advertisement', '.sponsor', '.promoted', '.banner', '.sidebar',
      '.footer', '.social-media', '.popup', '.modal', '.overlay', '.promotion',
      '.iframe[src*="ads"]', 'div[id*="ad"]', 'script[src*="ads"]',
      'div[class*="ad"]', 'div[class*="banner"]', 'div[class*="promotion"]',
      'div[class*="sidebar"]', 'div[class*="popup"]', 'div[class*="overlay"]',
      'div[class*="sponsor"]', 'div[class*="advertisement"]', 'div[class*="promoted"]',
      'div[class*="iframe-ad"]', 'div[class*="ad-slot"]', 'div[class*="ad-wrapper"]',
      'div[class*="ad-container"]'
    ].join(', ');

    document.querySelectorAll(adSel).forEach(el => {
      el.querySelectorAll('.placeholder').forEach(ph => ph.remove());
      el.remove();
    });

    // 9. Force responsive design
    document.body.style.width = '100%';
    document.body.style.overflowX = 'hidden';

    // 10. Defer non-essential scripts
    document.querySelectorAll('script').forEach(s => {
      if (!s.hasAttribute('async') && !s.hasAttribute('defer')) {
        s.defer = true;
      }
    });

    // 11. Use requestIdleCallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => { /* Non-essential tasks */ });
    }
  } catch (e) {
    console.error('Error optimizing page:', e);
  }
}

optimizePage();
