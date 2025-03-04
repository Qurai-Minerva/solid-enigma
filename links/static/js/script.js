document.addEventListener("DOMContentLoaded", function () {
    const body = document.querySelector("body"),
          modeToggle = document.querySelector(".mode-toggle"),
          sidebar = document.querySelector("nav"),
          sidebarToggle = document.querySelector(".sidebar-toggle"),
          addGroupBtn = document.querySelector(".add-link-group-btn"),
          addGroupModal = document.querySelector(".add-group-modal"),
          closeModalBtn = document.querySelector(".close-modal"),
          saveGroupBtn = document.querySelector(".save-group-btn"),
          groupNameInput = document.querySelector("#group-name"),
          groupDescriptionInput = document.querySelector("#group-description"),
          searchBox = document.querySelector(".search-box input");

    // QR Code Modal Elements
    const qrCodeModal = document.querySelector(".qr-code-modal"),
          qrCodeContainer = document.querySelector("#qr-code-container"),
          closeQrModalBtn = document.querySelector(".close-qr-modal");

    if (!sidebar || !sidebarToggle || !addGroupBtn) {
        console.error("Sidebar or buttons not found in the DOM");
        return;
    }

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

    // Open add group modal
    addGroupBtn.addEventListener("click", () => {
        addGroupModal.style.display = "flex";
    });

    // Close add group modal
    closeModalBtn.addEventListener("click", () => {
        addGroupModal.style.display = "none";
    });

    // Save group
    saveGroupBtn.addEventListener("click", function () {
        const groupName = groupNameInput.value.trim();
        const groupDescription = groupDescriptionInput.value.trim();

        if (groupName) {
            fetch("/add-group/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCSRFToken(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: groupName,
                    description: groupDescription,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        addGroupToUI(data.group);
                        addGroupModal.style.display = "none";
                        groupNameInput.value = "";
                        groupDescriptionInput.value = "";
                    } else {
                        alert("Error: " + data.error);
                    }
                })
                .catch((error) => console.error("Error:", error));
        } else {
            alert("Group name is required.");
        }
    });

    // Add group to UI
    function addGroupToUI(group) {
        const groupContainer = document.querySelector(".link-groups");
        if (!groupContainer) {
            console.error("Group container not found");
            return;
        }
        const groupElement = document.createElement("div");
        groupElement.classList.add("group-item");
        groupElement.innerHTML = `
            <div class="group-icons">
                <i class="uil uil-qrcode-scan"></i>
                <i class="uil uil-pen edit-group" data-group-id="${group.id}"></i>
                <i class="uil uil-trash-alt delete-group" data-group-id="${group.id}"></i>
            </div>
            <span class="group-name">${group.name}</span>
            <p class="group-description">${limitDescription(group.description, 50)}</p>
        `;
        groupContainer.appendChild(groupElement);

        // Add delete event listener
        const deleteBtn = groupElement.querySelector(".delete-group");
        deleteBtn.addEventListener("click", deleteGroup);

        // Add edit event listener
        const editBtn = groupElement.querySelector(".edit-group");
        editBtn.addEventListener("click", openEditModal);

        // Add QR code event listener
        const qrCodeBtn = groupElement.querySelector(".uil-qrcode-scan");
        qrCodeBtn.addEventListener("click", generateQRCode);
    }

    // Attach event listeners to existing delete buttons
    const deleteButtons = document.querySelectorAll(".delete-group");
    deleteButtons.forEach(button => {
        button.addEventListener("click", deleteGroup);
    });

    // Attach event listeners to existing edit buttons
    const editButtons = document.querySelectorAll(".edit-group");
    editButtons.forEach(button => {
        button.addEventListener("click", openEditModal);
    });

    // Attach event listeners to existing QR code buttons
    const qrCodeButtons = document.querySelectorAll(".uil-qrcode-scan");
    qrCodeButtons.forEach(button => {
        button.addEventListener("click", generateQRCode);
    });

    // Delete group function
    function deleteGroup(event) {
        console.log("Delete button clicked!"); // Debugging

        const groupId = event.target.getAttribute("data-group-id");
        console.log("Group ID:", groupId); // Debugging

        const csrfToken = getCSRFToken();
        console.log("CSRF Token:", csrfToken); // Debugging

        if (!csrfToken) {
            console.error("CSRF Token is missing!");
            return;
        }

        if (confirm("Are you sure you want to delete this group?")) {
            console.log("Sending DELETE request..."); // Debugging
            fetch(`/delete-group/${groupId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                },
            })
            .then(response => {
                console.log("Response Status:", response.status); // Debugging
                return response.json();
            })
            .then(data => {
                console.log("Response Data:", data); // Debugging
                if (data.success) {
                    event.target.closest(".group-item").remove(); // Remove from UI
                } else {
                    alert("Error: " + data.error);
                }
            })
            .catch(error => console.error("Error:", error));
        }
    }

    // Open edit modal (redirect to group detail page)
    function openEditModal(event) {
        const groupId = event.target.getAttribute("data-group-id");
        window.location.href = `/group/${groupId}/`;  // Redirect to the group detail page
    }

    // Generate QR Code
    function generateQRCode(event) {
        const groupId = event.target.closest(".group-item").querySelector(".edit-group").getAttribute("data-group-id");
        const publicLinkUrl = `${window.location.origin}/public/${groupId}/`;

        // Clear previous QR code
        qrCodeContainer.innerHTML = "";

        // Generate new QR code
        new QRCode(qrCodeContainer, {
            text: publicLinkUrl,
            width: 256,
            height: 256,
        });

        // Display the modal
        qrCodeModal.style.display = "flex";
    }

    // Close QR Code Modal
    closeQrModalBtn.addEventListener("click", () => {
        qrCodeModal.style.display = "none";
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === qrCodeModal) {
            qrCodeModal.style.display = "none";
        }
    });

    // Helper function to limit description to 50 words
    function limitDescription(description, wordLimit) {
        if (!description) return "";
        const words = description.split(" ");
        if (words.length > wordLimit) {
            return words.slice(0, wordLimit).join(" ") + "...";
        }
        return description;
    }

    // Get CSRF token from cookies or meta tag
    function getCSRFToken() {
        // Try to get the CSRF token from the cookie
        const csrfTokenFromCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];

        if (csrfTokenFromCookie) {
            return csrfTokenFromCookie;
        }

        // If not found in cookies, try to get it from the meta tag
        const csrfTokenFromMeta = document.querySelector('meta[name="csrf-token"]')?.content;
        console.log("CSRF Token from meta tag:", csrfTokenFromMeta); // Debugging
        return csrfTokenFromMeta;
    }

    // Refresh CSRF token
    function refreshCSRFToken() {
        fetch("/get-csrf-token/")
            .then(response => response.json())
            .then(data => {
                document.cookie = `csrftoken=${data.csrfToken}; path=/`;
                console.log("New CSRF Token:", data.csrfToken); // Debugging
            })
            .catch(error => console.error("Error fetching CSRF token:", error));
    }

    // Ensure the CSRF token is refreshed when the page loads
    refreshCSRFToken();

    // Refresh CSRF token on logout or login form submission
    document.querySelector(".logout-btn")?.addEventListener("click", function () {
        setTimeout(refreshCSRFToken, 1000);
    });

    document.querySelector(".login-form")?.addEventListener("submit", function () {
        setTimeout(refreshCSRFToken, 1000);
    });

    // Search functionality
    searchBox.addEventListener("input", function () {
        const searchQuery = this.value.toLowerCase();
        const groupItems = document.querySelectorAll(".group-item");

        groupItems.forEach(group => {
            const groupName = group.querySelector(".group-name").textContent.toLowerCase();
            const groupDescription = group.querySelector(".group-description").textContent.toLowerCase();

            if (groupName.includes(searchQuery) || groupDescription.includes(searchQuery)) {
                group.style.display = "flex";
            } else {
                group.style.display = "none";
            }
        });
    });

    // Close add group modal with X button (this may already exist in your code)
    document.querySelector(".close-modal").addEventListener("click", () => {
        document.querySelector(".add-group-modal").style.display = "none";
    });

    // Close edit group modal with X button
    document.querySelector(".close-edit-modal")?.addEventListener("click", () => {
        document.querySelector(".edit-group-modal").style.display = "none";
    });

    // Close QR code modal with X button (this may already exist in your code)
    document.querySelector(".close-qr-modal").addEventListener("click", () => {
        document.querySelector(".qr-code-modal").style.display = "none";
    });

    // Close modals when clicking outside the modal content
    window.addEventListener("click", (event) => {
        const addModal = document.querySelector(".add-group-modal");
        const editModal = document.querySelector(".edit-group-modal");
        const qrModal = document.querySelector(".qr-code-modal");

        if (event.target === addModal) {
            addModal.style.display = "none";
        } else if (event.target === editModal) {
            editModal.style.display = "none";
        } else if (event.target === qrModal) {
            qrModal.style.display = "none";
        }
    });

    // Add visual feedback when buttons are clicked
    const modalButtons = document.querySelectorAll(".save-group-btn, .save-edit-group-btn");
    modalButtons.forEach(button => {
        button.addEventListener("click", function() {
            this.classList.add("button-clicked");
            setTimeout(() => {
                this.classList.remove("button-clicked");
            }, 200);
        });
    });

    // Function to add a new group to the UI with improved styling
    function addGroupToUI(group) {
        const groupContainer = document.querySelector(".link-groups");
        if (!groupContainer) {
            console.error("Group container not found");
            return;
        }

        const groupElement = document.createElement("div");
        groupElement.classList.add("group-item");

        // Apply random animation delay for a staggered effect
        const randomDelay = Math.random() * 0.3;
        groupElement.style.animationDelay = `${randomDelay}s`;

        groupElement.innerHTML = `
            <div class="group-icons">
                <i class="uil uil-qrcode-scan" title="Show QR Code"></i>
                <i class="uil uil-pen edit-group" data-group-id="${group.id}" title="Edit Group"></i>
                <i class="uil uil-trash-alt delete-group" data-group-id="${group.id}" title="Delete Group"></i>
            </div>
            <span class="group-name">${group.name}</span>
            <p class="group-description">${group.description || 'No description provided.'}</p>
        `;

        groupContainer.appendChild(groupElement);

        // Add delete event listener
        const deleteBtn = groupElement.querySelector(".delete-group");
        deleteBtn.addEventListener("click", deleteGroup);

        // Add edit event listener
        const editBtn = groupElement.querySelector(".edit-group");
        editBtn.addEventListener("click", openEditModal);

        // Add QR code event listener
        const qrCodeBtn = groupElement.querySelector(".uil-qrcode-scan");
        qrCodeBtn.addEventListener("click", generateQRCode);
    }

    // Modify the limitDescription function to not truncate but handle overflow with CSS
    function limitDescription(description, wordLimit) {
        if (!description) return "No description provided.";
        return description; // Let CSS handle overflow now
    }

    // Add tooltips to icons when hovering
    document.addEventListener('DOMContentLoaded', function() {
        // Apply initial animations to existing cards
        const groupItems = document.querySelectorAll('.group-item');
        groupItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });

        // Adjust heights for descriptions if needed
        adjustDescriptionHeights();

        // Add resize listener for responsiveness
        window.addEventListener('resize', adjustDescriptionHeights);
    });

    // Function to adjust description heights based on content
    function adjustDescriptionHeights() {
        const groupItems = document.querySelectorAll('.group-item');
        groupItems.forEach(item => {
            const name = item.querySelector('.group-name');
            const description = item.querySelector('.group-description');
            const icons = item.querySelector('.group-icons');

            // Calculate available height (container height minus other elements)
            const maxHeight = item.offsetHeight - name.offsetHeight - icons.offsetHeight - 40; // 40px for padding
            description.style.maxHeight = `${maxHeight}px`;
        });
    }

    // Add an observer to detect theme changes and adjust group colors
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' && mutation.target === document.body) {
                // Theme has changed, adjust group colors if needed
                const isDarkMode = document.body.classList.contains('dark');
                adjustGroupColors(isDarkMode);
            }
        });
    });

    observer.observe(document.body, { attributes: true });

    // Function to adjust group colors based on theme
    function adjustGroupColors(isDarkMode) {
        // Additional color adjustments if needed
        // This functionality is mostly handled by CSS, but can be extended here
    }
});