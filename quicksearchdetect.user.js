// ==UserScript==
// @name         Enable Quick Search Detection
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enhance search field detection for Safari's Quick Website Search
// @author       Your Name
// @match        *://*/*  // Change this to target specific websites
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to create a search field if it doesn't exist
    function createSearchField() {
        // Modify this selector to match the specific search input field of the website
        const searchFieldSelector = 'input[type="search"], input[name="q"], input[name="search"]';
        const searchField = document.querySelector(searchFieldSelector);

        if (searchField) {
            // Add an event listener to the search field
            searchField.addEventListener('input', function() {
                // This will trigger the search functionality
                console.log('Search input detected:', searchField.value);
            });
        } else {
            console.warn('Search field not found on this page.');
        }
    }

    // Run the function to create the search field detection
    createSearchField();
})();
