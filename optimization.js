(function() {
  function optimizePage() {
    try {
      // Utility function for logging actions
      function logAction(action, element) {
        console.log(`optimizer: ${action}: ${element ? element.className || element.src || element.href : ''}`);
      }

      // Remove problematic iframes and non-essential scripts
      document.querySelectorAll('iframe[src*="ads"], iframe[src*="track"], iframe[src*="analytics"]').forEach(iframe => {
        logAction('Removing problematic iframe', iframe);
        iframe.remove();
      });

      document.querySelectorAll('script').forEach(script => {
        if (script.src && !script.src.includes('essential')) {
          logAction('Removing non-essential script', script);
          script.remove();
        }
      });

      // Remove unused styles
      document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('unused-class')) {
          logAction('Removing style with unused-class', style);
          style.remove();
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

      // Lazy loading setup
      const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.src) {
              logAction('Lazy loading element', el);
              el.src = el.dataset.src;
              el.removeAttribute('data-src');
            }
            observer.unobserve(el);
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        lazyLoadObserver.observe(media);
      });

      // Prefetching setup
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
            if (linkHref && !link.matches(prefetchBlacklistSelectors) && !isMediaLink(linkHref)) {
              logAction('Prefetching link', link);
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = linkHref;
              document.head.appendChild(prefetchLink);
            }
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('a[href]').forEach(link => {
        prefetchObserver.observe(link);
      });

      // MutationObserver to handle visibility changes for hidden or obstructed links
      const mutationObserver = new MutationObserver(mutationsList => {
        mutationsList.forEach(mutation => {
          if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            const target = mutation.target;
            if (target.matches('a[href]') && getComputedStyle(target).display !== 'none') {
              logAction('Element became visible:', target);
              prefetchObserver.observe(target);
            }
          }
        });
      });

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

  // Simplify CSS animations and transitions
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('*').forEach(el => {
      const computedStyle = getComputedStyle(el);

      // Simplify animations
      if (computedStyle.animationName && computedStyle.animationName !== 'none') {
        el.style.animationName = 'none'; // Remove existing animations
      }

      // Simplify transitions
      if (computedStyle.transitionProperty && computedStyle.transitionProperty !== 'none') {
        el.style.transitionProperty = 'none'; // Remove existing transitions
      }
    });

    // Apply a simple fade-in effect for visibility
    document.querySelectorAll('*').forEach(el => {
      const computedStyle = getComputedStyle(el);
      if (computedStyle.animationName === 'none' && computedStyle.transitionProperty === 'none') {
        el.style.transition = 'opacity 1s ease-in-out';
        el.style.opacity = '1';
      }
    });
  });

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
