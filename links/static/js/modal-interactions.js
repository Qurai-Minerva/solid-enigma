/**
 * Enhanced Modal Interactions
 * This script adds improved interactions to modal windows
 */
document.addEventListener("DOMContentLoaded", function() {
    // Find all modal elements
    const modals = document.querySelectorAll(".add-link-modal, .edit-link-modal, .edit-group-modal");
    const buttons = document.querySelectorAll(".save-link-btn, .save-edit-link-btn, .save-edit-group-btn");
    const closeButtons = document.querySelectorAll(".close-modal, .close-edit-modal, .close-edit-group-modal");
    
    // Add click animation to all buttons
    buttons.forEach(button => {
        button.addEventListener("click", function() {
            this.classList.add("button-clicked");
            setTimeout(() => {
                this.classList.remove("button-clicked");
            }, 200);
        });
    });
    
    // Close modal when clicking outside
    modals.forEach(modal => {
        modal.addEventListener("click", function(event) {
            if (event.target === this) {
                this.style.display = "none";
            }
        });
    });
    
    // Close modal when pressing Escape
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            modals.forEach(modal => {
                if (modal.style.display === "flex") {
                    modal.style.display = "none";
                }
            });
        }
    });
    
    // Auto-focus first input when modal opens
    const addLinkBtn = document.querySelector(".add-link-btn");
    if (addLinkBtn) {
        addLinkBtn.addEventListener("click", function() {
            setTimeout(() => {
                document.querySelector("#link-title").focus();
            }, 100);
        });
    }
    
    // Add focus to first input when edit modal opens
    document.querySelectorAll(".edit-link").forEach(btn => {
        btn.addEventListener("click", function() {
            setTimeout(() => {
                document.querySelector("#edit-link-title").focus();
            }, 100);
        });
    });
    
    // Add focus to first input when edit group modal opens
    document.querySelectorAll(".edit-group-name").forEach(btn => {
        btn.addEventListener("click", function() {
            setTimeout(() => {
                document.querySelector("#edit-group-name").focus();
            }, 100);
        });
    });
});