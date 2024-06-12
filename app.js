if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const dbUrl= process.env.ATLASDB_URL

const express= require("express");
const mongoose= require("mongoose");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");

const app= express();
const port= 8080;
const mongoose_url= "mongodb://127.0.0.1:27017/wanderlust";
// const Listing= require("./models/listing.js");
const path= require("path");
// const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/expressError.js");
// const { listingSchema, reviewSchema} = require("./schema.js");
// const Review= require("./models/review.js");

const listingsRouter= require("./routes/listing.js")
const reviewsRouter= require("./routes/review.js")
const usersRouter= require("./routes/user.js");

const session= require("express-session");
const flash= require("connect-flash");

const User= require("./models/user.js");
const passport= require("passport");
const LocalStrategy= require("passport-local");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions= {
    secret: "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())

async function main(){
    await mongoose.connect(dbUrl); 
}

main().then(()=>{console.log("Connected to Mongoose")})
.catch((err)=>{console.log(err)});

//Set up
// app.get("/", (req, res)=>{
//     console.log("Index Route Successfully");
//     res.send("Index Route Successfully");
// })

// app.get("/testListing", async (req, res)=>{
//     let sampleListing= new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     })
//     await sampleListing.save().then((res)=>{console.log(res)})
//     .catch((err)=>{console.log(err)});
//     res.send("Listing Test Successfully");
// })

app.use((req, res, next)=>{
    res.locals.success= req.flash("success");
    // console.log(res.locals);
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user;
    next();
})

// app.get("/demouser", async (req, res)=>{
//     let fakeUser= new User({
//         email:"demo2@gmail.com",
//         username: "demo-user2",
//     })
//     let registeredUser= await User.register(fakeUser, "helloworld");
//     console.log(registeredUser);
//     res.send(registeredUser);
// })

app.use("/listing", listingsRouter);

app.use("/listing/:id/reviews", reviewsRouter);

app.use("/", usersRouter);

app.all("*",(req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"));
})
 
// app.use((err, req, res, next)=>{
//     // res.send(err.message);
//     res.send("Something went WRONG");
// })

app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went WRONG"}= err;
    // res.status(statusCode).send(message)
    // res.send(err);
    res.status(statusCode).render("error.ejs", { err });
})

app.listen(port, ()=>{
    console.log("Listening to port 8080");
})

