import express from 'express';
import User from '../models/users';
import VerifyToken from '../middlewares/verify_token';
import  jwt from 'jsonwebtoken';
import Role from '../models/roles';
import Permission from '../models/permissions';
import UserRole from '../models/user_roles';
import VerifyUserRole from '../middlewares/verify_user_role'
const router:express.Router = express.Router();
const JWT_KEY =  process.env.JWT_KEY ||'jsonwebtoken'

//interface 
interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}


router.post('/add-role',VerifyToken,async function(request:express.Request,response:express.Response){
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

router.get('/all-roles',VerifyToken,async function(request:express.Request,response:express.Response){

    let roles = await Role.aggregate([
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

])
    return response.status(200).json({roles:roles});
    
})
router.post('/edit-role',VerifyToken,async function(request:express.Request,response:express.Response){
    const {current_roleId,new_role} = request.body;

    if(current_roleId&&new_role){
        let findRole = Role.findOne({_id:current_roleId});
        if(findRole){
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

router.post('/delete-role',VerifyToken,async function(request:express.Request,response:express.Response){
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

router.post('/manage-permissions',VerifyToken,async function(request:express.Request,response:express.Response){
    let {roleId,permission} = request.body;
    if(roleId&&permission){
        const findRole = await Role.findOne({_id:roleId});
        if(findRole){
            let new_permission = await Permission.findOne({role_id:findRole._id})
            if(new_permission){
                if(permission.Users&&permission.Events&&permission.Roles&&permission.User_Roles){
                    let obj = {
                        Users:{
                            add:permission.Users.add,
                            view:permission.Users.view,
                            edit:permission.Users.edit,
                            delete:permission.Users.delete
                        },
                        Events:{
                            add:permission.Events.add,
                            view:permission.Events.view,
                            edit:permission.Events.edit,
                            delete:permission.Events.delete
                        },
                        Roles:{
                            add:permission.Roles.add,
                            view:permission.Roles.view,
                            edit:permission.Roles.edit,
                            delete:permission.Roles.delete
                        },
                        User_Roles:{
                            add:permission.User_Roles.add,
                            view:permission.User_Roles.view,
                            edit:permission.User_Roles.edit,
                            delete:permission.User_Roles.delete
                        }
                    }
                    new_permission.permissions=obj;
                    let promise = new_permission.save();
                    promise.then(doc=>{
                        return response.status(200).json({message:'Successfully added',doc:doc})
                    })
        
                    promise.catch(err=>{
                        return response.status(501).json({message:err.message})
                    })
                }else{
                    return response.status(501).json({message:'Enter valid permissions'})
                }
                    
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


router.post('/add-UserRole',VerifyToken,async function(request:express.Request,response:express.Response){
    const {userId,RoleId} = request.body;

    if(userId&&RoleId){
        let user = await User.findOne({_id:userId});
        if(user){
            let role = await Role.findOne({_id:RoleId});
            if(role){
                let findUserRole = await UserRole.findOne({user_id:userId});

                if(findUserRole){
                     
                   let promise =  UserRole.updateOne({user_id:user._id},{$set:{role_id:role._id}});

                   promise.then(doc=>{
                       return response.status(200).json({message:'Successfully changed',doc:doc})
                   });

                   promise.catch(err=>{

                       return response.status(501).json({message:err.message})
                   })
                }else{
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
                }
               
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



router.post('/delete-UserRole',VerifyToken,async function(request:express.Request,response:express.Response){
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

router.get('/all-UserRoles',VerifyToken,VerifyUserRole({collection:'User_roles',permission:'view'}),VerifyToken,async function(request:express.Request,response:express.Response){
    let user_roles = await UserRole.find({});
    return response.status(200).json({user_roles:user_roles});
});


router.post('/check-permission',VerifyToken,async function(request:jwt_request,response:express.Response){
    try{
        if(request.tokenData){
            const {userId} = request.tokenData;
            const {collection,permission} = request.body;
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
                if(allRoles[0].permissions[0].permissions[collection][permission]){
                    return response.status(200).json(true)
                }else{
                    return response.status(200).json(false);
                }
            }else{
                return response.status(200).json(false)
            }
        }else{
            return response.status(200).json(false)
        }
        }
    }
    catch{
        return response.status(200).json(false)
    }
  
})
export default router;