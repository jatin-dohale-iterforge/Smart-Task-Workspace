// Import Required Packages
import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

import dotenv from "dotenv";

dotenv.config();

const app = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const SECRET_KEY = process.env.SECRET_KEY || "fallback_secret_key";
const expiresIn = "24h";

// This function create token using jwt module using secret key and expireIn 
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// this function used to verify token using jwt
function verifyToken(req, res, next) {
  const token = req.headers.token;//get token from request header

  // if token not present in request
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided." });
  }

  // if token is present in request
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Access denied: Invalid token." });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: Insufficient permissions"
      });
    }

    next();
  };
}

app.use(bodyParser.json());// Parse body data of request using body-parser module
app.use(middlewares);

// ==========================================
// Role Route Guard Middleware
// ==========================================
function requireAdmin(req, res, next) {

  const role = (req.user?.role || "").toLowerCase();

  if (role !== "admin") {
    return res.status(403).json({
      message: "Only administrators can access this resource."
    });
  }

  next();
}


//===========================
// Authentication endpoints
//===========================

// login endpoint take req.body[email,password]
app.post("/login", async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ "message": "Email and password is required to login!" });
  }
  const user = router.db.get("employees").find({ email }).value();
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }


  const token = createToken({ id: user.id, email: user.email, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json({ token, user: userWithoutPassword });
});


// registration endpoint take req.body[name,email,password]
app.post("/register", async (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password || 123;
  const name = req.body.name?.trim();
  const role = req.body.role || "employee";

  if (!email || !password || !name) {
    return res.status(400).json({ "message": "Email, name and password is required to register!" });
  }

  const existingUser = router.db.get("employees").find({ email }).value();

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const employees = router.db.get("employees").value();
  const nextId =
    employees.length > 0
      ? Math.max(...employees.map(employee => employee.id)) + 1
      : 1;

  const newUser = {
    id: nextId,
    name,
    email,
    password: hashedPassword,
    role
  };

  router.db.get("employees").push(newUser).write();

  const token = createToken({
    id: newUser.id,
    email: newUser.email,
    role: newUser.role
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    token,
    user: userWithoutPassword
  });
});

//workspace create endpoint
// only admins are allowed to create workspaces
// required headers:
// token: JWT token
// request body:
// {
//   workspaceName:"Personal",
//   workspaceDesc:"Description of personal workspace",
//   workspaceColor:"blue",
//   workspaceIcon:"folder",
//   managerId:1,
//   employeeIds:[3,4]
// }
app.post("/workspace", verifyToken, authorizeRoles("admin"), (req, res) => {
  const { workspaceName, workspaceDesc, workspaceColor, workspaceIcon, managerId, employeeIds } = req.body;

  if (!workspaceName || !workspaceColor || !workspaceIcon) {
    return res.status(400).json({
      message: "Workspace name, color and icon are required"
    });
  }
  const workspaces = router.db.get("workspaces").value();
  const nextId =
    workspaces.length > 0
      ? Math.max(...workspaces.map(w => w.id)) + 1
      : 1;

  const now = new Date().toISOString();

  const workspace = {
    id: nextId,
    workspaceName,
    workspaceDesc,
    workspaceColor,
    workspaceIcon,
    // manager responsible for this workspace
    managerId: managerId || null,
    // employees assigned to this workspace
    employeeIds: employeeIds || [],
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now
  };

  router.db.get("workspaces").push(workspace).write();
  res.status(201).json(workspace);
});


// get all workspace data endpoint
// any authenticated user can view workspaces

app.get("/workspace", verifyToken, (req, res) => {
  const role=req.user.role;
  const workspaces = router.db
    .get("workspaces")
    .value();

  // Admin can see every workspace
  if (role === "admin") {
    return res.status(200).json(workspaces);
  }

  // Manager can see only assigned workspaces
  if (role === "Manager") {
    const managerWorkspaces = workspaces.filter(
      workspace => workspace.managerId === req.user.id
    );

    return res.status(200).json(managerWorkspaces);
  }

  if (role === "employee") {

    const employeeWorkspaces = workspaces.filter(
      workspace =>
        workspace.employeeIds &&
        workspace.employeeIds.includes(req.user.id)
    );
    return res.status(200).json(employeeWorkspaces);
  }
  return res.status(403).json({
    message:"Access denied"
  });

});

//edit workspace using id 
//permissions:
//admin can edit any workspace
//manager can edit only assigned workspace
//user cannot edit

app.put("/workspace/:id", verifyToken, authorizeRoles("admin", "Manager"), (req, res) => {
  const id = Number(req.params.id);
  const { workspaceName, workspaceDesc, workspaceColor, workspaceIcon } = req.body;
  const workspace = router.db.get("workspaces").find({ id }).value();
  if (!workspace) {
    return res.status(404).json({
      message: "Workspace not found",
    });
  }
  //manager can edit only assigned workspace
  if (req.user.role === "Manager" && workspace.managerId !== req.user.id) {
    return res.status(403).json({ message: "You can edit only your assigned workspace" });
  }

  router.db.get("workspaces").find({ id }).assign({
    workspaceName: workspaceName !== undefined ? workspaceName : workspace.workspaceName,
    workspaceDesc: workspaceDesc !== undefined ? workspaceDesc : workspace.workspaceDesc,
    workspaceColor: workspaceColor !== undefined ? workspaceColor : workspace.workspaceColor,
    workspaceIcon: workspaceIcon !== undefined ? workspaceIcon : workspace.workspaceIcon,
    updatedAt: new Date().toISOString()
  }).write();

  const updatedWorkspace = router.db.get("workspaces").find({ id }).value();
  res.status(200).json(updatedWorkspace);
});

//delete workspace using id if available
//only admin can delete workspace

app.delete("/workspace/:id", verifyToken, authorizeRoles("admin"), (req, res) => {
  const id = Number(req.params.id);
  const workspace = router.db.get("workspaces").find({ id }).value();
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }
   //permanently remove workspace
  router.db.get("workspaces").remove({ id }).write();
  res.status(200).json({ message: "Workspace deleted successfully" });
});


//task create endpoint
//permissions:
//admin can create task anywhere
//manager can create task only inside assigned workspace
//user cannot create task

// ==========================================
// Create Task
// ==========================================

app.post("/task", verifyToken, authorizeRoles("admin", "Manager"), (req, res) => {
    const {
      taskName,
      taskDesc,
      taskType,
      taskPriority,
      duedate,
      workspaceId,
      assignedTo
    } = req.body;

    if (
      !taskName ||
      !taskType ||
      !taskPriority ||
      !duedate ||
      !workspaceId
    ) {
      return res.status(400).json({
        message:
          "taskName, type, priority, workspaceId and duedate are required"
      });
    }

    const workspace = router.db
      .get("workspaces")
      .find({ id: Number(workspaceId) })
      .value();

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found"
      });
    }

    // Manager can create task only in assigned workspace
    if (
      req.user.role === "Manager" &&
      workspace.managerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "You cannot create task in this workspace"
      });
    }

    // Validate assigned employee
    if (assignedTo) {
      const employee = router.db
        .get("employees")
        .find({ id: Number(assignedTo) })
        .value();

      if (!employee || employee.role !== "employee") {
        return res.status(400).json({
          message: "Please select a valid employee"
        });
      }

      // Automatically add employee to workspace
      if (!workspace.employeeIds.includes(Number(assignedTo))) {
        router.db
          .get("workspaces")
          .find({ id: workspace.id })
          .assign({
            employeeIds: [
              ...workspace.employeeIds,
              Number(assignedTo)
            ],
            updatedAt: new Date().toISOString()
          })
          .write();
      }
    }

    const tasks = router.db.get("tasks").value();

    const nextId =
      tasks.length > 0
        ? Math.max(...tasks.map(task => task.id)) + 1
        : 1;

    const now = new Date().toISOString();

    const task = {
      id: nextId,
      taskName,
      taskDesc,
      taskType,
      taskPriority,
      duedate,
      workspaceId: Number(workspaceId),
      assignedTo: assignedTo ? Number(assignedTo) : null,
      assignedBy: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    router.db.get("tasks").push(task).write();

    res.status(201).json(task);
  }
);



// ==========================================
// Get Tasks
// ==========================================

app.get("/task", verifyToken, (req, res) => {

  const tasks = router.db.get("tasks").value();
  const workspaces = router.db.get("workspaces").value();

  // Admin -> all tasks
  if (req.user.role === "admin") {
    return res.status(200).json(tasks);
  }

  // Manager -> only tasks of managed workspaces
  if (req.user.role === "Manager") {

    const workspaceIds = workspaces
      .filter(ws => ws.managerId === req.user.id)
      .map(ws => ws.id);

    const managerTasks = tasks.filter(task =>
      workspaceIds.includes(task.workspaceId)
    );

    return res.status(200).json(managerTasks);
  }

  // Employee -> tasks of workspaces employee belongs to and assigned to employee

  const workspaceIds = workspaces
    .filter(ws => ws.employeeIds.includes(req.user.id))
    .map(ws => ws.id);

  const employeeTasks = tasks.filter(task =>
    workspaceIds.includes(task.workspaceId) && task.assignedTo === req.user.id
  );

  res.status(200).json(employeeTasks);

});



// ==========================================
// Update Task
// ==========================================

app.put("/task/:id", verifyToken, authorizeRoles("admin", "Manager", "employee"), (req, res) => {
    const id = Number(req.params.id);
    const { taskName, taskDesc, taskType, taskPriority, duedate, workspaceId, assignedTo } = req.body;
    const task = router.db.get("tasks").find({ id }).value();

    if (!task) {
      return res.status(404).json({message: "Task not found"});
    }

    // Employee can edit only assigned task
    if (req.user.role === "employee" && task.assignedTo !== req.user.id) {
      return res.status(403).json({
        message: "You can edit only assigned tasks"
      });
    }

    // Manager can edit only tasks of own workspace
    if (req.user.role === "Manager") {

      const workspace = router.db
        .get("workspaces")
        .find({ id: task.workspaceId })
        .value();

      if (workspace.managerId !== req.user.id) {
        return res.status(403).json({
          message: "You can edit only tasks of your workspace"
        });
      }
    }

    // Employee
    if (req.user.role === "employee") {

      router.db
        .get("tasks")
        .find({ id })
        .assign({
          taskName: taskName ?? task.taskName,
          taskDesc: taskDesc ?? task.taskDesc,
          taskType: taskType ?? task.taskType,
          updatedAt: new Date().toISOString(),
          taskPriority: taskPriority ?? task.taskPriority

        })
        .write();

    }

    // Admin / Manager

    else {

      // If task is assigned to a new employee
      if (assignedTo) {

        const workspace = router.db
          .get("workspaces")
          .find({
            id: Number(workspaceId ?? task.workspaceId)
          })
          .value();

        if (!workspace.employeeIds.includes(Number(assignedTo))) {

          router.db
            .get("workspaces")
            .find({ id: workspace.id })
            .assign({
              employeeIds: [
                ...workspace.employeeIds,
                Number(assignedTo)
              ],
              updatedAt: new Date().toISOString()
            })
            .write();
        }

      }

      router.db
        .get("tasks")
        .find({ id })
        .assign({

          taskName: taskName ?? task.taskName,
          taskDesc: taskDesc ?? task.taskDesc,
          taskType: taskType ?? task.taskType,
          taskPriority: taskPriority ?? task.taskPriority,
          duedate: duedate ?? task.duedate,
          workspaceId: workspaceId ?? task.workspaceId,
          assignedTo: assignedTo ?? task.assignedTo,
          updatedAt: new Date().toISOString()

        })
        .write();

    }

    const updatedTask = router.db
      .get("tasks")
      .find({ id })
      .value();

    res.status(200).json(updatedTask);

  }
);

app.post("/employees", verifyToken, requireAdmin, async(req,res)=>{
    const {name,email,role,password} = req.body;
    if(!name || !email){
        return res.status(400).json({
            message:"Name and email are required"
        });
    }
    const existingUser = router.db
        .get("employees")
        .find({email})
        .value();
    if(existingUser){
        return res.status(400).json({
            message:"Email already exists"
        });
    }

    const employees = router.db
        .get("employees")
        .value();

    const nextId =
        employees.length > 0
        ? Math.max(...employees.map(e=>e.id))+1
        : 1;

    const hashedPassword = await bcrypt.hash(
        password || "123456",
        10
    );

    const newUser={
        id:nextId,
        name,
        email,
        password:hashedPassword,
        role:role || "employee"
    };

    router.db
        .get("employees")
        .push(newUser)
        .write();

    const {password:_, ...safeUser}=newUser;

    res.status(201).json(safeUser);
});

app.put("/employees/:id", verifyToken, requireAdmin, async(req,res)=>{

    const id = Number(req.params.id);

    const user = router.db
        .get("employees")
        .find({ id })
        .value();


    if(!user){
        return res.status(404).json({
            message:"User not found"
        });
    }


    router.db
        .get("employees")
        .find({ id })
        .assign({
            name: req.body.name ?? user.name,
            email: req.body.email ?? user.email,
            role: req.body.role ?? user.role,
            password: user.password   // preserve old password
        })
        .write();


    const updatedUser = router.db
        .get("employees")
        .find({ id })
        .value();


    const { password, ...safeUser } = updatedUser;


    res.json(safeUser);

});

app.delete("/employees/:id", verifyToken, requireAdmin, async (req, res) => {

    const id = Number(req.params.id);

    const user = router.db
        .get("employees")
        .find({ id })
        .value();


    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }


    // Prevent admin from deleting himself
    if (req.user.id === id) {
        return res.status(400).json({
            message: "You cannot delete your own account"
        });
    }


    router.db
        .get("employees")
        .remove({ id })
        .write();


    res.status(200).json({
        message: "User deleted successfully"
    });

});

app.get( "/user", verifyToken, (req, res) => {
  const users = router.db.get("employees").value().map(({ password, ...user }) => user);
  res.status(200).json(users);
  }
);

// Protected route
app.use("/employees", verifyToken, requireAdmin);

// Use JSON Server's router
app.use(router);

// Start the server
app.listen(3000, () => {
  console.log("JSON Server running securely on http://localhost:3000");
});
