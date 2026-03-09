const express=require('express')
const authRouter = require('./routes/auth.routes')
<<<<<<< HEAD
const interviewRuter=require('./routes/interview.routes')
=======
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
const cookieParser = require('cookie-parser')
const cors =require('cors')




const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))




app.use('/api/auth',authRouter)
<<<<<<< HEAD
app.use('/api/interview',interviewRuter)
=======
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742


module.exports=app