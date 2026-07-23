let tasks = [];
let workspaces = [];
let employees = [];
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const urlParams = new URLSearchParams(window.location.search);
let currentWorkspaceFilter = urlParams.get("workspace") || "all";

let currentSearchQuery = "";
let sortByPriorityMode = false;

async function loadTaskData() {
    const taskResponse = await fetch(`${API_URL}/task`, {
        headers: { token },
    });
    tasks = await taskResponse.json();
    const workspaceResponse = await fetch(`${API_URL}/workspace`, {
        headers: { token },
    });
    workspaces = await workspaceResponse.json();
    const employeeResponse = await fetch(`${API_URL}/user`, {
        headers: { token },
    });
    employees = await employeeResponse.json();
    employees = employees.filter((emp) => emp.role.toLowerCase() === "employee");

    const pendingMsg = sessionStorage.getItem("pending_toast_msg");

    if (pendingMsg) {
        sessionStorage.removeItem("pending_toast_msg");

    setTimeout(() => {
        showToast(pendingMsg, "success");
    }, 300);
}

    populateWorkspaceDropdowns();
    renderTasks();
}

document.addEventListener("DOMContentLoaded", async () => {

    if (user.role.toLowerCase() === "employee") {
    document.querySelectorAll(".add-task-btn").forEach(btn => {
        btn.style.display = "none";
    });
    }

    await loadTaskData();

    const boardTitleElement = document.querySelector(".board-title");
    if (boardTitleElement) {
        boardTitleElement.innerText =
            currentWorkspaceFilter === "all"
                ? "Global Task Board"
                : `${currentWorkspaceFilter} Board`;
    }

    const boardFilterSelect = document.getElementById("board-workspace-filter");
    if (boardFilterSelect) {
        boardFilterSelect.value = currentWorkspaceFilter;
        boardFilterSelect.addEventListener("change", handleWorkspaceFilterChange);
    }

    const dateInputElement = document.getElementById("task-date");
    if (dateInputElement) {
        const todayStr = new Date().toISOString().split("T")[0];
        dateInputElement.min = todayStr;
    }

    document
        .getElementById("task-form")
        .addEventListener("submit", handleFormSubmit);

    document
        .getElementById("sort-priority-btn")
        .addEventListener("click", togglePrioritySort);

    window.addEventListener("hashchange", handleRouting);

    if (!window.location.hash || window.location.hash === "#") {
        window.location.hash = "/tasks";
    } else {
        handleRouting();
    }
});

// This function fills up the workspace dropdown selectors using the workspaces saved in your data storage.
// It makes sure users can select from their created workspaces when filtering the board or assigning a new task.
function populateWorkspaceDropdowns() {
    const boardFilterSelect = document.getElementById("board-workspace-filter");
    const taskAssignSelect = document.getElementById("task-workspace-assign");
    const employeeSelect = document.getElementById("task-assigned-to");

    if (boardFilterSelect) {
        boardFilterSelect.innerHTML = `<option value="all">All Workspaces</option>`;
        workspaces.forEach((ws) => {
            boardFilterSelect.innerHTML += `<option value="${ws.id}">${ws.workspaceName}</option>`;
        });
    }

    if (taskAssignSelect) {
        taskAssignSelect.innerHTML = `<option value="" selected disabled>Select Workspace</option>`;
        if (workspaces.length === 0) {
            taskAssignSelect.innerHTML += `<option value="" disabled>No workspace available</option>`;
        } else {
            workspaces.forEach((ws) => {
                taskAssignSelect.innerHTML += `<option value="${ws.id}">${ws.workspaceName}</option>`;
            });
        }
    }

    if (employeeSelect) {
        employeeSelect.innerHTML = `<option value="" selected disabled>Select Employee</option>`;
        if (employees.length === 0) {
            employeeSelect.innerHTML += `<option value="" disabled>No employee available</option>`;
        } else {
            employees.forEach((emp) => {
                employeeSelect.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
            });
        }
    }
}

// This function triggers whenever the user selects a different workspace filter from the dropdown.
// It updates the titles, modifies the web browser address bar text, and redraws the matching filtered tasks.
function handleWorkspaceFilterChange(e) {
    currentWorkspaceFilter = e.target.value;

    const boardTitleElement = document.querySelector(".board-title");
    if (boardTitleElement) {
        boardTitleElement.innerText =
            currentWorkspaceFilter === "all"
                ? "Global Task Board"
                : `${currentWorkspaceFilter} Board`;
    }

    const newUrl = currentWorkspaceFilter === "all" ? "taskboard.html" : `taskboard.html?workspace=${encodeURIComponent(currentWorkspaceFilter)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    renderTasks();
}

// This function watches the web address hash fragment to figure out which window state should display.
// It automatically reads the URL path to open the creation popup, the editing popup, or close everything.
function handleRouting() {
    const hashPath = window.location.hash.replace("#", "");

    renderTasks();

    if (hashPath.startsWith('/tasks/create')) {

        const type = new URLSearchParams(
            window.location.hash.split("?")[1]
        ).get("type");
        openTaskForm(null, type);
    } else if (hashPath.startsWith('/tasks/edit/')) {
        const idToEdit = parseInt(
            hashPath.split('/tasks/edit/')[1],
            10
        );
        openTaskForm(idToEdit);
    } else {
        closeTaskFormModal();
    }
}

// This function shows a brief toast notification on successful creation of tasks as well as shows toast notification if there is something wrong.
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) {
        console.log("Toast element missing");
        return;
    }
    toast.innerText = message;
    toast.className = `toast ${type}`;
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// This function opens a task modal form, changes the form title, resets the form in the beginning.
function openTaskForm(id = null, defaultType = null) {
    const modal = document.getElementById("task-modal");
        if (modal.style.display === "flex") {
        return;
    }
    const form = document.getElementById("task-form");
    const title = document.getElementById("form-title");
    const workspaceSelect = document.getElementById("task-workspace-assign");
    const employeeSelect = document.getElementById("task-assigned-to");

    // Reset readonly state every time modal opens
    workspaceSelect.style.pointerEvents = "auto";
    workspaceSelect.style.backgroundColor = "";

    if (employeeSelect) {
        employeeSelect.style.pointerEvents = "auto";
        employeeSelect.style.backgroundColor = "";
    }
    form.reset();
    modal.style.display = "flex";

    if (id) {
        title.innerText = "Edit Task Window";
        const targetTask = tasks.find((t) => t.id === id);

        if (targetTask) {
            document.getElementById("task-id").value = targetTask.id;
            document.getElementById("task-name").value = targetTask.taskName;
            document.getElementById("task-desc").value = targetTask.taskDesc || "";
            document.getElementById("task-type").value = targetTask.taskType;
            document.getElementById("task-priority").value = targetTask.taskPriority;
            document.getElementById("task-date").value = targetTask.duedate;
            // Set workspace
            workspaceSelect.value = String(targetTask.workspaceId);
            // Set employee
            if (employeeSelect) {
                employeeSelect.value = targetTask.assignedTo
                    ? String(targetTask.assignedTo)
                    : "";
            }
            // Employee can see but cannot change
            if (user.role.toLowerCase() === "employee") {
                workspaceSelect.style.pointerEvents = "none";
                workspaceSelect.style.backgroundColor = "#eee";
                if (employeeSelect) {
                    employeeSelect.style.pointerEvents = "none";
                    employeeSelect.style.backgroundColor = "#eee";
                }
            }
        } else {
            window.location.hash = "/tasks";
        }
   } else {
    title.innerText = "Create New Task";
    document.getElementById("task-id").value = "";
    if(defaultType){
        document.getElementById("task-type").value = defaultType;
    } else {
        document.getElementById("task-type").value = "todo";
    }
    workspaceSelect.value = "";
    if(employeeSelect){
        employeeSelect.value = "";
    }
}
}

function closeTaskFormModal() {
    document.getElementById("task-modal").style.display = "none";
}

// This function handles form submission by getting all the values from the form and submitting it.
async function handleFormSubmit(e) {
    e.preventDefault();

    const idValue = document.getElementById("task-id").value;
    const taskName = document.getElementById("task-name").value;
    const taskDesc = document.getElementById("task-desc").value;
    const taskType = document.getElementById("task-type").value;
    const taskPriority = document.getElementById("task-priority").value;
    const duedate = document.getElementById("task-date").value;
    const workspaceSelect = document.getElementById("task-workspace-assign");
    const employeeSelect = document.getElementById("task-assigned-to");
    const workspaceId = workspaceSelect.value;
    const assignedTo = employeeSelect ? employeeSelect.value : null;

    if (!workspaceId) {
        alert("Please select workspace");
        return;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    if (duedate < todayStr) {
        alert(
            "Due date cannot be in the past! Please choose a valid target deadline.",
        );
        document.getElementById("task-date").focus();
        return;
    }

        const payload = {
            taskName,
            taskDesc,
            taskType,
            taskPriority,
            duedate,
            workspaceId: Number(workspaceId),
            assignedTo: assignedTo ? Number(assignedTo) : null
        };
        let url=`${API_URL}/task`
        let method="POST"
       
        if (idValue) {
            url += `/${idValue}`;
            method = "PUT";
        }
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                token
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {

        const message = idValue
        ? "Task updated successfully"
        : "Task created successfully";

        // Save toast message before route change/refresh
        sessionStorage.setItem("pending_toast_msg", message);

        // Close modal
        closeTaskFormModal();

        // Go back to task board
        window.location.hash = "/tasks";

        // Refresh page so routing resets properly
        window.location.reload();
        }
    }
}

// This function switches the task sorting mode between default ordering and high-to-low priority levels.
function togglePrioritySort() {
    sortByPriorityMode = !sortByPriorityMode;

    const btn = document.getElementById("sort-priority-btn");
    if (btn) {
        btn.style.background = sortByPriorityMode ? "#e0e7ff" : "";
        btn.style.color = sortByPriorityMode ? "#4f46e5" : "";
        btn.style.borderColor = sortByPriorityMode ? "#4f46e5" : "";
    }

    renderTasks();
}

// This function filters your entire task collection by workspaces and search matches to clean out columns.
function renderTasks() {
    const todoBanner = document.querySelector(".todo-card .task-banner");
    const inprogressBanner = document.querySelector(
        ".inprogress-card .task-banner",
    );
    const completedBanner = document.querySelector(
        ".completed-card .task-banner",
    );
    const overdueBanner = document.querySelector(".overdue-card .task-banner");

    if (todoBanner) todoBanner.innerHTML = "";
    if (inprogressBanner) inprogressBanner.innerHTML = "";
    if (completedBanner) completedBanner.innerHTML = "";
    if (overdueBanner) overdueBanner.innerHTML = "";

    let counts = { todo: 0, inprogress: 0, completed: 0, overdue: 0 };
    const todayStr = new Date().toISOString().split("T")[0];

    let processedTasks = tasks.filter((task) => {
        const matchesWorkspace =
            currentWorkspaceFilter === "all" ||
            Number(task.workspaceId) === Number(currentWorkspaceFilter);
        const matchesSearch =
            task.taskName.toLowerCase().includes(currentSearchQuery) ||
            (task.taskDesc &&
                task.taskDesc.toLowerCase().includes(currentSearchQuery));
        return matchesWorkspace && matchesSearch;
    });

    if (sortByPriorityMode) {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        processedTasks.sort(
            (a, b) =>
                (priorityWeight[b.taskPriority] || 0) -
                (priorityWeight[a.taskPriority] || 0),
        );
    }

    processedTasks.forEach((task) => {
        let targetType = task.taskType;
        if (
            task.taskType !== "completed" &&
            task.duedate &&
            task.duedate < todayStr
        ) {
            targetType = "overdue";
        }

        if (counts.hasOwnProperty(targetType)) {
            counts[targetType]++;
        }

        const taskElement = document.createElement("a");
        taskElement.classList.add("task-item");
        taskElement.style.textDecoration = "none";
        

        let priorityClass = task.taskPriority.toLowerCase();
        taskElement.innerHTML = `
            <div class="task-row-top">
                <h5 class="task-item-title">${task.taskName}</h5>
                <span class="priority-badge ${priorityClass}">${task.taskPriority}</span>
            </div>
            <div class="task-row-bottom">
                <span class="task-date">📅 ${task.duedate}</span>
            </div>
        `;

        if (targetType === "todo" && todoBanner) {
            todoBanner.appendChild(taskElement);
        } else if (targetType === "inprogress" && inprogressBanner) {
            inprogressBanner.appendChild(taskElement);
        } else if (targetType === "completed" && completedBanner) {
            completedBanner.appendChild(taskElement);
        } else if (targetType === "overdue" && overdueBanner) {
            overdueBanner.appendChild(taskElement);
        }
    });

    document.querySelector(".todo-card .task-count").innerText = counts.todo;
    document.querySelector(".inprogress-card .task-count").innerText =
        counts.inprogress;
    document.querySelector(".completed-card .task-count").innerText =
        counts.completed;
    document.querySelector(".overdue-card .task-count").innerText =
        counts.overdue;
}
