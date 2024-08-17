// Version 2.0.8
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
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        logAction('Adding viewport meta tag');
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.appendChild(meta);
      } else {
        logAction('Viewport meta tag already present');
      }

      // Disable video autoplay
      document.querySelectorAll('video[autoplay]').forEach(video => {
        logAction('Disabling video autoplay', video);
        video.removeAttribute('autoplay');
      });

      // Apply 50% framerate reduction to animations and transitions
      const framerateCSS = `
        * {
          animation-duration: 200% !important;
          transition-duration: 200% !important;
        }
      `;
      const style = document.createElement('style');
      style.textContent = framerateCSS;
      document.head.appendChild(style);
      logAction('Applied 50% framerate reduction');

      // Defer non-essential scripts
      document.querySelectorAll('script:not([async]):not([defer])').forEach(script => {
        if (!script.src.includes('critical')) {
          logAction('Deferring script', script);
          script.defer = true;
        }
      });

      // Setup prefetching with blacklist
      const prefetchBlacklistSelectors = [
        '.ad*', '.track*', '.analytics*', '.popup*', '.modal*', '.overlay*',
        '.signup*', '.paywall*', '.cookie*', '.subscribe*', '.banner*',
        '.notification*', '.announce*', '.footer*', '.sidebar*', '.related*',
        '.partner*', '.admin*', '.dashboard*', '.settings*', '[hidden]',
        '.hidden*', '.offscreen*'
      ];

      const prefetchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            const linkHref = link.getAttribute('href');
            if (!link.matches(prefetchBlacklistSelectors.join(', ')) && linkHref && !linkHref.startsWith('javascript:')) {
              logAction('Prefetching link', link);
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = linkHref;
              document.head.appendChild(prefetchLink);
              observer.unobserve(link);
            }
          }
        });
      });

      // Function to handle re-observation of previously obstructed links
      function handleVisibilityChange() {
        document.querySelectorAll('a').forEach(link => {
          if (link.getBoundingClientRect().width > 0 && link.getBoundingClientRect().height > 0) {
            logAction('Reobserving link for prefetching', link);
            prefetchObserver.observe(link);
          }
        });
      }

      // Initial observation of links
      document.querySelectorAll('a').forEach(link => {
        const parentMatchesBlacklist = Array.from(link.closest('div, section, article, aside, header, main, footer')?.classList || [])
          .some(cls => prefetchBlacklistSelectors.includes(`.${cls}`));
        if (!parentMatchesBlacklist) {
          logAction('Observing link for prefetching', link);
          prefetchObserver.observe(link);
        } else {
          logAction('Skipped observing blacklisted link', link);
        }
      });

      // Observe visibility changes via mutation observer
      const observer = new MutationObserver(() => handleVisibilityChange());
      observer.observe(document.body, { childList: true, subtree: true });

      // Recheck visibility on animation and mouse clicks
      document.addEventListener('animationstart', handleVisibilityChange);
      document.addEventListener('click', handleVisibilityChange);

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
      console.error('optimizer: Error optimizing page:', error);
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
// Version 2.0.8
