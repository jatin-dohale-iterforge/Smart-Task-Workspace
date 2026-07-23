  const token = localStorage.getItem("token");

async function loadDashboardData() {
    try {
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const [tasksRes, workspacesRes] = await Promise.all([
            fetch(`${API_URL}/task`, { headers: { token } }),
            fetch(`${API_URL}/workspace`, { headers: { token } })
        ]);

        if (!tasksRes.ok || !workspacesRes.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const tasks = await tasksRes.json();
        const workspaces = await workspacesRes.json();

        let counts = { todo: 0, inprogress: 0, completed: 0, overdue: 0 };
        let priorities = { High: 0, Medium: 0, Low: 0 };

        const todayStr = new Date().toISOString().split('T')[0];

        tasks.forEach(task => {
            let targetType = task.taskType || "todo";
            if (targetType !== "completed" && task.duedate && task.duedate < todayStr) {
                targetType = "overdue";
            }

            if (counts.hasOwnProperty(targetType)) {
                counts[targetType]++;
            }

            if (priorities.hasOwnProperty(task.taskPriority)) {
                priorities[task.taskPriority]++;
            }
        });

        const totalTasks = tasks.length;
        const totalWorkspace = workspaces.length;

        document.getElementById("count-total").innerText = totalTasks;
        document.getElementById("count-todo").innerText = counts.todo;
        document.getElementById("count-inprogress").innerText = counts.inprogress;
        document.getElementById("count-completed").innerText = counts.completed;
        document.getElementById("count-overdue").innerText = counts.overdue;
        document.getElementById("count-workspace").innerText = totalWorkspace;

        const ctx = document.getElementById('progressChart');
        const ctx2 = document.getElementById('priorityChart');

        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress', 'To do', 'Overdue'],
                    datasets: [{
                        label: 'Task Status',
                        data: [counts.completed, counts.inprogress, counts.todo, counts.overdue],
                        backgroundColor: ['#22c55e', '#f97316', '#2563eb', '#ef4444'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        if (ctx2) {
            new Chart(ctx2, {
                type: 'pie',
                data: {
                    labels: ['High', 'Medium', 'Low'],
                    datasets: [{
                        label: 'Tasks Priority',
                        data: [priorities.High, priorities.Medium, priorities.Low],
                        backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        const activityBox = document.getElementById("activity-box");
        if (activityBox) {
            activityBox.innerHTML = "";
            if (tasks.length === 0) {
                activityBox.innerHTML = `<p style="color: #64748b; font-size: 14px;">No recent tasks added yet.</p>`;
            } else {
                const recentTasks = [...tasks].reverse().slice(0, 5);
                recentTasks.forEach(task => {
                    const item = document.createElement("div");
                    item.classList.add("activity-item");
                    item.style.marginBottom = "10px";
                    let statusLabel = (task.taskType || "todo").toUpperCase();
                    if (task.taskType !== "completed" && task.duedate && task.duedate < todayStr) {
                        statusLabel = "OVERDUE";
                    }
                    item.innerHTML = `
                        <div class="activity-left">
                            <span class="activity-badge-icon" style="margin-right: 8px;">📌</span>
                            <div class="activity-info">
                                <h5 style="margin: 0; font-size: 14px; font-weight: 600;">${task.taskName}</h5>
                                <small style="color: #64748b;">Status: ${statusLabel}</small>
                            </div>
                        </div>
                    `;
                    activityBox.appendChild(item);
                });
            }
        }
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
}); 	