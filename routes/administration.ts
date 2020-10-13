import express, { request } from 'express';
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

//admin login
router.post('/login',async function(request:express.Request,response:express.Response){
    const {email,password} = request.body;
    if(email && password){
        const user= await User.findOne({email:email})
            if(user){
                //validate password
                if(user.isValid(password)){
                    //verify active status
                    if(user.isVerified()){
                        //check email verification
                        if(user.verifyStatus()){
                            console.log(['Admin','Organiser'].includes(user.role))
                            if(['Admin','Organiser'].includes(user.role)){
                                let token = jwt.sign({email:email,userId:user._id},JWT_KEY,{expiresIn:'3h'})
                                 return response.status(200).json({token:token})
                            }else{
                                return response.status(501).json({message:'Authorization denied'})
                            }
                            
                        }else{
                            return response.status(501).json({message:'This account is currently blocked/inactive'})
                        }

                    }else{
                        return response.status(501).json({message:'Email is not verified yet'})
                    }
                }else{
                    return response.status(501).json({message:'Invalid Credentials'})
                }
            }else{
                return response.status(501).json({message:'User not Registered'})
            }

        
    }else{
        return response.status(400).json({message:'Enter all the Details'})
    }
})

//returns all users
router.get('/all-users',VerifyToken,VerifyAdministration,async function(request:jwt_request,response:express.Response){
    const users = await User.find({},'_id samyak_id name email mobile college current_year branch gender college_id status role email_verified created_at updated_at');
    return response.status(200).json(users);

})

//delete a user
router.delete('/delete-user',VerifyToken,VerifyAdministration,async function(request:jwt_request,response:express.Response){
    const {userId} = request.query;
    if(userId){
        let user = await User.findOne({_id:userId});
        if(user){
             User.findOneAndDelete({_id:userId})
                .then(()=>{
                    return response.status(200).json({message:'successfully deleted'})
                })
                .catch(err=>{
                    return response.status(501).json({message:err.message})
                })
        }else{
            return response.status(501).json({message:'No user found'})
        }
    }else{
        return response.status(501).json({message:'Enter user id'});
    }
})



//edit user details
router.post('/edit-user',VerifyToken,VerifyAdministration,async function(request:jwt_request,response:express.Response){
    let {name,email,mobile,college,current_year,branch,gender,college_id} = request.body;
    if(name&&email&&mobile&&college&&current_year&&branch&&gender&&college_id){

        let user = await User.findOne({email:email});
        if(user){
            
            let promise = User.updateOne({email:user.email},{$set:{
                      name:name,email:email,mobile:mobile,college:college,current_year:current_year,branch:branch,
                      gender:gender,college_id:college_id,updated_at:new Date()
            }});

            promise.then(doc=>{
                return response.status(200).json({message:'Successfully updated',doc:doc})
            })

            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'No user found'})
        }
    }else{
        return response.status(501).json({message:'Enter all details'});
    }
})

router.post('/account-status',VerifyToken,VerifyAdministration,async function(request:jwt_request,response:express.Response){
    const {userId} = request.body;
    if(userId){
        const user = await User.findOne({_id:userId});
        if(user){
            let toggle;
            (user.status==1)?toggle=0:toggle=1;
            let promise = User.updateOne({_id:user},{$set:{status:toggle}});
            promise.then((doc)=>{
                return response.status(200).json({message:'successful'})
            })
            promise.catch((error)=>{
                return response.status(501).json({message:error.message})
            })

        }else{
            return response.status(501).json({message:'user not found'})
        }
        
    }else{
        return response.status(501).json({message:'Enter all details'})
    }
})



export default router;