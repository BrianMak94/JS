function optimizePage() {
  // 1. Viewport meta tag for responsiveness
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.head.appendChild(viewportMeta);

  // 2. Preconnect to important origins
  const origins = [
    'https://fonts.googleapis.com',   // Google Fonts
    'https://fonts.gstatic.com',      // Google Fonts static assets
    'https://cdnjs.cloudflare.com',   // CDN for common JS/CSS libraries
    'https://www.cloudflare.com',     // Cloudflare CDN and security services
    'https://s3.amazonaws.com'        // AWS S3 (common for asset hosting)
  ];
  origins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // 3. Inline critical CSS
  const criticalCSS = `
    body { margin: 0; font-family: sans-serif; max-width: 100%; overflow-x: hidden; }
    img, video, iframe { max-width: 100%; height: auto; }
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
    .skeleton-image, .skeleton-video, .skeleton-audio {
      background: #ddd;
      border-radius: 4px;
      width: 100%;
    }
    .skeleton-text {
      height: 16px;
      margin: 8px 0;
    }
  `;
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);

  // 4. IntersectionObserver for lazy loading
  const observerOptions = { rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;

        if (element.classList.contains('skeleton')) {
          const actualContent = element.querySelector('.actual-content');
          if (actualContent) {
            element.innerHTML = '';
            element.appendChild(actualContent);
          }
        }

        if (element.tagName === 'IMG' && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        if ((element.tagName === 'VIDEO' || element.tagName === 'AUDIO') && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // 5. Lazy load images
  document.querySelectorAll('img').forEach(img => {
    if (img.dataset.src) {
      const skeleton = document.createElement('div');
      skeleton.classList.add('skeleton', 'skeleton-image');
      skeleton.style.height = img.height + 'px';
      img.parentNode.replaceChild(skeleton, img);
      observer.observe(skeleton);
    } else {
      img.loading = 'lazy';
    }
  });

  // 6. Lazy load videos and audios
  document.querySelectorAll('video, audio').forEach(media => {
    if (media.dataset.src) {
      const skeleton = document.createElement('div');
      skeleton.classList.add('skeleton', media.tagName.toLowerCase() === 'video' ? 'skeleton-video' : 'skeleton-audio');
      skeleton.style.height = media.height + 'px';
      media.parentNode.replaceChild(skeleton, media);
      observer.observe(skeleton);
    } else {
      media.loading = 'lazy';
    }
  });

  // 7. Lazy load stylesheets
  document.querySelectorAll('link[rel="stylesheet"][data-lazy]').forEach(link => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton');
    document.head.appendChild(skeleton);
    observer.observe(link);
  });

  // 8. Remove ad containers, wrappers, and placeholders
  const adSelectors = [
    '.ad', '.sidebar', '.footer', '.social-media', '.popup', '.modal', '.overlay',
    '.promotion', '.banner', 'iframe[src*="ads"]', 'div[id^="ad"]', 'script[src*="ads"]',
    'div.ad', 'div.banner', 'div.promotion', 'div.sidebar', 'div.popup', 
    'div[class*="ad-slot"]', 'div[class*="ad-wrapper"]', 'div[class*="ad-container"]'
  ].join(', ');

  document.querySelectorAll(adSelectors).forEach(element => {
    const placeholders = element.querySelectorAll('.placeholder');
    placeholders.forEach(placeholder => placeholder.remove());
    element.remove();
  });

  // 9. Force responsive design on mobile
  document.body.style.width = '100%';
  document.body.style.overflowX = 'hidden';
}

optimizePage();
