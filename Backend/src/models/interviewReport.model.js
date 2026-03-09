const mongoose=require('mongoose')



const technicalQuestionSchema=new mongoose.Schema({
    question:{
        type:String,
        required:[true,"Technical Question is Required"]
    },
    intention:{
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


const behaviouralQuestionSchema=new mongoose.Schema({
      question:{
        type:String,
        required:[true,"Behavioral Question is Required"]
    },
    intention:{
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
        technicalQuestions:[technicalQuestionSchema],
        behaviouralQuestions:[behaviouralQuestionSchema],
        skillGaps:[skillGapSchema],
        preparationPlan:[preparationPlanSchema],
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"users"
        }

},{
    timestamps:true
})


const interviewReportModel=mongoose.model("interviewReport",interviewReportSchema)


module.exports=interviewReportModel