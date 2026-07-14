let tasks = JSON.parse(localStorage.getItem("smart_tasks")) || [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("task-form").addEventListener("submit", handleFormSubmit);

    window.addEventListener("hashchange", handleRouting);

    if (!window.location.hash || window.location.hash === "#") {
        window.location.hash = "/tasks";
    } else {
        handleRouting();
    }
});

function saveTasks() {
    localStorage.setItem("smart_tasks", JSON.stringify(tasks));
}

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
        } else {
            window.location.hash = "/tasks";
        }
    } else {
        title.innerText = "Create New Task";
        document.getElementById("task-id").value = "";
    }
}

function closeTaskFormModal() {
    document.getElementById("task-modal").style.display = "none";
}

function handleFormSubmit(e) {
    e.preventDefault();

    const idValue = document.getElementById("task-id").value;
    const name = document.getElementById("task-name").value;
    const description = document.getElementById("task-desc").value;
    const type = document.getElementById("task-type").value;
    const priority = document.getElementById("task-priority").value;
    const date = document.getElementById("task-date").value;

    if (idValue) {
        const taskId = parseInt(idValue, 10);
        tasks = tasks.map(task => task.id === taskId ? {
            ...task, name, description, type, priority, date
        } : task);
    } else {
        const newTask = {
            id: Date.now(),
            name: name,
            type: type,
            description: description,
            priority: priority,
            date: date
        };
        tasks.push(newTask);
    }

    saveTasks();
    window.location.hash = "/tasks";
}

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

    tasks.forEach(task => {
        if (counts.hasOwnProperty(task.type)) {
            counts[task.type]++;
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

        if (task.type === "todo" && todoBanner) {
            todoBanner.appendChild(taskElement);
        } else if (task.type === "inprogress" && inprogressBanner) {
            inprogressBanner.appendChild(taskElement);
        } else if (task.type === "completed" && completedBanner) {
            completedBanner.appendChild(taskElement);
        } else if (task.type === "overdue" && overdueBanner) {
            overdueBanner.appendChild(taskElement);
        }
    });

    if(document.querySelector(".todo-card .task-count")) document.querySelector(".todo-card .task-count").innerText = counts.todo;
    if(document.querySelector(".inprogress-card .task-count")) document.querySelector(".inprogress-card .task-count").innerText = counts.inprogress;
    if(document.querySelector(".completed-card .task-count")) document.querySelector(".completed-card .task-count").innerText = counts.completed;
    if(document.querySelector(".overdue-card .task-count")) document.querySelector(".overdue-card .task-count").innerText = counts.overdue;

    localStorage.setItem("smart_task_counts", JSON.stringify(counts));
}
