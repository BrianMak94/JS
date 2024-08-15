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
