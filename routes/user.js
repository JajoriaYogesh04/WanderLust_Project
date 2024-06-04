const express= require("express");
const router= express.Router();
const User= require("../models/user.js");
const wrapAsync= require("../utils/wrapAsync.js");

router.get("/signup", (req, res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res)=>{
    try{
        let {username, email, password}= req.body;
        let newUser= new User({
            username: username,
            email: email,
        });
        let registeredUser= await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", `Sign Up Successfully: Welcome to WanderLust ${username}`);
        res.redirect("/listing");
    }
    catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}))

module.exports= router;