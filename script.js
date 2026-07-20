// Json Data of all pages 
const pageData = [
  {
    name: "DashBoard",
    route: "/dashboard",
    select: false,
    search: true,
    filter: false,
    addButton: false,
    rootPath: "dashboard.html",
    child: "",
  },
  {
    name: "Workspace",
    route: "/workspace",
    select: false,
    search: true,
    filter: false,
    addButton: true,
    rootPath: "create-workspace.html",
    child: "Workspace",
  },
  {
    name: "TaskBoard",
    route: "/tasks",
    select: true,
    search: false,
    filter: true,
    addButton: true,
    rootPath: "#/tasks/create",
    child: "Task",
  },
  {
    name: "Notes",
    select: false,
    search: true,
    filter: false,
    addButton: true,
    rootPath: "notes.html",
    child: "Note",
  },
  {
    name: "Setting",
    select: false,
    search: false,
    filter: false,
    addButton: false,
    rootPath: "/",
    child: "",
  },
  {
    name: "About",
    select: false,
    search: false,
    filter: false,
    addButton: false,
    rootPath: "/",
    child: "",
  },
    {
    name: "Users",
    select: false,
    search: true,
    filter: false,
    addButton: true,
    rootPath: "users.html",
    child: "User",
  },
];

// Showing SideBar in all pages using js innerHtml 
const showSideBar = () => {
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
        <a href="users.html">
          <li><i class="fa fa-users"></i><span>Users</span></li>
        </a>
        <a href="setting.html">
          <li><i class="fa fa-cog"></i><span>Settings</span></li>
        </a>
        <a href="about.html">
          <li><i class="fa fa-info-circle"></i><span>About</span></li>
        </a>
        <a onclick="logout()">
          <li><i class="fa fa-sign-out"></i><span>Logout</span></li>
        </a>
      </ul>`;

    const check = window.location.pathname.split("/")[2];
    const anchorBox = document.querySelectorAll(".sidebar-menu a");

    anchorBox.forEach((anchor) => {
      anchor.children[0].classList.remove("active");
    });
    anchorBox.forEach((anchor) => {
      if (anchor.getAttribute("href") === check) {
        anchor.children[0].classList.add("active");
      }
    });
  } catch (error) {
    console.log("error", error.message);
  }
};

// Showing Navbar in all pages using js innerHtml and based on pageData add elements
const showNavbar = () => {
  try {
    const header = document.querySelector(".header");
    const path = window.location.pathname.split("/")[2];
    const page = pageData.find(
      (item) => item.name.toLowerCase() == path.split(".")[0],
    );
    header.innerHTML = `
    <h2 class="board-heading">${page.name}</h2>
                <div class="header-box">
                </div>
  `;
   const headerBox = document.querySelector(".header-box");
    if (page.select) {
      headerBox.innerHTML += `
      <div class="header-select">
      <select class="workspace-select"  id="board-workspace-filter">
      <option value="all">All Workspaces</option>
      <option value="personal">Personal</option>
      <option value="work">Work</option>
      </select>
      </div>
      `;
    }

    if (page.search) {
      headerBox.innerHTML += `
      <div class="header-search">
      <span id="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
      class="bi bi-search" viewBox="0 0 16 16">
      <path
      d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
      </svg>
                        </span>
                        <input type="text" id="search-board" placeholder="Search ${page.name == "DashBoard" ? "" : page.child + "s..."}" oninput="renderItem(this.value)">
                    </div>
    `;
    }

    if (page.filter) {
      headerBox.innerHTML += `
      <button class="header-filter" id="sort-priority-btn">
      <span class="filter-icon">
                    <img src="../assets/icons/filter-icon.svg" alt="filter icon"/>
                        </span> Filters
    </button>
    `;
    }

    if (page.addButton) {
      if (page.name == "Notes") {
        headerBox.innerHTML += `
         <a onclick="toggleCreateWindow()" class="header-button">+ <span class="header-button-span">Add ${page.child}</span></a>
      `;
      } else {
        headerBox.innerHTML += `
         <a href=${page.rootPath} class="header-button">+ <span class="header-button-span">Add ${page.child}</a>
      `;
      }
    }
  } catch (error) {
    console.log("error :", error.message);
  }
};

// Showing Bottom bar in Mobile version in all pages using js innerHtml 
const showBottomBar = () => {
  try {
    const navBox = document.querySelector(".mobile-nav");
    navBox.innerHTML = `
    <a href="dashboard.html">
            <i class="fa fa-home"></i>
            <span>DashBoard</span>
        </a>
        <a href="workspace.html">
            <i class="fa fa-folder"></i>
            <span>Workspace</span>
        </a>
        <a href="taskboard.html">
            <i class="fa fa-tasks"></i>
            <span>Tasks</span>
        </a>
        <a href="notes.html">
            <i class="fa fa-pencil-square-o"></i>
            <span>Notes</span>
        </a>
        <a href="setting.html">
            <i class="fa fa-cog"></i>
            <span>Setting</span>
        </a>

  `;
    const check = window.location.pathname.split("/")[2];
    const anchorBox = document.querySelectorAll(".mobile-nav > a");

    anchorBox.forEach((anchor) => {
      anchor.classList.remove("active");
    });
    anchorBox.forEach((anchor) => {
      if (anchor.getAttribute("href") === check) {
        anchor.classList.add("active");
      }
    });
  } catch (error) {
    console.log("error : ", error);
  }
};


// main function
const main = () => {
  showSideBar();
  showNavbar();
  showBottomBar();
};
main();

