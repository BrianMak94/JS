// ==UserScript==
// @name         Enhanced Page Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Optimizes page by applying various performance improvements
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

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
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      if (style.animationName !== 'none') el.style.animationName = 'none';
      if (style.transitionProperty !== 'none') el.style.transitionProperty = 'none';
      // Removed the code that might cause unintended style application
    });
  }

  // Optimize page function
  function optimizePage() {
    try {
      // Remove iframes and scripts related to ads or tracking
      document.querySelectorAll('iframe[src*="ads"], iframe[src*="track"], iframe[src*="analytics"], script:not([src*="essential"])').forEach(el => {
        logAction('Removing', el);
        el.remove();
      });

      // Disable video autoplay
      document.querySelectorAll('video[autoplay]').forEach(video => {
        logAction('Disabling video autoplay', video);
        video.removeAttribute('autoplay');
      });

      // Lazy loading setup
      const lazyLoadObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.src) {
              logAction('Lazy loading element', el);
              el.src = el.dataset.src;
              el.removeAttribute('data-src');
            }
            lazyLoadObserver.unobserve(el);
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        lazyLoadObserver.observe(media);
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
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = href;
              document.head.appendChild(prefetchLink);
              prefetchObserver.unobserve(link);
            }
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('a[href]').forEach(link => {
        if (!link.matches(prefetchBlacklistSelectors) && !isMediaLink(link.href || '')) {
          logAction('Observing link for prefetching', link);
          prefetchObserver.observe(link);
        }
      });

      // MutationObserver for visibility changes
      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && ['style', 'class'].includes(mutation.attributeName)) {
            const target = mutation.target;
            if (target.matches('a[href]') && getComputedStyle(target).display !== 'none') {
              logAction('Element became visible:', target);
              prefetchObserver.observe(target);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(media => {
        mutationObserver.observe(media, { attributes: true, attributeFilter: ['style', 'class'] });
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
