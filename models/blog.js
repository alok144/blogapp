var mongoose=require("mongoose");
//creating blog schema and mongoose config
var blogschema= new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var blog=mongoose.model("Blog", blogschema);
module.exports= blog;