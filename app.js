require("dotenv").config();
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const flash = require("connect-flash");
const { allowedNodeEnvironmentFlags } = require("process");
const Employee = require("./models/Employee");


const app = express();
const PORT =  process.env.PORT || 3000;

//Passport Configuration
require("./config/passport")(passport);

//Set Handlebars as our templating engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./views"));

//Sets our static resources folder
app.use(express.static(path.join(__dirname,"public")));

//Middleware body-parser parses jsons requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//Setup Express-Session Middleware
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true
}))

//Setup Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Setup Flash messaging
app.use(flash());

//Global Variables for Flash Messages
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

//Required Route Router Example
app.use("/", require("./routes/auth").router);
app.use("/", require("./routes/crud"));

//MongoDB Database connection
// const mongoURI = "mongodb://localhost:27017/gamelibrary"
const mongoURI = process.env.MONGO_URI.replace("${MONGO_PASSWORD}", process.env.MONGO_PASSWORD); //||  "mongodb://localhost:27017/gamelibrary"
mongoose.connect(mongoURI);
const db = mongoose.connection;
//check for connection
db.on("error", console.error.bind(console, "MonoDB Connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});


app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});



// Check for connection
db.on("error", console.error.bind(console, "MongoDB Connection error"));
db.once("open", () => {
  console.log("Connected to MongoDB Database");
});




app.get("/register", (req, res) => {
  res.render("register");
});


app.post("/register", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    req.flash("error_msg", "Passwords do not match");
    return res.redirect("/register");
  }
  
  try {
    const user = new User({ username, email, password });
    await user.save();
    req.flash("success_msg", "Registration successful");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error creating user");
    res.redirect("/register");
  }
});


app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/",(req, res)=>{
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
  failureFlash: true,
}));

// Protected route (example dashboard)
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("dashboard", { user: req.user });
  } else {
    req.flash("error_msg", "Please log in to view this page.");
    res.redirect("/login");
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success_msg", "You are logged out.");
    res.redirect("/login");
  });
});

// Handlebars example route
app.get("/hbsindex", (req, res) => {
  res.render("home", {
    title: "Welcome to the Handlebars Site",
    message: "This is our page using the template engine",
  });
});

// Example of serving a static file
app.get("/json", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "players.json"));
});

// For nodemon testing
app.get("/nodemon", (req, res) => {
  res.sendStatus(500);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;