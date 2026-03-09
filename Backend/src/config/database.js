const mongoose=require('mongoose')


async function connectToDb(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Sucessfully Connect to Database");
        
    } catch (err) {
        console.log("Error in DataBase",err);
        
    }
}

module.exports=connectToDb