(function() {
  'use strict';

  // Function to inject the script into an iframe
  function injectScript(iframe, scriptContent) {
    const iframeDoc = iframe.contentDocument;
    const script = document.createElement('script');
    script.textContent = scriptContent;
    iframeDoc.head.appendChild(script);
  }

  // Script to force the native player
  const nativePlayerScript = `
    (function() {
      'use strict';
        // Set the 'playsinline' attribute to prevent full-screen mode
        const video = document.querySelector('video');
        video.setAttribute('playsinline', '');

        // Trigger the native player
        video.load();
      }
  )();
  `;

  // Find all iframe elements containing videos
  const iframes = document.querySelectorAll('iframe[src*="video"]');

  // Loop through each iframe and inject the script
  iframes.forEach(iframe => {
    injectScript(iframe, nativePlayerScript);
  });
})();
