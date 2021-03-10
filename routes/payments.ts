import express from 'express';
const router:express.Router = express.Router();
import User from '../models/users'
import jwt from 'jsonwebtoken';
import emailVerification from '../services/email_verification';
import SendMail from '../services/mail';
import VerifyToken from '../middlewares/verify_token';
import axios from 'axios';
import PaymentRequest from '../models/payment_requests';
import user_roles from '../models/user_roles';
import VerifyUserRole from '../middlewares/verify_user_role'
import Payment from '../models/payments';
import dotenv from 'dotenv';
import e from 'express';
dotenv.config();
const JWT_KEY =  process.env.JWT_KEY ||'jsonwebtoken'

interface jwt_request extends express.Request{
    tokenData?:{userId?:String}
}

router.get('/create-request',VerifyToken,async function(request:jwt_request,response:express.Response){
    if(request.tokenData){
        const {userId} = request.tokenData;
        const user = await User.findOne({_id:userId})
        if(user){
             const FindPayment = await Payment.findOne({user_id:user._id,status:'Credit'})
             if(!FindPayment){
                let headers = { 'X-Api-Key': process.env.INSTAMOJO_KEY , 'X-Auth-Token': process.env.INSTAMOJO_TOKEN}
            const payload = {
            purpose: 'Samyak 2020 registration',
            amount: '200',
            phone: user.mobile,
            buyer_name: user.name,
            redirect_url: 'https://klsamyak.in/#/payment-verification',
            send_email: false,
            // webhook: 'https://klsamyak-dev.tk/payments/webhook',
            send_sms: true,
            email: user.email,
            allow_repeated_payments: false
        }
        
        try{
          let payment_response=  await axios({
              method:'POST',
              url:'https://www.instamojo.com/api/1.1/payment-requests/',
              data:payload,
              headers:headers
          })
           
            let payment_request = new PaymentRequest({
            id: payment_response.data["payment_request"].id,
            user_id:user._id,
        amount: payment_response.data["payment_request"].amount,
        purpose: payment_response.data["payment_request"].purpose,
        status: payment_response.data["payment_request"].status,
        send_sms: payment_response.data["payment_request"].send_sms,
        send_email: payment_response.data["payment_request"].send_email,
        sms_status: payment_response.data["payment_request"].sms_status,
        email_status: payment_response.data["payment_request"].email_status,
        shorturl: payment_response.data["payment_request"].shorturl,
        longurl: payment_response.data["payment_request"].longurl,
        redirect_url: payment_response.data["payment_request"].redirect_url,
        // webhook: payment_response.data["payment_request"].webhook,
        created_at:payment_response.data["payment_request"].reated_at,
        modified_at: payment_response.data["payment_request"].modified_at,
        allow_repeated_payments: payment_response.data["payment_request"].allow_repeated_payments
            })
           
           let promise =  payment_request.save()
           promise.then(doc=>{
            return response.status(200).json({message:'created',request:doc})
        });

        promise.catch(err=>{
            return response.status(501).json({message:err.message})
        })
        }catch(e){
            
            return response.status(501).json({message:e.response.data})
        }
             }else{
                 return response.status(501).json({message:'User already payed'})
             }
            
       
        }else{
            return response.status(501).json({message:'user not found'})
        }
    }else{
        response.status(501).json({message:'Invalid token'})
    }
});


router.post('/add-payment',VerifyToken,async function(request:jwt_request,response:express.Response){
    if(request.tokenData){
        const {userId} = request.tokenData;

        const user = await User.findOne({_id:userId})
        if(user){
            const {payment_id,payment_status,payment_request_id}= request.body;
            if(payment_id&&payment_status&&payment_request_id){
                let checkpayment = await Payment.findOne({payment_request_id:payment_request_id,payment_id:payment_id});
                if(!checkpayment){
                    let headers = { 'X-Api-Key': process.env.INSTAMOJO_KEY , 'X-Auth-Token': process.env.INSTAMOJO_TOKEN}
                try{
                    let payment_response=  await axios({
                        method:'GET',
                        url:'https://www.instamojo.com/api/1.1/payment-requests/'+payment_request_id+'/'+payment_id,
                        headers:headers
                    })
                    let payment = new Payment({
                        user_id:user._id, 
                        payment_id:payment_response.data['payment_request'].payment.payment_id,
                        payment_request_id:payment_response.data['payment_request'].id,	
                        instrument_type:payment_response.data['payment_request'].payment.instrument_type,
                        billing_instrument:payment_response.data['payment_request'].payment.billing_instrument,
                        amount:payment_response.data['payment_request'].payment.amount,
                        status:payment_response.data['payment_request'].payment.status,
                    })
                    let promise =  payment.save()
                    promise.then(doc=>{
                     return response.status(200).json({message:'Created',request:doc})
                 });
         
                 promise.catch(err=>{
                     return response.status(501).json({message:err.message})
                 })
                }catch(e){
                    console.log(e.response.data)
                    return response.status(501).json({message:e.response.data})
                }
                }else{
                    return response.status(501).json({message:'record already exist'})
                }
                

            }else{
                return response.status(501).json({message:'Enter all details'})
            }
        }else{
            return response.status(501).json({message:'Invalid user'})
        }
    
    }else{
        return response.status(501).json({message:'Invalid token'})
    }
   
})


router.get('/all-payments',VerifyToken,VerifyUserRole({collection:'Payments',permission:'view'}),async function(request:jwt_request,response:express.Response){
    let payments = await Payment.aggregate([
        {
            $match:{status:"Credit"}
        },
        {
            $lookup:{
                from: 'users',
                localField: "user_id",
                foreignField: "_id",
                as: "user"        
            }
        },
        {
            $lookup:{
                from: 'payment_requests',
                localField: "payment_request_id",
                foreignField: "id",
                as: "payment_request"        
            }
        },
        {
    
        $project:{
            'user.password':0,
            'permissions.__v':0,
            '__v':0,
            
        }
        }
    ])
    return response.status(200).json({payments:payments})
});

router.get('/payments/:id',VerifyToken,VerifyUserRole({collection:'Payments',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    let {id} = request.params;
    if(id){
        let user = await User.findOne({_id:id});
        if(user){
            let payments = await Payment.aggregate([
                {
                    $lookup:{
                        from: 'users',
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"        
                    }
                },
                {
                    $lookup:{
                        from: 'payment_requests',
                        localField: "payment_request_id",
                        foreignField: "id",
                        as: "payment_request"        
                    }
                },
                {
            
                $project:{
                    'user.password':0,
                    'permissions.__v':0,
                    '__v':0,
                    
                }
                }
            ]);

            let payment = payments.find(p=>p.user[0]._id==id);
            return response.status(200).json(payment);
        }else{
            return response.status(501).json({"message":"user not found"});
        }
    }else{
        return response.status(501).json({'message':'Enter valid id'});
    }
})

router.post('/edit-payment',VerifyToken,VerifyUserRole({collection:'Payments',permission:'edit'}),async function(request:jwt_request,response:express.Response){
    let {user_id,payment_id,instrument_type,billing_instrument,amount,status} = request.body;
    if(user_id&&payment_id&&instrument_type&&billing_instrument&&amount&&status){
        let findUser = await User.findOne({_id:user_id});
        if(findUser){
            let d= new Date()
            let promise = User.updateOne({user_id:user_id,payment_id:payment_id},{$set:{instrument_type:instrument_type,billing_instrument:billing_instrument,amount:amount,status:status,updated_at:d}});
            promise.then(doc=>{
                return response.status(200).json({'message':'Successfully updated'});
            });

            promise.catch(err=>{
                return response.status(501).json({'message':err.message});
            });
        }else{
            return response.status(501).json({'message':'user not found'});
        }
    }else{
        return response.status(501).json({'message':'Enter valid details'});
    }
    // let payment = new Payment({
    //     user_id:user_id, 
    //     payment_id:payment_id,
    //     payment_request_id:payment_request_id,	
    //     instrument_type:instrument_type,
    //     billing_instrument:billing_instrument,
    //     amount:amount,
    //     status:status,
    // })
});


router.get('/refresh/:payment_id/:email',async function(request:jwt_request,response:express.Response){
    let {payment_id,email} = request.params;
    let us = await User.findOne({email:email})
    let allRequests = await PaymentRequest.find({user_id:us?._id});
    for(let i=0;i<allRequests.length;i++){
        let flag=0;
        // let findPay = await Payment.findOne({payment_request_id:allRequests[i].id})
        let headers = { 'X-Api-Key': process.env.INSTAMOJO_KEY , 'X-Auth-Token': process.env.INSTAMOJO_TOKEN}
        try{
            let payment_response=  await axios({
                method:'GET',
                url:'https://www.instamojo.com/api/1.1/payment-requests/'+allRequests[i].id,
                headers:headers
            });
            try{
                if(payment_response){
               
                    if(payment_response.data){
                        let payments = payment_response.data['payment_request'].payments;
                    for(let j=0;j<payments.length;j++){
                       
                        if(payments[j].status=="Credit" && payments[j].payment_id==payment_id){
                            let findP=await Payment.findOne({payment_id:payment_id,payment_request_id:allRequests[i].id,status:"Credit"});
                        if(!findP){
                            console.log(payments[j])
                        let payment = new Payment({
                            user_id:allRequests[i].user_id, 
                            payment_id:payment_id,
                            payment_request_id:allRequests[i].id,	
                            instrument_type:payments[j].instrument_type,
                            billing_instrument:payments[j].billing_instrument,
                            amount:payments[j].amount,
                            status:payments[j].status,
                        })
                         await  payment.save()
                         flag=1;
                         break;
                        }
                    }
                    }
                }
                }
             
            }
            catch(e){
                console.log(e);
            }
           
            
            
          
            if(flag)break;
        }catch(e){
            console.log('--'+e.response.data)
            // return response.status(501).json({message:e.response.data})
        }

    }
    return response.status(200).json({message:'Done'})
})

export default router;
