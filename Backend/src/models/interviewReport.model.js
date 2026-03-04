const mongoose=require('mongoose')



const techinicalQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical Question is Required"]
    },
    intension:{
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


const behavioralQuestionSchema=new mongoose.Schema({
      question:{
        type:String,
        required:[true,"Technical Question is Required"]
    },
    intension:{
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
        techinicalQuestion:[techinicalQuestionSchema],
        behavioralQuestion:[behavioralQuestionSchema],
        skilGaps:[skillGapSchema],
        preparationPlan:[preparationPlanSchema]

},{
    timestamps:true
})


const interviewReportModel=mongoose.Model("interviewReport",interviewReportSchema)


module.exports=interviewReportModel