// Import Required Packages
import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

import dotenv from "dotenv";
dotenv.config();


const app = jsonServer.create();//create Server using json-server module
const router = jsonServer.router("db.json");//create router using json-server module
const middlewares = jsonServer.defaults();//Create Middlewares for authenticate the user

const SECRET_KEY = process.env.SECRET_KEY;
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
    console.log(token)
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
  const password = req.body.password;
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
    managerId: managerId || null,
    employeeIds: employeeIds || [],
    createdBy: req.user.id,
    createdAt: now,
    updatedAt: now
  };

  router.db.get("workspaces").push(workspace).write();
  res.status(201).json(workspace);
});


// get all workspace data endpoint

app.get("/workspace", verifyToken, (req, res) => {
  const workspaces = router.db.get("workspaces").value();
  res.status(200).json(workspaces);
});

//edit workspace using id 

app.put("/workspace/:id", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
  const id = Number(req.params.id);
  const { workspaceName, workspaceDesc, workspaceColor, workspaceIcon } = req.body;
  const workspace = router.db.get("workspaces").find({ id }).value();
  if (!workspace) {
    return res.status(404).json({
      message: "Workspace not found",
    });
  }
  // manager can edit only assigned workspace
  if (req.user.role === "manager" && workspace.managerId !== req.user.id) {
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

app.delete("/workspace/:id", verifyToken, authorizeRoles("admin"), (req, res) => {
  const id = Number(req.params.id);
  const workspace = router.db.get("workspaces").find({ id }).value();
  if (!workspace) {
    return res.status(404).json({ message: "Workspace not found" });
  }
  router.db.get("workspaces").remove({ id }).write();
  res.status(200).json({ message: "Workspace deleted successfully" });
});


//task create endpoint
app.post( "/task", verifyToken, authorizeRoles("admin", "manager"), (req, res) => {
  const { taskName, taskDesc, taskType, taskPriority, duedate, workspaceId, assignedTo } = req.body;
    if ( !taskName || !taskDesc || !taskType || !taskPriority || !duedate ||!workspaceId ) {
      return res.status(400).json({message: "taskName, description, type, priority, workspaceId and duedate are required"
      });
    }
    // check workspace exists
    const workspace = router.db.get("workspaces").find({ id: Number(workspaceId) }).value();
    if (!workspace) {
      return res.status(404).json({message: "Workspace not found"});
    }
    // manager can create task only in assigned workspace
    if ( req.user.role === "manager" && workspace.managerId !== req.user.id) {
      return res.status(403).json({ message: "You cannot create task in this workspace"});
    }

    const tasks = router.db
      .get("tasks")
      .value();

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
      assignedTo: assignedTo || null,
      assignedBy: req.user.id,
      createdAt: now,
      updatedAt: now
    };

    router.db.get("tasks").push(task).write();
    res.status(201).json(task);

  }
);

// get all task data endpoint

app.get("/task", verifyToken, (req, res) => {
  const tasks = router.db.get("tasks").value();
  res.status(200).json(tasks);
});

//edit task using id 

app.put("/task/:id", verifyToken, authorizeRoles("admin", "manager", "employee"), (req, res) => {
  const id = Number(req.params.id);

  const { taskName, taskDesc, taskType, taskPriority, duedate, workspaceId, assignedTo, assignedBy } = req.body;
  const task = router.db.get("tasks").find({ id }).value();

  if (!task) {
    return res.status(404).json({message: "Task not found"});
  }
  if (req.user.role === "employee" && task.assignedTo !== req.user.id) {
    return res.status(403).json({message: "You can edit only assigned tasks"});
  }

  router.db.get("tasks")
    .find({ id })
    .assign({
      taskName: taskName ?? task.taskName,
      taskDesc: taskDesc ?? task.taskDesc,
      taskType: taskType ?? task.taskType,
      taskPriority: taskPriority ?? task.taskPriority,
      duedate: duedate ?? task.duedate,
      workspaceId: workspaceId ?? task.workspaceId,
      assignedTo: assignedTo ?? task.assignedTo,
      assignedBy: assignedBy ?? task.assignedBy,
      updatedAt: new Date().toISOString()
    })
    .write();

  const updatedTask = router.db.get("tasks").find({ id }).value();
  res.status(200).json(updatedTask);
});


// Use JSON Server's router
app.use(router);

// Start the server
app.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});
