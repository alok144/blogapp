var express =require("express");
var app =express();
var bodyparser =require("body-parser");
var mongoose =require("mongoose");
var passport=require("passport");
var LocalStrategy=require("passport-local");

var methodoverride=require("method-override");
var expressSanitizer=require("express-sanitizer");

var User= require("./models/user");
var blog= require("./models/blog");

mongoose.connect("mongodb://localhost/restful_blog_app");

//app config
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodoverride("_method"));

//**************************//

//passport configuration
app.use(require("express-session")({
    secret: "rusty is best",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));
//for reading the session and taking data from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//**************************//


var port=process.env.PORT||8080;



app.get("/",function(req,res){
    res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs",function(req,res){
    //res.render("index");
    blog.find({},function(err,blogs){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("index",{blogs:blogs});
        }
    });
});
//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req,res){
    //create blog
    //req.body.blog conntains all data from form
    req.body.blog.body=req.sanitize(req.body.blog.body);
    blog.create(req.body.blog, function(err, newblog){
        if(err){
            res.render("new");
        }
        else{
            //redirect to index
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
    //res.send("show page");
    blog.findById(req.params.id, function(err,foundblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("show",{blog:foundblog});
        }
    });
})

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
    //res.render("edit");
    blog.findById(req.params.id, function(err,foundblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog:foundblog});
        }
    });
})

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    //res.redirect("/blogs");
    req.body.blog.body=req.sanitize(req.body.blog.body);
    blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedblog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
})

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
    //res.send("bla bla blogs");
    //destroy blog
    blog.findByIdAndDelete(req.params.id,function(err){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.redirect("/blogs");
        }
    });
    //redirect 
})

//*****************************************************//

//Auth routes
//signup form
app.get("/register", function(req,res){
    res.render("register");
});
//handling user signup
app.post("/register", function(req,res){
    //res.send("registered");
    var newUser=new User({username: req.body.username});
    //user.register will do all hash like things for us
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register"); 
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTES
//render login form
app.get("/login", function(req,res){
    res.render("login");
});
//handle sign in
//middleware
app.post("/login", passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), 
    function(req,res){//this is callback function
    res.render("login");
});

//LOGOUT ROUTES
app.get("/logout", function(req,res){
    req.logout();//request.logout()
    res.redirect("/campgrounds");
});

//middleware functionality
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//*****************************************************//

app.listen(port, function(){
    console.log("blog app started!!");
});






