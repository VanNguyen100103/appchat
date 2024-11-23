const router = require('express').Router();
const ctrls = require('../controllers/user');
const {avatarUploader} = require('../configs/cloudinary');
const { verifyAccessToken } = require('../middlewares/verify');


router.post("/register", avatarUploader.single("avatar"), ctrls.register)
router.get("/final-register/:token", ctrls.finalRegister)
router.post("/login", ctrls.login)
router.get("/current", verifyAccessToken, ctrls.getCurrent)
router.get("/logout", verifyAccessToken, ctrls.logout)
router.put("/update", verifyAccessToken, ctrls.updateUser)
router.get("/friends", verifyAccessToken, ctrls.getUsers)

module.exports = router;