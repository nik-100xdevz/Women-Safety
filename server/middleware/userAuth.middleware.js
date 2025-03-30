import jwt from 'jsonwebtoken';
import {config} from '../config/config.js'

const jwtVerify=(req,res,next)=>{
    const header = req.headers.authorization;
    if(!header){
        return res.status(400).json({msg:"No header found"})
    }
    
    // Extract token from Bearer header
    const token = header.split(' ')[1];
    if(!token){
        return res.status(400).json({msg:"No token found in header"})
    }
    
    try{
        const decoded = jwt.verify(token, config.jwt_secret)
        if(decoded){
            req.userId = decoded.id
            next()
            return;
        }
        
        return res.status(401).json({msg:"You are not authorized to access this endpoint"})
    }catch(e){
        return res.status(401).json({msg:"You are not authorized to access this endpoint", error: e.message})
    }
}

export default jwtVerify