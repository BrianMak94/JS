// ==UserScript==
// @name         Perplexity Quick Search Detection
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modify Perplexity to enable Quick Website Search detection in iOS Safari with a visible search box
// @author       Your Name
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a visible form to help Safari detect the search functionality
    const searchForm = document.createElement('form');
    searchForm.setAttribute('action', 'https://www.perplexity.ai/search'); // Adjust this to the correct search URL
    searchForm.setAttribute('method', 'GET');
    searchForm.style.position = 'fixed'; // Make it fixed position
    searchForm.style.top = '10px'; // Adjust top position
    searchForm.style.right = '10px'; // Adjust right position
    searchForm.style.zIndex = '1000'; // Ensure it appears above other elements
    searchForm.style.backgroundColor = 'white'; // Background color for visibility
    searchForm.style.padding = '10px'; // Padding for aesthetics
    searchForm.style.border = '1px solid #ccc'; // Border for visibility
    searchForm.style.borderRadius = '5px'; // Rounded corners

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('name', 'q'); // This name should match the expected query parameter for the search
    searchInput.setAttribute('placeholder', 'Search Perplexity...'); // Placeholder text
    searchInput.style.width = '200px'; // Set width for the input
    searchInput.style.marginRight = '5px'; // Space between input and button

    const searchButton = document.createElement('button');
    searchButton.setAttribute('type', 'submit');
    searchButton.textContent = 'Search'; // Button text

    // Append the input and button to the form
    searchForm.appendChild(searchInput);
    searchForm.appendChild(searchButton);

    // Append the form to the body
    document.body.appendChild(searchForm);

    // Optional: Trigger the search when the input is used
    searchInput.addEventListener('input', function() {
        if (searchInput.value) {
            console.log('Search input detected:', searchInput.value);
        }
    });

    console.log('Perplexity Quick Search Detection script loaded with visible search box.');
})();
