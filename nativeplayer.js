(function() {
    'use strict';

    // Check if we're on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
        // Find all iframe elements containing videos
        const iframes = document.querySelectorAll('iframe[src*="video"]');

        // Loop through each iframe and force the native player
        iframes.forEach(iframe => {
            // Set the `playsinline` attribute to prevent full-screen mode
            iframe.setAttribute('playsinline', '');

            // Create a custom event to trigger the native player
            const event = new Event('load', { bubbles: true });
            iframe.dispatchEvent(event);
        });
    }
})();
