import SendMail from './mail';
import User from '../models/users'
import jwt from 'jsonwebtoken';


const JWT_KEY =  process.env.JWT_KEY ||'jsonwebtoken'

interface emailVerificationData{
    html:string,
    replacements:Object,
    from:string,
    to:string
    subject:string
} 
//email verification service
let emailVerification = async function(email:string){
    let user = await User.findOne({email:email})

    if(user){
        //generate token No expiry 
        //If required expiry date - {expiresIn:'3h'}
        let token = jwt.sign({userId:user._id},JWT_KEY);

    let data:emailVerificationData = {
        html:'mail.html',
        replacements:{
            name:user.name,
            token:token
        },
        from:'praveennaidu264@gmail.com',
        to:email,
        subject:'Email confirmation'
    }
    //email service
   let response = await SendMail(data);
   return response;

    }else{
        return {status:501,message:'Invalid email'};
    }
    

}

export default emailVerification;