import express from 'express'
import User from '../models/users';
import UserRole from '../models/user_roles';
import Role from '../models/roles';
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

interface role_data {
    collection:string,
    permission:string
}
let VerifyUserRole = (data:role_data)=>{
    return async function(request:jwt_request,response:express.Response,next:express.NextFunction){
        if(request.tokenData){
            const {userId} = request.tokenData;
        const user = await User.findOne({_id:userId})
        if(user){
            let FindRole = await UserRole.findOne({user_id:user._id});
            if(FindRole){
                let allRoles= await Role.aggregate([
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

                let FindPermission = allRoles.find(x=>x._id==FindRole?._id)
                if(FindPermission.permissions[0].permissions[data.collection][data.permission]){
                    next();
                }else{
                    return response.status(500).json({message:'Authorization failed'});
                }
            }else{
                return response.status(501).json({message:'Authorization failed'})
            }
        }else{
            return response.status(501).json({message:'Authorization failed'})
        }
        }
        
    }
    
}

   
export default VerifyUserRole;