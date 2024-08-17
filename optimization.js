(function() {
  // Version 1.0.0

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

      // Critical CSS for lazy loading skeleton
      const criticalCSS = `
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.15; } 100% { opacity: 0.3; } }
        .skeleton { animation: pulse 1s infinite ease-in-out; }
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
        '.ad*', '.track*', '.analytics*', '.popup*', '.modal*', '.overlay*', 
        '.signup*', '.paywall*', '.cookie*', '.subscribe*', '.banner*', 
        '.notification*', '.announce*', '.footer*', '.sidebar*', '.related*', 
        '.partner*', '.admin*', '.dashboard*', '.settings*', '[hidden]', 
        '.hidden*', '.offscreen*'
      ].join(', ');

      const prefetchObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target;
            if (link.href && !link.matches(prefetchBlacklistSelectors)) {
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

      // Observe all links and filter based on blacklist
      const observeLinks = () => {
        document.querySelectorAll('a').forEach(link => {
          const parentMatchesBlacklist = Array.from(link.closest('div, section, article, aside, header, main, footer')?.classList || [])
            .some(cls => prefetchBlacklistSelectors.includes(`.${cls}`));

          if (!parentMatchesBlacklist) {
            logAction('Observing link for prefetching', link);
            prefetchObserver.observe(link);
          }
        });
      };

      observeLinks(); // Initial observation

      // Reobserve links that become unobstructed
      const reobserveObstructedLinks = () => {
        document.querySelectorAll('a').forEach(link => {
          if (!prefetchObserver.observing.has(link)) {
            const rect = link.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
              logAction('Reobserving unobstructed link', link);
              prefetchObserver.observe(link);
            }
          }
        });
      };

      // Handle scroll and animation events
      const handleScrollOrAnimation = () => {
        reobserveObstructedLinks();
      };

      window.addEventListener('scroll', handleScrollOrAnimation);
      window.addEventListener('animationstart', handleScrollOrAnimation);
      window.addEventListener('click', handleScrollOrAnimation);

      // Lower the framerate of animations and transitions
      const styleFramerate = document.createElement('style');
      styleFramerate.textContent = `
        * {
          animation-duration: 2s !important;
          transition-duration: 2s !important;
        }
      `;
      document.head.appendChild(styleFramerate);
      logAction('Lowered framerate of animations and transitions');

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
    } catch (error) {
      console.error('Error optimizing page:', error);
    }
  }

  // Initial call to optimize the page
  optimizePage();
})();
