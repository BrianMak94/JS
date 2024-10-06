(function() {
  function act() {
    let v = document.querySelector('video');

    if (!v) {
      return; // Exit if video element is not found
    }

    v.addEventListener('webkitpresentationmodechanged', (e) => {
      e.stopPropagation();
      console.log('stop prop');
    }, true);

    // Set the 'pip-mode' attribute to 'true'
    v.setAttribute('pip-mode', 'true');

    // Use `webkitSetPresentationMode` to force native player
    v.webkitSetPresentationMode('inline');
    console.log('forced native player');
  }

  function helper() {
    let vid = document.querySelector('video');
    if (vid && vid.getAttribute('pip-mode') !== 'true') {
      act();
    }
  }

  setInterval(() => helper(), 1000);
})();
