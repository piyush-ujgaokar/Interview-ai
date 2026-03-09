require('dotenv').config()
const app=require('./src/app')
const connectToDb=require('./src/config/database')
// const {jobDescription,resume,selfDescription}=require('./src/services/temp')
// const generateInterviewReport=require('./src/services/ai.service')

connectToDb()

// generateInterviewReport({resume,selfDescription,jobDescription})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
    
})