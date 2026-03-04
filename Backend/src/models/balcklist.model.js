const mongoose=require('mongoose')



const blacklistTokenSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is Required to be Added in Blacklist"]
    }
},{
    timestamps:true
})

const blacklistModel=mongoose.model('blackListtokens',blacklistTokenSchema)


module.exports=blacklistModel