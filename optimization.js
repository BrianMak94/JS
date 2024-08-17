(function() {
  function optimizePage() {
    try {
      // Utility function for logging actions
      function logAction(action, element) {
        console.log(`optimizer: ${action}: ${element ? element.className || element.src || element.href : ''}`);
      }

      // Configuration
      const MAX_PREFETCHES = 10; // Limit for number of active prefetch requests
      let activePrefetchCount = 0; // Counter for active prefetch requests

      // Remove problematic iframes and ads
      document.querySelectorAll('iframe').forEach(iframe => {
        if (/ads|track|analytics/.test(iframe.src || '')) {
          logAction('Removing problematic iframe', iframe);
          iframe.remove();
        }
      });

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
                el.removeAttribute('data-src');
              }
              observer.unobserve(el);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        lazyLoadObserver.observe(media);
      });

      // Setup prefetching with blacklist and media exclusion
      const prefetchBlacklistSelectors = [
        '[class*="track"]', '[class*="analytics"]', '[class*="popup"]',
        '[class*="modal"]', '[class*="overlay"]', '[class*="signup"]',
        '[class*="paywall"]', '[class*="cookie"]', '[class*="subscribe"]',
        '[class*="banner"]', '[class*="notification"]', '[class*="announce"]',
        '[class*="footer"]', '[class*="sidebar"]', '[class*="related"]',
        '[class*="partner"]', '[class*="admin"]', '[class*="dashboard"]',
        '[class*="settings"]', '[hidden]', '[class*="hidden"]',
        '[class*="offscreen"]'
      ].join(', ');

      const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm'];

      const isMediaLink = href => mediaExtensions.some(ext => href.endsWith(ext));

      const prefetchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            const linkHref = link.href || '';
            // Check if the link has href, is not blacklisted, is not a media file
            if (linkHref && !link.matches(prefetchBlacklistSelectors) && !isMediaLink(linkHref)) {
              if (activePrefetchCount < MAX_PREFETCHES) {
                logAction('Prefetching link', link);
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = linkHref;
                document.head.appendChild(prefetchLink);
                activePrefetchCount++;
                // Remove from the observer once prefetched
                observer.unobserve(link);
              } else {
                logAction('Prefetch limit reached, skipping link', link);
              }
            }
          }
        });
      }, { threshold: 0.1 });

      // Observe links that are in view on load
      document.querySelectorAll('a[href]').forEach(link => {
        const linkHref = link.href || '';
        // Check if the link is not blacklisted, has href, and is not a media file
        if (linkHref && !link.matches(prefetchBlacklistSelectors) && !isMediaLink(linkHref)) {
          logAction('Observing link for prefetching', link);
          prefetchObserver.observe(link);
        }
      });

      // MutationObserver to handle visibility changes for hidden or obstructed links
      const mutationObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            const target = mutation.target;
            if (target.matches('a[href]')) {
              if (getComputedStyle(target).display !== 'none') {
                logAction('Element became visible:', target);
                // Re-observe for prefetching if it was previously observed
                prefetchObserver.observe(target);
              }
            }
          }
        }
      });

      // Observe changes to visibility-related attributes
      document.querySelectorAll('a[href]').forEach(link => {
        mutationObserver.observe(link, { attributes: true, attributeFilter: ['style', 'class'] });
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
    console.log('Document is loading, adding DOMContentLoaded event listener.');
    document.addEventListener('DOMContentLoaded', optimizePage);
  } else {
    console.log('Document is already loaded, running optimizePage.');
    requestAnimationFrame(optimizePage);
  }

  // Fallback to ensure optimizePage runs if injected late
  console.log('Adding load event listener for fallback.');
  window.addEventListener('load', optimizePage);
})();
