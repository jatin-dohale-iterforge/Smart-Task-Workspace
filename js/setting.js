document.addEventListener("DOMContentLoaded", () => {
    lastVisit();
    renderSessionData();
});

// This function calculates the current date and time and formats it into text string.
// It then saves this timestamp into the browser's local storage so we can remember when the user last visited.
function lastVisit() {

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';


    const formattedDateTimeStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${hours}:${minutes} ${ampm}`;

    localStorage.setItem("smart_last_visit_time", formattedDateTimeStr);
}

// This function looks for a specific element on the page and displays the saved last visit time inside it.
// If no previous visit time is found in the browser's memory, it safely defaults to showing "Just Now".
function renderSessionData() {
    const timeDisplay = document.getElementById("session-last-time");
    const fallbackTime = localStorage.getItem("smart_last_visit_time") || "Just Now";
    if (timeDisplay) timeDisplay.innerText = fallbackTime;
}

// This function asks the user for permission before completely wiping out all saved tasks, workspaces, and visit times.
// Once everything is deleted from the browser's memory, it alerts the user and refreshes the page to show a clean slate.
function clearSessionStorage() {
    if (confirm("Are you sure you want to clear your logs?")) {

        localStorage.removeItem("smart_last_visit_time");

        localStorage.removeItem("smart_tasks");
        localStorage.removeItem("workspaces");
        alert("Session parameters cleaned successfully!");
        window.location.reload();
    }
}
