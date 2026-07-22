const API_URL='http://localhost:3000/employees';

const token=localStorage.getItem('token');
const loggedInUser=JSON.parse(localStorage.getItem('user')||'{}');

const userTableBody=document.querySelector('.user-table tbody');
const deleteModal=document.getElementById('deleteModal');
const userModal=document.getElementById('userModal');
const userForm=document.getElementById('userForm');
const modalTitle=document.getElementById('modalTitle');
const toast=document.getElementById('toast');

const userNameInput=document.getElementById('userName');
const userEmailInput=document.getElementById('userEmail');
const userRoleInput=document.getElementById('userRole');

let isEditing=false;
let currentEditId=null;
let idToDelete=null;

// Checks if the logged-in user has admin access to view the Users page
function checkAccessHierarchy(){
    const usersSidebarTab=document.getElementById('usersSidebarTab');
    const role=(loggedInUser.role||"").toLowerCase();

    if(token&&role==="admin"){
        if(usersSidebarTab){
            usersSidebarTab.style.display="block";
        }
    }else{
        if(usersSidebarTab){
            usersSidebarTab.style.display="none";
        }
        alert("Unauthorized entry attempted. Administrative access clearance required.");
        window.location.href="dashboard.html";
    }
}

// Fetches all users from the server API
async function fetchUsers(){
    try{
        const response=await fetch(API_URL,{
            method:"GET",
            headers:{
                "Content-Type":"application/json",
                "token":token
            }
        });

        if(response.status===401||response.status===403){
            throw new Error("Access denied.");
        }

        const users=await response.json();
        renderUsers(users);
    }catch(error){
        showToast(error.message,"error");
    }
}

// Displays users data inside the users table
function renderUsers(users){
    userTableBody.innerHTML="";

    users.forEach(user=>{
        const tr=document.createElement("tr");

        tr.innerHTML=`
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role||"Employee"}</td>
        <td>
            <div class="action-btns">
                <button class="btn-action btn-edit" onclick="editUser('${user.id}','${user.name}','${user.email}','${user.role}')">
                    <i class="fa fa-pencil"></i> Edit
                </button>

                <button class="btn-action btn-delete" onclick="openDeleteModal('${user.id}')">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </div>
        </td>`;
        userTableBody.appendChild(tr);
    });
}

// Opens the modal for creating a new user
function openAddUserModal(){
    isEditing=false;
    currentEditId=null;
    modalTitle.textContent="Add New User";
    userForm.reset();
    userModal.style.display="flex";
}
window.openAddUserModal=openAddUserModal;

function editUser(id,name,email,role){
    isEditing=true;
    currentEditId=id;
    modalTitle.textContent="Edit User";
    userNameInput.value=name;
    userEmailInput.value=email;
    userRoleInput.value=role;
    userModal.style.display="flex";
}
window.editUser=editUser;

// Opens the delete confirmation modal for selected user
function openDeleteModal(id){
    idToDelete=id;
    deleteModal.style.display="flex";
}
window.openDeleteModal=openDeleteModal;

// Saves a new user or updates an existing user
async function saveUser(e){
    e.preventDefault();

    const userData={
        name:userNameInput.value.trim(),
        email:userEmailInput.value.trim(),
        role:userRoleInput.value
    };

    try{
        let response;

        if(isEditing){
            response=await fetch(`${API_URL}/${currentEditId}`,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    "token":token
                },
                body:JSON.stringify(userData)
            });
        }else{
            response=await fetch(API_URL,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "token":token
                },
                body:JSON.stringify(userData)
            });
        }

        if(!response.ok){
            throw new Error("Unable to save user.");
        }

        showToast(isEditing?"User updated successfully":"User added successfully","success");

        closeFormModal();
        fetchUsers();
    }catch(error){
        showToast(error.message,"error");
    }
}
window.saveUser=saveUser;

async function confirmDelete(){
    if(!idToDelete)return;

    try{
        const response=await fetch(`${API_URL}/${idToDelete}`,{
            method:"DELETE",
            headers:{
                "token":token
            }
        });

        if(!response.ok){
            throw new Error("Delete failed.");
        }

        showToast("User deleted successfully","success");

        closeDeleteModal();
        fetchUsers();
    }catch(error){
        showToast(error.message,"error");
    }
}
window.confirmDelete=confirmDelete;

function closeFormModal(){
    userModal.style.display="none";
    userForm.reset();
    isEditing=false;
    currentEditId=null;
}
window.closeFormModal=closeFormModal;

// Closes the delete confirmation modal and clears selected user ID
function closeDeleteModal(){
    deleteModal.style.display="none";
    idToDelete=null;
}
window.closeDeleteModal=closeDeleteModal;

// Displays success or error notification messages
function showToast(message,type){
    if(!toast)return;

    toast.textContent=message;
    toast.className=`toast show ${type}`;

    setTimeout(()=>{
        toast.className=`toast ${type}`;
    },3000);
}

document.addEventListener("DOMContentLoaded",()=>{
    checkAccessHierarchy();

    if(token&&(loggedInUser.role||"").toLowerCase()==="admin"){
        fetchUsers();
    }
});