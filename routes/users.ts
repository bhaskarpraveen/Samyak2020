import express from 'express';
const router:express.Router = express.Router();
import User from '../models/users'
import jwt from 'jsonwebtoken';
import emailVerification from '../services/email_verification';
import SendMail from '../services/mail';
import VerifyToken from '../middlewares/verify_token';
const JWT_KEY =  process.env.JWT_KEY ||'jsonwebtoken'






//Creating a new user record
router.post('/register',async function(request:express.Request,response:express.Response){
    
    let {name,email,mobile,college,current_year,branch,gender,college_id,password} = request.body;
    
    if(name&&email&&mobile&&college&&current_year&&branch&&gender&&college_id&&password){
        let FindUser = await User.findOne({email:email});

        if(!FindUser){

            let newuser =  new User({
                name:name,
                email:email,
                mobile:mobile,
                college:college,
                current_year:current_year,
                branch:branch,
                password: User.hashPassword(password),
                gender:gender,
                college_id:college_id
            });

            let promise = newuser.save();
            
            promise.then(async (doc)=>{
                console.log(doc.email)
            //email verification service
            await emailVerification(doc.email)
                .then((res)=>{
                    if(res.status==200)
                    return response.status(res.status).json({message:'User successfully added'});
                    else
                    return response.status(res.status).json({message:res.message});
                })
            })

            promise.catch((err: { message: any })=>{
                response.status(501).json({message:err.message});
            })
        }else{
            return response.status(501).json({message:'User with this email already exists'})
        }
           
    }else{
        return response.status(400).json({message:'Enter all the Details'})
    }
})

//user login
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
                            let token = jwt.sign({email:email,userId:user._id},JWT_KEY,{expiresIn:'3h'})
                            return response.status(200).json({token:token})
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

//verifies user after clicking the activation link
router.get('/verify/:token',async function(request:express.Request,response:express.Response){
    let {token} = request.params;
  
    if(token){

    //verifying token
    jwt.verify(token,JWT_KEY,async function(err,data){
        if(err){
            return response.status(501).json({message:'Invalid link'})
        }
        if(data){
            let user = await User.findOne({_id:data.userId})
            if(user){
                //toggle email_verified to 1
                user.email_verified=1;
                let promise = user.save();
                promise.then(()=>{
                    return response.status(200).json({message:'User verified'})
                })

                promise.catch((error)=>{
                    return response.status(501).json({message:error.message})
                })
            }else{
                return response.status(501).json({message:'User doesn\'t exist'})
            }
        }
    })
   }else{
       return response.status(501).json({message:'Invalid link'})
   }
    

})
//email verification 
router.post('/email-verification',async function(request:express.Request,response:express.Response){
    let {email} = request.body;
    console.log(email);
    //email verification service
    await emailVerification(email)
    .then(res=>{
        return response.status(res.status).json({message:res.message});
    })

})


router.post('/forgot-password',async function(request:express.Request,response:express.Response){
    const {email} = request.body;

    if(email){
        const user = await User.findOne({email:email});

        if(user){
            let new_string =  Math.random().toString(36).slice(-8)
            let new_password = await User.hashPassword(new_string);
            let promise = User.updateOne({email:email},{$set:{password:String(new_password)}})
            promise.then(async (doc)=>{
                let data = {
                    html:'forgot_password.html',
                    replacements:{
                        name:user.name,
                        password:new_string
                    },
                    from:'praveennaidu264@gmail.com',
                    to:email,
                    subject:'Password Reset'
                }
                await SendMail(data)
                        .then(res=>{
                            if(res.status==200)
                            return response.status(res.status).json({message:'Email successfully sent'});
                            else
                            return response.status(res.status).json({message:res.message});
                        })

            })
        
            promise.catch(err=>{
                return response.status(501).json({message:err.message})
            })
        }else{
            return response.status(501).json({message:'User not found'})
        }
    }else{
        return response.status(501).json({message:'Enter an email'})
    }
})


interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}


router.post('/change-password',VerifyToken,async function(request:jwt_request,response:express.Response){
    if(request.tokenData){
        const {userId} = request.tokenData;
        const {current_password,new_password} = request.body;
        if(current_password&&new_password){
                let FindUser = await User.findOne({_id:userId});
                    if(FindUser){
                        if(FindUser.isValid(current_password)){
                            let hash_password = await User.hashPassword(new_password);
                            let promise = User.updateOne({_id:userId},{$set:{password:String(hash_password)}});
    
                            promise.then(doc=>{
                                return response.status(200).json({message:'Successfully changed'})
                            })
    
                            promise.catch(err=>{
                                return response.status(501).json({message:err.message})
                            })

                        }else{
                            return response.status(501).json({message:'Invalid password'})
                        }
                        }else{
                            return response.status(501).json({message:'User not found'})
                        }
                   
                       
                
        }else{
            return response.status(501).json({message:'Enter valid details'})
        }
        
    
    }
    
   
})
export default router;