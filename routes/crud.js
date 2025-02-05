const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const {isAuthenticated} = require("./auth"); //Import our Authentcation routes


//get route to get data from database
router.get("/employee", async (req,res)=>{
    try{
        const employee = await Employee.find();
        res.json(employee);
    }catch(err){
        res.status(500).json({error:"Failed to fetch employee data"});
    }
});

//get route for a single user
router.get("/employee/:id", async (req,res)=>{
    try{
        const employee = await Employee.findById(req.params.id);
        if(!employee){
            return res.status(404).json({error:"Employee not found"});
        }
        res.json(employee);

    }catch(err){
        res.status(500).json({error:"Failed to fetch employee"});
    }
});

//post route to add data
router.post("/addEmployee", async (req,res)=>{
    console.log(req.body.employeename);
    try{
        const newEmployee = new Employee(req.body);
        const savedEmployee = await newEmployee.save();
        res.status(201).json(savedEmployee );
        console.log(savedEmployee );
    }catch(err){
        router.put("/users/:id", async (req, res) => {
            try {
                const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (!updatedUser) {
                    return res.status(404).json({ error: "User not found" });
                }
                res.json(updatedUser);
            } catch (err) {
                res.status(400).json({ error: "Failed to update user" });
            }
        });
    }
});

//put route to update data
router.put("/updateemployee/:id", (req,res)=>{
    //example using a promise statement
    Employee.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    }).then((updatedemployee)=>{
        if(!updatedemployee){
            return res.status(404).json({ error: "employee not found" });    
        }
        res.json(updatedemployee);
    }).catch((err)=>{
        res.status(400).json({ error: "Failed to update the employee" });
    });
});

//Example of delete route
router.delete("/deleteEmployee/employeename/", async (req,res)=>{
    try{
        const employeename = req.query;
        const employee = await Employee.find(employeename);

        if(employee.length === 0){
            return res.status(404).json({ error: "Failed to find the employee" });
        }
        const deletedEmployee = await Employee.findOneAndDelete(employeename);
        res.json({message:"Employee deleted successfully"})
    }catch(err){
        console.error(err);
        res.status(404).json({ error: "Employee not found"});
    }
})

router.get("/addEmployee", isAuthenticated, (req,res)=>{
    res.render("addEmployee", {
        title:"Add a employeeto the Favorite Employee Database",
        message:"Please add a employee."
    })
});

module.exports = router;