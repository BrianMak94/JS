// Hide all images on the page
const images = document.getElementsByTagName('img');
for (let i = 0; i < images.length; i++) {
    images[i].style.setProperty('display', 'none', 'important');
}
