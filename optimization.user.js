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
  'use strict';

  const logAction = (action, el) => console.log(`optimizer: ${action}: ${el?.className || el?.src || el?.href || ''}`);
  
  const throttle = (fn, limit) => {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn(...args);
      }
    };
  };

  const optimizePage = () => {
    try {
      document.querySelectorAll('iframe[src*="ads"], iframe[src*="track"], iframe[src*="analytics"], script[src]:not([src*="essential"])').forEach(el => {
        logAction('Removing element', el);
        el.remove();
      });

      document.querySelectorAll('style').forEach(style => {
        if (style.textContent.includes('unused-class')) {
          logAction('Removing unused style', style);
          style.remove();
        }
      });

      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.appendChild(meta);
      }

      document.querySelectorAll('video[autoplay]').forEach(video => {
        logAction('Disabling video autoplay', video);
        video.removeAttribute('autoplay');
      });

      document.querySelectorAll('script:not([async]):not([defer]):not([src*="critical"])').forEach(script => {
        logAction('Deferring script', script);
        script.defer = true;
      });

      const lazyLoadObserver = new IntersectionObserver(entries => {
        entries.forEach(({ isIntersecting, target: el }) => {
          if (isIntersecting && el.dataset.src) {
            logAction('Lazy loading element', el);
            el.src = el.dataset.src;
            el.removeAttribute('data-src');
            lazyLoadObserver.unobserve(el);
          }
        });
      });

      document.querySelectorAll('[data-src]').forEach(el => lazyLoadObserver.observe(el));

      const prefetchObserver = new IntersectionObserver(entries => {
        entries.forEach(({ isIntersecting, target: link }) => {
          const href = link.href || '';
          if (isIntersecting && !isMediaLink(href)) {
            logAction('Prefetching link', link);
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = href;
            document.head.appendChild(prefetchLink);
            prefetchObserver.unobserve(link);
          }
        });
      }, { threshold: 0.1 });

      const isMediaLink = href => /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/.test(href);

      document.querySelectorAll('a[href]').forEach(link => prefetchObserver.observe(link));

      const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(({ target }) => {
          if (getComputedStyle(target).display !== 'none') {
            prefetchObserver.observe(target);
          }
        });
      });

      document.querySelectorAll('img[data-src], video[data-src]').forEach(el => mutationObserver.observe(el, { attributes: true, attributeFilter: ['style', 'class'] }));

      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('*').forEach(el => {
          const style = getComputedStyle(el);
          if (style.animationName !== 'none') el.style.animationName = 'none';
          if (style.transitionProperty !== 'none') el.style.transitionProperty = 'none';
          if (style.animationName === 'none' && style.transitionProperty === 'none') {
            el.style.transition = 'opacity 1s ease-in-out';
            el.style.opacity = '1';
          }
        });
      });

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {});
      }
    } catch (error) {
      console.error('Error optimizing page:', error);
    }
  };

  const animate = throttle(() => {}, 1000 / 25);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizePage);
  } else {
    requestAnimationFrame(optimizePage);
  }

  window.addEventListener('load', optimizePage);
  requestAnimationFrame(() => {
    animate();
    requestAnimationFrame(() => animate());
  });

})();
