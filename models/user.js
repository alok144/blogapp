var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

//set up user schema
var userSchema=new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//variable to access database

module.exports= mongoose.model("User", userSchema);