        // Find all iframe elements containing videos
        const iframes = document.querySelectorAll('iframe[src*="video"]');

        // Loop through each iframe and force the native player
        iframes.forEach(iframe => {
            iframe.style.webkitAllowFullScreen = 'true';
            iframe.style.mozAllowFullScreen = 'true';
            iframe.style.msAllowFullScreen = 'true';
            iframe.style.oAllowFullScreen = 'true';
            iframe.style.allowFullScreen = 'true';
        });
