function optimizePage() {
  // 1. Add viewport meta tag
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.head.appendChild(viewportMeta);

  // 2. Inline critical CSS
  const criticalCSS = `
    body { margin: 0; font-family: sans-serif; }
    .skeleton {
      background: #ddd;
      border-radius: 4px;
      animation: pulse 1.5s infinite ease-in-out;
    }
    @keyframes pulse {
      0% { background-color: #ddd; }
      50% { background-color: #eee; }
      100% { background-color: #ddd; }
    }
    .skeleton-text {
      height: 16px;
      margin: 8px 0;
    }
    .skeleton-image,
    .skeleton-video,
    .skeleton-audio {
      background: #ddd;
      border-radius: 4px;
      width: 100%;
    }
  `;
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);

  // 3. Convert preload links to prefetch and defer non-deferred scripts
  document.querySelectorAll('link[rel="preload"]').forEach(link => {
    const clone = link.cloneNode();
    clone.rel = 'prefetch';
    document.head.appendChild(clone);
  });
  document.querySelectorAll('script:not([defer])').forEach(script => {
    script.defer = true;
  });

  // 4. Remove unnecessary elements
  document.querySelectorAll(
    '.ad, .sidebar, .footer, .social-media, .popup, .modal, .overlay, .promotion, .banner, iframe[src*="ads"], div[id^="ad"], script[src*="ads"]'
  ).forEach(element => {
    element.querySelectorAll('.placeholder').forEach(placeholder => placeholder.remove());
    element.remove();
  });

  // 5. Show skeleton screens and optimize media with lazy loading
  const observerOptions = { rootMargin: '0px', threshold: 0.1 };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Replace placeholders with actual images
        if (element.tagName === 'IMG' && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        // Replace placeholders with actual videos and audios
        if ((element.tagName === 'VIDEO' || element.tagName === 'AUDIO') && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        // Replace skeleton content with actual content
        if (element.classList.contains('skeleton')) {
          const actualContent = element.querySelector('.actual-content');
          if (actualContent) {
            element.innerHTML = ''; // Clear skeleton
            element.appendChild(actualContent);
          }
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Create and apply skeleton placeholders
  const createSkeleton = (element) => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton');
    
    if (element.tagName === 'IMG') {
      skeleton.classList.add('skeleton-image');
      skeleton.style.height = element.height + 'px';
    } else if (element.tagName === 'VIDEO') {
      skeleton.classList.add('skeleton-video');
      skeleton.style.height = element.height + 'px';
    } else if (element.tagName === 'AUDIO') {
      skeleton.classList.add('skeleton-audio');
      skeleton.style.height = element.height + 'px';
    }

    return skeleton;
  };

  // Apply skeletons to images
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.src) {
      const skeleton = createSkeleton(img);
      img.parentNode.replaceChild(skeleton, img);

      observer.observe(skeleton);

      skeleton.onload = () => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        skeleton.replaceWith(img);
      };
    } else {
      img.loading = 'lazy'; // Lazy load images
    }
  });

  // Apply skeletons to videos and audios
  document.querySelectorAll('video, audio').forEach(media => {
    if (media.dataset.src) {
      const skeleton = createSkeleton(media);
      media.parentNode.replaceChild(skeleton, media);

      observer.observe(skeleton);

      skeleton.onload = () => {
        media.src = media.dataset.src;
        media.removeAttribute('data-src');
        skeleton.replaceWith(media);
      };
    } else {
      media.loading = 'lazy'; // Apply lazy loading where possible
    }
  });

  // Lazy load stylesheets
  document.querySelectorAll('link[rel="stylesheet"][data-lazy]').forEach(link => {
    observer.observe(link);
  });

  // 6. Disable autoplay for videos
  document.querySelectorAll('video').forEach(video => {
    video.autoplay = false;
    video.muted = true;
  });

  // 7. Preconnect and prefetch important domains (if needed)
  const preconnectLinks = []; // Add domains to preconnect
  preconnectLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  });

  const prefetchLinks = []; // Add URLs to prefetch
  prefetchLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });

  // 8. Use async for non-critical JavaScript
  document.querySelectorAll('script[data-async]').forEach(script => {
    script.async = true;
  });

  // 9. Implement service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch(error => {
        console.log('Service Worker registration failed:', error);
      });
    });
  }

  // 10. Optimize web fonts
  document.querySelectorAll('link[rel="stylesheet"][data-font]').forEach(link => {
    link.onload = () => {
      const fontFace = document.createElement('style');
      fontFace.textContent = `
        @font-face {
          font-family: '${link.dataset.font}';
          src: url('${link.href}') format('woff2');
          font-display: swap;
        }
      `;
      document.head.appendChild(fontFace);
    };
  });
}

// Call the function to apply optimizations
optimizePage();
