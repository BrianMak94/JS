// ==UserScript==
// @name         Page Optimizer
// @namespace    http://yournamespacehere.com
// @version      1.0
// @description  Optimize page load and performance by removing unnecessary elements, deferring scripts, and lazy loading resources.
// @author       Brian
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  // Utility function for logging actions
  function logAction(action, element) {
    console.log(`optimizer: ${action}: ${element ? element.className || element.src || element.href : ''}`);
  }

  // Throttle function to limit the rate at which a function can be executed
  function throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall < limit) return;
      lastCall = now;
      fn(...args);
    };
  }

  // Function to handle animations
  const animate = throttle(() => {
    // Animation code here
  }, 1000 / 25); // 25 FPS

  // Optimize page function
  function optimizePage() {
    try {
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

      // Remove unused styles (more robust approach)
      const unusedStyles = [];
      document.querySelectorAll('style').forEach(style => {
        const styleText = style.textContent;
        if (styleText.includes('unused-class')) {
          logAction('Removing style with unused-class', style);
          unusedStyles.push(style);
        }
      });
      unusedStyles.forEach(style => style.remove());

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

      // Prefetching setup (improved)
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
              observer.unobserve(link);
            }
          }
        });
      }, { threshold: 0.1 });

      // Observe all links
      document.querySelectorAll('a[href]').forEach(link => {
        const linkHref = link.href || '';
        if (linkHref && !link.matches(prefetchBlacklistSelectors) && !isMediaLink(linkHref)) {
          logAction('Observing link for prefetching', link);
          prefetchObserver.observe(link);
        }
      });

      // MutationObserver to handle visibility changes for hidden or obstructed links (improved)
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

      // Observe only links that might become visible (e.g., elements loaded via lazy loading)
      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        mutationObserver.observe(media, { attributes: true, attributeFilter: ['style', 'class'] });
      });

      // Simplify CSS animations and transitions (improved)
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

          // Apply a simple fade-in effect for visibility (combined with animation/transition simplification)
          if (computedStyle.animationName === 'none' && computedStyle.transitionProperty === 'none') {
            el.style.transition = 'opacity 1s ease-in-out';
            el.style.opacity = '1';
          }
        });
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

  // Request animation frame for throttled animations
  requestAnimationFrame(() => {
    animate();
    requestAnimationFrame(() => animate()); // Recursive call to ensure throttle applies
  });
})();
