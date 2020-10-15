import express from 'express'
import User from '../models/users';

interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

let VerifyAdministration = async function(request:jwt_request,response:express.Response,next:express.NextFunction){
    if(request.tokenData){
        const {userId} = request.tokenData;
    const user = await User.findOne({_id:userId})
    if(user){
        // if(['Admin','Organiser'].includes(user.role))
        next();
        // else return response.status(501).json({message:'Authorization failed'})
    }else{
        return response.status(501).json({message:'Authorization failed'})
    }
    }
    
}

export default VerifyAdministration;