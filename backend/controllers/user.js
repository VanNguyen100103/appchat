const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const makeToken = require('uuid').v4;
const sendEmail = require('../utils/sendEmail');
const {gen, generateAccessToken, generateRefreshToken} = require('../middlewares/generateToken');

const register = asyncHandler(async(req, res) => {
    const {email, password, name} = req.body;
    let avatar
    if(req.file){
        avatar = req.file.path;
    }
    if(!(email && password && name)){
        return res.status(400).json({
            success: false,
            message: "Missing inputs."
        })
    }
    const user = await User.findOne({email})
    if(user){
        return res.status(400).json({
            success: false,
            message: "User existed!"
        })
    }
    const token = makeToken()
    res.cookie("dataRegister",{ ...req.body, avatar, token}, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    })
    const html = `Xin quý khách nhấn đường link để xác nhận quá trình đăng ký tài khoản.<br/><a href="http://localhost:8000/api/user/final-register/${token}">Xác nhận</a>`
    const subject = "Đăng ký"
    await sendEmail({email, html, subject})
    return res.status(200).json({
        mes: "Please check your email!"
    })
}
)

const finalRegister = asyncHandler(async(req, res)=>{
    const token = req.params.token
    const cookie = req.cookies
    if(!(cookie || cookie.dataRegister) && cookie.dataRegister.token !== token){
        return res.status(400).json({
            success: false,
            message: "Missing token"
        })
    }

    const {email, password, name, avatar} = cookie.dataRegister
    const newUser = await User.create({email, password, name, avatar})
    res.clearCookie("dataRegister")
    return res.status(200).json({
        success: newUser ? true : false,
        user: newUser ? newUser : false
    })

})

const login = asyncHandler(async(req,res) => {
    const {email, password} = req.body
    if(!(email || password)){
        return res.status(400).json({
            success: false,
            message: "Missing inputs!"
        })
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return res.status(400).json({
            success: false,
            mes: "User not register."
        })
    }
    const isMatch = await user.comparePassword(password)
    if(!isMatch){
        return res.status(400).json({
            success: false,
            mes: "Wrong password."
        })
    }
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000
    })
    user.password = undefined
    return res.status(200).json({
        accessToken,
        user: user ? user : null,
        success: user ? true : false
    })
})

const getCurrent = asyncHandler(async(req,res)=>{
    const _id = req.user._id
    const user = await User.findById(_id)
    return res.status(200).json({
        success: user ? true : false,
        user
    })
}
)


const logout = asyncHandler(async(req,res)=>{
    res.clearCookie("refreshToken")
    return res.status(200).json({
        success: true,
        mes: 'Logout successfully!'
    })
})


const updateUser = asyncHandler(async(req,res)=>{
    const _id = req.user._id
    if(!_id || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            mes: "Missing inputs."
        })
    }
    const updateUser = await User.findByIdAndUpdate(_id, req.body, {new: true})
    return res.status(200).json({
        success: updateUser ? true : false,
        updateUser
    })
})

const getUsers = asyncHandler(async(req,res)=>{
    const queries = {...req.query}
    const excludeFields = ["fields"]
    excludeFields.forEach(field => delete queries[field])
    let queryString = JSON.stringify(queries)
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, (matchedEl)=>`$${matchedEl}`)
    const formatedQueries = JSON.parse(queryString)
    if(queries.name){
        formatedQueries.name = {$regex: queries.name, $options: "i"}
    }else{
        delete formatedQueries.name
    }
    let queryCommand = User.find(formatedQueries)
    if(req.query.fields){
        const fields = req.query.fields.split(" ").join(" ")
        queryCommand = queryCommand.select(fields)
    }
    const response = await queryCommand.exec()
    const counts = await User.countDocuments(formatedQueries)
    return res.status(200).json({
        counts,
        users: response,
        success: response ? true : false,
    })
})



module.exports = { 
    register,
    finalRegister,
    login,
    getCurrent,
    logout,
    updateUser,
    getUsers
};