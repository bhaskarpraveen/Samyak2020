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
    const {current_role,new_role} = request.body;

    if(current_role&&new_role){
        let findRole = Role.findOne({name:current_role});
        if(!findRole){
            let promise = Role.updateOne({name:current_role},{$set:{name:new_role}});
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

router.delete('/delete-role',async function(request:express.Request,response:express.Response){
    let {RoleId} = request.query;

    if(RoleId){
        let role =await Role.findOne({_id:RoleId});
        if(role){
            let role_id =role._id
            Role.deleteOne({_id:RoleId})
                .then(async ()=>{
                    await Permission.deleteOne({role_id:role_id})
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

export default router;