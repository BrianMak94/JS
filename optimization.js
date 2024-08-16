(function() {
  function optimizePage() {
    try {
      // Viewport meta tag for responsiveness
      const viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
      document.head.appendChild(viewportMeta);

      // Preconnect to important origins
      const origins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdnjs.cloudflare.com',
        'https://www.cloudflare.com',
        'https://s3.amazonaws.com'
      ];
      origins.forEach(origin => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Inline critical CSS
      const criticalCSS = `
        body { margin: 0; font-family: sans-serif; max-width: 100%; overflow-x: hidden; }
        img, video, iframe { max-width: 100%; height: auto; }
        .skeleton { background: #ddd; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
        @keyframes pulse { 0% { background-color: #ddd; } 50% { background-color: #eee; } 100% { background-color: #ddd; } }
        .skeleton-image, .skeleton-video, .skeleton-audio { background: #ddd; border-radius: 4px; width: 100%; }
        .skeleton-text { height: 16px; margin: 8px 0; }
      `;
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);

      // IntersectionObserver for lazy loading with priority
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const classPriority = ['header', 'main', 'article', 'section', 'aside', 'footer'];
            const elClass = el.classList[0];
            const priority = classPriority.indexOf(elClass);
            if (priority !== -1) {
              if (el.tagName === 'IMG' && el.dataset.src) {
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
              }
              if ((el.tagName === 'VIDEO' || el.tagName === 'AUDIO') && el.dataset.src) {
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
              }
              observer.unobserve(el);
            }
          }
        });
      });

      // Lazy load images, media, and stylesheets based on priority
      document.querySelectorAll('img[data-src], video[data-src], audio[data-src]').forEach(media => {
        observer.observe(media);
      });

      // Prefetch high and medium priority links in view
      const prefetchLimit = 5;
      let prefetchCount = 0;
      const prefetchObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && prefetchCount < prefetchLimit) {
            const link = entry.target;
            const containerPriority = ['header', 'main', 'article', 'section', 'aside', 'footer'];
            const elClass = link.closest(containerPriority.join(', '))?.classList[0];
            if (containerPriority.indexOf(elClass) < prefetchLimit) {
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = link.href;
              document.head.appendChild(prefetchLink);
              prefetchCount++;
            }
            prefetchObserver.unobserve(link);
          }
        });
      });

      document.querySelectorAll('a').forEach(link => {
        prefetchObserver.observe(link);
      });

      // Remove ad containers and placeholders
      const adSelectors = [
        '.ad', '.ads', '.advertisement', '.sponsor', '.promoted', '.banner', 
        '.sidebar', '.footer', '.social-media', '.popup', '.modal', '.overlay',
        '.promotion', 'div[class*="ad"]', 'div[class*="banner"]', 'div[class*="promotion"]',
        'div[class*="sidebar"]', 'div[class*="popup"]', 'div[class*="overlay"]',
        'div[class*="sponsor"]', 'div[class*="advertisement"]',
        'div[class*="promoted"]', 'div[class*="ad-slot"]', 'div[class*="ad-wrapper"]',
        'div[class*="ad-container"]'
      ].join(', ');

      document.querySelectorAll(adSelectors).forEach(el => {
        el.remove();
      });

      // Force responsive design on mobile
      document.body.style.width = '100%';
      document.body.style.overflowX = 'hidden';

      // Defer non-essential scripts
      document.querySelectorAll('script').forEach(script => {
        if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
          script.defer = true;
        }
      });

      // Use requestIdleCallback for non-critical tasks
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Perform non-essential background tasks here
        });
      }
    } catch (error) {
      console.error('Error optimizing page:', error);
    }
  }

  // Run optimizePage as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizePage);
  } else {
    requestAnimationFrame(optimizePage);
  }

  // Fallback to ensure it runs if injected late
  window.addEventListener('load', optimizePage);
})();
