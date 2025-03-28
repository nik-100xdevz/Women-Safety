import mongoose,{Schema} from "mongoose"

const commentSchema = new Schema({
    comment : {
        type:String,
        required:true,
    },
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    reportId:{
        type:mongoose.Types.ObjectId,
        ref:'Report'

    }
},{timestamp:true})

const Comment = mongoose.model('Comment',commentSchema)

export default Comment