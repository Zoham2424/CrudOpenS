
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const { allowedNodeEnvironmentFlags } = require("process");

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

const Employee = mongoose.model("Employee", employeeSchema, "employees");

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
      res.json(employees);
  } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch employees");
  }
});


app.get("/employees/:id", async (req,res)=>{
  try{
      const employee = await Employee.findById(req.params.id);
      if(!employee){
          return res.status(404).json({error:"Game not found"});
      }
      res.json(employee);

  }catch(err){
      res.status(500).json({error:"Failed to fetch game"});
  }
});

// GET - Show form to add a new employee
app.get("/addEmployee", (req, res) => {
  res.render("addEmployee", { title: "Add New Employee" });
});

app.post("/addEmployee", async (req, res) => {
  try {
      const newEmployee = new Employee(req.body);
      await newEmployee.save();
      res.redirect("/"); 
  } catch (err) {
      console.error("Error saving employee:", err);
      res.status(400).send("Failed to add employee");
  }
});

app.put("/updateEmployee/:id", (req, res) => {
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
      console.error("Error updating employee:", err);
      res.status(400).json({ error: "Failed to update the employee" });
  });
});

app.delete("/deleteEmployee", async (req, res) => {
  try {
      const { firstName, lastName } = req.query;

      if (!firstName || !lastName) {
          return res.status(400).json({ error: "Missing employee firstName or lastName" });
      }

      console.log(`Deleting employee: ${firstName} ${lastName}`);
      const deletedEmployee = await Employee.findOneAndDelete({ firstName, lastName });

      if (!deletedEmployee) {
          return res.status(404).json({ error: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully", deletedEmployee });
  } catch (err) {
      console.error("Error deleting employee:", err);
      res.status(500).json({ error: "Failed to delete employee" });
  }
});

app.get("/hbsindex", (req, res) => {
  res.render("home", {
      title: "Welcome to the Handlebars Site",
      message: "This is our page using the template engine",
  });
});

app.get("/nodemon", (req, res) => {
  res.sendStatus(500);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});