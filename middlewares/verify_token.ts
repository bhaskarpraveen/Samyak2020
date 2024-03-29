import express from 'express'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()
let JWT_KEY = process.env.JWT_KEY || 'jsonwebtoken';

interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

let VerifyToken = async function(request:jwt_request,response:express.Response,next:express.NextFunction){
    const token:string = String(request.headers['x-access-token']);
    
    jwt.verify(token,JWT_KEY,function(err,data){
        if(err){
            console.log(err)
            return response.status(400).json({message:'Authorization failed',authorized:false})
        }
        else if(data){
            request.tokenData = data;
            next();
        }
    })
}

export default VerifyToken;