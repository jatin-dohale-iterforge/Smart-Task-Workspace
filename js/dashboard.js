document.addEventListener("DOMContentLoaded", () => {

    const tasks = JSON.parse(localStorage.getItem('smart_tasks')) || [];
    const workspaces = JSON.parse(localStorage.getItem('workspaces')) || []; 


    let counts = { todo: 0, inprogress: 0, completed: 0, overdue: 0 };
    let priorities = { High: 0, Medium: 0, Low: 0 };

    tasks.forEach(task => {
        if (counts.hasOwnProperty(task.type)) counts[task.type]++;

        if (priorities.hasOwnProperty(task.priority)) priorities[task.priority]++;
    });

    const totalTasks = tasks;

    document.getElementById("count-workspace").innerText = workspaces.length;
    document.getElementById("count-total").innerText = totalTasks;
    document.getElementById("count-todo").innerText = counts.todo;
    document.getElementById("count-inprogress").innerText = counts.inprogress;
    document.getElementById("count-completed").innerText = counts.completed;
    document.getElementById("count-overdue").innerText = counts.overdue;

const ctx = document.getElementById('priorityChart');
const ctx2 = document.getElementById('priorityChart');

  new Chart(ctx, {
      type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'To do', 'Overdue'],
      datasets: [{
        label: 'Task Status',
        data: [counts.completed, counts.inprogress, counts.todo, counts.overdue],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });


  new Chart(ctx2, {
    type: 'pie',
    data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
        label: 'Tasks Priority',
        data: [priorities.High, priorities.Medium, priorities.Low],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
  
  const activityBox = document.getElementById("activityBox");
  activityBox.innerHTML = "";
  
  if(tasks.lenghth === 0) {
    activityBox.innerHTML = `<p style="color: #64748b; font-size: 14px;">No recent tasks added yet.</p>`;
  } else {
    const recentTasks = [..tasks].reverse().slice(0, 5);
    
    recentTasks.forEach(task => {
      const item = document.createElement("div");
      item.classList.add("activity-item");
      item.innerHTML = `
      <div class="activity-left">
        <span class="activity-badge-icon">📌</span>
        <div class="activity-info">
        <h5>${task.name}</h5>
        <small>Moved to ${task.type.toUpperCase()}</small>
        </div>
      </div>
      `;
      activityBox.appendChild(item);
    });
      }
  })
