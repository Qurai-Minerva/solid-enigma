/**
 * Dashboard Interaction Enhancements
 * This script adds improved interactions to the dashboard
 */
document.addEventListener("DOMContentLoaded", function() {
    // Add tooltips to action icons
    addTooltipsToIcons();
    
    // Initialize staggered animations
    initStaggeredAnimations();
    
    // Adjust heights for descriptions
    adjustDescriptionHeights();
    
    // Add resize listener for responsiveness
    window.addEventListener('resize', adjustDescriptionHeights);
    
    // Add theme change observer
    observeThemeChanges();
    
    // Add visual feedback to sidebar toggle
    enhanceSidebarToggle();
    
    // Add drag handle animations
    enhanceDragHandles();
});

/**
 * Add tooltips to action icons
 */
function addTooltipsToIcons() {
    // Add tooltips to edit icons
    document.querySelectorAll(".edit-link").forEach(icon => {
        icon.setAttribute("data-tooltip", "Edit Link");
    });
    
    // Add tooltips to delete icons
    document.querySelectorAll(".delete-link").forEach(icon => {
        icon.setAttribute("data-tooltip", "Delete Link");
    });
    
    // Add tooltips to drag handles
    document.querySelectorAll(".drag-handle").forEach(icon => {
        icon.setAttribute("data-tooltip", "Drag to Reorder");
    });
    
    // Add tooltips to group icons if they exist
    document.querySelectorAll(".uil-qrcode-scan").forEach(icon => {
        icon.setAttribute("data-tooltip", "Show QR Code");
    });
    
    document.querySelectorAll(".edit-group").forEach(icon => {
        icon.setAttribute("data-tooltip", "Edit Group");
    });
    
    document.querySelectorAll(".delete-group").forEach(icon => {
        icon.setAttribute("data-tooltip", "Delete Group");
    });
}

/**
 * Initialize staggered animations for group items and links
 */
function initStaggeredAnimations() {
    // Apply random delay to existing group items if any
    const groupItems = document.querySelectorAll('.group-item');
    groupItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Apply delay to link items
    const linkItems = document.querySelectorAll('.link-item');
    linkItems.forEach((item, index) => {
        item.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
    });
}

/**
 * Adjust description heights based on content and container
 */
function adjustDescriptionHeights() {
    // For group items if they exist
    const groupItems = document.querySelectorAll('.group-item');
    groupItems.forEach(item => {
        const name = item.querySelector('.group-name');
        const description = item.querySelector('.group-description');
        const icons = item.querySelector('.group-icons');
        
        if (name && description && icons) {
            // Calculate available height (container height minus other elements)
            const maxHeight = item.offsetHeight - name.offsetHeight - icons.offsetHeight - 40; // 40px for padding
            description.style.maxHeight = `${maxHeight}px`;
        }
    });
    
    // For preview section to ensure it's responsive
    const previewSection = document.querySelector('.preview-section');
    if (previewSection) {
        // Adjust based on viewport height
        const viewportHeight = window.innerHeight;
        const previewPhone = previewSection.querySelector('.preview-phone');
        if (previewPhone) {
            const maxHeight = viewportHeight * 0.7; // Limit to 70% of viewport height
            previewPhone.style.maxHeight = `${maxHeight}px`;
        }
    }
}

/**
 * Observe theme changes and adjust styles accordingly
 */
function observeThemeChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mutation.target === document.body) {
                // Theme has changed, adjust styles if needed
                const isDarkMode = document.body.classList.contains('dark');
                adjustThemeColors(isDarkMode);
            }
        });
    });
    
    observer.observe(document.body, { attributes: true });
}

/**
 * Adjust colors based on theme
 */
function adjustThemeColors(isDarkMode) {
    // Additional theme adjustments can be added here if needed
    // Most theme changes are handled by CSS, but dynamic adjustments can be done here
    
    // For example, you could adjust the link preview colors based on theme
    const previewLinks = document.querySelectorAll('.preview-link-item');
    if (previewLinks.length > 0) {
        previewLinks.forEach(link => {
            if (isDarkMode) {
                link.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
            } else {
                link.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }
        });
    }
}

/**
 * Enhance sidebar toggle with visual feedback
 */
function enhanceSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            // Add a temporary class for visual feedback
            this.classList.add('active-toggle');
            
            // Remove the class after animation completes
            setTimeout(() => {
                this.classList.remove('active-toggle');
            }, 300);
        });
    }
}

/**
 * Enhance drag handles for better UX
 */
function enhanceDragHandles() {
    const dragHandles = document.querySelectorAll('.drag-handle');
    dragHandles.forEach(handle => {
        handle.addEventListener('mousedown', function() {
            // Add a class to the parent list item when dragging starts
            this.closest('.link-item').classList.add('dragging');
        });
        
        document.addEventListener('mouseup', function() {
            // Remove the class from all items when dragging ends
            document.querySelectorAll('.link-item.dragging').forEach(item => {
                item.classList.remove('dragging');
            });
        });
    });
    
    // Add custom CSS for dragging state
    const style = document.createElement('style');
    style.textContent = `
        .link-item.dragging {
            background-color: rgba(77, 163, 255, 0.15);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            transform: scale(1.02);
            z-index: 10;
        }
    `;
    document.head.appendChild(style);
}
