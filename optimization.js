(function() {
  function optimizePage() {
    try {
      // Utility function for logging actions
      function logAction(action, element) {
        console.log(`optimizer: ${action}: ${element ? element.className || element.src || element.href : ''}`);
      }

      // Remove problematic iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        if (/ads|track|analytics/.test(iframe.src || '')) {
          logAction('Removing problematic iframe', iframe);
          iframe.remove();
        }
      });

      // Viewport meta tag for responsiveness
      //const viewportMeta = document.querySelector('meta[name="viewport"]');
      //if (!viewportMeta) {
        //logAction('Adding viewport meta tag');
        //const meta = document.createElement('meta');
        //meta.name = 'viewport';
        //meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        //document.head.appendChild(meta);
      //} else {
        //logAction('Viewport meta tag already present');
      //}

      // Disable video autoplay
      document.querySelectorAll('video[autoplay]').forEach(video => {
        logAction('Disabling video autoplay', video);
        video.removeAttribute('autoplay');
      });

      // Critical CSS for lazy loading skeleton
      const criticalCSS = `
        .skeleton { background: #888; border-radius: 4px; opacity: 0.8; }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.15; } 100% { opacity: 0.3; } }
        .skeleton { animation: pulse 1.5s infinite ease-in-out; }
      `;
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
      logAction('Adding critical CSS for lazy loading skeleton');

      // Defer non-essential scripts
      document.querySelectorAll('script:not([async]):not([defer])').forEach(script => {
        if (!script.src.includes('critical')) {
          logAction('Deferring script', script);
          script.defer = true;
        }
      });

      // Setup lazy loading
      const classPriority = ['header', 'main'];
      const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (classPriority.some(cls => el.classList.contains(cls))) {
              logAction('Lazy loading element', el);
              if (el.dataset.src) {
                el.src = el.dataset.src;
                el.classList.remove('skeleton');
                el.removeAttribute('data-src');
              }
              observer.unobserve(el);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        media.classList.add('skeleton');
        logAction('Adding skeleton and observing media for lazy loading', media);
        lazyLoadObserver.observe(media);
      });

      // Setup prefetching with blacklist
      const prefetchBlacklistSelectors = [
        '.track*', '.analytics*', '.popup*', '.modal*', '.overlay*', 
        '.signup*', '.paywall*', '.cookie*', '.subscribe*', '.banner*', 
        '.notification*', '.announce*', '.footer*', '.sidebar*', '.related*', 
        '.partner*', '.admin*', '.dashboard*', '.settings*', '[hidden]', 
        '.hidden*', '.offscreen*'
      ].join(', ');

      const hasValidHref = (link) => link.href && !link.href.startsWith('#') && link.href.trim() !== '';

      const prefetchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            const parentMatchesBlacklist = Array.from(link.closest('div, section, article, aside, header, main, footer')?.classList || [])
              .some(cls => prefetchBlacklistSelectors.includes(`.${cls}`));
            if (!parentMatchesBlacklist && hasValidHref(link)) {
              logAction('Prefetching link', link);
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = link.href;
              document.head.appendChild(prefetchLink);
              observer.unobserve(link);
            }
          }
        });
      });

      const observeLinks = () => {
        document.querySelectorAll('a').forEach(link => {
          const parentMatchesBlacklist = Array.from(link.closest('div, section, article, aside, header, main, footer')?.classList || [])
            .some(cls => prefetchBlacklistSelectors.includes(`.${cls}`));
          if (!parentMatchesBlacklist && hasValidHref(link)) {
            logAction('Observing link for prefetching', link);
            prefetchObserver.observe(link);
          }
        });
      };

      observeLinks();

      // Remove ads and overlays
      const adSelectors = [
        '[class^="ad-"]', '[class*=" ad-"]', '[class$="-ad"]', '[class*="ads"]',
        '[class*="-ads"]', '[class*="ads-"]'
      ].join(', ');
      
      document.querySelectorAll(adSelectors).forEach(el => {
        logAction('Removing ad element', el);
        el.remove();
      });

      const overlaySelectors = [
        '.paywall', '.subscription', '.signup', '.modal', '.popup', '.overlay',
        '.cookie-consent', '.cookie-banner', '.notification', '.banner', '.announce'
      ].join(', ');

      document.querySelectorAll(overlaySelectors).forEach(el => {
        logAction('Removing overlay element', el);
        el.remove();
      });

      // Use requestIdleCallback for non-critical background tasks
      if ('requestIdleCallback' in window) {
        logAction('Using requestIdleCallback for non-critical tasks');
        requestIdleCallback(() => {
          // Additional non-essential tasks can be performed here
        });
      } else {
        logAction('requestIdleCallback is not supported');
      }
    } catch (error) {
      console.error('Error optimizing page:', error);
    }
  }

  // Ensure optimizePage runs as early as possible
  if (document.readyState === 'loading') {
    console.log('optimizer: Document is loading, adding DOMContentLoaded event listener.');
    document.addEventListener('DOMContentLoaded', optimizePage);
  } else {
    console.log('optimizer: Document is already loaded, running optimizePage.');
    requestAnimationFrame(optimizePage);
  }

  // Fallback to ensure optimizePage runs if injected late
  console.log('optimizer: Adding load event listener for fallback.');
  window.addEventListener('load', optimizePage);
})();
