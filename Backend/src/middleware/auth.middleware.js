const jwt=require('jsonwebtoken')
const blacklistModel=require('../models/balcklist.model')

async function authUser(req,res,next){

    const token=req.cookies.token

    if(!token){
        return res.status(401).json({
            message:"Token Not Provided"
        })
    }

    const isTokenBlacklisted=await blacklistModel.findOne({token})
    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is Invalid"
        })
    }


   try{
     const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user=decoded

    next()

   }catch(err){
    return res.status(401).json({
        message:"Invalid token"
    })
   }



}

module.exports={
    authUser
}