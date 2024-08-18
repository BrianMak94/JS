// ==UserScript==
// @name         Enhanced Page Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Optimizes page by applying various performance improvements
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // Utility function for logging actions
  function logAction(action, element) {
    if (element) {
      console.log(`optimizer: ${action}: ${element.className || element.src || element.href}`);
    }
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

  // Utility to remove elements matching a selector
  function removeElements(selector, action) {
    document.querySelectorAll(selector).forEach(el => {
      logAction(action, el);
      el.remove();
    });
  }

  // Remove empty containers
  function removeEmptyContainers() {
    document.querySelectorAll('*').forEach(el => {
      if (!el.childElementCount && !el.textContent.trim()) {
        logAction('Removing empty container', el);
        el.remove();
      }
    });
  }

  // Remove containers with failed-to-load items
  function removeFailedLoadContainers() {
    document.querySelectorAll('*').forEach(el => {
      const failedChildren = Array.from(el.children).some(child =>
        (child.tagName === 'IMG' || child.tagName === 'VIDEO') && !child.complete
      );
      if (failedChildren) {
        logAction('Removing container with failed-to-load items', el);
        el.remove();
      }
    });
  }

  // Simplify animations and transitions
  function simplifyAnimations() {
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      if (style.animationName !== 'none') el.style.animationName = 'none';
      if (style.transitionProperty !== 'none') el.style.transitionProperty = 'none';
      if (style.animationName === 'none' && style.transitionProperty === 'none') {
        el.style.transition = 'opacity 1s ease-in-out';
        el.style.opacity = '1';
      }
    });
  }

  // Lazy load setup
  function setupLazyLoading() {
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
  }

  // Prefetching setup
  function setupPrefetching() {
    const blacklistSelectors = [
      '[class*="track"]', '[class*="analytics"]', '[class*="popup"]', '[class*="modal"]', '[class*="overlay"]',
      '[class*="signup"]', '[class*="paywall"]', '[class*="cookie"]', '[class*="subscribe"]', '[class*="banner"]',
      '[class*="notification"]', '[class*="announce"]', '[class*="footer"]', '[class*="sidebar"]', '[class*="related"]',
      '[class*="partner"]', '[class*="admin"]', '[class*="dashboard"]', '[class*="settings"]', '[hidden]',
      '[class*="hidden"]', '[class*="offscreen"]'
    ].join(', ');

    const isMediaLink = href => /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/.test(href);

    const prefetchObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.href || '';
          if (href && !link.matches(blacklistSelectors) && !isMediaLink(href)) {
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
      if (!link.matches(blacklistSelectors) && !isMediaLink(link.href || '')) {
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
  }

  // Optimize page function
  function optimizePage() {
    try {
      // Remove iframes and scripts related to ads or tracking
      removeElements('iframe[src*="ads"], iframe[src*="track"], iframe[src*="analytics"], script:not([src*="essential"])', 'Removing');

      // Disable video autoplay
      removeElements('video[autoplay]', 'Disabling video autoplay');

      // Setup lazy loading and prefetching
      setupLazyLoading();
      setupPrefetching();

      // Simplify animations and transitions
      simplifyAnimations();

      // Remove empty and failed load containers
      removeEmptyContainers();
      removeFailedLoadContainers();

      // Use requestIdleCallback for non-critical background tasks
      if ('requestIdleCallback' in window) {
        logAction('Using requestIdleCallback for non-critical tasks');
        requestIdleCallback(() => {});
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
    requestAnimationFrame(animate); // Recursive call to ensure animation frame is requested
  });
})();
