const workspaceName = document.querySelector('.workspace-name-input');
const workspaceDesc = document.querySelector('#workspace-desc-input');
const workspaceIcon = document.querySelector('#workspace-icon-options');
const workspaceColor = document.querySelector('#color');
const error = document.querySelectorAll('.error')
const workspaceCard = document.querySelector('.workspace-lists')
let editIndex = -1
const createWorkspaceBtn = document.querySelector('.create-btn')

const workspaces = JSON.parse(localStorage.getItem("workspaces")) || [];
let workspace = {
    workspaceName: "",
    workspaceDescription: "",
    workspaceIcon: "",
    workspaceColor: ""
}

function validate(inputTag, errorMsg) {
    let value = inputTag.value;
    let error = inputTag.parentElement.querySelector(".error");
    if (!value) {
        error.innerHTML = errorMsg;
        return false;
    }
    error.innerHTML = ""
    return true;

}

function resetWorkspaceForm() {
    try {
        workspaceName.value = "";
        workspaceDesc.value = "";
        workspaceIcon.value = "";
        workspaceColor.value = "";
        error.forEach((errorElem) => {
            errorElem.innerHTML = ""
        })
    }
    catch (e) {
        console.log(e)
    }

}

function submitWorkspace(e) {
    e.preventDefault()
    try {
        let name = validate(workspaceName, "Workspace name is required");
        let icon = validate(workspaceIcon, "Icon is required")
        let color = validate(workspaceColor, "Color is required")

        if (name && icon && color) {
            workspace = {
                workspaceName: workspaceName.value,
                workspaceDescription: workspaceDesc.value || "",
                workspaceIcon: workspaceIcon.value,
                workspaceColor: workspaceColor.value
            }
        }

        if (editIndex === -1) {
            workspaces.push(workspace)

        }
        else {
            workspaces[editIndex] = workspace;
            editIndex = -1;
            createWorkspaceBtn.textContent = "Create Workspace"

        }
        localStorage.setItem("workspaces", JSON.stringify(workspaces))
        resetWorkspaceForm()
        datashow()
    }
    catch (e) {
        console.log(e)
    }
}

function datashow() {
    if (workspaces.length > 0) {
        workspaces.forEach((elem, index) =>
            workspaceCard.innerHTML += `
       <div class="workspace-card">
        <div class="main-workspace-info">
            <i class="${elem.workspaceIcon}" style="background-color:${elem.workspaceColor}"></i>
            <h3 class="workspace-title">${elem.workspaceName}</h3>
            <h4 class="workspace-task-count">task count : 0</h4>
            <p class="workspace-update-time">updated: 2 hours ago</p>
            </div>
            <div class="workspace-action-btn">
                        <button><i class="fa fa-ellipsis-v"></i></button>
                        <div class="action-btns">
                           <button class="edit-icon" onclick="editWorkspace(${index})" ><a href="../pages/create-workspace.html"><i class="fa fa-edit"></i></a></button>
                           <button class="delete-icon" onclick="deleteWorkspace(${index})"><i class="fa fa-trash"></i></button>
                        </div>
            </div>
        </div>
        `
        )


    }


}

function editWorkspace(index) {
    try {
        editIndex = index;
        createWorkspaceBtn.textContent = "Update Student";
        const workspace = workspaces[index];
        console.log("edit workspace",workspace)
        workspaceName.value = workspace.workspaceName
        workspaceDesc.value = workspace.workspaceDescription
        workspaceIcon.value = workspace.workspaceIcon
        workspaceColor.value = workspace.workspaceColor
    }
    catch (e) {
        console.log(e)
    }
}

function deleteWorkspace(index) {

}

datashow()