document.addEventListener("DOMContentLoaded", () => {
    const tasks = JSON.parse(localStorage.getItem('smart_tasks')) || [];

    let counts = { todo: 0, inprogress: 0, completed: 0, overdue: 0 };
    let priorities = { High: 0, Medium: 0, Low: 0 };

    tasks.forEach(task => {
        if (counts.hasOwnProperty(task.type)) counts[task.type]++;

        if (priorities.hasOwnProperty(task.priority)) priorities[task.priority]++;
    });

    const totalTasks = tasks.length;

    document.getElementById("count-total").innerText = totalTasks;
    document.getElementById("count-todo").innerText = counts.todo;
    document.getElementById("count-inprogress").innerText = counts.inprogress;
    document.getElementById("count-completed").innerText = counts.completed;
    document.getElementById("count-overdue").innerText = counts.overdue;

const ctx = document.getElementById('progressChart');
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
})