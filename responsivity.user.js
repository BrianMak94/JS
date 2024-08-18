// ==UserScript==
// @name         Responsive Webpage Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Make any webpage responsive for iPhones and iPads
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Set viewport for responsive design
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(viewportMeta);

    // Utility function to rearrange elements for responsiveness
    function rearrangeElements() {
        // Example: Make images and videos responsive
        document.querySelectorAll('img, video').forEach(el => {
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
        });

        // Example: Adjust iframes to be responsive
        document.querySelectorAll('iframe').forEach(el => {
            el.style.width = '100%';
            el.style.height = 'auto';
        });

        // Example: Rearrange certain block elements to stack vertically
        document.querySelectorAll('div, section, article').forEach(el => {
            el.style.display = 'block';
            el.style.width = '100%';
            el.style.margin = '0 auto';
        });

        // Example: Adjust text size for readability
        document.querySelectorAll('h1, h2, h3, p').forEach(el => {
            el.style.fontSize = 'calc(16px + 1vw)';
            el.style.lineHeight = '1.5';
        });

        // Remove fixed headers/footers that may obstruct view on small screens
        document.querySelectorAll('header, footer').forEach(el => {
            el.style.position = 'relative';
        });

        // Additional optimization: Centering content
        document.querySelectorAll('body').forEach(el => {
            el.style.padding = '10px';
            el.style.boxSizing = 'border-box';
        });
    }

    // Apply the rearrangement once the DOM is fully loaded
    window.addEventListener('load', rearrangeElements);
})();
