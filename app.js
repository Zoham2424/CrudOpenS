const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");

const app = express();
const PORT = 3000;


app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./views");


app.use(express.static(path.join(__dirname, "public")));


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Database connection
const mongoURI = "mongodb://localhost:27017/Empl";
mongoose.connect(mongoURI);
const db = mongoose.connection;


db.on("error", console.error.bind(console, "MongoDB Connection error"));
db.once("open", () => {
  console.log("Connected to MongoDB Database");
});

// Mongoose Schema and Model 
const employeeSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  department: { type: String, enum: ["HR", "Development", "Marketing"] },
  startDate: Date,
  jobTitle: String,
  salary: Number,
});

const Employee = mongoose.model("Employee", employeeSchema, "employees");

// Routes
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
// Get all employees
app.get("/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    console.log(employees);
    res.render("home", { employees });
  } catch (err) {
    res.status(500).send("Error fetching employees.");
  }
});

// Get single employee
app.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).send("Employee not found.");
    }
    res.render("updateEmployee", { employee });
  } catch (err) {
    res.status(500).send("Error fetching employee.");
  }
});

// Add new employee
app.get("/addEmployee", (req, res) => {
  res.render("addEmployee");
});

app.post("/addEmployee", async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;
    const newEmployee = new Employee({ firstName, lastName, department, startDate, jobTitle, salary });
    await newEmployee.save();
    res.redirect("/employees");
  } catch (err) {
    res.status(500).send("Error adding employee.");
  }
});

// Update employee
app.post("/updateEmployee/:id", async (req, res) => {
  try {
    const { firstName, lastName, department, startDate, jobTitle, salary } = req.body;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, department, startDate, jobTitle, salary },
      { new: true, runValidators: true }
    );
    if (!updatedEmployee) {
      return res.status(404).send("Employee not found.");
    }
    res.redirect("/employees");
  } catch (err) {
    res.status(500).send("Error updating employee.");
  }
});

// Delete employee
app.post("/deleteEmployee/:id", async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).send("Employee not found.");
    }
    res.redirect("/employees");
  } catch (err) {
    res.status(500).send("Error deleting employee.");
  }
});
app.get("/nodemon",(req,res)=>{
  res.sendStatus(500);
})

// Listen on PORT 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
