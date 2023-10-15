const mongoose = require("mongoose");
const RatingSchema = new mongoose.Schema({
    blogId: { type: mongoose.SchemaTypes.ObjectId, ref: 'Post' },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
    username: { type: String,required:true},
    author: {type: String , required:true},
    rating: { type: Number, min: 1, max: 5 },
    feedback:{type:String,required:true}
  });
  
 module.exports=mongoose.model("RatingPost",RatingSchema)
  