
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
      res.render("home", {
          employees,
          title: "Employee List",
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch employees");
  }
});

// GET - Show form to add a new employee
app.get("/add", (req, res) => {
  res.render("addEmployee", {
      title: "Add Employee",
      departments: ["HR", "Engineering", "Sales"], 
  });
});

// POST - Create a new employee
app.post("/add", async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.redirect("/employees");
    } catch (err) {
        console.error(err);
        res.status(400).send("Failed to create employee");
    }
});

// GET - Show form to update an employee
app.get("/updateEmployees/:id", async (req, res) => {
  try {
      const employee = await Employee.findById(req.params.id);
      if (!employee) {
          return res.status(404).send("Employee not found");
      }
      res.render("updateEmployees", {
          employee,
          title: "Update Employee",
          departments: ["HR", "Engineering", "Sales"],
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch employee");
  }
});

// PUT - Update an employee
app.put("/updateEmployees/:id", (req, res) => {
  // Using a promise to update employee by ID
  Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
  })
  .then((updatedEmployee) => {
      if (!updatedEmployee) {
          return res.status(404).json({ error: "Employee not found" });
      }
      res.json(updatedEmployee);
  })
  .catch((err) => {
      res.status(400).json({ error: "Failed to update the employee" });
  });
});

// DELETE - Delete an employee
app.delete("/deleteEmployee/:id", async (req, res) => {
  try {
      // Find employee by ID to delete
      const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
      
      if (!deletedEmployee) {
          return res.status(404).json({ error: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully" });
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
