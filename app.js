const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const methodOverride = require('method-override');

const app = express();
const PORT = 3000;

// Set Handlebars as our templating engine
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Set static resources folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware for parsing requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
const mongoURI = "mongodb://localhost:27017/Empl";
mongoose.connect(mongoURI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", () => {
    console.log("Connected to MongoDB Database");
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

const Employee = mongoose.model("employee", employeeSchema, "employees");

// Routes

// Index route - Home Page
app.get("/", async (req, res) => {
  try {
      const employees = await Employee.find();
      res.render("home", {
          employees,
          title: "Employee List",
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch employees");
  }
});

// GET - Employee List
app.get("/employees", async (req, res) => {
  try {
      const employees = await Employee.find();
      res.render("home", { employees, title: "Employee List" });
  } catch (err) {
      res.status(500).json({ error: "Failed to fetch employee data" });
  }
});

// Get route for a single employee
app.get("/employees/:id", async (req, res) => {
  try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
          return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
  } catch (err) {
      res.status(500).json({ error: "Failed to fetch employee" });
  }
});


app.post("/addEmployee", async (req, res) => {
  try {
      const newEmployee = new Employee(req.body);
      const savedEmployee = await newEmployee.save();
      res.redirect("/employees");
  } catch (err) {
      console.error(err);
      res.status(400).send("Failed to create employee");
  }
});
app.get("/updateEmployee/:id", async (req, res) => {
  try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
          return res.status(404).send("Employee not found");
      }
      res.render("updateEmployee", { employee, title: "Update Employee" });
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch employee");
  }
});

app.put("/updateEmployee/:id", async (req, res) => {
  try {
      const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEmployee) {
          return res.status(404).json({ error: "Employee not found" });
      }
      res.redirect("/employees");
  } catch (err) {
      res.status(400).json({ error: "Failed to update the employee" });
  }
});


app.delete("/deleteEmployee/:id", async (req, res) => {
  try {
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      if (!deletedEmployee) {
          return res.status(404).json({ error: "Employee not found" });
      }
      res.redirect("/employees");
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete employee" });
  }
});

app.get("/nodemon", (req, res) => {
  res.sendStatus(500);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
