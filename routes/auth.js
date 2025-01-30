const express = require("express");
const router = express.Router();
const passport = require("passport");

//login page route
router.get("/login", (req,res)=>{
    res.render("login");
});

//Dashboard (Protected Route)
router.get("/dashboard", isAuthenticated, (req,res)=>{
    res.render("dashboard", {user:req.user});
});

//User login
router.post("/login", (req,res,next)=>{
    passport.authenticate("local", {
        successRedirect:"/dashboard",
        failureRedirect: "/login",
        failureFlash:true
    })(req,res,next)
});

//user logout
router.get("/logout", (req,res)=>{
    req.logout(()=>{
        req.flash("success_msg", "You logged out");
        res.redirect("/login");
    })
})

//Middleware function to protect routes
function isAuthenticated(req,res,next){
    //Checks if user is authenticated
    if(req.isAuthenticated()) return next();

    //Sends error and redirects if they are not.
    req.flash("error_msg", "Please login to see this page.");
    res.redirect("/login");
}

module.exports = {router, isAuthenticated};