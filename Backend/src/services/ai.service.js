const { GoogleGenAI } = require('@google/genai')
const {z}=require('zod')
const { zodToJsonSchema } =require("zod-to-json-schema")

const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema=z.object({

    matchScore:z.number().describe(" Score between 0 to 100 Candidate's profile matches Resume and Job description"),

    technicalQuestions: z.array(z.object(
        {
        question:z.string().describe('The technical Questions can Be Asked in  Interview'),
        intention:z.string().describe("The intention of interviewer behind asking the question"),
        answer:z.string().describe("How to Answer this Questions, What point to Cover, What Approach to take etc.")
        }
)).describe(" Technical Questions that can be Asked in Interview along with the Intention of interviewer behind asking the question and How to Answer this Questions"),
    
    behaviouralQuestions: z.array(z.object(
        {
        question:z.string().describe('The technical Questions can Be Asked in  Interview'),
        intention:z.string().describe("The intention of interviewer behind asking the question"),
        answer:z.string().describe("How to Answer this Questions, What point to Cover, What Approach to take etc.")
        }
)).describe(" Behavioural Questions that can be Asked in Interview along with the Intention of interviewer behind asking the question and How to Answer this Questions"),
    
    skillGaps:z.array(z.object(
        {
        skill:z.string().describe("Skill that Candidate is lacking"),
        severity:z.enum(['low','medium','high']).describe("Severity of Skill Gap")
         }
)).describe("list of Skill Gaps that Candidate has along with the Severity of each Skill Gap"),

    preparationPlan:z.array(z.object(
        {
    day:z.number().describe("Day Number"),
    focus:z.string().describe("Focus of Preparation for the Day"),
    tasks:z.array(z.string()).describe("List of Tasks to be Completed for the Day")
    }
)).describe("Preparation Plan for the Interview")


})

async function generateInterviewReport({resume,selfDescription,jobDescription}){

// const prompt = `
// Generate an interview report.

// Return ONLY valid JSON that strictly follows this structure.

// technicalQuestions must be an array of objects with:
// - question
// - intention
// - answer

// behaviouralQuestions must be an array of objects with:
// - question
// - intention
// - answer

// skillGaps must be an array of objects with:
// - skill
// - severity (low, medium, high)

// preparationPlan must be an array of objects with:
// - day
// - focus
// - tasks (array of strings)

// Candidate Resume:
// ${resume}

// Candidate Self Description:
// ${selfDescription}

// Job Description:
// ${jobDescription}
// `


const prompt = `
You are an AI interview analyzer.

Return ONLY valid JSON.

The JSON must contain ONLY these fields:
- matchScore
- technicalQuestions
- behaviouralQuestions
- skillGaps
- preparationPlan

Do NOT add fields like:
candidateName
summary
recommendation
feedback
interviewDate

IMPORTANT STRUCTURE RULES:

matchScore:

technicalQuestions MUST be:
[
 { "question": "...", "intention": "...", "answer": "..." }
]

behaviouralQuestions MUST be:
[
 { "question": "...", "intention": "...", "answer": "..." }
]

skillGaps MUST be:
[
 { "skill": "...", "severity": "low|medium|high" }
]

preparationPlan MUST be:
[
 { "day": number, "focus": "...", "tasks": ["task1","task2"] }
]

Return only JSON. Do not convert objects to strings.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}
`

    const response=await ai.models.generateContent({
            model:'gemini-3-flash-preview',
            contents:prompt,
            config:{
                temperature:0,
                responseMimeType:'application/json',
                responseSchema:zodToJsonSchema(interviewReportSchema)
            }
    })

    function tryParseStringifiedJson(value){
        if(typeof value !== 'string') return value;
        const s = value.trim();
        if(s.startsWith('{') || s.startsWith('[')){
            try{
                return JSON.parse(s);
            }catch(e){
                return value;
            }
        }
        return value;
    }

    function normalize(obj){
        if(Array.isArray(obj)){
            return obj.map(item => normalize(tryParseStringifiedJson(item)));
        }else if(obj && typeof obj === 'object'){
            const out = {};
            for(const k of Object.keys(obj)){
                out[k] = normalize(tryParseStringifiedJson(obj[k]));
            }
            return out;
        }
        return obj;
    }

    const parsed = JSON.parse(response.text);
    const cleaned = normalize(parsed);
    console.log(JSON.stringify(cleaned, null, 2));

}

module.exports=generateInterviewReport