function optimizePage() {
  try {
    // Viewport meta tag
    document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }));

    // Preconnect
    ['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'https://www.cloudflare.com', 'https://s3.amazonaws.com']
      .forEach(o => document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preconnect', href: o, crossOrigin: 'anonymous' })));

    // Inline critical CSS
    const style = document.createElement('style');
    style.textContent = `
      body { margin: 0; font-family: sans-serif; max-width: 100%; overflow-x: hidden; }
      img, video, iframe { max-width: 100%; height: auto; }
      .skeleton { background: #ddd; border-radius: 4px; animation: pulse 1.5s infinite; }
      @keyframes pulse { 0%, 100% { background-color: #ddd; } 50% { background-color: #eee; } }
    `;
    document.head.appendChild(style);

    // Lazy loading
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          if (el.dataset.src) {
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
          }
          if (el.dataset.lazy) {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = el.dataset.lazy;
            document.head.appendChild(newLink);
            el.remove();
          }
          observer.unobserve(el);
        }
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    // Lazy load media
    document.querySelectorAll('img[data-src], video[data-src], audio[data-src]').forEach(m => {
      const s = document.createElement('div');
      s.classList.add('skeleton', m.tagName.toLowerCase() === 'video' ? 'skeleton-video' : 'skeleton-audio');
      s.style.height = m.height + 'px';
      m.parentNode.replaceChild(s, m);
      observer.observe(s);
    });

    document.querySelectorAll('link[rel="stylesheet"][data-lazy]').forEach(l => {
      const s = document.createElement('div');
      s.classList.add('skeleton');
      document.head.appendChild(s);
      observer.observe(l);
    });

    // Prefetch links
    const prefetchLimit = 5;
    let prefetchCount = 0;
    const highPriorityContainers = ['.main-content', 'header', '.article'];
    const mediumPriorityContainers = ['footer', '.sidebar'];

    const linkObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (prefetchCount < prefetchLimit && e.isIntersecting) {
          const l = e.target;
          if (l.tagName === 'A' && l.href) {
            const container = l.closest(highPriorityContainers.join(', ')) || l.closest(mediumPriorityContainers.join(', '));
            if (container) {
              const isHighPriority = highPriorityContainers.some(c => container.matches(c));
              if (isHighPriority || prefetchCount < prefetchLimit) {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = l.href;
                document.head.appendChild(prefetchLink);
                prefetchCount++;
              }
            }
          }
          linkObserver.unobserve(l);
        }
      });
    }, { rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('a').forEach(l => linkObserver.observe(l));

    // Remove ads

    document.querySelectorAll(adSelectors).forEach(e => {
      e.querySelectorAll('.placeholder').forEach(ph => ph.remove());
      e.remove();
    });

    // Responsive design
    document.body.style.cssText = 'width: 100%; overflow-x: hidden;';

    // Defer non-essential scripts
    document.querySelectorAll('script').forEach(s => {
      if (!s.hasAttribute('async') && !s.hasAttribute('defer')) s.defer = true;
    });

    // RequestIdleCallback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => { /* Non-essential tasks */ });
    }
  } catch (e) {
    console.error('Error optimizing page:', e);
  }
}

optimizePage();
