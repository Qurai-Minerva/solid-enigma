/**
 * Phone Preview Interaction Enhancements
 * Makes the phone preview more realistic and interactive
 */
document.addEventListener("DOMContentLoaded", function() {
    // Update the time in the status bar to match the user's current time
    updatePhoneTime();
    setInterval(updatePhoneTime, 60000); // Update every minute
    
    // Make links appear with a staggered animation
    animatePreviewLinks();
    
    // Add a subtle tilt effect to the phone when mouse moves
    addTiltEffect();
    
    // Add click effect to preview links
    addClickEffectToLinks();
    
    // Dynamically update the preview when links change
    setupPreviewObserver();
});

/**
 * Updates the time in the phone status bar
 */
function updatePhoneTime() {
    const timeElement = document.querySelector('.status-bar-time');
    if (!timeElement) return;
    
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    
    // Format as 12-hour time
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    timeElement.textContent = `${hours}:${minutes} ${ampm}`;
}

/**
 * Animates preview links with a staggered appearance
 */
function animatePreviewLinks() {
    const links = document.querySelectorAll('.preview-link-item');
    
    links.forEach((link, index) => {
        // Set initial state
        link.style.opacity = '0';
        link.style.transform = 'translateY(20px)';
        link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation with delay
        setTimeout(() => {
            link.style.opacity = '1';
            link.style.transform = 'translateY(0)';
        }, 100 + (index * 50)); // Staggered delay
    });
}

/**
 * Adds a subtle tilt effect to the phone preview
 */
function addTiltEffect() {
    const phone = document.querySelector('.preview-phone');
    const container = document.querySelector('.preview-section');
    
    if (!phone || !container) return;
    
    container.addEventListener('mousemove', (e) => {
        const containerRect = container.getBoundingClientRect();
        const x = e.clientX - containerRect.left;
        const y = e.clientY - containerRect.top;
        
        // Calculate percentage position
        const xPercent = (x / containerRect.width) * 100;
        const yPercent = (y / containerRect.height) * 100;
        
        // Calculate tilt amount (max 3 degrees)
        const tiltX = ((yPercent - 50) / 50) * 3;
        const tiltY = ((50 - xPercent) / 50) * 3;
        
        // Apply the tilt
        phone.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    
    // Reset on mouse leave
    container.addEventListener('mouseleave', () => {
        phone.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        
        // Smooth transition back to normal
        phone.style.transition = 'transform 0.5s ease';
        setTimeout(() => {
            phone.style.transition = '';
        }, 500);
    });
}

/**
 * Adds click effects to preview links
 */
function addClickEffectToLinks() {
    const links = document.querySelectorAll('.preview-link-item');
    
    links.forEach(link => {
        link.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        });
        
        link.addEventListener('mouseup', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // Prevent the stuck "pressed" state if mouse leaves while pressed
        link.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
}

/**
 * Sets up an observer to update the preview when links change
 */
function setupPreviewObserver() {
    const linksContainer = document.querySelector('.link-list');
    if (!linksContainer) return;
    
    // Function to update the preview links count
    function updatePreviewStats() {
        const statsElement = document.querySelector('.preview-stat-number');
        if (statsElement) {
            const linkCount = document.querySelectorAll('.link-item').length;
            statsElement.textContent = linkCount;
        }
        
        // Update the "last updated" date
        const updateDateElement = document.querySelectorAll('.preview-stat-number')[2];
        if (updateDateElement) {
            const now = new Date();
            const month = now.toLocaleString('default', { month: 'short' });
            const day = now.getDate();
            updateDateElement.textContent = `${month} ${day}`;
        }
    }
    
    // Create a MutationObserver to watch for changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                updatePreviewStats();
            }
        });
    });
    
    // Start observing
    observer.observe(linksContainer, { 
        childList: true,
        subtree: true
    });
}
