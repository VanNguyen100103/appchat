const mongoose = require('mongoose');

const connectDb = async ()=>{
    try{
        const db = await mongoose.connect(process.env.MONGO_URI,{
            dbName: "appchat"
        })
        console.log(`Mongoose connected ${db.connection.name} successfully! `)
    }catch(err){
        console.log(`Mongoose connected failly!`, err.message)
    }
}

module.exports = connectDb