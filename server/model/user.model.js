import mongoose,{Schema} from "mongoose"

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pushSubscription: {
        type: Object,
        default: null
    }
},{timestams:true})

const User = mongoose.model('User',userSchema)

export default User;