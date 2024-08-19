// ==UserScript==
// @name         Perplexity Quick Search Detection
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modify Perplexity to enable Quick Website Search detection in iOS Safari
// @author       Your Name
// @match        https://www.perplexity.ai/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create a hidden form to help Safari detect the search functionality
    const searchForm = document.createElement('form');
    searchForm.setAttribute('action', 'https://www.perplexity.ai/search'); // Adjust this to the correct search URL
    searchForm.setAttribute('method', 'GET');

    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('name', 'q'); // This name should match the expected query parameter for the search
    searchInput.setAttribute('placeholder', 'Search Perplexity...'); // Optional placeholder text

    // Append the input to the form
    searchForm.appendChild(searchInput);

    // Append the form to the body (hidden)
    searchForm.style.display = 'none'; // Hide the form
    document.body.appendChild(searchForm);

    // Optional: Trigger the search when the input is used
    searchInput.addEventListener('input', function() {
        if (searchInput.value) {
            // Uncomment the next line if you want to automatically submit the form when typing
            // searchForm.submit();
            console.log('Search input detected:', searchInput.value);
        }
    });

    console.log('Perplexity Quick Search Detection script loaded.');
})();
