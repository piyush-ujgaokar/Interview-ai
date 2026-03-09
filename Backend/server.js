require('dotenv').config()
const app=require('./src/app')
const connectToDb=require('./src/config/database')
<<<<<<< HEAD
// const {jobDescription,resume,selfDescription}=require('./src/services/temp')
// const generateInterviewReport=require('./src/services/ai.service')

connectToDb()

// generateInterviewReport({resume,selfDescription,jobDescription})
=======
const {jobDescription,resume,selfDescription}=require('./src/services/temp')
const generateInterviewReport=require('./src/services/ai.service')

connectToDb()

generateInterviewReport({resume,selfDescription,jobDescription})
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
    
})