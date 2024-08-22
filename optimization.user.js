// ==UserScript==
// @name         Enhanced Page Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Optimizes page by applying various performance improvements
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

    // Force viewport scale to 1
    var viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.content = 'width=device-width, initial-scale=1';

    } else {
        var viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1';
        document.head.appendChild(viewportMeta); 1

  // Load FastDOM for efficient DOM manipulation
  const fastdom = (function() {
    let reads = [], writes = [];

    function rafLoop() {
      let task;
      while (task = reads.shift()) task();
      while (task = writes.shift()) task();
      requestAnimationFrame(rafLoop);
    }

    requestAnimationFrame(rafLoop);

    return {
      measure: fn => reads.push(fn),
      mutate: fn => writes.push(fn)
    };
  })();

  // Utility function for logging actions
  function logAction(action, element) {
    console.log(`optimizer: ${action}: ${element ? element.className || element.src || element.href : ''}`);
  }

  // Throttle function to limit the rate at which a function can be executed
  function throttle(fn, limit) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  // Handle animations and transitions
  function simplifyAnimations() {
    fastdom.mutate(() => {
      document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);
        if (style.animationName !== 'none') el.style.animationName = 'none';
        if (style.transitionProperty !== 'none') el.style.transitionProperty = 'none';
      });
    });
  }

  // Optimize page function
  function optimizePage() {
    try {

      // Disable video autoplay
      fastdom.mutate(() => {
        document.querySelectorAll('video[autoplay]').forEach(video => {
          logAction('Disabling video autoplay', video);
          video.removeAttribute('autoplay');
        });
      });

      // Lazy loading setup
      const lazyLoadObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            fastdom.mutate(() => {
              if (el.dataset.src) {
                logAction('Lazy loading element', el);
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
              }
            });
            lazyLoadObserver.unobserve(el);
          }
        });
      });

      fastdom.measure(() => {
        document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
          lazyLoadObserver.observe(media);
        });
      });

      // Prefetching setup
      const prefetchBlacklistSelectors = [
        '[class*="track"]', '[class*="analytics"]', '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]', '[class*="signup"]',
        '[class*="paywall"]', '[class*="cookie"]', '[class*="subscribe"]', '[class*="banner"]', '[class*="notification"]', 
        '[class*="announce"]', '[class*="footer"]', '[class*="sidebar"]', '[class*="related"]', '[class*="partner"]', 
        '[class*="admin"]', '[class*="dashboard"]', '[class*="settings"]', '[hidden]', '[class*="hidden"]', '[class*="offscreen"]'
      ].join(', ');

      const isMediaLink = href => /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/.test(href);

      const prefetchObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            const href = link.href || '';
            if (href && !link.matches(prefetchBlacklistSelectors) && !isMediaLink(href)) {
              logAction('Prefetching link', link);
              fastdom.mutate(() => {
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = href;
                document.head.appendChild(prefetchLink);
              });
              prefetchObserver.unobserve(link);
            }
          }
        });
      }, { threshold: 0.1 });

      fastdom.measure(() => {
        document.querySelectorAll('a[href]').forEach(link => {
          if (!link.matches(prefetchBlacklistSelectors) && !isMediaLink(link.href || '')) {
            logAction('Observing link for prefetching', link);
            prefetchObserver.observe(link);
          }
        });
      });

      // MutationObserver for visibility changes
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && ['style', 'class'].includes(mutation.attributeName)) {
            const target = mutation.target;
            if (target.matches('a[href]') && getComputedStyle(target).display !== 'none') {
              logAction('Element became visible:', target);
              fastdom.measure(() => prefetchObserver.observe(target));
            }
          }
        });
      });

      fastdom.measure(() => {
        document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
          mutationObserver.observe(media, { attributes: true, attributeFilter: ['style', 'class'] });
        });
      });

      // Simplify animations and transitions
      simplifyAnimations();

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
    document.addEventListener('DOMContentLoaded', optimizePage);
  } else {
    requestAnimationFrame(optimizePage);
  }

  // Fallback to ensure optimizePage runs if injected late
  window.addEventListener('load', optimizePage);

  // Request animation frame for throttled animations
  requestAnimationFrame(function animate() {
    throttle(() => {}, 1000 / 25)(); // Throttle function is a no-op to ensure animation frame is requested
    requestAnimationFrame(animate);
  });
})();
