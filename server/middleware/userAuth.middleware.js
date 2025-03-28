import jwt from 'jsonwebtoken';
import {config} from '../config/config.js'

const jwtVerify=(req,res,next)=>{
    const header = req.headers.authorization;
    if(!header){
        return res.status(400).json({msg:"No header founds"})
    }
    try{
        const token = jwt.verify(header,config.jwt_secret)
        if(token){
            req.userId = token.id
            next()
            return;
        }
        
        return res.status(401).json({msg:"you are not authorize to access this point"})
    }catch(e){
        return res.status(401).json({msg:"you are not authorize to access this point",e})
    }
}

export default jwtVerify