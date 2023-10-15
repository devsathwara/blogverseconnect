const mongoose = require('mongoose');

const ContactSchema= new mongoose.Schema(
    {

        firstName: {
          type: String,
          required: true,
        },
        lastName:{
            type: String,
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          phoneNo:{
            type:String,
            required:true
          },
          Query:{
            type:String,
            required:true
          }
    },
      { timestamps: true }
)
module.exports= mongoose.model("Contact",ContactSchema)