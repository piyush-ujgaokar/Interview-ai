const mongoose=require('mongoose')



<<<<<<< HEAD
const technicalQuestionSchema=new mongoose.Schema({
=======
const techinicalQuestionSchema=new mongoose.Schema({
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
    question:{
        type:String,
        required:[true,"Technical Question is Required"]
    },
<<<<<<< HEAD
    intention:{
=======
    intension:{
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
        type:String,
        required:[true,"Intention is Required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is Required"]
    }
},{
    _id:false
})


<<<<<<< HEAD
const behaviouralQuestionSchema=new mongoose.Schema({
      question:{
        type:String,
        required:[true,"Behavioral Question is Required"]
    },
    intention:{
=======
const behavioralQuestionSchema=new mongoose.Schema({
      question:{
        type:String,
        required:[true,"Technical Question is Required"]
    },
    intension:{
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742
        type:String,
        required:[true,"Intention is Required"]
    },
    answer:{
        type:String,
        required:[true,"Answer is Required"]
    }
},{
    _id:false
})

const skillGapSchema=new mongoose.Schema({
    skill:{
        type:String,
        required:[true,"Skill is required"]
    },
    severity:{
        type:String,
        enum:['low','medium','high'],
        required:[true,"Severity is Required"]
    }
},{
    _id:false
})


const preparationPlanSchema=new mongoose.Schema({
    day:{
        type:Number,
        required:[true,"Day Is required"]
    },
    focus:{
        type:String,
        required:[true,"Focus is required"]
    },
    tasks:[{
        type:String,
        required:[true,"Task is required"]
    }]
})

const interviewReportSchema=new mongoose.Schema({
        jobDescription:{
            type:String,
            required:[true,"Job Description is Required"]
        },
        resume:{
            type:String
        },
        matchScore:{
            type:Number,
            min:0,
            max:100
        },  
<<<<<<< HEAD
        technicalQuestions:[technicalQuestionSchema],
        behaviouralQuestions:[behaviouralQuestionSchema],
        skillGaps:[skillGapSchema],
        preparationPlan:[preparationPlanSchema],
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }
=======
        techinicalQuestion:[techinicalQuestionSchema],
        behavioralQuestion:[behavioralQuestionSchema],
        skilGaps:[skillGapSchema],
        preparationPlan:[preparationPlanSchema]
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742

},{
    timestamps:true
})


<<<<<<< HEAD
const interviewReportModel=mongoose.model("interviewReport",interviewReportSchema)
=======
const interviewReportModel=mongoose.Model("interviewReport",interviewReportSchema)
>>>>>>> d4d00cd07d6844c27829c266566da4df1177e742


module.exports=interviewReportModel