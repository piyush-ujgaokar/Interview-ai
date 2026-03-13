const { GoogleGenAI } = require('@google/genai')
const {z}=require('zod')
const { zodToJsonSchema } =require("zod-to-json-schema")
const {puppeteer} =require('puppeteer')

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
)).describe("Preparation Plan for the Interview"),

     title:z.string().describe("The title of the job for which the interview report is generated")


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

title:{title:""}

Return only JSON. Do not convert objects to strings.

Do NOT output placeholder tokens such as the literal words
'question', 'intention', 'answer', 'skill', 'severity', 'day', 'focus', or 'tasks'.
Always provide concrete content for each field. If you cannot extract real values,
return an empty array for that field (do NOT return arrays of placeholder strings).

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}
`

    const response=await ai.models.generateContent({
            model:'gemini-2.5-flash',
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

    console.log('AI raw response:', response.text);
    const parsed = JSON.parse(response.text);

    // Robust extraction: if the raw text contains arrays as escaped/concatenated strings,
    // try to extract them directly and replace in parsed before normalization.
    function extractArrayFromRaw(field){
        try{
            const re = new RegExp('"'+field+'"\\s*:\\s*(\\[([\\s\\S]*?)\\])','m');
            const m = response.text.match(re);
            if(m && m[1]){
                const arr = JSON.parse(m[1]);
                parsed[field] = arr;
            }
        }catch(e){ /* ignore */ }
    }

    extractArrayFromRaw('technicalQuestions');
    extractArrayFromRaw('behaviouralQuestions');
    extractArrayFromRaw('skillGaps');
    extractArrayFromRaw('preparationPlan');

    let cleaned = normalize(parsed);

    function remapAliases(obj){
        if(!obj || typeof obj !== 'object') return obj;
        const mapping = {
            techinicalQuestion: 'technicalQuestions',
            techinicalQuestions: 'technicalQuestions',
            technicalQuestion: 'technicalQuestions',
            behavioralQuestion: 'behaviouralQuestions',
            behavioralQuestions: 'behaviouralQuestions',
            skilGaps: 'skillGaps',
            skillGap: 'skillGaps'
        };
        for(const from of Object.keys(mapping)){
            const to = mapping[from];
            if(Object.prototype.hasOwnProperty.call(obj, from) && !Object.prototype.hasOwnProperty.call(obj, to)){
                obj[to] = obj[from];
                delete obj[from];
            }
        }

        if(Array.isArray(obj.technicalQuestions)){
            obj.technicalQuestions = obj.technicalQuestions.map(q=>{
                if(q && typeof q === 'object'){
                    if(q.intension){ q.intention = q.intension; delete q.intension; }
                }
                return q;
            });
        }
        if(Array.isArray(obj.behaviouralQuestions)){
            obj.behaviouralQuestions = obj.behaviouralQuestions.map(q=>{
                if(q && typeof q === 'object'){
                    if(q.intension){ q.intention = q.intension; delete q.intension; }
                }
                return q;
            });
        }

        return obj;
    }

    cleaned = remapAliases(cleaned);

    function coerceArrays(obj){
        const out = Object.assign({}, obj);
        function isFlatStringArray(a){ return Array.isArray(a) && a.length>0 && a.every(x=>typeof x==='string'); }
        const placeholderTokens = new Set(['question','intention','answer','skill','severity','day','focus','tasks']);
        function isPlaceholderArray(a){ return isFlatStringArray(a) && a.every(s=>placeholderTokens.has(String(s).toLowerCase())); }

        function tryUnwrapConcatenatedJsonField(field){
            if(!Array.isArray(out[field]) || out[field].length!==1) return;
            const v = out[field][0];
            if(typeof v !== 'string') return;
            const s = v.trim();
            if(s.startsWith('[')){
                try{
                    const arr = JSON.parse(s);
                    out[field] = normalize(arr);
                    return;
                }catch(e){ /* fallthrough */ }
            }

            // If string contains multiple top-level JSON objects concatenated, split reliably
            if(s.startsWith('{') || s.startsWith('}')){
                const objs = [];
                let depth = 0;
                let start = null;
                for(let i=0;i<s.length;i++){
                    const ch = s[i];
                    if(ch === '{'){
                        if(depth === 0) start = i;
                        depth++;
                    } else if(ch === '}'){
                        depth--;
                        if(depth === 0 && start !== null){
                            objs.push(s.slice(start, i+1));
                            start = null;
                        }
                    }
                }
                if(objs.length>0){
                    try{
                        const parsedObjs = objs.map(x=>JSON.parse(x));
                        out[field] = normalize(parsedObjs);
                        return;
                    }catch(e){
                        // fallthrough
                    }
                }
            }
        }

        tryUnwrapConcatenatedJsonField('technicalQuestions');
        tryUnwrapConcatenatedJsonField('behaviouralQuestions');
        tryUnwrapConcatenatedJsonField('skillGaps');
        tryUnwrapConcatenatedJsonField('preparationPlan');

            // If AI returned arrays where each element is a JSON string, parse them individually
            function tryParseArrayOfJsonStrings(field){
                if(!Array.isArray(out[field]) || out[field].length===0) return;
                if(out[field].every(it=>typeof it === 'string')){
                    const parsed = out[field].map(it=>{
                        try{ return JSON.parse(it); }catch(e){ return it; }
                    });
                    // if at least one parsed to object, replace and normalize
                    if(parsed.some(p=>p && typeof p === 'object')){
                        out[field] = normalize(parsed);
                    }
                }
            }

            tryParseArrayOfJsonStrings('technicalQuestions');
            tryParseArrayOfJsonStrings('behaviouralQuestions');
            tryParseArrayOfJsonStrings('skillGaps');
            tryParseArrayOfJsonStrings('preparationPlan');

        if(isFlatStringArray(out.technicalQuestions)){
            const arr = out.technicalQuestions;
            if(isPlaceholderArray(arr)){
                console.log('Detected placeholder technicalQuestions array — leaving empty');
                out.technicalQuestions = [];
            } else if(arr.length % 3 === 0){
                const tq = [];
                for(let i=0;i<arr.length;i+=3){
                    tq.push({ question: arr[i], intention: arr[i+1], answer: arr[i+2] });
                }
                out.technicalQuestions = tq;
            } else {
                out.technicalQuestions = [];
            }
        }

        if(isFlatStringArray(out.behaviouralQuestions)){
            const arr = out.behaviouralQuestions;
            if(isPlaceholderArray(arr)){
                console.log('Detected placeholder behaviouralQuestions array — leaving empty');
                out.behaviouralQuestions = [];
            } else if(arr.length % 3 === 0){
                const bq = [];
                for(let i=0;i<arr.length;i+=3){
                    bq.push({ question: arr[i], intention: arr[i+1], answer: arr[i+2] });
                }
                out.behaviouralQuestions = bq;
            } else {
                out.behaviouralQuestions = [];
            }
        }

        if(isFlatStringArray(out.skillGaps)){
            const arr = out.skillGaps;
            if(isPlaceholderArray(arr)){
                console.log('Detected placeholder skillGaps array — leaving empty');
                out.skillGaps = [];
            } else if(arr.length % 2 === 0){
                const sg = [];
                for(let i=0;i<arr.length;i+=2){
                    sg.push({ skill: arr[i], severity: (arr[i+1] || '').toLowerCase() });
                }
                out.skillGaps = sg;
            } else {
                out.skillGaps = [];
            }
        }

        if(isFlatStringArray(out.preparationPlan)){
            const arr = out.preparationPlan;
            if(isPlaceholderArray(arr)){
                console.log('Detected placeholder preparationPlan array — leaving empty');
                out.preparationPlan = [];
            } else if(arr.length % 3 === 0){
                const pp = [];
                for(let i=0;i<arr.length;i+=3){
                    const dayVal = Number(arr[i]);
                    let tasksVal = [];
                    try{
                        const t = (arr[i+2] || '').trim();
                        if(t.startsWith('[')) tasksVal = JSON.parse(t);
                        else tasksVal = t.split(',').map(s=>s.trim()).filter(Boolean);
                    }catch(e){
                        tasksVal = [arr[i+2]];
                    }
                    pp.push({ day: isNaN(dayVal) ? null : dayVal, focus: arr[i+1], tasks: tasksVal });
                }
                out.preparationPlan = pp;
            } else {
                out.preparationPlan = [];
            }
        }

        return out;
    }

    cleaned = coerceArrays(cleaned);
    // If AI returned only placeholder/empty arrays, generate a simple fallback
    function generateFallback(jobDesc, resume){
        const jd = (jobDesc||'').toLowerCase();
        const kws = {
            node: jd.includes('node'),
            mongodb: jd.includes('mongo'),
            docker: jd.includes('docker'),
            k8s: jd.includes('kubernetes') || jd.includes('k8s'),
            aws: jd.includes('aws') || jd.includes('gcp') || jd.includes('azure'),
            microservices: jd.includes('microservice') || jd.includes('system design') || jd.includes('scalabl'),
            redis: jd.includes('redis'),
            jwt: jd.includes('jwt') || jd.includes('authentication')
        };

        const techQ = [];
        if(kws.mongodb) techQ.push({ question: 'How have you optimized MongoDB queries in production?', intention: 'Assess MongoDB performance experience', answer: 'Discuss indexes, schema design, aggregation and sharding.' });
        if(kws.microservices) techQ.push({ question: 'How would you design a scalable backend for high traffic?', intention: 'Evaluate system design and scalability thinking', answer: 'Discuss stateless services, caching, queues, load balancing and DB scaling.' });
        if(kws.jwt) techQ.push({ question: 'Explain the JWT authentication flow in REST APIs.', intention: 'Verify security and auth implementation knowledge', answer: 'Describe token issuance, validation, refresh tokens and storage considerations.' });
        if(kws.docker) techQ.push({ question: 'How do you Dockerize a Node.js app and why?', intention: 'Check containerization practical knowledge', answer: 'Create Dockerfile, use multi-stage builds, expose ports, and discuss deployment benefits.' });
        if(techQ.length===0) techQ.push({ question: 'Explain a backend problem you solved recently.', intention: 'Evaluate problem-solving and backend knowledge', answer: 'Describe the situation, actions taken and results.' });

        const behQ = [
            { question: 'Describe a challenging bug you debugged and the outcome.', intention: 'Assess troubleshooting and resilience', answer: 'Use STAR: situation, task, action, result.' },
            { question: 'How do you approach code reviews?', intention: 'Understand collaboration and code quality habits', answer: 'Discuss constructive feedback, standards and tests.' }
        ];

        const gaps = [];
        if(!kws.aws) gaps.push({ skill: 'Cloud Platforms (AWS/GCP/Azure)', severity: 'high' });
        if(!kws.docker) gaps.push({ skill: 'Docker', severity: 'medium' });
        if(!kws.k8s) gaps.push({ skill: 'Kubernetes', severity: 'medium' });
        if(!kws.mongodb) gaps.push({ skill: 'MongoDB', severity: 'medium' });
        if(gaps.length===0) gaps.push({ skill: 'Communication & Interview Prep', severity: 'low' });

        const plan = [
            { day:1, focus: 'Core Backend Concepts', tasks: ['Review Node.js basics and asynchronous patterns','Practice REST API design and error handling']},
            { day:2, focus: 'Databases & Performance', tasks: ['Review MongoDB indexing and aggregation','Practice query optimization']},
            { day:3, focus: 'Containerization', tasks: ['Dockerize a sample app','Learn basic Docker Compose usage']},
            { day:4, focus: 'System Design', tasks: ['Read microservices patterns','Sketch a scalable system for a sample problem']},
            { day:5, focus: 'Behavioral Prep', tasks: ['Practice STAR answers for common questions','Prepare questions for interviewers']}
        ];

        return { technicalQuestions: techQ, behaviouralQuestions: behQ, skillGaps: gaps, preparationPlan: plan };
    }

    const allEmpty = (!Array.isArray(cleaned.technicalQuestions) || cleaned.technicalQuestions.length===0)
        && (!Array.isArray(cleaned.behaviouralQuestions) || cleaned.behaviouralQuestions.length===0)
        && (!Array.isArray(cleaned.skillGaps) || cleaned.skillGaps.length===0)
        && (!Array.isArray(cleaned.preparationPlan) || cleaned.preparationPlan.length===0);

    // Robustly try to extract preparationPlan from raw response text if AI returned it as escaped/concatenated string
    function extractPreparationPlanFromRaw(){
        const key = '"preparationPlan"';
        const idx = response.text.indexOf(key);
        if(idx===-1) return null;
        // find first '[' after key
        const startIdx = response.text.indexOf('[', idx);
        if(startIdx===-1) return null;
        // find matching closing bracket
        let depth = 0;
        for(let i=startIdx;i<response.text.length;i++){
            const ch = response.text[i];
            if(ch === '[') depth++;
            else if(ch === ']') depth--;
            if(depth===0){
                const snippet = response.text.slice(startIdx, i+1);
                try{
                    const arr = JSON.parse(snippet);
                    // normalize elements if they are JSON strings or concatenated
                    const out = [];
                    for(const it of arr){
                        if(typeof it === 'string'){
                            const s = it.trim();
                            if(s.startsWith('[')){
                                try{ const parsed = JSON.parse(s); out.push(...parsed); continue;}catch(e){}
                            }
                            // split concatenated objects
                            if(s.includes('}{') || s.includes('},{')){
                                // attempt to split by '}{' boundaries
                                const objs = [];
                                let depth2=0, st=null;
                                for(let j=0;j<s.length;j++){
                                    const c=s[j];
                                    if(c==='{'){ if(depth2===0) st=j; depth2++; }
                                    else if(c==='}'){ depth2--; if(depth2===0 && st!==null){ objs.push(s.slice(st,j+1)); st=null; } }
                                }
                                for(const o of objs){ try{ out.push(JSON.parse(o)); }catch(e){ /*ignore*/ } }
                                continue;
                            }
                            try{ out.push(JSON.parse(s)); continue; }catch(e){ /* ignore */ }
                        } else if(typeof it === 'object'){
                            out.push(it);
                        }
                    }
                    if(out.length>0) return out;
                }catch(e){ return null; }
                break;
            }
        }
        // fallback: try to extract JSON objects inside the snippet using a regex
        try{
            const key2 = '"preparationPlan"';
            const idx2 = response.text.indexOf(key2);
            if(idx2===-1) return null;
            const start2 = response.text.indexOf('[', idx2);
            const end2 = response.text.indexOf(']', start2);
            if(start2===-1 || end2===-1) return null;
            const snippet2 = response.text.slice(start2, end2+1);
            const matches = snippet2.match(/\{[\s\S]*?\}/g);
            if(matches && matches.length>0){
                const parsedObjs = [];
                for(const m of matches){
                    try{ parsedObjs.push(JSON.parse(m)); }catch(e){ /* ignore */ }
                }
                if(parsedObjs.length>0) return parsedObjs;
            }
        }catch(e){ /* ignore */ }
        return null;
    }

    const extractedPlan = extractPreparationPlanFromRaw();
    if(extractedPlan && extractedPlan.length>0){
        cleaned.preparationPlan = normalize(extractedPlan);
    }

    if(allEmpty){
        const fb = generateFallback(jobDescription, resume);
        cleaned.technicalQuestions = fb.technicalQuestions;
        cleaned.behaviouralQuestions = fb.behaviouralQuestions;
        cleaned.skillGaps = fb.skillGaps;
        cleaned.preparationPlan = fb.preparationPlan;
        console.log('Used fallback generation for interview report because AI returned placeholders.');
    }

    // Ensure a title exists — fall back to jobDescription or a generic title
    if(!cleaned.title || typeof cleaned.title !== 'string' || cleaned.title.trim() === ''){
        if(jobDescription && typeof jobDescription === 'string' && jobDescription.trim()){
            const firstLine = jobDescription.split('\n').find(l=>l && l.trim());
            cleaned.title = firstLine ? firstLine.slice(0,200).trim() : 'Interview Report';
        } else {
            cleaned.title = 'Interview Report';
        }
    }

    console.log(JSON.stringify(cleaned, null, 2));
    return cleaned;

}

async function generatePdfFromHtml(htmlContent){
    const browser=await puppeteer.launch()
    const page=await browser.newPage()
    await page.setContent(htmlContent,{waitUntil:"networkidle0"})

    const pageBuffer=await page.pdf({format:"A4"})
    await browser.close()

    return pageBuffer
}


async function generateResumePdf({resume,jobDescription,selfDescription}){
        const resumePdfSchema=z.object({
            html:z.string().describe("The html content of the resume which can be converted to pdf using any library Like puppeteer")
        })

        const prompt=`
            generate the resume for a candidate with the following details:
                Resume:${resume}
                self Description:${selfDescription}
                job Description:${jobDescription}

                the response should be a json Object with a single field "HTML" which contains the html content of the following resume which can be converted to be Pdf using any library like puppeteer
        `

        const response=await ai.models.generateContent({
            model:"gemini-3-flash-preview",
            contents:prompt,
            config:{
                responseMimeType:'application/json',
                responseSchema:zodToJsonSchema(resumePdfSchema)
            }

        })

        const jsonContent= json.parse(response.text)

        const pdfBuffer=await generatePdfFromHtml(jsonContent.html)

        return pdfBuffer
}


module.exports={
    generateInterviewReport,
    generateResumePdf
}