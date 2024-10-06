// Get the iframe element
var iframe = document.getElementById('myIframe');

// Create a function to spoof the iPhone Safari user agent
function spoofIPhoneSafariUserAgent() {
  // Set the desired iPhone Safari user agent string
  var newUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/605.1';

  // Modify the iframe's user agent
  iframe.contentWindow.navigator.userAgent = newUserAgent;
}

// Add an event listener to trigger spoofing on iframe load
iframe.addEventListener('load', spoofIPhoneSafariUserAgent);
