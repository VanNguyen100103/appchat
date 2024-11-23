const express = require('express');
const dotenv = require('dotenv');
dotenv.config({
    path: "./.env"
})
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDb = require('./configs/dbconnetion');
const initRoutes = require('./routes');
const {app, server} = require('./socket/index');


app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))



connectDb().then(() => {
    server.listen(process.env.PORT, () => {
        console.log(`Server running on http://localhost:${process.env.PORT}`)
    })
}
)

initRoutes(app)


