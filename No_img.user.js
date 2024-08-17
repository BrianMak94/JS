// ==UserScript==
// @name         Block All Images
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Block all images on the webpage by hiding them
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to block all images
    function blockAllImages() {
        // Get all image elements
        const images = document.querySelectorAll('img');

        // Hide each image
        images.forEach(image => {
            image.style.display = 'none';
        });
    }

    // Run the function to block images
    blockAllImages();
})();
