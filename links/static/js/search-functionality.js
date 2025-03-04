/**
 * Search Functionality for Links
 * This script adds real-time search capabilities to filter links by title or URL
 */
document.addEventListener("DOMContentLoaded", function() {
    // Get search input element
    const searchInput = document.querySelector(".search-box input");
    
    // If search input doesn't exist, exit early
    if (!searchInput) {
        console.error("Search input not found in the DOM");
        return;
    }
    
    // Add event listener for input changes
    searchInput.addEventListener("input", function() {
        const searchQuery = this.value.trim().toLowerCase();
        filterLinks(searchQuery);
    });
    
    // Clear search when X icon is clicked (optional, add this element if you want)
    const searchClearIcon = document.createElement("i");
    searchClearIcon.className = "uil uil-times search-clear";
    searchClearIcon.style.display = "none";
    searchClearIcon.style.cursor = "pointer";
    searchClearIcon.setAttribute("data-tooltip", "Clear search");
    
    // Insert the clear icon after the search icon
    const searchBox = document.querySelector(".search-box");
    if (searchBox) {
        searchBox.appendChild(searchClearIcon);
        
        // Position the clear icon properly
        searchClearIcon.style.position = "absolute";
        searchClearIcon.style.right = "15px";
        searchClearIcon.style.top = "50%";
        searchClearIcon.style.transform = "translateY(-50%)";
        searchClearIcon.style.zIndex = "11";
        searchClearIcon.style.fontSize = "18px";
        searchClearIcon.style.color = "var(--black-light-color)";
        
        // Add click event to clear search
        searchClearIcon.addEventListener("click", function() {
            searchInput.value = "";
            this.style.display = "none";
            filterLinks("");
            searchInput.focus();
        });
    }
    
    // Show/hide clear button based on search input
    searchInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            searchClearIcon.style.display = "block";
        } else {
            searchClearIcon.style.display = "none";
        }
    });
    
    /**
     * Filter links based on search query
     * @param {string} query - The search term
     */
    function filterLinks(query) {
        const linkItems = document.querySelectorAll(".link-item");
        const emptyMessage = getOrCreateEmptySearchMessage();
        let visibleCount = 0;
        
        // If no search query, show all links
        if (query === "") {
            linkItems.forEach(item => {
                item.style.display = "flex";
                // Reset the highlighting
                resetHighlighting(item);
            });
            emptyMessage.style.display = "none";
            return;
        }
        
        // For each link, check if it matches the search query
        linkItems.forEach(item => {
            const linkTitle = item.querySelector(".link-name").textContent.toLowerCase();
            const linkUrl = item.querySelector(".link-url").textContent.toLowerCase();
            
            if (linkTitle.includes(query) || linkUrl.includes(query)) {
                item.style.display = "flex";
                // Highlight the matching text
                highlightMatchingText(item, query);
                visibleCount++;
            } else {
                item.style.display = "none";
            }
        });
        
        // Show or hide the empty message
        if (visibleCount === 0) {
            emptyMessage.style.display = "block";
            emptyMessage.textContent = `No links found matching "${query}"`;
        } else {
            emptyMessage.style.display = "none";
        }
    }
    
    /**
     * Create or get the empty search result message element
     * @returns {HTMLElement} The empty message element
     */
    function getOrCreateEmptySearchMessage() {
        let emptyMessage = document.querySelector(".empty-search-message");
        
        if (!emptyMessage) {
            emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-search-message";
            emptyMessage.style.display = "none";
            emptyMessage.style.padding = "20px";
            emptyMessage.style.textAlign = "center";
            emptyMessage.style.color = "var(--black-light-color)";
            emptyMessage.style.backgroundColor = "rgba(0, 0, 0, 0.03)";
            emptyMessage.style.borderRadius = "8px";
            emptyMessage.style.margin = "10px 0";
            
            // Insert after the link list
            const linkList = document.querySelector(".link-list");
            if (linkList) {
                linkList.parentNode.insertBefore(emptyMessage, linkList.nextSibling);
            }
        }
        
        return emptyMessage;
    }
    
    /**
     * Highlight the matching text in link title and URL
     * @param {HTMLElement} item - The link item element
     * @param {string} query - The search term to highlight
     */
    function highlightMatchingText(item, query) {
        const linkNameEl = item.querySelector(".link-name");
        const linkUrlEl = item.querySelector(".link-url");
        
        const originalName = linkNameEl.getAttribute("data-original") || linkNameEl.textContent;
        const originalUrl = linkUrlEl.getAttribute("data-original") || linkUrlEl.textContent;
        
        // Store original text if not already stored
        if (!linkNameEl.getAttribute("data-original")) {
            linkNameEl.setAttribute("data-original", originalName);
        }
        if (!linkUrlEl.getAttribute("data-original")) {
            linkUrlEl.setAttribute("data-original", originalUrl);
        }
        
        // Highlight matching parts
        linkNameEl.innerHTML = highlightText(originalName, query);
        linkUrlEl.innerHTML = highlightText(originalUrl, query);
    }
    
    /**
     * Reset the highlighting in a link item
     * @param {HTMLElement} item - The link item element
     */
    function resetHighlighting(item) {
        const linkNameEl = item.querySelector(".link-name");
        const linkUrlEl = item.querySelector(".link-url");
        
        const originalName = linkNameEl.getAttribute("data-original");
        const originalUrl = linkUrlEl.getAttribute("data-original");
        
        if (originalName) {
            linkNameEl.textContent = originalName;
        }
        if (originalUrl) {
            linkUrlEl.textContent = originalUrl;
        }
    }
    
    /**
     * Highlight matching parts of text
     * @param {string} text - The original text
     * @param {string} query - The search term to highlight
     * @returns {string} HTML string with highlighted parts
     */
    function highlightText(text, query) {
        if (!query) return text;
        
        // Make the search case-insensitive
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<span style="background-color: #FFFF88; color: #000;">$1</span>');
    }
    
    /**
     * Escape special characters in a string for use in RegExp
     * @param {string} string - The string to escape
     * @returns {string} Escaped string
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
});
