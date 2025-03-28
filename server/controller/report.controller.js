import Report from '../model/report.model.js'
import Comment from '../model/comment.model.js'

export async function allReport(req,res){
    try{
        const report = await Report.find({})
        if(report){
            return res.status(200).json({msg:"all the reports", report})
        }
    }catch(e){
        res.json({msg:"Error while fetching report",e})
    }
    
}

export async function getCommentByReports(req,res){
    const {reportId}=req.body;
    try{
        const comment = await Comment.find({reportId})
        if(comment){
            return res.status(200).json({msg:"all the reports", comment})
        }
    }catch(e){
        res.json({msg:"Error while fetching report",e})
    }
    
}

export async function addReport(req,res) {
    const {title, location, incident} = req.body;
    const userId = req.userId;
try{    
    const report = await Report.create({title,location,incident,user:userId})
    res.status(201).json({msg:"Report has been reported",report})
}catch(e){
    return res.json({msg:"Error occured while reporting the incident",e})
}

}

export async function updateReport(req,res) {
    const {title, location, incident} = req.body;
    const reportId = req.params.reportId;
    const userId = req.userId;
try{    
    const findReport = await Report.findById(reportId)
    if(!findReport){
        return res.status(404).json({msg:"Report does not found"})
    }
    if(!(findReport.user == req.userId)){
        return res.status(404).json({msg:"Please update your own report"})
    }
    const report = await Report.findByIdAndUpdate(reportId,{title,location,incident,user:userId})
    res.status(201).json({msg:"Report has been updated",report})
}catch(e){
    return res.status(400).json({msg:"Error",e})
}

}

export async function deleteReport(req,res) {
    const reportId = req.params.reportId;
try{    
    const report = await Report.findById(reportId)
    if(!report){
        return res.status(404).json({msg:"Report does not found"})
    }
    if(!(report.user == req.userId)){
        return res.status(404).json({msg:"Please delete your own report"})
    }
    await Report.findByIdAndDelete(reportId)
    return res.status(200).json({msg:"Report has been deleted"})
}catch(e){
    return res.json({msg:"Error occured while reporting the incident",e})
}
}
