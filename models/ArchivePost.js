const mongoose = require('mongoose');
const archiveSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
      },
      ops: {
        type: Array,
        required: false
      },
      photo: {
        type: String,
        required: false,
      },
      username: {
        type: String,
        required: true,
      },
      categories: {
        type: Array,
        required: false,
      },
    },
    { timestamps: true }
)
module.exports= mongoose.model("archive",archiveSchema)
