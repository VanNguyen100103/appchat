const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var conversationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messages: [
        {
            message: {type: mongoose.Types.ObjectId, ref: "Message"},
        }

    ]
},{timestamps: true});

//Export the model
module.exports = mongoose.model('Conversation', conversationSchema);