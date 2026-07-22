const workspaceName = document.querySelector(".workspace-name-input");
const workspaceDesc = document.querySelector("#workspace-desc-input");
const workspaceIcon = document.querySelector("#workspace-icon-options");
const workspaceColor = document.querySelector("#color");
const error = document.querySelectorAll(".error");
const workspaceCard = document.querySelector(".workspace-lists");
let editIndex = -1;
const createWorkspaceBtn = document.querySelector(".create-btn");
const breadcrumbAction = document.querySelector("#breadcrumb-action");
const workspaceFormTitle = document.querySelector("#workspace-form-title");
const workspaceFormDescription = document.querySelector(
  "#workspace-form-description",
);
const managerField = document.querySelector(".workspace-manager");

// Load saved workspaces from localStorage
let workspaces = [];
let tasks = [];
let filteredWorkspaces = [];
const token = localStorage.getItem("token");
const API_URL = "http://localhost:3000";

const managerSelect = document.querySelector("#manager-select");
// Object used to store workspace data before saving
let workspace = {
  workspaceName: "",
  workspaceDescription: "",
  workspaceIcon: "",
  workspaceColor: "",
};
const searchBar = document.querySelector("#search-board");

// Stores the workspace selected for deletion
let deleteIndex = null;

function showToast(message, type = "success") {
  try {
    const toast = document.querySelector("#toast");
    if (!toast) return;
    toast.innerHTML = message;
    toast.className = `toast ${type}`;
    // Trigger toat animation after updating content
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    // Hide toast after a few seconds
    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  } catch (e) {
    console.log("Toast error:", e);
  }
}

function formatDate(date) {
  try {
    if (!date) return "";
    // Convert ISO date into a readable format
    return new Date(date).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    console.log("Format date error:", e);
    return "";
  }
}

async function loadWorkspaces() {
  try {
    const response = await fetch(`${API_URL}/workspace`, {
      headers: {
        token: token,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch workspaces");
    }

    workspaces = await response.json();
    filteredWorkspaces = [...workspaces];

    datashow();
  } catch (err) {
    console.log(err);
    showToast("Unable to load workspaces", "error");
  }
}

function validate(inputTag, errorMsg) {
  try {
    let value = inputTag.value;
    let error = inputTag.parentElement.querySelector(".error");
    // Show validation message if field is empty
    if (!value) {
      error.innerHTML = errorMsg;
      return false;
    }
    error.innerHTML = "";
    return true;
  } catch (e) {
    console.log("Validation error:", e);
    return false;
  }
}

function resetWorkspaceForm() {
  try {
    if (!workspaceName) return;
    // Clear all form fields
    workspaceName.value = "";
    workspaceDesc.value = "";
    workspaceIcon.value = "";
    workspaceColor.value = "";
    // Remove previous validation messages
    error.forEach((errorElem) => {
      errorElem.innerHTML = "";
    });
  } catch (e) {
    console.log(e);
  }
}

async function submitWorkspace(e) {
  e.preventDefault();

  try {
    const isEditing = editIndex !== -1;

    let name = validate(workspaceName, "Workspace name is required");
    let icon = validate(workspaceIcon, "Icon is required");
    let color = validate(workspaceColor, "Color is required");

    if (!(name && icon && color)) return;

    let manager = true;

    if (!isEditing) {
      manager = validate(managerSelect, "Manager is required");
    }

    if (!(name && icon && color && manager)) {
      return;
    }

    const data = {
      workspaceName: workspaceName.value,
      workspaceDesc: workspaceDesc.value,
      workspaceColor: workspaceColor.value,
      workspaceIcon: workspaceIcon.value,
    };

    if (!isEditing) {
      data.managerId = Number(managerSelect.value);
    }

    let response;

    if (!isEditing) {
      response = await fetch(`${API_URL}/workspace`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify(data),
      });
    } else {
      response = await fetch(
        `${API_URL}/workspace/${workspaces[editIndex].id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify(data),
        },
      );
    }

    if (!response.ok) {
      throw new Error("Unable to save workspace");
    }

    resetWorkspaceForm();

    showToast(
      isEditing
        ? "Workspace updated successfully!"
        : "Workspace created successfully!",
    );

    setTimeout(() => {
      window.location.href = "workspace.html";
    }, 500);
  } catch (e) {
    console.log(e);
    showToast("Something went wrong!", "error");
  }
}
function datashow() {
  try {
    if (!workspaceCard) return;
    // Clear old workspace cards before rendering
    workspaceCard.innerHTML = "";
    if (filteredWorkspaces.length === 0) {
      // Show placeholder when no workspaces exist
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
      // Encode workspace name for safe URL usage
      const encodedName = encodeURIComponent(elem.workspaceName);
      const index = elem.id;
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
        `;
    });
  } catch (e) {
    console.log("Data show error:", e);
  }
}

function editWorkspace(id) {
  try {
    window.location.href = `create-workspace.html?id=${id}`;
  } catch (e) {
    console.log("Edit error:", e);
  }
}

async function loadWorkspaceForEdit() {
  try {
    if (!workspaceName) return;

    const params = new URLSearchParams(window.location.search);

    const id = Number(params.get("id"));

    if (!id) return;

    const response = await fetch(`${API_URL}/workspace`, {
      headers: {
        token: token,
      },
    });

    workspaces = await response.json();

    const workspace = workspaces.find((w) => w.id === id);

    if (!workspace) return;

    editIndex = workspaces.findIndex((w) => w.id === id);

    workspaceName.value = workspace.workspaceName;
    workspaceDesc.value = workspace.workspaceDesc;
    workspaceIcon.value = workspace.workspaceIcon;
    workspaceColor.value = workspace.workspaceColor;
    if (managerSelect && workspace.managerId) {
      managerSelect.value = String(workspace.managerId);
    }

    createWorkspaceBtn.textContent = "Update Workspace";
    breadcrumbAction.textContent = "Edit";
    workspaceFormTitle.textContent = "Edit Workspace";
    workspaceFormDescription.textContent = "Update your workspace details.";
    if (managerField) {
      managerField.style.display = "none";
    }
  } catch (e) {
    console.log(e);
  }
}

async function deleteWorkspace() {
  try {
    if (deleteIndex === null) return;

    const response = await fetch(`${API_URL}/workspace/${deleteIndex}`, {
      method: "DELETE",
      headers: {
        token: token,
      },
    });

    if (!response.ok) {
      throw new Error("Delete failed");
    }

    closeDeleteModal();
    showToast("Workspace deleted successfully!");

    await loadWorkspaces();
  } catch (e) {
    console.log("Delete error:", e);
    showToast("Unable to delete workspace", "error");
  }
}

function openDeleteModal(id) {
  try {
    deleteIndex = id;

    const modal = document.querySelector("#deleteModal");
    modal.classList.add("show");
  } catch (e) {
    console.log("Open modal error:", e);
  }
}

function closeDeleteModal() {
  try {
    // Reset selection when modal closes
    deleteIndex = null;
    const modal = document.querySelector("#deleteModal");
    modal.classList.remove("show");
  } catch (e) {
    console.log("Close modal error:", e);
  }
}

function renderItem() {
  try {
    if (!searchBar) return;
    const keyword = searchBar.value.toLowerCase().trim();
    // Filter workspaces by matching the search keyword
    filteredWorkspaces = workspaces.filter((workspace) =>
      workspace.workspaceName.toLowerCase().includes(keyword),
    );
    console.log(filteredWorkspaces);
    datashow();
  } catch (e) {
    console.log("Search error:", e);
  }
}

async function loadTasks() {
  const response = await fetch(`${API_URL}/task`, {
    headers: {
      token: token,
    },
  });

  tasks = await response.json();
}

function getTaskCount(workspaceId) {
  return tasks.filter((task) => task.workspaceId === workspaceId).length;
}

async function loadManagers() {
  try {
    const response = await fetch(`${API_URL}/employees`, {
      headers: {
        token: token,
      },
    });
    if (!response.ok) {
      throw new Error("Unable to load managers");
    }
    const employees = await response.json();
    managerSelect.innerHTML = `<option value="">Select Manager</option>`;
    employees
      .filter((employee) => employee.role === "Manager")
      .forEach((manager) => {
        managerSelect.innerHTML += `
                    <option value="${manager.id}">
                        ${manager.name}
                    </option>
                `;
      });
  } catch (err) {
    console.log(err);
  }
}

// Load edit data if available and display workspaces
async function init() {
  await loadTasks();
  await loadWorkspaces();
  if (managerSelect) {
    await loadManagers();
  }
  await loadWorkspaceForEdit();
}

init();