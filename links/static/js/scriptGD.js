document.addEventListener("DOMContentLoaded", function () {
    const body = document.querySelector("body"),
          modeToggle = document.querySelector(".mode-toggle"),
          sidebar = document.querySelector("nav"),
          sidebarToggle = document.querySelector(".sidebar-toggle"),
          addLinkBtn = document.querySelector(".add-link-btn"),
          addLinkModal = document.querySelector(".add-link-modal"),
          closeModalBtn = document.querySelector(".add-link-modal .close-modal"),
          saveLinkBtn = document.querySelector(".save-link-btn"),
          editLinkModal = document.querySelector(".edit-link-modal"),
          closeEditModalBtn = document.querySelector(".edit-link-modal .close-edit-modal"),
          saveEditLinkBtn = document.querySelector(".save-edit-link-btn"),
          linkTitleInput = document.querySelector("#link-title"),
          linkUrlInput = document.querySelector("#link-url"),
          editLinkTitleInput = document.querySelector("#edit-link-title"),
          editLinkUrlInput = document.querySelector("#edit-link-url"),
          linkList = document.querySelector(".link-list"),
          closeEditGroupModalBtn = document.querySelector(".edit-group-modal .close-edit-group-modal"),
          editGroupModal = document.querySelector(".edit-group-modal"),
          saveEditGroupBtn = document.querySelector(".save-edit-group-btn");

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

    // Open add link modal
    addLinkBtn.addEventListener("click", () => {
        addLinkModal.style.display = "flex";
        setTimeout(() => {
            linkTitleInput.focus();
        }, 100);
    });

    // Close add link modal
    closeModalBtn.addEventListener("click", () => {
        addLinkModal.style.display = "none";
    });

    // Save new link
    saveLinkBtn.addEventListener("click", function () {
        const linkTitle = linkTitleInput.value.trim();
        const linkUrl = linkUrlInput.value.trim();
    
        if (linkTitle && linkUrl) {
            fetch(`/add_link/${groupId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({
                    link_title: linkTitle,
                    link_url: linkUrl,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addLinkToUI(data.link.id, linkTitle, linkUrl);
                    addLinkModal.style.display = "none";
                    linkTitleInput.value = "";
                    linkUrlInput.value = "";
                    updatePreview(); // Update the public page preview
                } else {
                    alert(data.error || "Failed to save the link.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while saving the link.");
            });
        } else {
            alert("Please fill in both Link Title and Link URL.");
        }
    });

    function addLinkToUI(id, title, url) {
        const linkItem = document.createElement("div");
        linkItem.classList.add("link-item");
        linkItem.setAttribute("data-link-id", id);
        linkItem.innerHTML = `
            <div class="link-icons">
                <i class="uil uil-bars drag-handle" data-tooltip="Drag to Reorder"></i>
                <i class="uil uil-pen edit-link" data-tooltip="Edit Link"></i>
                <i class="uil uil-trash-alt delete-link" data-tooltip="Delete Link"></i>
            </div>
            <div class="link-details">
                <span class="link-name">${title}</span>
                <span class="link-url">${url}</span>
            </div>
        `;
        linkList.appendChild(linkItem);
    
        // Attach event listeners to the new link
        attachLinkEventListeners(linkItem);
    
        // Update the preview section
        updatePreview();
    }
    // Function to attach event listeners to edit and delete buttons
    function attachLinkEventListeners(linkItem) {
        const editBtn = linkItem.querySelector(".edit-link");
        const deleteBtn = linkItem.querySelector(".delete-link");

        // Get the link ID, title, and URL from the link item
        const linkId = linkItem.getAttribute("data-link-id");
        const linkTitle = linkItem.querySelector(".link-name").textContent;
        const linkUrl = linkItem.querySelector(".link-url").textContent;

        // Attach edit event listener
        editBtn.addEventListener("click", () => openEditLinkModal(linkId, linkTitle, linkUrl, linkItem));

        // Attach delete event listener
        deleteBtn.addEventListener("click", () => deleteLink(linkId, linkItem));
    }

    // Attach event listeners to existing links on page load
    const existingLinks = document.querySelectorAll(".link-item");
    existingLinks.forEach(linkItem => {
        attachLinkEventListeners(linkItem);
    });

    // Open edit link modal
    function openEditLinkModal(id, title, url, linkItem) {
        editLinkTitleInput.value = title;
        editLinkUrlInput.value = url;
        editLinkModal.style.display = "flex";
        
        setTimeout(() => {
            editLinkTitleInput.focus();
        }, 100);

        // Save changes when the save button is clicked
        saveEditLinkBtn.onclick = () => {
            saveEditLinkBtn.classList.add("button-clicked");
            setTimeout(() => {
                saveEditLinkBtn.classList.remove("button-clicked");
            }, 200);
            
            const newTitle = editLinkTitleInput.value.trim();
            const newUrl = editLinkUrlInput.value.trim();

            if (newTitle && newUrl) {
                fetch(`/edit_link/${id}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken(),
                    },
                    body: JSON.stringify({
                        link_title: newTitle,
                        link_url: newUrl,
                    }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        linkItem.querySelector(".link-name").textContent = newTitle;
                        linkItem.querySelector(".link-url").textContent = newUrl;
                        editLinkModal.style.display = "none";
                        updatePreview(); // Update the public page preview
                    } else {
                        alert(data.error || "Failed to update the link.");
                    }
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("An error occurred while updating the link.");
                });
            } else {
                alert("Please fill in both Link Title and Link URL.");
            }
        };
    }

    // Close edit link modal
    closeEditModalBtn.addEventListener("click", () => {
        editLinkModal.style.display = "none";
    });

    function deleteLink(id, linkItem) {
        if (confirm("Are you sure you want to delete this link?")) {
            fetch(`/delete_link/${id}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    linkItem.remove();
                    updatePreview(); // Update the public page preview
                } else {
                    alert(data.error || "Failed to delete the link.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while deleting the link.");
            });
        }
    }

    function updatePreview() {
        const previewLinksContainer = document.querySelector('.preview-links');
        previewLinksContainer.innerHTML = ''; // Clear existing links
    
        // Get all links from the link list
        const linkItems = document.querySelectorAll('.link-item');
        linkItems.forEach(linkItem => {
            const linkTitle = linkItem.querySelector('.link-name').textContent;
            const linkUrl = linkItem.querySelector('.link-url').textContent;
    
            // Create a new link element for the preview
            const previewLinkItem = document.createElement('a');
            previewLinkItem.classList.add('preview-link-item');
            previewLinkItem.href = linkUrl;
            previewLinkItem.target = '_blank';
            previewLinkItem.innerHTML = `
                <i class="uil uil-link preview-link-icon"></i>
                <span class="preview-link-title">${linkTitle}</span>
            `;
            previewLinksContainer.appendChild(previewLinkItem);
        });
    
        // Update the stats in the preview
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

    new Sortable(linkList, {
        handle: '.drag-handle',  // Drag handle
        animation: 150,
        onEnd: function (evt) {
            const linkItems = linkList.querySelectorAll('.link-item');
            const linkIds = Array.from(linkItems).map(item => item.getAttribute('data-link-id'));
    
            // Send the new order to the server
            fetch(`/update_link_order/${groupId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({
                    link_order: linkIds,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('Failed to update link order.');
                } else {
                    updatePreview(); // Update the public page preview
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating link order.');
            });
        },
    });
   
    // Open Edit Group Modal
    document.querySelector(".edit-group-name").addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(".edit-group-modal").style.display = "flex";
        setTimeout(() => {
            document.querySelector("#edit-group-name").focus();
        }, 100);
    });

    // Close Edit Group Modal
    document.querySelector(".close-edit-group-modal").addEventListener("click", function () {
        document.querySelector(".edit-group-modal").style.display = "none";
    });

    // Save Updated Group Name and Description
    document.querySelector(".save-edit-group-btn").addEventListener("click", function () {
        this.classList.add("button-clicked");
        setTimeout(() => {
            this.classList.remove("button-clicked");
        }, 200);
        
        const newGroupName = document.querySelector("#edit-group-name").value.trim();
        const newGroupDescription = document.querySelector("#edit-group-description").value.trim();

        if (newGroupName && newGroupDescription) {
            fetch(`/update_group/${groupId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({
                    group_name: newGroupName,
                    group_description: newGroupDescription,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update the group name and description in the UI
                    document.querySelector(".edit-group-name").textContent = data.new_name;
                    document.querySelector(".group-description p").textContent = data.new_description;
                    document.querySelector(".preview-phone h4 a").textContent = data.new_name;
                    document.querySelector(".preview-phone p").textContent = data.new_description;
                    document.querySelector(".edit-group-modal").style.display = "none";
                } else {
                    alert(data.error || "Failed to update the group.");
                }
            })
            .catch(error => {

            });
        } else {
            alert("Please enter a valid group name and description.");
        }
    });

    function refreshPreview() {
        const iframe = document.querySelector(".preview-iframe");
        iframe.src = iframe.src; // Refresh the iframe
    }
    
    // Get CSRF token from cookies or meta tag
    function getCSRFToken() {
        const csrfTokenFromCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];

        if (csrfTokenFromCookie) {
            return csrfTokenFromCookie;
        }

        const csrfTokenFromMeta = document.querySelector('meta[name="csrf-token"]')?.content;
        return csrfTokenFromMeta;
    }

    // Close modals when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === addLinkModal) {
            addLinkModal.style.display = "none";
        } else if (event.target === editLinkModal) {
            editLinkModal.style.display = "none";
        } else if (event.target === editGroupModal) {
            editGroupModal.style.display = "none";
        }
    });

    // Close modals with Escape key
    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            if (addLinkModal.style.display === "flex") {
                addLinkModal.style.display = "none";
            }
            if (editLinkModal.style.display === "flex") {
                editLinkModal.style.display = "none";
            }
            if (editGroupModal.style.display === "flex") {
                editGroupModal.style.display = "none";
            }
        }
    });

    // Make modal contents draggable
    const modalContents = document.querySelectorAll(".modal-content");
    modalContents.forEach(modal => {
        makeDraggable(modal);
    });

    // Function to make elements draggable
    function makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // Find the header or create one
        const header = element.querySelector("h2");
        if (header) {
            header.style.cursor = "move";
            header.onmousedown = dragMouseDown;
        } else {
            element.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e.preventDefault();
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // Call function whenever the cursor moves
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});