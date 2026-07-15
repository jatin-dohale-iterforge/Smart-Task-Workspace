const workspaceName = document.querySelector('.workspace-name-input');
const workspaceDesc = document.querySelector('#workspace-desc-input');
const workspaceIcon = document.querySelector('#workspace-icon-options');
const workspaceColor = document.querySelector('#color');
const error = document.querySelectorAll('.error')
const workspaceCard = document.querySelector('.workspace-lists')
let editIndex = -1
const createWorkspaceBtn = document.querySelector('.create-btn')
const breadcrumbAction = document.querySelector("#breadcrumb-action");
const workspaceFormTitle = document.querySelector("#workspace-form-title");
const workspaceFormDescription = document.querySelector("#workspace-form-description");

const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
let workspace = {
    workspaceName: "",
    workspaceDescription: "",
    workspaceIcon: "",
    workspaceColor: ""
}
const searchBar = document.querySelector("#search-bar");
let filteredWorkspaces = workspaces;
let deleteIndex = null;


function showToast(message, type = "success") {
    try {
        const toast = document.querySelector("#toast");
        if (!toast) return;
        toast.innerHTML = message;
        toast.className = `toast ${type}`;
        setTimeout(() => {
            toast.classList.add("show");
        }, 10);
        setTimeout(() => {
            toast.classList.remove("show");
        }, 5000);

    }
    catch (e) {
        console.log("Toast error:", e);
    }
}

function formatDate(date) {
    try {
        if (!date) return "";
        return new Date(date).toLocaleString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    }
    catch (e) {
        console.log("Format date error:", e);
        return "";

    }
}


function getTaskCount(workspaceId) {
    try {
        const tasks = JSON.parse(localStorage.getItem("smart_tasks")) || [];
        return tasks.filter(task => task.workspaceId === workspaceId).length;
    }
    catch (e) {
        console.log("Task count error:", e);
        return 0;
    }
}

function validate(inputTag, errorMsg) {
    try {
        let value = inputTag.value;
        let error = inputTag.parentElement.querySelector(".error");
        if (!value) {
            error.innerHTML = errorMsg;
            return false;
        }
        error.innerHTML = ""
        return true;
    }
    catch (e) {
        console.log("Validation error:", e);
        return false;
    }

}

function resetWorkspaceForm() {
    try {
        if (!workspaceName) return;
        workspaceName.value = "";
        workspaceDesc.value = "";
        workspaceIcon.value = "";
        workspaceColor.value = "";
        error.forEach((errorElem) => {
            errorElem.innerHTML = ""
        })
    }
    catch (e) {
        console.log(e)
    }

}

function submitWorkspace(e) {
    e.preventDefault()
    try {
        let name = validate(workspaceName, "Workspace name is required");
        let icon = validate(workspaceIcon, "Icon is required")
        let color = validate(workspaceColor, "Color is required")
        if (!(name && icon && color)) {
            return;
        }
        workspace = {
            id: Date.now(),
            workspaceName: workspaceName.value,
            workspaceDescription: workspaceDesc.value || "",
            workspaceIcon: workspaceIcon.value,
            workspaceColor: workspaceColor.value,
            updatedAt: new Date().toISOString()
        }


        if (editIndex === -1) {
            workspaces.push(workspace)

        }
        else {
            workspaces[editIndex] = workspace;
            editIndex = -1;
            if (createWorkspaceBtn) {
                createWorkspaceBtn.textContent = "Create Workspace";
            }

        }
        localStorage.setItem("workspaces", JSON.stringify(workspaces))
        filteredWorkspaces = workspaces;
        resetWorkspaceForm()
        setTimeout(() => {
            window.location.href = "workspace.html";
        }, 1000);
        showToast("Workspace created successfully!", "success");
    }
    catch (e) {
        console.log(e);
        showToast("Something went wrong!", "error");
    }
}

function datashow() {
    try {
        if (!workspaceCard) return;
        workspaceCard.innerHTML = "";
        if (filteredWorkspaces.length === 0) {

    workspaceCard.innerHTML = `
        <div class="empty-workspace">
            <i class="fa fa-folder-open"></i>
            <h3>No Workspace Found</h3>
            <p>
                Create a workspace to start organizing your tasks.
            </p>
        
        </div>
    `;

    return;
}
        filteredWorkspaces.forEach((elem) => {
            const encodedName=encodeURIComponent(elem.workspaceName)
            const index = workspaces.indexOf(elem);
            workspaceCard.innerHTML += `
       <div class="workspace-card">
         <a href="taskboard.html?workspace=${encodedName}" class="workspace-link-wrapper" style="text-decoration: none; color: inherit; flex-grow: 1;">
        <div class="main-workspace-info">
            <i class="${elem.workspaceIcon}" style="background-color:${elem.workspaceColor}"></i>
            <h3 class="workspace-title">${elem.workspaceName}</h3>
            <h4 class="workspace-task-count">Task count: ${getTaskCount(elem.id)}</h4>
            <p class="workspace-update-time">Updated: ${formatDate(elem.updatedAt)}</p>
            </div>
            </a>
            <div class="workspace-action-btn">
                        <div class="action-btns">
                           <button class="edit-icon" onclick="editWorkspace(${index})"><i class="fa fa-edit"></i></button>
                           <button class="delete-icon" onclick="openDeleteModal(${index})"><i class="fa fa-trash"></i></button>
                        </div>
            </div>           
        </div>
        `
        });
    }
    catch (e) {
        console.log("Data show error:", e);
    }
}

function editWorkspace(index) {
    try {
        window.location.href = `create-workspace.html?id=${index}`;
    }
    catch (e) {
        console.log("Edit error:", e);
    }


}

function loadWorkspaceForEdit() {

    try {
        if (!workspaceName) return;
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id === null) return;
        editIndex = Number(id);
        const workspace = workspaces[editIndex];
        if (!workspace) return;
        workspaceName.value = workspace.workspaceName;
        workspaceDesc.value = workspace.workspaceDescription;
        workspaceIcon.value = workspace.workspaceIcon;
        workspaceColor.value = workspace.workspaceColor;

     
        if (createWorkspaceBtn) {
            createWorkspaceBtn.textContent = "Update Workspace";
        }
        if (breadcrumbAction) {
            breadcrumbAction.textContent = "Edit";
        }
        if (workspaceFormTitle) {
            workspaceFormTitle.textContent = "Edit Workspace";
        }
        if (workspaceFormDescription) {
            workspaceFormDescription.textContent =
                "Update your workspace details.";
        }

    }
    catch (e) {
        console.log("Edit load error:", e);
    }
}

function deleteWorkspace() {
    try {
        if (deleteIndex === null) return;
        workspaces.splice(deleteIndex, 1);
        localStorage.setItem(
            "workspaces",
            JSON.stringify(workspaces)
        );
        filteredWorkspaces = workspaces;
        datashow();
        showToast("Workspace deleted successfully!", "success");
        closeDeleteModal();
    }
    catch (e) {
        console.log("Delete error:", e);
        showToast("Unable to delete workspace!", "error");

    }
}


function openDeleteModal(index) {
    try {
        deleteIndex = index;
        const modal = document.querySelector("#deleteModal");
        modal.classList.add("show");
    }
    catch (e) {
        console.log("Open modal error:", e)
    }
}


function closeDeleteModal() {
    try {
        deleteIndex = null;
        const modal = document.querySelector("#deleteModal");
        modal.classList.remove("show");
    }
    catch (e) {
        console.log("Close modal error:", e);
    }
}

function searchWorkspace() {
    try {
        if (!searchBar) return;
        const keyword = searchBar.value.toLowerCase().trim();
        filteredWorkspaces = workspaces.filter(workspace =>
            workspace.workspaceName.toLowerCase().includes(keyword)
        );
        datashow();
    }
    catch (e) {
        console.log("Search error:", e);
    }
}


loadWorkspaceForEdit();
datashow();