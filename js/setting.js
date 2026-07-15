document.addEventListener("DOMContentLoaded", () => {
    lastVisit();
    renderSessionData();
});

function lastVisit() {

    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';


    const formattedDateTimeStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${hours}:${minutes} ${ampm}`;

    localStorage.setItem("smart_last_visit_time", formattedDateTimeStr);
}

function renderSessionData() {
    const timeDisplay = document.getElementById("session-last-time");
    const fallbackTime = localStorage.getItem("smart_last_visit_time") || "Just Now";
    if (timeDisplay) timeDisplay.innerText = fallbackTime;
}

function clearSessionStorage() {
    if (confirm("Are you sure you want to clear your logs?")) {

        localStorage.removeItem("smart_last_visit_time");

        localStorage.removeItem("smart_tasks");
        localStorage.removeItem("workspaces");
        alert("Session parameters cleaned successfully!");
        window.location.reload();
    }
}
