const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyAccessToken = (req, res, next) =>{
    if(req.headers.authorization.startsWith("Bearer")) {
        const accessToken = req.headers.authorization.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, decode) => {
          if(err) {
            return res.status(401).json({
                message: "Invalid accesstoken"
            })
          }
          req.user = decode
          next();
        }
        );
    }else{
        return res.status(401).json({
            message: "Unauthorized!"
        })
    }
}

const verifyToken = async (token) => {
    if(!token) {
        return res.status(401).json({
            message: "Unauthorized!"
        })
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decode._id)
    return user
}


module.exports = {verifyAccessToken, verifyToken}