const mongoose=require('mongoose')


const userSchema=new mongoose.Schema({
        username:{
            type:String,
            required:true,
            unique:[true,"Username Already taken"]
        },
        email:{
            type:String,
            unique:[true,"User Already Exists With this Email Address"],
            required:true
        },
        password:{
            type:String,
            required:true
        }
})

const userModel=mongoose.model("users",userSchema)

module.exports=userModel