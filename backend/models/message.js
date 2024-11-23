const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var messageSchema = new mongoose.Schema({
    text:{
        type:String,
        default:""
    },
    imageUrl:{
        type:String,
        default:""
    },
    videoUrl:{
        type:String,
        default:""
    },
    seen:{
        type:Boolean,
        default:false
    },
    msgByUserId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    }
},{timestamps: true});



//Export the model
module.exports = mongoose.model('Message', messageSchema);