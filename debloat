(function() {
    // Remove all iframes (often used for ads)
    var iframes = document.getElementsByTagName('iframe');
    while (iframes.length > 0) {
        iframes[0].parentNode.removeChild(iframes[0]);
    }

    // Remove all scripts from third-party domains
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
        if (scripts[i].src && !scripts[i].src.includes(window.location.hostname)) {
            scripts[i].parentNode.removeChild(scripts[i]);
        }
    }

    // Remove all external stylesheets
    var links = document.getElementsByTagName('link');
    for (var j = links.length - 1; j >= 0; j--) {
        if (links[j].rel === 'stylesheet' && links[j].href && !links[j].href.includes(window.location.hostname)) {
            links[j].parentNode.removeChild(links[j]);
        }
    }

    // Remove large images
    var images = document.getElementsByTagName('img');
    for (var k = images.length - 1; k >= 0; k--) {
        if (images[k].naturalWidth > 1024 || images[k].naturalHeight > 1024) {
            images[k].parentNode.removeChild(images[k]);
        }
    }

    // Remove inline styles to declutter the page
    var allElements = document.getElementsByTagName('*');
    for (var l = 0; l < allElements.length; l++) {
        allElements[l].removeAttribute('style');
    }

    // Remove excessive inline scripts
    var allScripts = document.getElementsByTagName('script');
    for (var m = allScripts.length - 1; m >= 0; m--) {
        if (!allScripts[m].src) {
            allScripts[m].parentNode.removeChild(allScripts[m]);
        }
    }

    console.log("Website debloating complete.");

})();
