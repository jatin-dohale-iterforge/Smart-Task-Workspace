
// function for showing Side bar
showSideBar = () => {
  try {
    const sideBar = document.querySelector(".app-sidebar");
    sideBar.innerHTML = `  <h2>Smart Task</h2>

      <ul class="sidebar-menu">
        <a href="dashboard.html">
          <li><i class="fa fa-home"></i><span>Dashboard</span></li>
        </a>
        <a href="workspace.html">
          <li class="active">
            <i class="fa fa-folder"></i><span>Workspace</span>
          </li>
        </a>
        <a href="taskboard.html">
          <li><i class="fa fa-tasks"></i><span>Tasks</span></li>
        </a>
        <a href="notes.html">
          <li><i class="fa fa-pencil-square-o"></i><span>Notes</span></li>
        </a>
        <a href="setting.html">
          <li><i class="fa fa-cog"></i><span>Settings</span></li>
        </a>
        <a href="about.html">
          <li><i class="fa fa-info-circle"></i><span>About</span></li>
        </a>
      </ul>

      <a href="login.html" class="logout-btn">
        <i class="fa fa-sign-out"></i>
        <span>Logout</span>
      </a>`;

    const check = window.location.pathname.split("/")[2];
    const anchorBox = document.querySelectorAll(".sidebar-menu a");

    anchorBox.forEach((anchor) => {
     anchor.children[0].classList.remove("active")
    });
    anchorBox.forEach((anchor) => {
      if (anchor.getAttribute("href") === check) {
        anchor.children[0].classList.add("active");
      }
    });

  } catch (error) {
    console.log("error", error.message)
  }
}



// main function 
const main = () => {
  showSideBar();
}
main()

console.log("run")