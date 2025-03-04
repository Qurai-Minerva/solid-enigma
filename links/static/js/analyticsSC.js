/**
 * Analytics Dashboard Interactions
 * Enhances the analytics page with interactive elements
 */
document.addEventListener("DOMContentLoaded", function() {
    // Initialize sidebar functionality
    setupSidebar();
    
    // Add animations to cards
    animateCards();
    
    // Handle dark mode toggle for charts
    setupDarkModeForCharts();
    
    // Add interactivity to the table rows
    enhanceTableRows();
});

/**
 * Sets up sidebar functionality
 */
function setupSidebar() {
    const body = document.querySelector("body"),
          modeToggle = document.querySelector(".mode-toggle"),
          sidebar = document.querySelector("nav"),
          sidebarToggle = document.querySelector(".sidebar-toggle");
    
    // Load dark mode and sidebar status from localStorage
    let getMode = localStorage.getItem("mode");
    if (getMode && getMode === "dark") {
        body.classList.add("dark");
    }

    let getStatus = localStorage.getItem("status");
    if (getStatus && getStatus === "close") {
        sidebar.classList.add("close");
    }

    // Toggle dark mode
    modeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");
        localStorage.setItem("mode", body.classList.contains("dark") ? "dark" : "light");
    });

    // Toggle sidebar
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        localStorage.setItem("status", sidebar.classList.contains("close") ? "close" : "open");
    });
}

/**
 * Adds animations to dashboard cards
 */
function animateCards() {
    const cards = document.querySelectorAll('.card');
    
    if (cards.length === 0) return;
    
    cards.forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation with delay
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 + (index * 100)); // Staggered delay
    });
}

/**
 * Sets up dark mode handling for charts
 */
function setupDarkModeForCharts() {
    const modeToggle = document.querySelector(".mode-toggle");
    
    if (!modeToggle) return;
    
    modeToggle.addEventListener("click", function() {
        // Wait for the dark mode class to be toggled
        setTimeout(() => {
            // Get all charts from the window object
            const chartIds = ['linkClicksChart', 'geographyChart', 'deviceChart'];
            
            // Apply dark mode styling to charts
            chartIds.forEach(id => {
                const chartElement = document.getElementById(id);
                if (!chartElement) return;
                
                const chart = Chart.getChart(chartElement);
                if (!chart) return;
                
                const isDarkMode = document.body.classList.contains('dark');
                
                // Update text colors for the chart
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) {
                            scale.ticks.color = isDarkMode ? 'rgba(200, 200, 200, 0.8)' : 'rgba(100, 100, 100, 0.8)';
                        }
                        if (scale.grid) {
                            scale.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                        }
                    });
                }
                
                // Update chart
                chart.update();
            });
        }, 100);
    });
}

/**
 * Enhances table rows with interactive features
 */
function enhanceTableRows() {
    const tableRows = document.querySelectorAll('.table-row:not(.empty)');
    
    if (tableRows.length === 0) return;
    
    tableRows.forEach(row => {
        // Add hover effect
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = document.body.classList.contains('dark') 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(14, 75, 241, 0.05)';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
        });
        
        // Add click effect
        row.addEventListener('click', function() {
            // Find the link title element
            const linkTitle = this.querySelector('.link-title span');
            if (!linkTitle) return;
            
            // Flash effect on click
            this.style.backgroundColor = document.body.classList.contains('dark')
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(14, 75, 241, 0.1)';
                
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 300);
            
            // You could also expand to show more details or navigate to a detail page
        });
    });
}