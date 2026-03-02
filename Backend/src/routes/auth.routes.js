const express=require('express')
const authController=require('../controllers/auth.controller')
const  authMiddleware  = require('../middleware/auth.middleware')


const authRouter=express.Router()


authRouter.post('/register',authController.registerUserController)
authRouter.post('/login',authController.loginUserController)
authRouter.get('/logout',authController.logoutuserController)
authRouter.get('/get-me',authMiddleware.authUser,authController.getMeController)


module.exports=authRouter