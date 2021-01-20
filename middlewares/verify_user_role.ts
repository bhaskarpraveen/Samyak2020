import express from 'express'
import User from '../models/users';
import UserRole from '../models/user_roles';
import Role from '../models/roles';
import dotenv from 'dotenv';
dotenv.config()
const CURR = process.env.CURR || 'PROD';
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

interface role_data {
    collection:string,
    permission:string
}
let VerifyUserRole = (data:role_data)=>{
    return async function(request:jwt_request,response:express.Response,next:express.NextFunction){
        if(CURR=='Dev'){
            next();
        }else{
            if(request.tokenData){
                const {userId} = request.tokenData;
            const user = await User.findOne({_id:userId})
            if(user){
                let FindRole = await UserRole.findOne({user_id:user._id});
                if(FindRole){
                    let allRoles= await Role.aggregate([
                        {
                           
                            $match:{_id:FindRole.role_id}
                           
        
                        },
    
                        {
                            $lookup:{
                                from: 'permissions',
                                localField: "_id",
                                foreignField: "role_id",
                                as: "permissions"        
                            }
                        },
                        {
                    
                        $project:{
                            'permissions._id':0,
                            'permissions.role_id':0,
                            '__v':0,
                            'permissions.__v':0,
                            
                        }
                        }
                    
                    ]);
                    if(allRoles[0].permissions[0].permissions[data.collection][data.permission]){
                        next();
                    }else{
                        return response.status(500).json({message:'Authorization failed .'});
                    }
                }else{
                    return response.status(501).json({message:'Authorization failed No role'})
                }
            }else{
                return response.status(501).json({message:'Authorization failed No user'})
            }
            }
        }
        
        
    }
    
}

   
export default VerifyUserRole;