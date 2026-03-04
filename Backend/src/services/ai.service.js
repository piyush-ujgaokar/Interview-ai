const { GoogleGenAI } =require('@google/genai')
const {z}=require('zod')
import { zodToJsonSchema } from "zod-to-json-schema"

const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema=z.object({

    matchScore:z.number().description(" Score between 0 to 100 Candidate's profile matches Resume and Job Description"),

    technicalQuestions: z.array(z.object({
        question:z.string().description('The technical Questions can Be Asked in  Interview'),
        intention:z.string().description("The intention of interviewer behind asking the question"),
        answer:z.string().description("How to Answer this Questions, What point to Cover, What Approach to take etc.")
    })).description(" Technical Questions that can be Asked in Interview along with the Intention of interviewer behind asking the question and How to Answer this Questions"),
    
    behaviouralQuestions: z.array(z.object({
        question:z.string().description('The technical Questions can Be Asked in  Interview'),
        intention:z.string().description("The intention of interviewer behind asking the question"),
        answer:z.string().description("How to Answer this Questions, What point to Cover, What Approach to take etc.")
    })).description(" Behavioural Questions that can be Asked in Interview along with the Intention of interviewer behind asking the question and How to Answer this Questions"),
    
    skillGaps:z.array(z.object({
        skill:z.string().description("Skill that Candidate is lacking"),
        severity:z.enum(['low','medium','high']).description("Severity of Skill Gap")
    })).description("list of Skill Gaps that Candidate has along with the Severity of each Skill Gap"),

    preparationPlan:z.array(z.object({
    day:z.number().description("Day Number"),
    focus:z.string().description("Focus of Preparation for the Day"),
    tasks:z.array(z.string()).description("List of Tasks to be Completed for the Day")
})).description("Preparation Plan for the Interview")


})

async function generateInterviewReport({resume,selfDescription,jobDescription}){

    const prompt=`generate an interview report for a candidate based on the following information:
    Candidate's Resume: ${resume}
    Candidate's Self-Description: ${selfDescription}
    Job Description: ${jobDescription}
    `


    const response=await ai.models.generateContent({
            model:'gemini-2.5-flash',
            contents:prompt,
            config:{
                responseMimeType:'application/json',
                responseJsonSchema:zodToJsonSchema(interviewReportSchema)
            }
    })

    console.log(JSON.parse(response.text));

}