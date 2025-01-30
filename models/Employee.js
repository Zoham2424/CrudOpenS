const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    department: String,
    startDate: Date,
    jobTitle: String,
    salary: Number
});

const Employee = mongoose.model("Employee", employeeSchema, "employees");

module.exports = Employee;