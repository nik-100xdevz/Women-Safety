import jwt from 'jsonwebtoken';
import Report from '../model/report.model.js'
import User from '../model/user.model.js';
import Comment from '../model/comment.model.js';
import {config} from '../config/config.js'

export const userRegister =  async(req, res) => {
    const {username, password, email} = req.body;
    const userWithEmail = await User.findOne({email})
    if(userWithEmail){
      return res.status(411).json({msg:"User with this email already exists"})
    }
    await User.create({username,email,password})
    return res.status(201).json({msg:"User has been created successfully"})
  }
  
export const userLogin =  async(req, res) => {
    const { password, email} = req.body;
    const userWithEmail = await User.findOne({email})
    if(!userWithEmail){
      return res.status(401).json({msg:"Invalid creadentials"})
    }
    if(userWithEmail.password == password){
      const token = jwt.sign({id:userWithEmail._id},config.jwt_secret,{expiresIn:'1d'})
      return res.status(200).json({msg:"User has been logged in successfully",token})
    }
    return res.status(401).json({msg:"Invalid creadentials"})
    
  }
  
export const userInfo = async(req,res)=>{
    const user = await User.findById(req.userId).select('-password')
    return res.status(200).json({msg:"here is user data",user}) 
   
  }
export const reportInfo = async(req,res)=>{
    const report = await Report.find({user:req.userId})
    return res.status(200).json({msg:"here is user data",report}) 
   
  }
export const commentInfo = async(req,res)=>{
    const comment = await Comment.find({userId:req.userId}).populate('reportId')
    console.log(comment)
    return res.status(200).json({msg:"here is user data",comment}) 
   
  }