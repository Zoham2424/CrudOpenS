const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");

const app = express();
const PORT = 3000;

// Set Handlebars as our templating engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Static folder for public files
app.use(express.static(path.join(__dirname, "public")));

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/EmployeeApp"
mongoose.connect(mongoURI)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Mongoose Schema and Model
const employeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  department: String,
  startDate: Date,
  jobTitle: String,
  salary: Number,
});

const Employee = mongoose.model("Employee", employeeSchema);

// Routes

// Home route (view all employees)
app.get("/", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render("home", { employees });
  } catch (err) {
    res.status(500).send("Error fetching employees");
  }
});

// Add employee form
app.get("/add", (req, res) => {
  res.render("addEmployee");
});

// Add employee to DB
app.post("/add", async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.redirect("/");
  } catch (err) {
    res.status(400).send("Error adding employee");
  }
});

// Update employee form
app.get("/update/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).send("Employee not found");
    res.render("updateEmployee", { employee });
  } catch (err) {
    res.status(500).send("Error fetching employee");
  }
});

// Update employee in DB
app.post("/update/:id", async (req, res) => {
  try {
    await Employee.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/");
  } catch (err) {
    res.status(400).send("Error updating employee");
  }
});

// Delete employee
app.post("/delete/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send("Error deleting employee");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
