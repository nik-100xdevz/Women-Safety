import mongoose,{Schema} from "mongoose"

const reportSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    },
    incident:{
        type:String,
        required:true,
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
    
},{timestamps:true})

const Report = mongoose.model('Report',reportSchema)

export default Report;