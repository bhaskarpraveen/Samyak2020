import express from 'express';
import User from '../models/users';
import VerifyToken from '../middlewares/verify_token';
import  jwt, { verify } from 'jsonwebtoken';
import VerifyUserRole from '../middlewares/verify_user_role'
import UserRole from '../models/user_roles';
import VerifyAdministration from '../middlewares/verify_administration';
import Payment from '../models/payments';
const router:express.Router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
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
                           let role = await UserRole.findOne({user_id:user._id});
                            if(role){
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
router.get('/all-users',VerifyToken,VerifyUserRole({collection:"Users",permission:"view"}),async function(request:jwt_request,response:express.Response){
    const users = await User.find({},'_id samyak_id name email mobile college current_year branch gender college_id status role email_verified created_at updated_at');
    return response.status(200).json(users);

})

//delete a user
router.post('/delete-user',VerifyToken,VerifyUserRole({collection:"Users",permission:"delete"}),async function(request:jwt_request,response:express.Response){
    const {userId} = request.body;
    if(userId){
        let user = await User.findOne({_id:userId});
        if(user){
             User.findOneAndDelete({_id:userId})
                .then(async ()=>{
                    await UserRole.deleteOne({user_id:userId});
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
router.post('/edit-user',VerifyToken,VerifyUserRole({collection:"Users",permission:"edit"}),async function(request:jwt_request,response:express.Response){
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

//status active or inacttive(blocked)
router.post('/account-status',VerifyToken,VerifyUserRole({collection:"Users",permission:"edit"}),async function(request:jwt_request,response:express.Response){
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

// user details for dashbboard
router.get('/users-details',VerifyToken,async function(request:jwt_request,response:express.Response){
    let total_users = await User.find({}).count()
    let klv = await User.find({college:"KLV"}).count()
    let klh = await User.find({college:"KLH"}).count()
    let other_college = await User.find({college:{$nin:["KLV","KLH"]}}).count()

    return response.status(200).json({count:total_users,klv_count:klv,klh_count:klh,others_count:other_college});
});


//payment details for dashboard
router.get('/payment-details',VerifyToken,async function (request:jwt_request,response:express.Response){
    let payments_count = await Payment.find({status:"Credit"}).count()
    let payments = await Payment.find({status:"Credit"});
    let sum = 0 ;
    let klv_sum =0 ;
    let klh_sum =0;
    let other_sum =0;
    let users = await User.find({});
    for(let i=0;i<payments.length;i++){
        if(payments[i].amount){
            sum=sum + Number(payments[i].amount);
            let user = users.find(x=>{payments[i].user_id==x._id});
            if(user?.college=="KLV"){
                klv_sum  =klv_sum+  Number(payments[i].amount)
            }else if(user?.college=="KLH"){
                klh_sum =  klh_sum+ Number(payments[i].amount);
            }else{
                other_sum= other_sum+ Number(payments[i].amount);
            }
        }
    }
    return response.status(200).json({total_number:payments_count,total_collected:sum,klv_collected:klv_sum,klh_collected:klh_sum,other_collected:other_sum});
})



export default router;