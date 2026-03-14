const pdfParse = require("pdf-parse");
const {generateInterviewReport,generateResumePdf} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewController(req, res) {
  const resumeContent = await new pdfParse.PDFParse(
    Uint8Array.from(req.file.buffer),
  ).getText();
  const { selfDescription, jobDescription } = req.body;

  const interviewReportByAi = await generateInterviewReport({
    resume: resumeContent,
    selfDescription,
    jobDescription,
  });

  // Normalize AI output: ensure fields that must be arrays of objects are valid
  function normalizeArrayField(value){
    if(Array.isArray(value)) return value.filter(v=>v && typeof v === 'object');
    if(typeof value === 'string'){
      try{ const parsed = JSON.parse(value); if(Array.isArray(parsed)) return parsed.filter(v=>v && typeof v === 'object'); }catch(e){}
      return [];
    }
    return [];
  }

  interviewReportByAi.technicalQuestions = normalizeArrayField(interviewReportByAi.technicalQuestions);
  interviewReportByAi.behaviouralQuestions = normalizeArrayField(interviewReportByAi.behaviouralQuestions);
  interviewReportByAi.skillGaps = normalizeArrayField(interviewReportByAi.skillGaps);
  interviewReportByAi.preparationPlan = normalizeArrayField(interviewReportByAi.preparationPlan);

  // Ensure we store plain text for resume
  const resumeText = (resumeContent && (resumeContent.text || typeof resumeContent === 'string'))
    ? (resumeContent.text || resumeContent)
    : '';

  const interviewReport = await interviewReportModel.create({
    user: req.user.id,
    resume: resumeText,
    selfDescription,
    jobDescription,
    ...interviewReportByAi,
  });

  res.status(201).json({
    message: "Interview Report created Successfully",
    interviewReport,
  });
}

async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  if (!interviewId) {
    return res.status(400).json({ message: "interviewId is required" });
  }

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({ message: "Interview report not found" });
  }

  res.status(200).json({ message: "Interview report fetched successfully", interviewReport });
}

async function getAllInterviewReportController(req, res) {
  const interviewReports = await interviewReportModel.find({
      user: req.user.id,
    }).sort({ createdAt: -1 }).select(
      "-resume -selfDescription -jobDescription -__v",
    );

    res.status(200).json({
        message:"Interview Report fetched Successfully ",
        interviewReports
    })

}

async function generateResumePdfController(req,res){
    const {interviewReportId}=req.params

    const interviewReport=await interviewReportModel.findById(interviewReportId)

    if(!interviewReport){
      return res.status(404).json({
        message:"Interview Report Not Found"
      })
    }

    const {resume,selfDescription,jobDescription}=interviewReport

    const pdfBuffer=await generateResumePdf({resume,selfDescription,jobDescription})
    res.set({
      "Content-Type":"application/pdf",
      "Content-Disposition":`attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)

}

module.exports = {
  generateInterviewController,
  getInterviewReportByIdController,
  getAllInterviewReportController,
  generateResumePdfController
};
