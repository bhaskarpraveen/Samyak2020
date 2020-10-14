import express from 'express';
import User from '../models/users';
import VerifyAdministration from '../middlewares/verify_administration';
import VerifyToken from '../middlewares/verify_token';
import  jwt from 'jsonwebtoken';
import Role from '../models/roles';
import Permission from '../models/permissions';
import UserRole from '../models/user_roles';
const router:express.Router = express.Router();
const JWT_KEY =  process.env.JWT_KEY ||'jsonwebtoken'

//interface 
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}


router.post('/add-role',async function(request:express.Request,response:express.Response){
    const {role} = request.body;
    if(role){
        const findRole = await Role.findOne({name:role});
        if(!findRole){
            let new_role = new Role({
                name:role
            });

            let promise = new_role.save();
            promise.then(doc=>{
                return response.status(201).json({message:'Successfully added',doc:doc})
            });

            promise.catch(err=>{
                return response.status(501).json({message:err.message});
            })
        }else{
            return response.status(501).json({message:'Role already exists'});
        }

    }else{
        return response.status(501).json({message:'Enter a role'});
    }
})

router.get('/all-roles',async function(request:express.Request,response:express.Response){

    let roles = await Role.find({});
    return response.status(200).json({roles:roles});
    
})
router.post('/edit-role',async function(request:express.Request,response:express.Response){
    const {current_roleId,new_role} = request.body;

    if(current_roleId&&new_role){
        let findRole = Role.findOne({_id:current_roleId});
        if(!findRole){
            let promise = Role.updateOne({_id:current_roleId},{$set:{name:new_role}});
            promise.then(doc=>{
                return response.status(200).json({message:'Successfully updated',doc:doc})
            });

            promise.catch(err=>{
                return response.status(501).json({message:err.message});
            })
        }else{
            return response.status(501).json({message:'Invalid role'})
        }
    }else{
        return response.status(501).json({message:'Enter alll details'});
    }
})

router.post('/delete-role',async function(request:express.Request,response:express.Response){
    let {RoleId} = request.body;

    if(RoleId){
        let role =await Role.findOne({_id:RoleId});
        if(role){
            let role_id =role._id
            Role.deleteOne({_id:RoleId})
                .then(async ()=>{
                    await Permission.deleteOne({role_id:role_id});
                    await UserRole.deleteOne({role_id:RoleId});
                    return response.status(200).json({message:'Successfully deleted'})
                })
                .catch(err=>{
                    return response.status(501).json({message:err.message});
                })
        }else{
            return response.status(501).json({message:'Role not found'})
        }
    }else{
        return response.status(501).json({message:'Enter all details'})
    }
});

router.post('/manage-permissions',async function(request:express.Request,response:express.Response){
    let {roleId,permission} = request.body;
    let check=1;
    try{
        eval(permission);
    }catch{
        check=0;
    }
    if(roleId&&check&&permission){
        const findRole = await Role.findOne({_id:roleId});
        if(findRole){
            let new_permission = await Permission.findOne({role_id:findRole._id})
            if(new_permission){
                if(!permission)permission=[];
                    new_permission.permissions=eval(permission);
                    let promise = new_permission.save();
                    promise.then(doc=>{
                        return response.status(200).json({message:'Successfully added',doc:doc})
                    })
        
                    promise.catch(err=>{
                        return response.status(501).json({message:err.message})
                    })
               
               
            }else{
                return response.status(501).json({message:'Permission not found'})
            }
           
        }else{
            return response.status(501).json({message:'Invalid role'})
        }
    }else{
        return response.status(501).json({message:'Enter valid details'})
    }
})

router.post('/add-UserRole',async function(request:express.Request,response:express.Response){
    const {userId,RoleId} = request.body;

    if(userId&&RoleId){
        let user = await User.findOne({_id:userId});
        if(user){
            let role = await Role.findOne({_id:RoleId});
            if(role){
                const new_user_role = new UserRole({
                    user_id:user._id,
                    role_id:role._id
                });

                const promise = new_user_role.save();
                promise.then(doc=>{
                    return response.status(200).json({message:'Successfully saved',doc:doc});
                })
                promise.catch(err=>{
                    return response.status(501).json({message:err.message});
                })
            }else{
                return response.status(501).json({message:'Invalid found'});
            }
        }else{
            return response.status(501).json({message:'User not found'});
        }
    }else{
        return response.status(501).json({message:'Enter all details'});
    }
});

router.post('edit-UserRole',async function(request,response){
    const {userId,RoleId} = request.body;

    if(userId&&RoleId){
        let user = await UserRole.findOne({user_id:userId});
        if(user){
            let role = await Role.findOne({_id:RoleId});
            if(role){
                const promise = UserRole.updateOne({user_id:userId},{$set:{role_id:RoleId}});
                promise.then(doc=>{
                    return response.status(200).json({message:'Successfully saved',doc:doc});
                })
                promise.catch(err=>{
                    return response.status(501).json({message:err.message});
                })
            }else{
                return response.status(501).json({message:'Invalid found'});
            }
        }else{
            return response.status(501).json({message:'User not found'});
        }
    }else{
        return response.status(501).json({message:'Enter all details'});
    }
});


router.post('/delete-UserRole',async function(request:express.Request,response:express.Response){
    const {userId} =  request.body;

    if(userId){
        let user = UserRole.findOne({user_id:userId});
        if(user){
            let promise = UserRole.deleteOne({user_id:userId});

            promise.then(()=>{
                return response.status(200).json({message:'Deleted successfully'});
            })
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(201).json({message:'User not found'})
        }

    }else{
        return response.status(501).json({message:'Enter all details'})
    }
});

router.get('/all-UserRoles',async function(request:express.Request,response:express.Response){
    let user_roles = await UserRole.find({});
    return response.status(200).json({user_roles:user_roles});
})
export default router;