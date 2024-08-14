function optimizePage() {
  // Image optimization
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    // Lazy loading
    if (img.dataset.src) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);   

          }
        });
      });
      observer.observe(img);
    }

    // Responsive images
    const srcset = img.srcset || '';
    const sizes = img.sizes || '';
    if (!srcset || !sizes) {
      const width = img.naturalWidth;
      const src = img.src;
      img.srcset = `${src} ${width}w`;
      img.sizes = `(max-width: ${width}px) 100vw, ${width}px`;
    }
  });

  // Resource loading
  const preloadLinks = document.querySelectorAll('link[rel="preload"]');
  preloadLinks.forEach(link => {
    const clone = link.cloneNode();
    clone.rel = 'prefetch';
    document.head.appendChild(clone);
  });

  const scripts = document.querySelectorAll('script:not([defer])');
  scripts.forEach(script => {
    script.defer = true;
  });

  // JavaScript optimization
  // Minification and combining (usually handled by build tools)
  // Reduce DOM manipulations (optimize code accordingly)

  const lazyScripts = document.querySelectorAll('script[data-lazy]');
  const scriptObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const script = entry.target;
        const src = script.dataset.lazy;
        const newScript = document.createElement('script');
        newScript.src = src;
        document.head.appendChild(newScript);
        scriptObserver.unobserve(script);
      }
    });
  });
  lazyScripts.forEach(script => scriptObserver.observe(script));

  // CSS optimization
  // Critical CSS extraction (requires more advanced techniques)
  // Minimize stylesheets (usually handled by build tools)
  // Optimize CSS delivery (use CDNs and caching)
  
}

optimizePage();
