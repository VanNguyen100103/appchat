const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    avatar:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select: false
    },
},{timestamps: true});

userSchema.pre("save", async function (next)  {
  if(!this.isModified("password")){
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
}
)

userSchema.methods = {
    comparePassword: async function(enteredPass){
        return await bcrypt.compare(enteredPass, this.password);
    }
}


//Export the model
module.exports = mongoose.model('User', userSchema);