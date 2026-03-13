const express=require('express')
const authRouter = require('./routes/auth.routes')
const interviewRuter=require('./routes/interview.routes')
const cookieParser = require('cookie-parser')
const cors =require('cors')
const path=require('path')



const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))
app.use(express.static(path.join(__dirname,'../public')))




app.use('/api/auth',authRouter)
app.use('/api/interview',interviewRuter)

app.get('*name',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/index.html'))
})



module.exports=app