import Report from '../model/report.model.js'

import Comment from '../model/comment.model.js'

export async function allComment(req,res){
    const reportId = req.params.reportId
    if(!reportId){
        return res.status(400).json({msg:"Report id not found"})
    }
    try{
        const report = await Report.findById(reportId)
        if(!report){
            return res.status(404).json({msg:"No report found"})
        }
        const comments = await Comment.find({reportId})
        return res.status(200).json({msg:"all the Comments", comments})
    }catch(e){
        res.json({msg:"Error while fetching Comment",e})
    }
    
}

export async function addComment(req,res) {
    const {reportId,comment} = req.body;
    const userId = req.userId;
try{    
    const addedC = await Comment.create({reportId,userId,comment})
    res.status(201).json({msg:"Comment has been Commented",comment:addedC})
}catch(e){
    return res.json({msg:"Error occured while Commenting the incident",e})
}

}



export async function deleteComment(req,res) {
    const CommentId = req.params.commentId;
try{    
    const comment = await Comment.findById(CommentId)

    if(!comment){
        return res.status(404).json({msg:"Comment does not found"})
    }
    if(!(comment.userId == req.userId)){
        return res.status(404).json({msg:"Please delete your own Comment"})
    }
    await Comment.findByIdAndDelete(CommentId)
    return res.status(200).json({msg:"Comment has been deleted"})
}catch(e){
    return res.json({msg:"Error occured while Commenting the incident",e})
}
}