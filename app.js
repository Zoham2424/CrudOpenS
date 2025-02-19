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


const app = express();
const PORT = process.env.Port || 3000;


require("./config/passport")(passport);


app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());


app.use(flash());


app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// MongoDB Database connection
const mongoURI = process.env.MONGO_URI; //
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Check for connection
db.on("error", console.error.bind(console, "MongoDB Connection error"));
db.once("open", () => {
  console.log("Connected to MongoDB Database");
});


app.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render("home", { employees, title: "Employee List" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch employees");
  }
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