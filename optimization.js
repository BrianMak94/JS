function optimizePage() {
  // Add viewport meta tag
  const viewportMeta = document.createElement('meta');
  viewportMeta.name = 'viewport';
  viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.head.appendChild(viewportMeta);

  // Inline critical CSS
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

  // IntersectionObserver options
  const observerOptions = { rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Replace skeletons with actual content
        if (element.classList.contains('skeleton')) {
          const actualContent = element.querySelector('.actual-content');
          if (actualContent) {
            element.innerHTML = ''; // Clear skeleton
            element.appendChild(actualContent);
          }
        }

        // Load images
        if (element.tagName === 'IMG' && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        // Load videos and audios
        if ((element.tagName === 'VIDEO' || element.tagName === 'AUDIO') && element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Replace images with skeletons
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

  // Replace videos and audios with skeletons
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

  // Lazy load stylesheets
  document.querySelectorAll('link[rel="stylesheet"][data-lazy]').forEach(link => {
    const skeleton = document.createElement('div');
    skeleton.classList.add('skeleton');
    document.head.appendChild(skeleton);

    observer.observe(link);
  });

  // Remove ad containers and placeholders
  const adSelectors = [
    '.ad', '.sidebar', '.footer', '.social-media', '.popup', '.modal', '.overlay',
    '.promotion', '.banner', 'iframe[src*="ads"]', 'div[id^="ad"]', 'script[src*="ads"]',
    'div.ad', 'div.banner', 'div.promotion', 'div.sidebar', 'div.popup'
  ].join(', ');

  document.querySelectorAll(adSelectors).forEach(element => {
    // Remove associated placeholders if applicable
    const placeholders = element.querySelectorAll('.placeholder');
    placeholders.forEach(placeholder => placeholder.remove());
    element.remove();
  });

  // Disable autoplay videos
  document.querySelectorAll('video').forEach(video => {
    video.autoplay = false;
    video.muted = true; // Optional: Mute videos for a better user experience
  });
}

// Call the function to apply optimizations
optimizePage();
