const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
})

const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "avatar",
        allowedFormats: ["png", "jpg", "webq", "jpeg"]
    },
    
})

const avatarUploader = multer({storage: avatarStorage})


module.exports = {avatarUploader}