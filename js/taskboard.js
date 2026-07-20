let tasks = JSON.parse(localStorage.getItem("smart_tasks")) || [];
const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];

const urlParams = new URLSearchParams(window.location.search);
let currentWorkspaceFilter = urlParams.get('workspace') || "all";

let currentSearchQuery = "";
let sortByPriorityMode = false;

document.addEventListener("DOMContentLoaded", () => {
    populateWorkspaceDropdowns();

    const boardTitleElement = document.querySelector(".board-title");
    if (boardTitleElement) {
        boardTitleElement.innerText = currentWorkspaceFilter === "all" 
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
        const todayStr = new Date().toISOString().split('T')[0];
        dateInputElement.min = todayStr;
    }

    document.getElementById("task-form").addEventListener("submit", handleFormSubmit);

    document.getElementById("sort-priority-btn").addEventListener("click", togglePrioritySort);


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

    if (boardFilterSelect) {
        boardFilterSelect.innerHTML = `<option value="all">All Workspaces</option>`;
        workspaces.forEach(ws => {
            boardFilterSelect.innerHTML += `<option value="${ws.workspaceName}">${ws.workspaceName}</option>`;
        });
    }

    if (taskAssignSelect) {
        taskAssignSelect.innerHTML = `<option value="" selected disabled>Select Workspace</option>`;
        if (workspaces.length === 0) {
            taskAssignSelect.innerHTML += `<option value="Default">Default Workspace</option>`;
        } else {
            workspaces.forEach(ws => {
                taskAssignSelect.innerHTML += `<option value="${ws.workspaceName}">${ws.workspaceName}</option>`;
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
        boardTitleElement.innerText = currentWorkspaceFilter === "all" ? "Global Task Board" : `${currentWorkspaceFilter} Board`;
    }

    const newUrl = currentWorkspaceFilter === "all" ? "tasks.html" : `tasks.html?workspace=${encodeURIComponent(currentWorkspaceFilter)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    renderTasks();
}

function saveTasks() {
    localStorage.setItem("smart_tasks", JSON.stringify(tasks));
}

// This function watches the web address hash fragment to figure out which window state should display.
// It automatically reads the URL path to open the creation popup, the editing popup, or close everything.
function handleRouting() {
    const hashPath = window.location.hash.replace("#", ""); 

    renderTasks();

    if (hashPath === '/tasks/create') {
        openTaskForm(null);
    } else if (hashPath.startsWith('/tasks/edit/')) {
        const idToEdit = parseInt(hashPath.split('/tasks/edit/')[1], 10);
        openTaskForm(idToEdit);
    } else {
        closeTaskFormModal();
    }
}

// This function shows a brief toast notification on successful creation of tasks as well as shows toast notification if there is something wrong.
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

// This function opens a task modal form, changes the form title, resets the form in the beginning.
function openTaskForm(id = null) {
    const modal = document.getElementById("task-modal");
    const form = document.getElementById("task-form");
    const title = document.getElementById("form-title");
    
    form.reset(); 
    modal.style.display = "flex";

    if (id) {
        title.innerText = "Edit Task Window";
        const targetTask = tasks.find(t => t.id === id);
        
        if (targetTask) {
            document.getElementById("task-id").value = targetTask.id;
            document.getElementById("task-name").value = targetTask.name;
            document.getElementById("task-desc").value = targetTask.description || "";
            document.getElementById("task-type").value = targetTask.type;
            document.getElementById("task-priority").value = targetTask.priority;
            document.getElementById("task-date").value = targetTask.date;

            const workspaceExists = workspaces.some(ws => ws.workspaceName === targetTask.workspace);
            document.getElementById("task-workspace-assign").value = workspaceExists ? targetTask.workspace : "Default";
        }
        else {
            window.location.hash = "/tasks";
        }
    } else {
        title.innerText = "Create New Task";
        document.getElementById("task-id").value = "";
        document.getElementById("task-workspace-assign").value = "";
    }
}

function closeTaskFormModal() {
    document.getElementById("task-modal").style.display = "none";
}

// This function handles form submission by getting all the values from the form and submitting it.
function handleFormSubmit(e) {
    e.preventDefault();

    const idValue = document.getElementById("task-id").value;
    const name = document.getElementById("task-name").value;
    const description = document.getElementById("task-desc").value;
    const type = document.getElementById("task-type").value;
    const priority = document.getElementById("task-priority").value;
    const date = document.getElementById("task-date").value;
    const workspace = document.getElementById("task-workspace-assign").value;

    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
        alert("Due date cannot be in the past! Please choose a valid target deadline.");
        document.getElementById("task-date").focus();
        return; 
    }

    if (idValue) {
        const taskId = parseInt(idValue, 10);
        tasks = tasks.map(task => task.id === taskId ? {
            ...task, name, description, type, priority, date, workspace
        } : task);
    } else {
        const newTask = {
            id: Date.now(),
            name: name,
            type: type,
            description: description,
            priority: priority,
            date: date,
            workspace: workspace
        };
        tasks.push(newTask);
    }
    showToast("Task created successfully!", "success");
    saveTasks();
    window.location.hash = "/tasks";
}

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
    const inprogressBanner = document.querySelector(".inprogress-card .task-banner");
    const completedBanner = document.querySelector(".completed-card .task-banner");
    const overdueBanner = document.querySelector(".overdue-card .task-banner");

    if (todoBanner) todoBanner.innerHTML = "";
    if (inprogressBanner) inprogressBanner.innerHTML = "";
    if (completedBanner) completedBanner.innerHTML = "";
    if (overdueBanner) overdueBanner.innerHTML = "";

    let counts = { todo: 0, inprogress: 0, completed: 0, overdue: 0 };
    const todayStr = new Date().toISOString().split('T')[0];

    let processedTasks = tasks.filter(task => {
        const matchesWorkspace = (currentWorkspaceFilter === "all" || task.workspace === currentWorkspaceFilter);
        const matchesSearch = task.name.toLowerCase().includes(currentSearchQuery) || 
                              (task.description && task.description.toLowerCase().includes(currentSearchQuery));
        return matchesWorkspace && matchesSearch;
    });

    if (sortByPriorityMode) {
        const priorityWeight = { "High": 3, "Medium": 2, "Low": 1 };
        processedTasks.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
    }

    processedTasks.forEach(task => {
        let targetType = task.type;
        if (task.type !== "completed" && task.date && task.date < todayStr) {
            targetType = "overdue";
        }

        if (counts.hasOwnProperty(targetType)) {
            counts[targetType]++;
        }

        const taskElement = document.createElement("a");
        taskElement.href = `#/tasks/edit/${task.id}`;
        taskElement.classList.add("task-item");
        taskElement.style.textDecoration = "none";

        let priorityClass = task.priority.toLowerCase();
        taskElement.innerHTML = `
            <div class="task-row-top">
                <h5 class="task-item-title">${task.name}</h5>
                <span class="priority-badge ${priorityClass}">${task.priority}</span>
            </div>
            <div class="task-row-bottom">
                <span class="task-date">📅 ${task.date}</span>
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

    if(document.querySelector(".todo-card .task-count")) document.querySelector(".todo-card .task-count").innerText = counts.todo;
    if(document.querySelector(".inprogress-card .task-count")) document.querySelector(".inprogress-card .task-count").innerText = counts.inprogress;
    if(document.querySelector(".completed-card .task-count")) document.querySelector(".completed-card .task-count").innerText = counts.completed;
    if(document.querySelector(".overdue-card .task-count")) document.querySelector(".overdue-card .task-count").innerText = counts.overdue;

    localStorage.setItem("smart_task_counts", JSON.stringify(counts));
}
