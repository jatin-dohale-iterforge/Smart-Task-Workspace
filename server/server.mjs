// Import Required Packages
import jsonServer from "json-server";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";


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
async function verifyToken(req, res, next) {
  const token = await req.headers.token;//get token from request header

  // if token not present in request
  if (!token) {
    console.log(token)
    return res
      .status(401)
      .json({ message: "Access denied: No token provided." });
  }

  // if token is present in request
  try {
    jwt.verify(token, SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).json({ message: "Access denied: Invalid token." });
  }
}

app.use(bodyParser.json());// Parse body data of request using body-parser module
app.use(middlewares);

//===========================
// Authentication endpoints
//===========================

// login endpoint take req.body[email,password]
app.post("/login", (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ "message": "Email and password is required to login!" });
  }
  const user = router.db.get("employees").find({ email, password }).value();

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = createToken({ id: user.id, email: user.email });
  res.status(200).json({ token, user });
});


// registration endpoint take req.body[name,email,password]
app.post("/register", (req, res) => {

  const email = req.body.email?.trim();
  const password = req.body.password;
  const name = req.body.name?.trim();

  if (!email || !password || !name) {
    return res.status(400).json({ "message": "Email, name and password is required to register!" });
  }

  const existingUser = router.db.get("employees").find({ email }).value();

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { id: Date.now(), email, password, name };
  router.db.get("employees").push(newUser).write();

  const token = createToken({ id: newUser.id, email: newUser.email });
  res.status(201).json({ token, user: newUser });
});


// Use JSON Server's router
app.use(router);

// Start the server
app.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});
